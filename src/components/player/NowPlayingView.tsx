import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
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
  setRate,
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
  StyledButton,
  StyledCheckbox,
  StyledInputGroup,
  StyledInputNumber,
  StyledInputPicker,
  StyledPopover,
} from '../shared/styled';
import { errorMessages, getCurrentEntryList, isFailedResponse } from '../../shared/utils';
import { getGenres, getRandomSongs, setRating, star, unstar } from '../../api/api';
import { notifyToast } from '../shared/toast';

const NowPlayingView = () => {
  const tableRef = useRef<any>();
  const addRandomTriggerRef = useRef<any>();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const config = useAppSelector((state) => state.config);
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
      const genresOrderedBySongCount = _.orderBy(res, 'songCount', 'desc');
      return genresOrderedBySongCount.map((genre: any) => {
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
        dispatch(clearSelected());
        dispatch(setStatus('PAUSED'));
        setTimeout(() => dispatch(resetPlayer()), 200);
      } else {
        dispatch(removeFromPlayQueue({ entries: multiSelect.selected }));
        dispatch(clearSelected());
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

  const handlePlayRandom = async (action: 'play' | 'addNext' | 'addLater') => {
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

    const cleanedSongs = res.song.filter((song: any) => {
      // Remove invalid songs that may break the player
      return song.bitRate && song.duration;
    });

    const difference = res.song.length - cleanedSongs.length;

    if (action === 'play') {
      dispatch(setPlayQueue({ entries: cleanedSongs }));
      dispatch(setStatus('PLAYING'));
      notifyToast(
        'info',
        `Playing ${cleanedSongs.length} ${
          difference !== 0 ? `(-${difference} invalid)` : ''
        } song(s)`
      );
    } else if (action === 'addLater') {
      dispatch(appendPlayQueue({ entries: cleanedSongs, type: 'later' }));
      if (playQueue.entry.length < 1) {
        dispatch(setStatus('PLAYING'));
      }
      notifyToast(
        'info',
        `Added ${cleanedSongs.length} ${difference !== 0 ? `(-${difference} invalid)` : ''} song(s)`
      );
    } else {
      dispatch(appendPlayQueue({ entries: cleanedSongs, type: 'next' }));
      if (playQueue.entry.length < 1) {
        dispatch(setStatus('PLAYING'));
      }
      notifyToast(
        'info',
        `Added ${cleanedSongs.length} ${difference !== 0 ? `(-${difference} invalid)` : ''} song(s)`
      );
    }

    setIsLoadingRandom(false);
    return addRandomTriggerRef.current.close();
  };

  const handleRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await star(rowData.id, 'music');
      dispatch(setStar({ id: [rowData.id], type: 'star' }));
    } else {
      await unstar(rowData.id, 'music');
      dispatch(setStar({ id: [rowData.id], type: 'unstar' }));
    }
  };

  const handleRowRating = (rowData: any, e: number) => {
    setRating(rowData.id, e);
    dispatch(setRate({ id: [rowData.id], rating: e }));
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
                        <StyledButton
                          onClick={() => handlePlayRandom('addNext')}
                          loading={isLoadingRandom}
                          disabled={!(typeof randomPlaylistTrackCount === 'number')}
                        >
                          <Icon icon="plus-circle" style={{ marginRight: '10px' }} /> Add (next)
                        </StyledButton>
                        <StyledButton
                          onClick={() => handlePlayRandom('addLater')}
                          loading={isLoadingRandom}
                          disabled={!(typeof randomPlaylistTrackCount === 'number')}
                        >
                          <Icon icon="plus" style={{ marginRight: '10px' }} /> Add (later)
                        </StyledButton>
                      </ButtonToolbar>
                      <ButtonToolbar>
                        <StyledButton
                          block
                          appearance="primary"
                          onClick={() => handlePlayRandom('play')}
                          loading={isLoadingRandom}
                          disabled={!(typeof randomPlaylistTrackCount === 'number')}
                        >
                          <Icon icon="play" style={{ marginRight: '10px' }} />
                          Play
                        </StyledButton>
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
              onChange={(_v: any, e: boolean) => {
                settings.setSync('scrollWithCurrentSong', e);
                dispatch(
                  setPlaybackSetting({
                    setting: 'scrollWithCurrentSong',
                    value: e,
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
          tableColumns={config.lookAndFeel.listView.music.columns}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          handleDragEnd={handleDragEnd}
          virtualized
          rowHeight={config.lookAndFeel.listView.music.rowHeight}
          fontSize={config.lookAndFeel.listView.music.fontSize}
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'album',
            cacheIdProperty: 'albumId',
          }}
          listType="music"
          nowPlaying
          dnd
          disabledContextMenuOptions={['deletePlaylist', 'viewInModal']}
          handleFavorite={handleRowFavorite}
          handleRating={handleRowRating}
        />
      )}
    </GenericPage>
  );
};

export default NowPlayingView;
