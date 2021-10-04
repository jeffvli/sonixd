import React, { useEffect, useRef, useState } from 'react';
import settings from 'electron-settings';
import { useQuery } from 'react-query';
import { ButtonToolbar, ControlLabel, FlexboxGrid, Icon, Whisper } from 'rsuite';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import useSearchQuery from '../../hooks/useSearchQuery';
import {
  setPlayerIndex,
  setPlayerVolume,
  fixPlayer2Index,
  clearPlayQueue,
  shuffleInPlace,
  toggleShuffle,
  moveToIndex,
  setPlaybackSetting,
  removeFromPlayQueue,
  setPlayQueue,
  appendPlayQueue,
  setStar,
} from '../../redux/playQueueSlice';
import {
  toggleSelected,
  setRangeSelected,
  toggleRangeSelected,
  clearSelected,
  setIsDragging,
} from '../../redux/multiSelectSlice';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import ListViewType from '../viewtypes/ListViewType';
import PageLoader from '../loader/PageLoader';
import { resetPlayer, setStatus } from '../../redux/playerSlice';
import { AutoPlaylistButton, ClearQueueButton, ShuffleButton } from '../shared/ToolbarButtons';
import {
  StyledCheckbox,
  StyledIconButton,
  StyledInputGroup,
  StyledInputNumber,
  StyledInputPicker,
  StyledPopover,
} from '../shared/styled';
import { errorMessages, getCurrentEntryList, isFailedResponse } from '../../shared/utils';
import { getGenres, getRandomSongs, star, unstar } from '../../api/api';
import { notifyToast } from '../shared/toast';

