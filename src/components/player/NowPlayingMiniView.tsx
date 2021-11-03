import React, { useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { ButtonToolbar, FlexboxGrid, Icon, Whisper, ControlLabel } from 'rsuite';
import { useHotkeys } from 'react-hotkeys-hook';
import { useQuery } from 'react-query';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  toggleSelected,
  setRangeSelected,
  toggleRangeSelected,
  clearSelected,
  setIsDragging,
} from '../../redux/multiSelectSlice';
import {
  setPlayerVolume,
  setPlayerIndex,
  fixPlayer2Index,
  clearPlayQueue,
  shuffleInPlace,
  toggleShuffle,
  moveToIndex,
  setPlaybackSetting,
  removeFromPlayQueue,
  setStar,
  setPlayQueue,
  appendPlayQueue,
  moveToTop,
  moveToBottom,
} from '../../redux/playQueueSlice';
import { resetPlayer, setStatus } from '../../redux/playerSlice';
import ListViewType from '../viewtypes/ListViewType';
import GenericPage from '../layout/GenericPage';
import {
  StyledButton,
  StyledCheckbox,
  StyledInputNumber,
  StyledInputPicker,
  StyledInputPickerContainer,
  StyledPopover,
} from '../shared/styled';
import { MiniViewContainer } from './styled';
import {
  errorMessages,
  filterPlayQueue,
  getCurrentEntryList,
  getPlayedSongsNotification,
  isFailedResponse,
} from '../../shared/utils';
import { getGenres, getMusicFolders, getRandomSongs, star, unstar } from '../../api/api';
import {
  AutoPlaylistButton,
  ClearQueueButton,
  MoveBottomButton,
  MoveTopButton,
  RemoveSelectedButton,
  ShuffleButton,
} from '../shared/ToolbarButtons';
import { notifyToast } from '../shared/toast';

