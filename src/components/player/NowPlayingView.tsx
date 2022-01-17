import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { useQuery } from 'react-query';
import { ButtonToolbar, ButtonGroup, ControlLabel, FlexboxGrid, Icon, Whisper } from 'rsuite';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import useSearchQuery from '../../hooks/useSearchQuery';
import {
  setPlayerIndex,
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
  moveToTop,
  moveToBottom,
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
import { setStatus } from '../../redux/playerSlice';
import {
  AutoPlaylistButton,
  ClearQueueButton,
  MoveBottomButton,
  MoveTopButton,
  RemoveSelectedButton,
  ShuffleButton,
} from '../shared/ToolbarButtons';
import {
  StyledButton,
  StyledCheckbox,
  StyledInputNumber,
  StyledInputPicker,
  StyledInputPickerContainer,
  StyledPopover,
  StyledTag,
} from '../shared/styled';
import {
  errorMessages,
  filterPlayQueue,
  getCurrentEntryList,
  getPlayedSongsNotification,
  isFailedResponse,
} from '../../shared/utils';
import { notifyToast } from '../shared/toast';
import { apiController } from '../../api/controller';
import { Song } from '../../types';
import { setPlaylistRate } from '../../redux/playlistSlice';

const NowPlayingView = () => {
  const { t } = useTranslation();
  const tableRef = useRef<any>();
  const genrePickerContainerRef = useRef(null);
  const musicFolderPickerContainerRef = useRef(null);
  const autoPlaylistTriggerRef = useRef<any>();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const config = useAppSelector((state) => state.config);
  const folder = useAppSelector((state) => state.folder);
  const misc = useAppSelector((state) => state.misc);
  const [autoPlaylistTrackCount, setRandomPlaylistTrackCount] = useState(
    Number(settings.getSync('randomPlaylistTrackCount'))
  );
  const [autoPlaylistFromYear, setRandomPlaylistFromYear] = useState(0);
  const [autoPlaylistToYear, setRandomPlaylistToYear] = useState(0);
  const [randomPlaylistGenre, setRandomPlaylistGenre] = useState<string | undefined>(undefined);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [musicFolder, setMusicFolder] = useState(folder.musicFolder);

  const { data: musicFolders } = useQuery(['musicFolders'], () =>
    apiController({ serverType: config.serverType, endpoint: 'getMusicFolders' })
  );

  const filteredData = useSearchQuery(misc.searchQuery, playQueue.entry, [
    'title',
    'artist',
    'album',
    'year',
    'genre',
    'path',
  ]);

  const { data: genres }: any = useQuery(['genreList'], async () => {
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
  });

  useHotkeys(
    'del',
    (e: KeyboardEvent) => {
      e.preventDefault();
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

    dispatch(clearSelected());
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

  const handleRowRating = (rowData: any, e: number) => {
    apiController({
      serverType: config.serverType,
      endpoint: 'setRating',
      args: { ids: [rowData.id], rating: e },
    });
    dispatch(setRate({ id: [rowData.id], rating: e }));
    dispatch(setPlaylistRate({ id: [rowData.id], rating: e }));
  };

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          title={
            <>
              {t('Now Playing')}{' '}
              <StyledTag style={{ verticalAlign: 'middle', cursor: 'default' }}>
                {playQueue.entry?.length || '...'}
              </StyledTag>
            </>
          }
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
                  ref={autoPlaylistTriggerRef}
                  placement="autoVertical"
                  trigger="click"
                  enterable
                  speaker={
                    <StyledPopover>
                      <ControlLabel>{t('How many tracks? (1-500)*')}</ControlLabel>
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
                      <StyledInputPickerContainer ref={genrePickerContainerRef}>
                        <ControlLabel>{t('Genre')}</ControlLabel>
                        <br />
                        <StyledInputPicker
                          style={{ width: '100%' }}
                          container={() => genrePickerContainerRef.current}
                          data={genres}
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
                          data={musicFolders}
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
                  <AutoPlaylistButton size="sm" />
                </Whisper>
                <ButtonGroup>
                  <MoveTopButton
                    size="sm"
                    appearance="subtle"
                    onClick={() => {
                      dispatch(moveToTop({ selectedEntries: multiSelect.selected }));

                      if (playQueue.currentPlayer === 1) {
                        dispatch(fixPlayer2Index());
                      }
                    }}
                  />
                  <MoveBottomButton
                    size="sm"
                    appearance="subtle"
                    onClick={() => {
                      dispatch(moveToBottom({ selectedEntries: multiSelect.selected }));

                      if (playQueue.currentPlayer === 1) {
                        dispatch(fixPlayer2Index());
                      }
                    }}
                  />
                  <RemoveSelectedButton
                    size="sm"
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
                </ButtonGroup>
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
              {t('Auto scroll')}
            </StyledCheckbox>
          }
        />
      }
    >
      {!playQueue ? (
        <PageLoader />
      ) : (
        <ListViewType
          ref={tableRef}
          data={misc.searchQuery !== '' ? filteredData : playQueue[getCurrentEntryList(playQueue)]}
          currentIndex={playQueue.currentIndex}
          tableColumns={config.lookAndFeel.listView.music.columns}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          handleDragEnd={handleDragEnd}
          virtualized
          rowHeight={config.lookAndFeel.listView.music.rowHeight}
          fontSize={config.lookAndFeel.listView.music.fontSize}
          listType="music"
          nowPlaying
          dnd
          disabledContextMenuOptions={['deletePlaylist', 'viewInModal']}
          handleFavorite={handleRowFavorite}
          handleRating={handleRowRating}
          initialScrollOffset={
            playQueue.scrollWithCurrentSong
              ? 0
              : Number(localStorage.getItem('scroll_list_nowPlaying'))
          }
          onScroll={(scrollIndex: number) => {
            localStorage.setItem('scroll_list_nowPlaying', String(Math.abs(scrollIndex)));
          }}
        />
      )}
    </GenericPage>
  );
};

export default NowPlayingView;
