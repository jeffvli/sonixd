import React, { useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { ButtonToolbar, FlexboxGrid, Icon, Whisper, ControlLabel } from 'rsuite';
import { useHotkeys } from 'react-hotkeys-hook';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearSelected, setIsDragging } from '../../redux/multiSelectSlice';
import {
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
import { setStatus } from '../../redux/playerSlice';
import ListViewType from '../viewtypes/ListViewType';
import GenericPage from '../layout/GenericPage';
import {
  StyledButton,
  StyledCheckbox,
  StyledInputNumber,
  StyledInputPicker,
  StyledInputPickerContainer,
  StyledPopover,
  StyledTag,
} from '../shared/styled';
import { MiniViewContainer } from './styled';
import {
  errorMessages,
  filterPlayQueue,
  getCurrentEntryList,
  getPlayedSongsNotification,
  isFailedResponse,
} from '../../shared/utils';
import {
  AutoPlaylistButton,
  ClearQueueButton,
  MoveBottomButton,
  MoveTopButton,
  RemoveSelectedButton,
  ShuffleButton,
} from '../shared/ToolbarButtons';
import { notifyToast } from '../shared/toast';
import { apiController } from '../../api/controller';
import { Server, Song } from '../../types';
import useListClickHandler from '../../hooks/useListClickHandler';

const NowPlayingMiniView = () => {
  const { t } = useTranslation();
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

  const { isLoading: isLoadingGenres, data: genres }: any = useQuery(
    ['genreList', folder.musicFolder],
    async () => {
      const res = await apiController({
        serverType: config.serverType,
        endpoint: 'getGenres',
        args: { musicFolderId: folder.musicFolder },
      });
      const genresOrderedBySongCount = _.orderBy(res, 'songCount', 'desc');
      return genresOrderedBySongCount.map((genre: any) => {
        return {
          title: `${genre.title} ${genre.albumCount ? `(${genre.albumCount})` : ''}`,
          id: genre.title,
          role: 'Genre',
        };
      });
    }
  );

  const { isLoading: isLoadingMusicFolders, data: musicFolders } = useQuery(['musicFolders'], () =>
    apiController({ serverType: config.serverType, endpoint: 'getMusicFolders' })
  );

  useHotkeys(
    'del',
    () => {
      if (multiSelect.selected.length === playQueue.entry.length) {
        // Clear the queue instead of removing individually
        dispatch(clearPlayQueue());
        dispatch(clearSelected());
        dispatch(setStatus('PAUSED'));
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

  const { handleRowClick, handleRowDoubleClick } = useListClickHandler();

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

    const res: Song[] = await apiController({
      serverType: config.serverType,
      endpoint: 'getRandomSongs',
      args: {
        size: autoPlaylistTrackCount,
        fromYear: autoPlaylistFromYear !== 0 ? autoPlaylistFromYear : undefined,
        toYear: autoPlaylistToYear !== 0 ? autoPlaylistToYear : undefined,
        genre: randomPlaylistGenre,
        musicFolderId: musicFolder,
      },
    });

    if (isFailedResponse(res)) {
      autoPlaylistTriggerRef.current.close();
      return notifyToast('error', errorMessages(res)[0]);
    }

    const cleanedSongs = filterPlayQueue(
      config.playback.filters,
      res.filter((song: any) => {
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
            original: res.length,
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
            original: res.length,
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
            original: res.length,
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
    return notifyToast('warning', t('No songs found, adjust your filters'));
  };

  const handleRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'music' },
      });
      dispatch(setStar({ id: [rowData.id], type: 'star' }));
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: rowData.id, type: 'music' },
      });
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
                        trigger="click"
                        enterable
                        speaker={
                          <StyledPopover>
                            <ControlLabel>{`${t('How many tracks?')} ${
                              config.serverType === Server.Subsonic ? '(1 - 500)*' : '(1 - ∞)'
                            }`}</ControlLabel>
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
                                <ControlLabel>{t('From year')}</ControlLabel>
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
                                <ControlLabel>{t('To year')}</ControlLabel>
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
                            <ControlLabel>{t('Genre')}</ControlLabel>
                            <StyledInputPickerContainer ref={genrePickerContainerRef}>
                              <StyledInputPicker
                                style={{ width: '100%' }}
                                container={() => genrePickerContainerRef.current}
                                data={!isLoadingGenres ? genres : []}
                                value={randomPlaylistGenre}
                                valueKey="id"
                                labelKey="title"
                                virtualized
                                placeholder={t('Select')}
                                onChange={(e: string) => setRandomPlaylistGenre(e)}
                              />
                            </StyledInputPickerContainer>
                            <br />
                            <StyledInputPickerContainer ref={musicFolderPickerContainerRef}>
                              <ControlLabel>{t('Music folder')}</ControlLabel>
                              <br />
                              <StyledInputPicker
                                style={{ width: '100%' }}
                                container={() => musicFolderPickerContainerRef.current}
                                data={!isLoadingMusicFolders ? musicFolders : []}
                                defaultValue={musicFolder}
                                valueKey="id"
                                labelKey="title"
                                placeholder={t('Select')}
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
                                <Icon icon="plus-circle" style={{ marginRight: '10px' }} />
                                {t('Add (next)')}
                              </StyledButton>
                              <StyledButton
                                appearance="subtle"
                                onClick={() => handlePlayRandom('addLater')}
                                loading={isLoadingRandom}
                                disabled={!(typeof autoPlaylistTrackCount === 'number')}
                              >
                                <Icon icon="plus" style={{ marginRight: '10px' }} />
                                {t('Add (later)')}
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
                                {t('Play')}
                              </StyledButton>
                            </ButtonToolbar>
                          </StyledPopover>
                        }
                      >
                        <AutoPlaylistButton size="xs" noText />
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
                          } else {
                            dispatch(removeFromPlayQueue({ entries: multiSelect.selected }));
                            dispatch(clearSelected());
                            if (playQueue.currentPlayer === 1) {
                              dispatch(fixPlayer2Index());
                            }
                          }
                        }}
                      />
                      <StyledTag style={{ verticalAlign: 'middle', cursor: 'default' }}>
                        {playQueue.entry?.length || '...'}
                      </StyledTag>
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