const NowPlayingView = () => {
  const tableRef = useRef<any>();
  const addRandomTriggerRef = useRef<any>();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const [randomPlaylistTrackCount, setRandomPlaylistTrackCount] = useState(
    Number(settings.getSync('randomPlaylistTrackCount'))
  );
  const [randomPlaylistFromYear, setRandomPlaylistFromYear] = useState(0);
  const [randomPlaylistToYear, setRandomPlaylistToYear] = useState(0);
  const [randomPlaylistGenre, setRandomPlaylistGenre] = useState('');
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(searchQuery, playQueue.entry, [
    'title',
    'artist',
    'album',
    'year',
    'genre',
    'path',
  ]);

  const { data: genres }: any = useQuery(
    ['genreList'],
    async () => {
      const res = await getGenres();
      return res.map((genre: any) => {
        return {
          label: `${genre.value} (${genre.songCount})`,
          value: genre.value,
          role: 'Genre',
        };
      });
    },
    { refetchOnWindowFocus: false }
  );

  useHotkeys(
    'del',
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (multiSelect.selected.length === playQueue.entry.length) {
        // Clear the queue instead of removing individually
        dispatch(clearPlayQueue());
        dispatch(setStatus('PAUSED'));
        setTimeout(() => dispatch(resetPlayer()), 200);
      } else {
        dispatch(removeFromPlayQueue({ entries: multiSelect.selected }));
        if (playQueue.currentPlayer === 1) {
          dispatch(fixPlayer2Index());
        }
      }
    },
    [multiSelect.selected]
  );

  useEffect(() => {
    if (playQueue.scrollWithCurrentSong) {
      setTimeout(() => {
        const rowHeight = Number(settings.getSync('musicListRowHeight'));
        tableRef?.current?.table.current?.scrollTop(
          rowHeight * playQueue.currentIndex - rowHeight * 2 > 0
            ? rowHeight * playQueue.currentIndex - rowHeight * 2
            : 0
        );
      }, 100);
    }
  }, [playQueue.currentIndex, playQueue.scrollWithCurrentSong, tableRef]);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          if (searchQuery !== '') {
            dispatch(toggleRangeSelected(filteredData));
          } else {
            dispatch(toggleRangeSelected(playQueue[getCurrentEntryList(playQueue)]));
          }
        }
      }, 100);
    }
  };

  const handleRowDoubleClick = (rowData: any) => {
    window.clearTimeout(timeout);
    timeout = null;

    // Reset volumes when changing to a new track
    dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
    dispatch(setPlayerVolume({ player: 2, volume: 0 }));

    dispatch(clearSelected());
    dispatch(resetPlayer());
    dispatch(setPlayerIndex(rowData));
    dispatch(fixPlayer2Index());
    dispatch(setStatus('PLAYING'));
  };

  const handleDragEnd = () => {
    if (multiSelect.isDragging) {
      dispatch(
        moveToIndex({
          entries: multiSelect.selected,
          moveBeforeId: multiSelect.currentMouseOverId,
        })
      );
      dispatch(setIsDragging(false));
      if (playQueue.currentPlayer === 1) {
        dispatch(fixPlayer2Index());
      }
    }
  };

  const handlePlayRandom = async (action: 'play' | 'add') => {
    setIsLoadingRandom(true);
    const res = await getRandomSongs({
      size: randomPlaylistTrackCount,
      fromYear: randomPlaylistFromYear !== 0 ? randomPlaylistFromYear : undefined,
      toYear: randomPlaylistToYear !== 0 ? randomPlaylistToYear : undefined,
      genre: randomPlaylistGenre,
    });

    if (isFailedResponse(res)) {
      addRandomTriggerRef.current.close();
      return notifyToast('error', errorMessages(res)[0]);
    }

    if (action === 'play') {
      dispatch(setPlayQueue({ entries: res.song }));
      dispatch(setStatus('PLAYING'));
      notifyToast('info', `Playing ${res.song.length} song(s)`);
    } else {
      dispatch(appendPlayQueue({ entries: res.song }));
      if (playQueue.entry.length < 1) {
        dispatch(setStatus('PLAYING'));
      }
      notifyToast('info', `Added ${res.song.length} song(s) to the queue`);
    }

    setIsLoadingRandom(false);
    return addRandomTriggerRef.current.close();
  };

  const handleRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await star(rowData.id, 'playlist');
      dispatch(setStar({ id: rowData.id, type: 'star' }));
    } else {
      await unstar(rowData.id, 'playlist');
      dispatch(setStar({ id: rowData.id, type: 'unstar' }));
    }
  };

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          title="Now Playing"
          subtitle={
            <>
              <ButtonToolbar>
                <ClearQueueButton
                  size="sm"
                  onClick={() => {
                    dispatch(clearPlayQueue());
                    dispatch(setStatus('PAUSED'));
                    // Needs a timeout otherwise the seek may still update after the pause due to
                    // the delay timeout
                    setTimeout(() => dispatch(resetPlayer()), 200);
                  }}
                />
                <ShuffleButton
                  size="sm"
                  onClick={() => {
                    if (playQueue.shuffle) {
                      dispatch(shuffleInPlace());
                    } else {
                      dispatch(toggleShuffle());
                    }
                  }}
                />
                <Whisper
                  ref={addRandomTriggerRef}
                  placement="autoVertical"
                  trigger="none"
                  speaker={
                    <StyledPopover>
                      <ControlLabel>How many tracks? (1-500)*</ControlLabel>
                      <StyledInputGroup>
                        <StyledInputNumber
                          min={1}
                          max={500}
                          step={10}
                          defaultValue={randomPlaylistTrackCount}
                          value={randomPlaylistTrackCount}
                          onChange={(e: number) => {
                            settings.setSync('randomPlaylistTrackCount', Number(e));
                            setRandomPlaylistTrackCount(Number(e));
                          }}
                        />
                      </StyledInputGroup>

                      <br />

                      <FlexboxGrid justify="space-between">
                        <FlexboxGrid.Item>
                          <ControlLabel>From year</ControlLabel>
                          <div>
                            <StyledInputGroup>
                              <StyledInputNumber
                                width={100}
                                min={0}
                                max={3000}
                                step={1}
                                defaultValue={randomPlaylistFromYear}
                                value={randomPlaylistFromYear}
                                onChange={(e: number) => {
                                  setRandomPlaylistFromYear(Number(e));
                                }}
                              />
                            </StyledInputGroup>
                          </div>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item>
                          <ControlLabel>To year</ControlLabel>
                          <div>
                            <StyledInputGroup>
                              <StyledInputNumber
                                width={100}
                                min={0}
                                max={3000}
                                step={1}
                                defaultValue={randomPlaylistToYear}
                                value={randomPlaylistToYear}
                                onChange={(e: number) => setRandomPlaylistToYear(Number(e))}
                              />
                            </StyledInputGroup>
                          </div>
                        </FlexboxGrid.Item>
                      </FlexboxGrid>
                      <br />
                      <ControlLabel>Genre</ControlLabel>
                      <div>
                        <StyledInputPicker
                          data={genres}
                          value={randomPlaylistGenre}
                          virtualized
                          onChange={(e: string) => setRandomPlaylistGenre(e)}
                        />
                      </div>
                      <br />
                      <ButtonToolbar>
                        <StyledIconButton
                          onClick={() => handlePlayRandom('play')}
                          loading={isLoadingRandom}
                          icon={<Icon icon="play" />}
                          disabled={!(typeof randomPlaylistTrackCount === 'number')}
                        >
                          Play
                        </StyledIconButton>
                        <StyledIconButton
                          onClick={() => handlePlayRandom('add')}
                          loading={isLoadingRandom}
                          icon={<Icon icon="plus" />}
                          disabled={!(typeof randomPlaylistTrackCount === 'number')}
                        >
                          Add to queue
                        </StyledIconButton>
                      </ButtonToolbar>
                    </StyledPopover>
                  }
                >
                  <AutoPlaylistButton
                    size="sm"
                    onClick={() =>
                      addRandomTriggerRef.current.state.isOverlayShown
                        ? addRandomTriggerRef.current.close()
                        : addRandomTriggerRef.current.open()
                    }
                  />
                </Whisper>
              </ButtonToolbar>
            </>
          }
          subsidetitle={
            <StyledCheckbox
              defaultChecked={playQueue.scrollWithCurrentSong}
              checked={playQueue.scrollWithCurrentSong}
              onChange={() => {
                settings.setSync(
                  'scrollWithCurrentSong',
                  !settings.getSync('scrollWithCurrentSong')
                );
                dispatch(
                  setPlaybackSetting({
                    setting: 'scrollWithCurrentSong',
                    value: !playQueue.scrollWithCurrentSong,
                  })
                );
              }}
            >
              Auto scroll
            </StyledCheckbox>
          }
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showSearchBar
        />
      }
    >
      {!playQueue ? (
        <PageLoader />
      ) : (
        <ListViewType
          ref={tableRef}
          data={searchQuery !== '' ? filteredData : playQueue[getCurrentEntryList(playQueue)]}
          currentIndex={playQueue.currentIndex}
          tableColumns={settings.getSync('musicListColumns')}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          handleDragEnd={handleDragEnd}
          virtualized
          rowHeight={Number(settings.getSync('musicListRowHeight'))}
          fontSize={Number(settings.getSync('musicListFontSize'))}
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'album',
            cacheIdProperty: 'albumId',
          }}
          listType="music"
          nowPlaying
          dnd
          disabledContextMenuOptions={['deletePlaylist']}
          handleFavorite={handleRowFavorite}
        />
      )}
    </GenericPage>
  );
};

export default NowPlayingView;
