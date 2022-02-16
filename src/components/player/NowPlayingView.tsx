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
  fixPlayer2Index,
  clearPlayQueue,
  shuffleInPlace,
  toggleShuffle,
  setPlaybackSetting,
  removeFromPlayQueue,
  setPlayQueue,
  appendPlayQueue,
  moveToTop,
  moveToBottom,
} from '../../redux/playQueueSlice';
import { clearSelected } from '../../redux/multiSelectSlice';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import ListViewType from '../viewtypes/ListViewType';
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
import { Server, Song } from '../../types';
import NowPlayingInfoView from './NowPlayingInfoView';
import CenterLoader from '../loader/CenterLoader';
import useListClickHandler from '../../hooks/useListClickHandler';
import Popup from '../shared/Popup';
import useFavorite from '../../hooks/useFavorite';
import { useRating } from '../../hooks/useRating';

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
  const [infoMode, setInfoMode] = useState(settings.getSync('infoMode' || false));

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

  const { handleRowClick, handleRowDoubleClick, handleDragEnd } = useListClickHandler({
    dnd: 'playQueue',
  });

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

  const { handleFavorite } = useFavorite();
  const { handleRating } = useRating();

  return (
    <>
      <GenericPage
        hideDivider
        header={
          <GenericPageHeader
            title={
              <>
                {!infoMode && (
                  <>
                    {t('Now Playing')}{' '}
                    <StyledTag style={{ verticalAlign: 'middle', cursor: 'default' }}>
                      {playQueue.entry?.length || '...'}
                    </StyledTag>
                  </>
                )}
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
                      <Popup>
                        <ControlLabel>{`${t('How many tracks?')} ${
                          config.serverType === Server.Subsonic ? '(1 - 500)*' : '(1 - ∞)'
                        }`}</ControlLabel>
                        <StyledInputNumber
                          min={1}
                          max={config.serverType === Server.Subsonic ? 500 : undefined}
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
                        <StyledButton
                          appearance="subtle"
                          onClick={() => handlePlayRandom('addNext')}
                          loading={isLoadingRandom}
                          disabled={!(typeof autoPlaylistTrackCount === 'number')}
                          style={{ width: '50%' }}
                        >
                          <Icon icon="plus-circle" style={{ marginRight: '10px' }} />
                          {t('Add (next)')}
                        </StyledButton>
                        <StyledButton
                          appearance="subtle"
                          onClick={() => handlePlayRandom('addLater')}
                          loading={isLoadingRandom}
                          disabled={!(typeof autoPlaylistTrackCount === 'number')}
                          style={{ width: '50%' }}
                        >
                          <Icon icon="plus" style={{ marginRight: '10px' }} />
                          {t('Add (later)')}
                        </StyledButton>
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
                      </Popup>
                    }
                  >
                    <AutoPlaylistButton size="sm" />
                  </Whisper>
                  <StyledButton
                    size="sm"
                    onClick={() => {
                      settings.setSync('infoMode', !infoMode);
                      setInfoMode(!infoMode);
                    }}
                  >
                    <Icon icon="info-circle" />
                  </StyledButton>
                  {!infoMode && (
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
                  )}
                </ButtonToolbar>
              </>
            }
            subsidetitle={
              <>
                {!infoMode && (
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
                )}
              </>
            }
          />
        }
      >
        {!playQueue ? (
          <CenterLoader />
        ) : (
          <>
            {infoMode && <NowPlayingInfoView />}
            {!infoMode && (
              <ListViewType
                ref={tableRef}
                data={
                  misc.searchQuery !== '' ? filteredData : playQueue[getCurrentEntryList(playQueue)]
                }
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
                handleFavorite={handleFavorite}
                handleRating={(rowData: any, rating: number) => handleRating(rowData, { rating })}
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
          </>
        )}
      </GenericPage>
    </>
  );
};

export default NowPlayingView;