const NowPlayingMiniView = () => {
  const tableRef = useRef<any>();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const config = useAppSelector((state) => state.config);
  const folder = useAppSelector((state) => state.folder);
  const [autoPlaylistTrackCount, setRandomPlaylistTrackCount] = useState(
    Number(settings.getSync('randomPlaylistTrackCount'))
  );
  const genrePickerContainerRef = useRef(null);
  const musicFolderPickerContainerRef = useRef(null);
  const autoPlaylistTriggerRef = useRef<any>();
  const [autoPlaylistFromYear, setRandomPlaylistFromYear] = useState(0);
  const [autoPlaylistToYear, setRandomPlaylistToYear] = useState(0);
  const [randomPlaylistGenre, setRandomPlaylistGenre] = useState('');
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [musicFolder, setMusicFolder] = useState(folder.musicFolder);

  const { isLoading: isLoadingGenres, data: genres }: any = useQuery(['genreList'], async () => {
    const res = await getGenres();
    const genresOrderedBySongCount = _.orderBy(res, 'songCount', 'desc');
    return genresOrderedBySongCount.map((genre: any) => {
      return {
        label: `${genre.value} (${genre.songCount})`,
        value: genre.value,
        role: 'Genre',
      };
    });
  });

  const { isLoading: isLoadingMusicFolders, data: musicFolders } = useQuery(
    ['musicFolders'],
    getMusicFolders
  );

  useHotkeys(
    'del',
    () => {
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
        const rowHeight = Number(settings.getSync('miniListRowHeight'));
        tableRef?.current?.table.current.scrollTop(
          rowHeight * playQueue.currentIndex - rowHeight * 2 > 0
            ? rowHeight * playQueue.currentIndex - rowHeight * 2
            : 0
        );
      }, 100);
    }
  }, [playQueue.currentIndex, tableRef, playQueue.displayQueue, playQueue.scrollWithCurrentSong]);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any, tableData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          dispatch(toggleRangeSelected(tableData));
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
      size: autoPlaylistTrackCount,
      fromYear: autoPlaylistFromYear !== 0 ? autoPlaylistFromYear : undefined,
      toYear: autoPlaylistToYear !== 0 ? autoPlaylistToYear : undefined,
      genre: randomPlaylistGenre,
      musicFolderId: musicFolder,
    });

    if (isFailedResponse(res)) {
      autoPlaylistTriggerRef.current.close();
      return notifyToast('error', errorMessages(res)[0]);
    }

    const cleanedSongs = filterPlayQueue(
      config.playback.filters,
      res.song.filter((song: any) => {
        // Remove invalid songs that may break the player
        return song.bitRate && song.duration;
      })
    );

    if (cleanedSongs.entries.length > 0) {
      if (action === 'play') {
        if (cleanedSongs.entries.length > 0) {
          dispatch(setPlayQueue({ entries: cleanedSongs.entries }));
          dispatch(setStatus('PLAYING'));
          dispatch(fixPlayer2Index());
        } else {
          dispatch(clearPlayQueue());
          dispatch(setStatus('PAUSED'));
        }

        notifyToast(
          'info',
          getPlayedSongsNotification({
            original: res.song.length,
            filtered: cleanedSongs.count.filtered,
            type: 'play',
          })
        );
      } else if (action === 'addLater') {
        if (cleanedSongs.entries.length > 0) {
          dispatch(appendPlayQueue({ entries: cleanedSongs.entries, type: 'later' }));
          dispatch(fixPlayer2Index());
        }

        notifyToast(
          'info',
          getPlayedSongsNotification({
            original: res.song.length,
            filtered: cleanedSongs.count.filtered,
            type: 'add',
          })
        );
      } else {
        if (cleanedSongs.entries.length > 0) {
          dispatch(appendPlayQueue({ entries: cleanedSongs.entries, type: 'next' }));
          dispatch(fixPlayer2Index());
        }

        notifyToast(
          'info',
          getPlayedSongsNotification({
            original: res.song.length,
            filtered: cleanedSongs.count.filtered,
            type: 'add',
          })
        );
      }
      dispatch(fixPlayer2Index());
      setIsLoadingRandom(false);
      return autoPlaylistTriggerRef.current.close();
    }
    setIsLoadingRandom(false);
    return notifyToast('warning', `No songs found, adjust your filters`);
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

  return (
    <>
      {playQueue.displayQueue && (
        <MiniViewContainer
          id="miniview-container"
          display={playQueue.displayQueue ? 'true' : 'false'}
        >
          <GenericPage
            hideDivider
            padding="0px"
            header={
              <>
                <FlexboxGrid justify="space-between" align="middle">
                  <FlexboxGrid.Item>
                    <ButtonToolbar>
                      <ClearQueueButton
                        size="xs"
                        onClick={() => {
                          dispatch(clearPlayQueue());
                          dispatch(setStatus('PAUSED'));
                          // Needs a timeout otherwise the seek may still update after the pause due to
                          // the delay timeout
                          setTimeout(() => dispatch(resetPlayer()), 200);
                        }}
                      />
                      <ShuffleButton
                        size="xs"
                        onClick={() => {
                          if (playQueue.shuffle) {
                            dispatch(shuffleInPlace());
                          } else {
                            dispatch(toggleShuffle());
                          }
                        }}
                      />
                      <Whisper
                        ref={autoPlaylistTriggerRef}
                        placement="autoVertical"
                        trigger="none"
                        speaker={
                          <StyledPopover>
                            <ControlLabel>How many tracks? (1-500)*</ControlLabel>
                            <StyledInputNumber
                              min={1}
                              max={500}
                              step={10}
                              defaultValue={autoPlaylistTrackCount}
                              value={autoPlaylistTrackCount}
                              onChange={(e: number) => {
                                settings.setSync('randomPlaylistTrackCount', Number(e));
                                setRandomPlaylistTrackCount(Number(e));
                              }}
                            />
                            <br />
                            <FlexboxGrid justify="space-between">
                              <FlexboxGrid.Item>
                                <ControlLabel>From year</ControlLabel>
                                <div>
                                  <StyledInputNumber
                                    width={100}
                                    min={0}
                                    max={3000}
                                    step={1}
                                    defaultValue={autoPlaylistFromYear}
                                    value={autoPlaylistFromYear}
                                    onChange={(e: number) => {
                                      setRandomPlaylistFromYear(Number(e));
                                    }}
                                  />
                                </div>
                              </FlexboxGrid.Item>
                              <FlexboxGrid.Item>
                                <ControlLabel>To year</ControlLabel>
                                <div>
                                  <StyledInputNumber
                                    width={100}
                                    min={0}
                                    max={3000}
                                    step={1}
                                    defaultValue={autoPlaylistToYear}
                                    value={autoPlaylistToYear}
                                    onChange={(e: number) => setRandomPlaylistToYear(Number(e))}
                                  />
                                </div>
                              </FlexboxGrid.Item>
                            </FlexboxGrid>
                            <br />
                            <ControlLabel>Genre</ControlLabel>
                            <StyledInputPickerContainer ref={genrePickerContainerRef}>
                              <StyledInputPicker
                                style={{ width: '100%' }}
                                container={() => genrePickerContainerRef.current}
                                data={!isLoadingGenres ? genres : []}
                                value={randomPlaylistGenre}
                                virtualized
                                onChange={(e: string) => setRandomPlaylistGenre(e)}
                              />
                            </StyledInputPickerContainer>
                            <br />
                            <StyledInputPickerContainer ref={musicFolderPickerContainerRef}>
                              <ControlLabel>Music folder</ControlLabel>
                              <br />
                              <StyledInputPicker
                                style={{ width: '100%' }}
                                container={() => musicFolderPickerContainerRef.current}
                                data={!isLoadingMusicFolders ? musicFolders : []}
                                defaultValue={musicFolder}
                                valueKey="id"
                                labelKey="name"
                                onChange={(e: any) => {
                                  setMusicFolder(e);
                                }}
                              />
                            </StyledInputPickerContainer>
                            <br />
                            <ButtonToolbar>
                              <StyledButton
                                appearance="subtle"
                                onClick={() => handlePlayRandom('addNext')}
                                loading={isLoadingRandom}
                                disabled={!(typeof autoPlaylistTrackCount === 'number')}
                              >
                                <Icon icon="plus-circle" style={{ marginRight: '10px' }} /> Add
                                (next)
                              </StyledButton>
                              <StyledButton
                                appearance="subtle"
                                onClick={() => handlePlayRandom('addLater')}
                                loading={isLoadingRandom}
                                disabled={!(typeof autoPlaylistTrackCount === 'number')}
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
                                disabled={!(typeof autoPlaylistTrackCount === 'number')}
                              >
                                <Icon icon="play" style={{ marginRight: '10px' }} />
                                Play
                              </StyledButton>
                            </ButtonToolbar>
                          </StyledPopover>
                        }
                      >
                        <AutoPlaylistButton
                          size="xs"
                          noText
                          onClick={() =>
                            autoPlaylistTriggerRef.current.state.isOverlayShown
                              ? autoPlaylistTriggerRef.current.close()
                              : autoPlaylistTriggerRef.current.open()
                          }
                        />
                      </Whisper>
                      <MoveTopButton
                        size="xs"
                        appearance="subtle"
                        onClick={() => {
                          dispatch(moveToTop({ selectedEntries: multiSelect.selected }));
                          if (playQueue.currentPlayer === 1) {
                            dispatch(fixPlayer2Index());
                          }
                        }}
                      />
                      <MoveBottomButton
                        size="xs"
                        appearance="subtle"
                        onClick={() => {
                          dispatch(moveToBottom({ selectedEntries: multiSelect.selected }));
                          if (playQueue.currentPlayer === 1) {
                            dispatch(fixPlayer2Index());
                          }
                        }}
                      />
                      <RemoveSelectedButton
                        size="xs"
                        appearance="subtle"
                        onClick={() => {
                          if (multiSelect.selected.length === playQueue.entry.length) {
                            // Clear the queue instead of removing individually
                            dispatch(clearPlayQueue());
                            dispatch(setStatus('PAUSED'));
                            setTimeout(() => dispatch(resetPlayer()), 200);
                          } else {
                            dispatch(removeFromPlayQueue({ entries: multiSelect.selected }));
                            dispatch(clearSelected());
                            if (playQueue.currentPlayer === 1) {
                              dispatch(fixPlayer2Index());
                            }
                          }
                        }}
                      />
                    </ButtonToolbar>
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item>
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
                    />
                  </FlexboxGrid.Item>
                </FlexboxGrid>
              </>
            }
          >
            <ListViewType
              ref={tableRef}
              data={playQueue[getCurrentEntryList(playQueue)]}
              currentIndex={playQueue.currentIndex}
              tableColumns={config.lookAndFeel.listView.mini.columns}
              handleRowClick={handleRowClick}
              handleRowDoubleClick={handleRowDoubleClick}
              handleDragEnd={handleDragEnd}
              virtualized
              rowHeight={config.lookAndFeel.listView.mini.rowHeight}
              fontSize={config.lookAndFeel.listView.mini.fontSize}
              cacheImages={{
                enabled: settings.getSync('cacheImages'),
                cacheType: 'album',
                cacheIdProperty: 'albumId',
              }}
              listType="music"
              miniView
              nowPlaying
              dnd
              disabledContextMenuOptions={['deletePlaylist', 'viewInModal']}
              handleFavorite={handleRowFavorite}
            />
          </GenericPage>
        </MiniViewContainer>
      )}
    </>
  );
};

export default NowPlayingMiniView;
