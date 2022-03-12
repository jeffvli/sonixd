/* eslint-disable no-await-in-loop */
import React, { useRef, useState } from 'react';
import _ from 'lodash';
import { nanoid } from 'nanoid/non-secure';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ButtonToolbar, Col, Grid, Form, Icon, Row, Whisper } from 'rsuite';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  addModalPage,
  addProcessingPlaylist,
  removeProcessingPlaylist,
  setContextMenu,
} from '../../redux/miscSlice';
import {
  appendPlayQueue,
  clearPlayQueue,
  fixPlayer2Index,
  moveDown,
  moveToBottom,
  moveToIndex,
  moveToTop,
  moveUp,
  removeFromPlayQueue,
  setPlayQueue,
  setRate,
  setStar,
} from '../../redux/playQueueSlice';
import {
  moveToIndex as plMoveToIndex,
  moveToBottom as plMoveToBottom,
  moveToTop as plMoveToTop,
  moveUp as plMoveUp,
  moveDown as plMoveDown,
  removeFromPlaylist,
  setPlaylistRate,
} from '../../redux/playlistSlice';
import {
  ContextMenuDivider,
  ContextMenuWindow,
  StyledContextMenuButton,
  StyledInputPicker,
  StyledButton,
  StyledInputGroup,
  StyledInputNumber,
  StyledInputPickerContainer,
  ContextMenuPopover,
  StyledInput,
  StyledInputGroupButton,
} from './styled';
import { notifyToast } from './toast';
import {
  errorMessages,
  filterPlayQueue,
  getCurrentEntryList,
  getPlayedSongsNotification,
  isFailedResponse,
  moveSelectedToIndex,
} from '../../shared/utils';
import { setStatus } from '../../redux/playerSlice';
import { apiController } from '../../api/controller';
import { Server } from '../../types';

export const ContextMenuButton = ({ text, hotkey, ...rest }: any) => {
  return (
    <StyledContextMenuButton {...rest} appearance="subtle" size="sm" block>
      <div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
        {text}
      </div>
    </StyledContextMenuButton>
  );
};

export const ContextMenu = ({
  yPos,
  xPos,
  minWidth,
  maxWidth,
  numOfButtons,
  numOfDividers,
  hasTitle,
  children,
}: any) => {
  return (
    <ContextMenuWindow
      yPos={yPos}
      xPos={xPos}
      minWidth={minWidth}
      maxWidth={maxWidth}
      numOfButtons={numOfButtons}
      numOfDividers={numOfDividers}
      hasTitle={hasTitle}
    >
      {children}
    </ContextMenuWindow>
  );
};

export const GlobalContextMenu = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const playlist = useAppSelector((state) => state.playlist);
  const playQueue = useAppSelector((state) => state.playQueue);
  const misc = useAppSelector((state) => state.misc);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const config = useAppSelector((state) => state.config);
  const folder = useAppSelector((state) => state.folder);
  const addToPlaylistTriggerRef = useRef<any>();
  const deletePlaylistTriggerRef = useRef<any>();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [shouldCreatePlaylist, setShouldCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [indexToMoveTo, setIndexToMoveTo] = useState(0);
  const playlistPickerContainerRef = useRef(null);

  const { data: playlists }: any = useQuery(['playlists'], () =>
    apiController({ serverType: config.serverType, endpoint: 'getPlaylists' })
  );

  const handlePlay = async () => {
    dispatch(setContextMenu({ show: false }));
    const promises = [];

    if (misc.contextMenu.type.match('music|nowPlaying|folder')) {
      const folders = multiSelect.selected.filter((entry: any) => entry.type === 'folder');
      const music = multiSelect.selected
        .filter((entry: any) => entry.type === 'music')
        .map((entry: any) => {
          return { ...entry, uniqueId: nanoid() };
        });

      for (let i = 0; i < folders.length; i += 1) {
        promises.push(
          apiController({
            serverType: config.serverType,
            endpoint: 'getMusicDirectorySongs',
            args: { id: folders[i].id },
          })
        );
      }

      const res = await Promise.all(promises);
      res.push(_.orderBy(music, 'rowIndex', 'asc'));
      const songs = filterPlayQueue(config.playback.filters, _.flatten(res));

      if (songs.entries.length > 0) {
        dispatch(setPlayQueue({ entries: songs.entries }));
        dispatch(setStatus('PLAYING'));
        dispatch(fixPlayer2Index());
      } else {
        dispatch(clearPlayQueue());
        dispatch(setStatus('PAUSED'));
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'play' }));
    } else if (misc.contextMenu.type === 'playlist') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(
          apiController({
            serverType: config.serverType,
            endpoint: 'getPlaylist',
            args: { id: multiSelect.selected[i].id },
          })
        );
      }

      const res = await Promise.all(promises);
      const songs = filterPlayQueue(config.playback.filters, _.flatten(_.map(res, 'song')));

      if (songs.entries.length > 0) {
        dispatch(setPlayQueue({ entries: songs.entries }));
        dispatch(setStatus('PLAYING'));
        dispatch(fixPlayer2Index());
      } else {
        dispatch(clearPlayQueue());
        dispatch(setStatus('PAUSED'));
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'play' }));
    } else if (misc.contextMenu.type === 'album') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(
          apiController({
            serverType: config.serverType,
            endpoint: 'getAlbum',
            args: { id: multiSelect.selected[i].id },
          })
        );
      }

      const res = await Promise.all(promises);
      const songs = filterPlayQueue(config.playback.filters, _.flatten(_.map(res, 'song')));

      if (songs.entries.length > 0) {
        dispatch(setPlayQueue({ entries: songs.entries }));
        dispatch(setStatus('PLAYING'));
        dispatch(fixPlayer2Index());
      } else {
        dispatch(clearPlayQueue());
        dispatch(setStatus('PAUSED'));
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'play' }));
    } else if (misc.contextMenu.type === 'artist') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(
          apiController({
            serverType: config.serverType,
            endpoint: 'getArtistSongs',
            args: {
              id: multiSelect.selected[i].id,
              musicFolderId: folder.applied.music && folder.musicFolder,
            },
          })
        );
      }

      const res = await Promise.all(promises);
      const songs = filterPlayQueue(config.playback.filters, _.flatten(res));

      if (songs.entries.length > 0) {
        dispatch(setPlayQueue({ entries: songs.entries }));
        dispatch(setStatus('PLAYING'));
        dispatch(fixPlayer2Index());
      } else {
        dispatch(clearPlayQueue());
        dispatch(setStatus('PAUSED'));
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'play' }));
    } else if (misc.contextMenu.type === 'genre') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(
          apiController({
            serverType: config.serverType,
            endpoint: 'getSongsByGenre',
            args: {
              type: 'byGenre',
              genre: multiSelect.selected[i].title,
              musicFolderId: (folder.applied.music || folder.applied.albums) && folder.musicFolder,
              size: 500,
              offset: 0,
              recursive: true,
              totalSongs: multiSelect.selected[i]?.songCount,
            },
          })
        );
      }

      const res = await Promise.all(promises);
      const songs = filterPlayQueue(config.playback.filters, _.flatten(_.map(res, 'data')));
      if (songs.entries.length > 0) {
        dispatch(setPlayQueue({ entries: songs.entries }));
        dispatch(setStatus('PLAYING'));
        dispatch(fixPlayer2Index());
      } else {
        dispatch(clearPlayQueue());
        dispatch(setStatus('PAUSED'));
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'play' }));
    }
  };

  const handleAddToQueue = async (type: 'next' | 'later') => {
    dispatch(setContextMenu({ show: false }));
    const promises = [];

    if (misc.contextMenu.type.match('music|nowPlaying|folder')) {
      const folders = multiSelect.selected.filter((entry: any) => entry.type === 'folder');
      const music = multiSelect.selected
        .filter((entry: any) => entry.type === 'music')
        .map((entry: any) => {
          return { ...entry, uniqueId: nanoid() };
        });

      for (let i = 0; i < folders.length; i += 1) {
        promises.push(
          apiController({
            serverType: config.serverType,
            endpoint: 'getMusicDirectorySongs',
            args: { id: folders[i].id },
          })
        );
      }

      const res = await Promise.all(promises);
      res.push(_.orderBy(music, 'rowIndex', 'asc'));
      const songs = filterPlayQueue(config.playback.filters, _.flatten(res));

      if (songs.entries.length > 0) {
        dispatch(appendPlayQueue({ entries: songs.entries, type }));
        dispatch(fixPlayer2Index());
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'add' }));
    } else if (misc.contextMenu.type === 'playlist') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(
          apiController({
            serverType: config.serverType,
            endpoint: 'getPlaylist',
            args: { id: multiSelect.selected[i].id },
          })
        );
      }

      const res = await Promise.all(promises);
      const songs = filterPlayQueue(config.playback.filters, _.flatten(_.map(res, 'song')));

      if (songs.entries.length > 0) {
        dispatch(appendPlayQueue({ entries: songs.entries, type }));
        dispatch(fixPlayer2Index());
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'add' }));
    } else if (misc.contextMenu.type === 'album') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(
          apiController({
            serverType: config.serverType,
            endpoint: 'getAlbum',
            args: { id: multiSelect.selected[i].id },
          })
        );
      }

      const res = await Promise.all(promises);
      const songs = filterPlayQueue(config.playback.filters, _.flatten(_.map(res, 'song')));

      if (songs.entries.length > 0) {
        dispatch(appendPlayQueue({ entries: songs.entries, type }));
        dispatch(fixPlayer2Index());
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'add' }));
    } else if (misc.contextMenu.type === 'artist') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(
          apiController({
            serverType: config.serverType,
            endpoint: 'getArtistSongs',
            args: {
              id: multiSelect.selected[i].id,
              musicFolderId: folder.applied.artist && folder.musicFolder,
            },
          })
        );
      }

      const res = await Promise.all(promises);
      const songs = filterPlayQueue(config.playback.filters, _.flatten(res));

      if (songs.entries.length > 0) {
        dispatch(appendPlayQueue({ entries: songs.entries, type }));
        dispatch(fixPlayer2Index());
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'add' }));
    } else if (misc.contextMenu.type === 'genre') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(
          apiController({
            serverType: config.serverType,
            endpoint: 'getSongsByGenre',
            args: {
              type: 'byGenre',
              genre: multiSelect.selected[i].title,
              musicFolderId: (folder.applied.album || folder.applied.artist) && folder.musicFolder,
              size: 500,
              offset: 0,
              recursive: true,
              totalSongs: multiSelect.selected[i]?.songCount,
            },
          })
        );
      }

      const res = await Promise.all(promises);
      const songs = filterPlayQueue(config.playback.filters, _.flatten(_.map(res, 'data')));

      if (songs.entries.length > 0) {
        dispatch(appendPlayQueue({ entries: songs.entries, type }));
        dispatch(fixPlayer2Index());
      }

      notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'add' }));
    }
  };

  const handleRemoveSelected = async () => {
    if (misc.contextMenu.type === 'nowPlaying') {
      if (multiSelect.selected.length === playQueue.entry.length) {
        dispatch(clearPlayQueue());
        dispatch(setStatus('PAUSED'));
      } else {
        dispatch(removeFromPlayQueue({ entries: multiSelect.selected }));
        if (playQueue.currentPlayer === 1) {
          dispatch(fixPlayer2Index());
        }
      }
    } else {
      dispatch(removeFromPlaylist({ selectedEntries: multiSelect.selected }));
    }

    dispatch(setContextMenu({ show: false }));
  };

  const playlistSuccessToast = (songCount: number, playlistId: string) => {
    notifyToast(
      'success',
      t('Added {{songCount}} item(s) to playlist {{playlist}}', {
        songCount,
        playlist: playlists.find((pl: any) => pl.id === playlistId)?.title,
      }),
      <>
        <StyledButton
          appearance="link"
          onClick={() => {
            history.push(`/playlist/${playlistId}`);
            dispatch(setContextMenu({ show: false }));
          }}
        >
          {t('Go to playlist')}
        </StyledButton>
      </>
    );
  };

  const handleAddToPlaylist = async () => {
    // If the window is closed, the selectedPlaylistId will be deleted
    const promises = [];
    let res;
    let songs;
    const localSelectedPlaylistId = selectedPlaylistId;
    dispatch(addProcessingPlaylist(selectedPlaylistId));

    try {
      if (misc.contextMenu.type.match('music|nowPlaying|folder')) {
        if (config.serverType === Server.Subsonic) {
          const folders = multiSelect.selected.filter((entry: any) => entry.type === 'folder');
          const music = multiSelect.selected
            .filter((entry: any) => entry.type === 'music')
            .map((entry: any) => {
              return { ...entry, uniqueId: nanoid() };
            });

          for (let i = 0; i < folders.length; i += 1) {
            promises.push(
              apiController({
                serverType: config.serverType,
                endpoint: 'getMusicDirectorySongs',
                args: { id: folders[i].id },
              })
            );
          }

          const folderSongs = await Promise.all(promises);

          folderSongs.push(_.orderBy(music, 'rowIndex', 'asc'));
          songs = _.flatten(folderSongs);

          res = await apiController({
            serverType: config.serverType,
            endpoint: 'updatePlaylistSongsLg',
            args: { id: localSelectedPlaylistId, entry: songs },
          });

          if (isFailedResponse(res)) {
            notifyToast('error', errorMessages(res)[0]);
          } else {
            playlistSuccessToast(songs.length, localSelectedPlaylistId);
          }
        }

        if (config.serverType === Server.Jellyfin) {
          res = await apiController({
            serverType: config.serverType,
            endpoint: 'updatePlaylistSongsLg',
            args: { id: localSelectedPlaylistId, entry: multiSelect.selected },
          });

          playlistSuccessToast(multiSelect.selected.length, localSelectedPlaylistId);
        }
      } else if (misc.contextMenu.type === 'playlist') {
        if (config.serverType === Server.Subsonic) {
          for (let i = 0; i < multiSelect.selected.length; i += 1) {
            promises.push(
              apiController({
                serverType: config.serverType,
                endpoint: 'getPlaylist',
                args: { id: multiSelect.selected[i].id },
              })
            );
          }

          res = await Promise.all(promises);
          songs = _.flatten(_.map(res, 'song'));
          res = await apiController({
            serverType: config.serverType,
            endpoint: 'updatePlaylistSongsLg',
            args: { id: localSelectedPlaylistId, entry: songs },
          });

          if (isFailedResponse(res)) {
            notifyToast('error', errorMessages(res)[0]);
          } else {
            playlistSuccessToast(songs.length, localSelectedPlaylistId);
          }
        }

        if (config.serverType === Server.Jellyfin) {
          res = await apiController({
            serverType: config.serverType,
            endpoint: 'updatePlaylistSongsLg',
            args: { id: localSelectedPlaylistId, entry: multiSelect.selected },
          });

          playlistSuccessToast(multiSelect.selected.length, localSelectedPlaylistId);
        }
      } else if (misc.contextMenu.type === 'album') {
        if (config.serverType === Server.Subsonic) {
          for (let i = 0; i < multiSelect.selected.length; i += 1) {
            promises.push(
              apiController({
                serverType: config.serverType,
                endpoint: 'getAlbum',
                args: { id: multiSelect.selected[i].id },
              })
            );
          }

          res = await Promise.all(promises);
          songs = _.flatten(_.map(res, 'song'));
          res = await apiController({
            serverType: config.serverType,
            endpoint: 'updatePlaylistSongsLg',
            args: { id: localSelectedPlaylistId, entry: songs },
          });

          if (isFailedResponse(res)) {
            notifyToast('error', errorMessages(res)[0]);
          } else {
            playlistSuccessToast(songs.length, localSelectedPlaylistId);
          }
        }

        if (config.serverType === Server.Jellyfin) {
          res = await apiController({
            serverType: config.serverType,
            endpoint: 'updatePlaylistSongsLg',
            args: { id: localSelectedPlaylistId, entry: multiSelect.selected },
          });
          playlistSuccessToast(multiSelect.selected.length, localSelectedPlaylistId);
        }
      }
    } catch (err) {
      notifyToast('error', t('Error adding to playlist'));
    } finally {
      dispatch(removeProcessingPlaylist(localSelectedPlaylistId));
      queryClient.removeQueries(['playlist', localSelectedPlaylistId]);
    }

    await queryClient.refetchQueries(['playlists'], {
      active: true,
    });
  };

  const handleDeletePlaylist = async () => {
    dispatch(setContextMenu({ show: false }));
    const promises = [];

    for (let i = 0; i < multiSelect.selected.length; i += 1) {
      promises.push(
        apiController({
          serverType: config.serverType,
          endpoint: 'deletePlaylist',
          args: { id: multiSelect.selected[i].id },
        })
      );
    }

    const res = await Promise.all(promises);

    if (isFailedResponse(res)) {
      notifyToast('error', errorMessages(res)[0]);
    } else {
      notifyToast(
        'info',
        t('Deleted {{n}} playlists', {
          n: multiSelect.selected.length,
        })
      );
    }

    await queryClient.refetchQueries(['playlists'], {
      active: true,
    });
  };

  const handleCreatePlaylist = async () => {
    try {
      const res = await apiController({
        serverType: config.serverType,
        endpoint: 'createPlaylist',
        args: { name: newPlaylistName },
      });

      if (isFailedResponse(res)) {
        notifyToast('error', errorMessages(res)[0]);
      } else {
        await queryClient.refetchQueries(['playlists'], {
          active: true,
        });
        notifyToast('success', t('Playlist "{{newPlaylistName}}" created!', { newPlaylistName }));
      }
    } catch (err) {
      notifyToast('error', err);
    }
  };

  const refetchActive = async () => {
    await queryClient.refetchQueries(['starred'], {
      active: true,
    });
    await queryClient.refetchQueries(['album'], {
      active: true,
    });
    await queryClient.refetchQueries(['albumList'], {
      active: true,
    });
    await queryClient.refetchQueries(['playlist'], {
      active: true,
    });
    await queryClient.refetchQueries(['artist'], {
      active: true,
    });
    await queryClient.refetchQueries(['artistList'], {
      active: true,
    });
    await queryClient.refetchQueries(['folder'], {
      active: true,
    });
  };

  const handleFavorite = async () => {
    dispatch(setContextMenu({ show: false }));

    const sortedEntries = [...multiSelect.selected].sort(
      (a: any, b: any) => a.rowIndex - b.rowIndex
    );

    const ids = _.map(sortedEntries, 'id');

    try {
      const res = await apiController({
        serverType: config.serverType,
        endpoint: 'batchStar',
        args: { ids, type: sortedEntries[0].type },
      });

      if (isFailedResponse(res)) {
        notifyToast('error', errorMessages(res)[0]);
      } else {
        dispatch(setStar({ id: ids, type: 'star' }));
      }

      await refetchActive();
    } catch (err) {
      notifyToast('error', err);
    }
  };

  const handleUnfavorite = async () => {
    dispatch(setContextMenu({ show: false }));

    // Run the unstar on all entries regardless of their starred status, since Airsonic
    // does not output the 'starred' property for starred artists
    const ids = _.map(multiSelect.selected, 'id');

    try {
      // Infer the type from the first selected entry
      const res = await apiController({
        serverType: config.serverType,
        endpoint: 'batchUnstar',
        args: { ids, type: multiSelect.selected[0].type },
      });

      if (isFailedResponse(res)) {
        notifyToast('error', errorMessages(res)[0]);
      } else {
        dispatch(setStar({ id: ids, type: 'unstar' }));
      }

      await refetchActive();
    } catch (err) {
      notifyToast('error', err);
    }
  };

  const handleMoveSelectedToIndex = () => {
    if (misc.contextMenu.type === 'nowPlaying') {
      const currentEntryList = getCurrentEntryList(playQueue);

      if (Number(indexToMoveTo) === playQueue[currentEntryList].length) {
        dispatch(moveToBottom({ selectedEntries: multiSelect.selected }));
      } else {
        dispatch(
          moveToIndex(
            moveSelectedToIndex(
              playQueue[currentEntryList],
              multiSelect.selected,
              playQueue[currentEntryList][indexToMoveTo].uniqueId
            )
          )
        );
      }
    } else if (Number(indexToMoveTo) === playlist.entry.length) {
      dispatch(plMoveToBottom({ selectedEntries: multiSelect.selected }));
    } else {
      dispatch(
        plMoveToIndex(
          moveSelectedToIndex(
            playlist.entry,
            multiSelect.selected,
            playlist.entry[indexToMoveTo].uniqueId
          )
        )
      );
    }
  };

  const handleMoveToTop = () => {
    if (misc.contextMenu.type === 'nowPlaying') {
      dispatch(moveToTop({ selectedEntries: multiSelect.selected }));
      if (playQueue.currentPlayer === 1) {
        dispatch(fixPlayer2Index());
      }
    } else {
      dispatch(plMoveToTop({ selectedEntries: multiSelect.selected }));
    }
  };

  const handleMoveToBottom = () => {
    if (misc.contextMenu.type === 'nowPlaying') {
      dispatch(moveToBottom({ selectedEntries: multiSelect.selected }));
      if (playQueue.currentPlayer === 1) {
        dispatch(fixPlayer2Index());
      }
    } else {
      dispatch(plMoveToBottom({ selectedEntries: multiSelect.selected }));
    }
  };

  const handleMoveUpOne = () => {
    if (misc.contextMenu.type === 'nowPlaying') {
      dispatch(moveUp({ selectedEntries: multiSelect.selected }));

      if (playQueue.currentPlayer === 1) {
        dispatch(fixPlayer2Index());
      }
    } else {
      dispatch(plMoveUp({ selectedEntries: multiSelect.selected }));
    }
  };

  const handleMoveDownOne = () => {
    if (misc.contextMenu.type === 'nowPlaying') {
      dispatch(moveDown({ selectedEntries: multiSelect.selected }));

      if (playQueue.currentPlayer === 1) {
        dispatch(fixPlayer2Index());
      }
    } else {
      dispatch(plMoveDown({ selectedEntries: multiSelect.selected }));
    }
  };

  const handleViewInModal = () => {
    dispatch(setContextMenu({ show: false }));
    if (misc.contextMenu.type !== 'music' && multiSelect.selected.length === 1) {
      dispatch(
        addModalPage({
          pageType: misc.contextMenu.type,
          id: misc.contextMenu.details.id,
        })
      );
    } else {
      notifyToast('error', t('Select only one row'));
    }
  };

  const handleViewInFolder = () => {
    dispatch(setContextMenu({ show: false }));
    if (misc.contextMenu.type.match('music|nowPlaying') && multiSelect.selected.length === 1) {
      history.push(`/library/folder?folderId=${multiSelect.selected[0].parent}`);
    } else {
      notifyToast('error', t('Select only one row'));
    }
  };

  const handleRating = async (rating: number) => {
    dispatch(setContextMenu({ show: false }));
    const ids = _.map(multiSelect.selected, 'id');
    await apiController({
      serverType: config.serverType,
      endpoint: 'setRating',
      args: { ids, rating },
    });
    dispatch(setRate({ id: ids, rating }));
    dispatch(setPlaylistRate({ id: ids, rating }));
    await refetchActive();
  };

  return (
    <>
      {misc.contextMenu.show && (
        <ContextMenu
          xPos={misc.contextMenu.xPos}
          yPos={misc.contextMenu.yPos}
          minWidth={200}
          maxWidth={350}
          numOfButtons={12}
          numOfDividers={3}
        >
          <ContextMenuButton
            text={t('Play')}
            onClick={handlePlay}
            disabled={misc.contextMenu.disabledOptions.includes('play')}
          />
          <ContextMenuButton
            text={t('Add to queue (next)')}
            onClick={() => handleAddToQueue('next')}
            disabled={misc.contextMenu.disabledOptions.includes('addToQueueNext')}
          />
          <ContextMenuButton
            text={t('Add to queue (later)')}
            onClick={() => handleAddToQueue('later')}
            disabled={misc.contextMenu.disabledOptions.includes('addToQueueLast')}
          />
          <ContextMenuButton
            text={t('Remove selected')}
            onClick={handleRemoveSelected}
            disabled={misc.contextMenu.disabledOptions.includes('removeSelected')}
          />
          <Whisper
            enterable
            placement="autoHorizontal"
            trigger={misc.contextMenu.disabledOptions.includes('moveSelectedTo') ? 'none' : 'hover'}
            delayShow={300}
            speaker={
              <ContextMenuPopover style={{ width: '150px' }}>
                <Grid fluid>
                  <Row>
                    <Col xs={12}>
                      <StyledButton onClick={handleMoveToTop} block>
                        <Icon icon="angle-double-up" />
                      </StyledButton>
                    </Col>
                    <Col xs={12}>
                      <StyledButton onClick={handleMoveUpOne} block>
                        <Icon icon="angle-up" />
                      </StyledButton>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <StyledButton onClick={handleMoveToBottom} block>
                        <Icon icon="angle-double-down" />
                      </StyledButton>
                    </Col>

                    <Col xs={12}>
                      <StyledButton onClick={handleMoveDownOne} block>
                        <Icon icon="angle-down" />
                      </StyledButton>
                    </Col>
                  </Row>
                </Grid>
                <br />

                <Form>
                  <StyledInputGroup>
                    <StyledInputNumber
                      defaultValue={0}
                      min={0}
                      max={
                        misc.contextMenu.type === 'nowPlaying'
                          ? playQueue[getCurrentEntryList(playQueue)]?.length
                          : playlist.entry?.length
                      }
                      value={indexToMoveTo}
                      onChange={(e: number) => setIndexToMoveTo(e)}
                    />
                    <StyledInputGroupButton
                      type="submit"
                      onClick={handleMoveSelectedToIndex}
                      disabled={
                        (misc.contextMenu.type === 'nowPlaying'
                          ? indexToMoveTo > playQueue[getCurrentEntryList(playQueue)]?.length
                          : indexToMoveTo > playlist.entry?.length) || indexToMoveTo < 0
                      }
                    >
                      {t('Go')}
                    </StyledInputGroupButton>
                  </StyledInputGroup>
                </Form>
              </ContextMenuPopover>
            }
          >
            <ContextMenuButton
              text={t('Move selected to [...]')}
              disabled={misc.contextMenu.disabledOptions.includes('moveSelectedTo')}
            />
          </Whisper>
          <ContextMenuDivider />

          <Whisper
            ref={addToPlaylistTriggerRef}
            enterable
            placement="autoHorizontal"
            trigger="none"
            speaker={
              <ContextMenuPopover>
                <StyledInputPickerContainer ref={playlistPickerContainerRef}>
                  <StyledInputGroup>
                    <StyledInputPicker
                      container={() => playlistPickerContainerRef.current}
                      data={playlists}
                      placement="autoVerticalStart"
                      virtualized
                      labelKey="title"
                      valueKey="id"
                      width={200}
                      placeholder={t('Select')}
                      onChange={(e: any) => setSelectedPlaylistId(e)}
                    />
                    <StyledButton
                      disabled={
                        !selectedPlaylistId ||
                        misc.isProcessingPlaylist.includes(selectedPlaylistId)
                      }
                      loading={misc.isProcessingPlaylist.includes(selectedPlaylistId)}
                      onClick={handleAddToPlaylist}
                    >
                      Add
                    </StyledButton>
                  </StyledInputGroup>
                </StyledInputPickerContainer>
                <div>
                  <StyledButton
                    size="sm"
                    appearance="subtle"
                    onClick={() => setShouldCreatePlaylist(!shouldCreatePlaylist)}
                  >
                    {t('Create new playlist')}
                  </StyledButton>
                </div>
                {shouldCreatePlaylist && (
                  <Form>
                    <br />
                    <StyledInputGroup>
                      <StyledInput
                        placeholder={t('Enter name...')}
                        value={newPlaylistName}
                        onChange={(e: string) => setNewPlaylistName(e)}
                      />
                      <StyledButton
                        size="sm"
                        type="submit"
                        loading={false}
                        disabled={!newPlaylistName}
                        appearance="primary"
                        onClick={() => {
                          handleCreatePlaylist();
                          setShouldCreatePlaylist(false);
                        }}
                      >
                        {t('Ok')}
                      </StyledButton>
                    </StyledInputGroup>
                  </Form>
                )}
              </ContextMenuPopover>
            }
          >
            <ContextMenuButton
              text={t('Add to playlist')}
              onClick={() =>
                addToPlaylistTriggerRef.current.state.isOverlayShown
                  ? addToPlaylistTriggerRef.current.close()
                  : addToPlaylistTriggerRef.current.open()
              }
              disabled={misc.contextMenu.disabledOptions.includes('addToPlaylist')}
            />
          </Whisper>
          <Whisper
            ref={deletePlaylistTriggerRef}
            enterable
            placement="autoHorizontal"
            trigger="none"
            speaker={
              <ContextMenuPopover>
                <p>
                  {t('Are you sure you want to delete {{n}} playlist(s)?', {
                    n: String(multiSelect?.selected?.length),
                  })}
                </p>
                <StyledButton size="sm" onClick={handleDeletePlaylist} appearance="primary">
                  {t('Yes')}
                </StyledButton>
              </ContextMenuPopover>
            }
          >
            <ContextMenuButton
              text={t('Delete playlist(s)')}
              onClick={() =>
                deletePlaylistTriggerRef.current.state.isOverlayShown
                  ? deletePlaylistTriggerRef.current.close()
                  : deletePlaylistTriggerRef.current.open()
              }
              disabled={misc.contextMenu.disabledOptions.includes('deletePlaylist')}
            />
          </Whisper>
          <ContextMenuDivider />
          <ContextMenuButton
            text={t('Add to favorites')}
            onClick={handleFavorite}
            disabled={misc.contextMenu.disabledOptions.includes('addToFavorites')}
          />
          <ContextMenuButton
            text={t('Remove from favorites')}
            onClick={handleUnfavorite}
            disabled={misc.contextMenu.disabledOptions.includes('removeFromFavorites')}
          />
          <Whisper
            enterable
            placement="autoHorizontal"
            trigger={
              misc.contextMenu.disabledOptions.includes('setRating') ||
              config.serverType === Server.Jellyfin
                ? 'none'
                : 'hover'
            }
            delayShow={300}
            speaker={
              <ContextMenuPopover>
                <ButtonToolbar>
                  <StyledButton onClick={() => handleRating(0)}>0</StyledButton>
                  <StyledButton onClick={() => handleRating(1)}>1</StyledButton>
                  <StyledButton onClick={() => handleRating(2)}>2</StyledButton>
                  <StyledButton onClick={() => handleRating(3)}>3</StyledButton>
                  <StyledButton onClick={() => handleRating(4)}>4</StyledButton>
                  <StyledButton onClick={() => handleRating(5)}>5</StyledButton>
                </ButtonToolbar>
              </ContextMenuPopover>
            }
          >
            <ContextMenuButton
              text={t('Set rating')}
              onClick={handleUnfavorite}
              disabled={
                misc.contextMenu.disabledOptions.includes('setRating') ||
                config.serverType === Server.Jellyfin
              }
            />
          </Whisper>
          <ContextMenuDivider />
          <ContextMenuButton
            text={t('View in modal')}
            onClick={handleViewInModal}
            disabled={misc.contextMenu.disabledOptions.includes('viewInModal')}
          />
          <ContextMenuButton
            text={t('View in folder')}
            onClick={handleViewInFolder}
            disabled={misc.contextMenu.disabledOptions.includes('viewInFolder')}
          />
        </ContextMenu>
      )}
    </>
  );
};
