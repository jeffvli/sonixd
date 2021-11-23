import React, { useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import settings from 'electron-settings';
import { ButtonToolbar, ControlLabel, Form, Whisper } from 'rsuite';
import { useHotkeys } from 'react-hotkeys-hook';
import { useQuery, useQueryClient } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import {
  DeleteButton,
  EditButton,
  PlayAppendButton,
  PlayAppendNextButton,
  PlayButton,
  SaveButton,
  UndoButton,
} from '../shared/ToolbarButtons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fixPlayer2Index,
  setPlayQueueByRowClick,
  setPlayQueue,
  appendPlayQueue,
  setStar,
  setRate,
  clearPlayQueue,
} from '../../redux/playQueueSlice';
import {
  toggleSelected,
  setRangeSelected,
  toggleRangeSelected,
  clearSelected,
  setIsDragging,
} from '../../redux/multiSelectSlice';
import {
  createRecoveryFile,
  errorMessages,
  filterPlayQueue,
  formatDate,
  formatDateTime,
  formatDuration,
  getCurrentEntryList,
  getPlayedSongsNotification,
  getRecoveryPath,
  getUniqueRandomNumberArr,
  isCached,
  isFailedResponse,
} from '../../shared/utils';
import useSearchQuery from '../../hooks/useSearchQuery';
import GenericPage from '../layout/GenericPage';
import ListViewType from '../viewtypes/ListViewType';
import PageLoader from '../loader/PageLoader';
import GenericPageHeader from '../layout/GenericPageHeader';
import { setStatus } from '../../redux/playerSlice';
import { notifyToast } from '../shared/toast';
import { addProcessingPlaylist, removeProcessingPlaylist } from '../../redux/miscSlice';
import { StyledButton, StyledCheckbox, StyledInput, StyledPopover } from '../shared/styled';
import {
  moveToIndex,
  removeFromPlaylist,
  setPlaylistData,
  setPlaylistRate,
  setPlaylistStar,
} from '../../redux/playlistSlice';
import { PageHeaderSubtitleDataLine } from '../layout/styled';
import CustomTooltip from '../shared/CustomTooltip';
import { apiController } from '../../api/controller';
import { Server } from '../../types';

interface PlaylistParams {
  id: string;
}

const PlaylistView = ({ ...rest }) => {
  const [isModified, setIsModified] = useState(false);
  const dispatch = useAppDispatch();
  const playlist = useAppSelector((state) => state.playlist);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const history = useHistory();
  const queryClient = useQueryClient();
  const editTriggerRef = useRef<any>();
  const { id } = useParams<PlaylistParams>();
  const playlistId = rest.id ? rest.id : id;
  const { isLoading, isError, data, error }: any = useQuery(['playlist', playlistId], () =>
    apiController({
      serverType: config.serverType,
      endpoint: 'getPlaylist',
      args: { id: playlistId },
    })
  );

  const [customPlaylistImage, setCustomPlaylistImage] = useState<string | string[]>(
    'img/placeholder.jpg'
  );
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPublic, setEditPublic] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [recoveryPath, setRecoveryPath] = useState('');
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const filteredData = useSearchQuery(misc.searchQuery, playlist.entry, [
    'title',
    'artist',
    'album',
    'year',
    'genre',
    'path',
  ]);

  useHotkeys(
    'del',
    () => {
      const selectedType = multiSelect.selected[0].type;
      if (selectedType === 'music') {
        dispatch(removeFromPlaylist({ selectedEntries: multiSelect.selected }));
      }
    },
    [multiSelect.selected]
  );

  useEffect(() => {
    const recoveryFilePath = path.join(getRecoveryPath(), `playlist_${data?.id}.json`);

    setRecoveryPath(recoveryFilePath);
    setNeedsRecovery(fs.existsSync(recoveryFilePath));
  }, [data?.id]);

  useEffect(() => {
    // Set the local playlist data on any changes
    dispatch(setPlaylistData(data?.song || []));
    setEditName(data?.title || '');
    setEditDescription(data?.comment || '');
    setEditPublic(data?.public || false);
  }, [data, dispatch]);

  useEffect(() => {
    if (!_.isEqual(data?.song, playlist[getCurrentEntryList(playlist)])) {
      setIsModified(true);
    } else {
      setIsModified(false);
    }
  }, [data?.song, playlist]);

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
    dispatch(
      setPlayQueueByRowClick({
        entries: playlist[getCurrentEntryList(playlist)],
        currentIndex: rowData.rowIndex,
        currentSongId: rowData.id,
        uniqueSongId: rowData.uniqueId,
        filters: config.playback.filters,
      })
    );
    dispatch(setStatus('PLAYING'));
    dispatch(fixPlayer2Index());
  };

  const handlePlay = () => {
    const songs = filterPlayQueue(config.playback.filters, playlist[getCurrentEntryList(playlist)]);

    if (songs.entries.length > 0) {
      dispatch(setPlayQueue({ entries: songs.entries }));
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    } else {
      dispatch(clearPlayQueue());
      dispatch(setStatus('PAUSED'));
    }

    notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'play' }));
  };

  const handlePlayAppend = (type: 'next' | 'later') => {
    const songs = filterPlayQueue(config.playback.filters, playlist[getCurrentEntryList(playlist)]);

    if (songs.entries.length > 0) {
      dispatch(appendPlayQueue({ entries: songs.entries, type }));
      dispatch(fixPlayer2Index());
    }

    notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'add' }));
  };

  const handleSave = async (recovery: boolean) => {
    dispatch(clearSelected());
    dispatch(addProcessingPlaylist(data.id));
    if (config.serverType === Server.Subsonic) {
      try {
        let res;
        const playlistData = recovery
          ? JSON.parse(fs.readFileSync(recoveryPath, { encoding: 'utf-8' }))
          : playlist[getCurrentEntryList(playlist)];

        // Smaller playlists can use the safe /createPlaylist method of saving
        if (playlistData.length <= 400 && !recovery) {
          res = await apiController({
            serverType: config.serverType,
            endpoint: 'updatePlaylistSongs',
            args: { id: data.id, entry: playlistData },
          });

          if (isFailedResponse(res)) {
            notifyToast('error', errorMessages(res)[0]);
          } else {
            notifyToast('success', `Saved playlist`);
            await queryClient.refetchQueries(['playlist'], {
              active: true,
            });
          }
        } else {
          // For larger playlists, we'll need to first clear out the playlist and then re-populate it
          // Tested on Airsonic instances, /createPlaylist fails with around ~350+ songId params
          res = await apiController({
            serverType: config.serverType,
            endpoint: 'clearPlaylist',
            args: { id: data.id },
          });

          if (isFailedResponse(res)) {
            notifyToast('error', errorMessages(res)[0]);
            return dispatch(removeProcessingPlaylist(data.id));
          }

          res = await apiController({
            serverType: config.serverType,
            endpoint: 'updatePlaylistSongsLg',
            args: { id: data.id, entry: playlistData },
          });

          if (isFailedResponse(res)) {
            res.forEach((response: any) => {
              if (isFailedResponse(response)) {
                notifyToast('error', errorMessages(response)[0]);
              }
            });

            // If there are any failures (network, etc.), then we'll need a way to recover the playlist.
            // Write the localPlaylistData to a file so we can re-run the save command.
            createRecoveryFile(data.id, 'playlist', playlistData);
            setNeedsRecovery(true);
            return dispatch(removeProcessingPlaylist(data.id));
          }

          if (recovery) {
            // If the recovery succeeds, we can remove the recovery file
            fs.unlinkSync(recoveryPath);
            setNeedsRecovery(false);
            notifyToast('success', `Recovered playlist from backup`);
          } else {
            notifyToast('success', `Saved playlist`);
          }

          await queryClient.refetchQueries(['playlist'], {
            active: true,
          });
        }
      } catch (err) {
        notifyToast('error', 'Errored while saving playlist');
        const playlistData = recovery
          ? JSON.parse(fs.readFileSync(recoveryPath, { encoding: 'utf-8' }))
          : playlist[getCurrentEntryList(playlist)];

        createRecoveryFile(data.id, 'playlist', playlistData);
        setNeedsRecovery(true);
        dispatch(removeProcessingPlaylist(data.id));
      }
    }

    if (config.serverType === Server.Jellyfin) {
      const { id: newPlaylistId } = await apiController({
        serverType: config.serverType,
        endpoint: 'updatePlaylistSongs',
        args: { name: data.title, entry: playlist.entry },
      });

      if (newPlaylistId) {
        await apiController({
          serverType: config.serverType,
          endpoint: 'deletePlaylist',
          args: { id: data.id },
        });

        await apiController({
          serverType: config.serverType,
          endpoint: 'updatePlaylist',
          args: {
            id: newPlaylistId,
            name: data.title,
            dateCreated: data.created,
            comment: data.comment,
            genres: data.genres,
          },
        });

        history.replace(`/playlist/${newPlaylistId}`);
        notifyToast('success', `Saved playlist`);
      } else {
        notifyToast('error', 'Error saving playlist');
      }
    }

    return dispatch(removeProcessingPlaylist(data.id));
  };

  const handleEdit = async () => {
    setIsSubmittingEdit(true);

    if (config.serverType === Server.Subsonic) {
      try {
        const res = await apiController({
          serverType: config.serverType,
          endpoint: 'updatePlaylist',
          args:
            config.serverType === Server.Subsonic
              ? {
                  id: data.id,
                  name: editName,
                  comment: editDescription,
                  genres: data.genres,
                  isPublic: editPublic,
                }
              : null,
        });

        if (isFailedResponse(res)) {
          notifyToast('error', errorMessages(res)[0]);
        } else {
          queryClient.setQueryData(['playlist', playlistId], (oldData: any) => {
            return { ...oldData, title: editName, comment: editDescription, public: editPublic };
          });
        }
      } catch {
        notifyToast('error', 'Error saving playlist');
      } finally {
        setIsSubmittingEdit(false);
      }
    }

    if (config.serverType === Server.Jellyfin) {
      try {
        apiController({
          serverType: config.serverType,
          endpoint: 'updatePlaylist',
          args: {
            id: data.id,
            name: editName,
            comment: editDescription,
            genres: data.genres,
            isPublic: editPublic,
          },
        });
      } catch {
        notifyToast('error', 'Error saving playlist');
      } finally {
        setIsSubmittingEdit(false);
      }

      notifyToast('success', 'Saved playlist');
      queryClient.setQueryData(['playlist', playlistId], (oldData: any) => {
        return { ...oldData, title: editName, comment: editDescription, public: editPublic };
      });
    }

    editTriggerRef.current.close();
  };

  const handleDelete = async () => {
    try {
      const res = await apiController({
        serverType: config.serverType,
        endpoint: 'deletePlaylist',
        args: { id: data.id },
      });

      if (isFailedResponse(res)) {
        notifyToast('error', res.error.message);
      } else {
        history.push('/playlist');
      }
    } catch (err) {
      notifyToast('error', err);
    }
  };

  const handleDragEnd = () => {
    if (multiSelect.isDragging) {
      dispatch(
        moveToIndex({
          selectedEntries: multiSelect.selected,
          moveBeforeId: multiSelect.currentMouseOverId,
        })
      );
      dispatch(setIsDragging(false));
    }
  };

  const handleRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'music' },
      });
      dispatch(setStar({ id: [rowData.id], type: 'star' }));
      dispatch(setPlaylistStar({ id: [rowData.id], type: 'star' }));

      queryClient.setQueryData(['playlist', playlistId], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.song, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.song[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: rowData.id, type: 'music' },
      });
      dispatch(setStar({ id: [rowData.id], type: 'unstar' }));
      dispatch(setPlaylistStar({ id: [rowData.id], type: 'unstar' }));

      queryClient.setQueryData(['playlist', playlistId], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.song, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.song[index].starred = undefined;
        });

        return oldData;
      });
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

  useEffect(() => {
    if (data?.image.match('placeholder')) {
      const uniqueAlbums: any = _.uniqBy(data?.song, 'albumId');

      if (uniqueAlbums.length === 0) {
        setCustomPlaylistImage('img/placeholder.jpg');
      } // If less than 4 images, we'll just set a single random image
      else if (uniqueAlbums.length > 0 && uniqueAlbums.length < 4) {
        setCustomPlaylistImage(uniqueAlbums[_.random(0, uniqueAlbums.length - 1)]?.image);
      } else if (uniqueAlbums.length >= 4) {
        const randomUniqueNumbers = getUniqueRandomNumberArr(4, uniqueAlbums.length);
        const randomAlbumImages = randomUniqueNumbers.map((num) => uniqueAlbums[num].image);

        setCustomPlaylistImage(randomAlbumImages);
      }
    }
  }, [data?.image, data?.song]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          image={
            data?.image.match('placeholder')
              ? customPlaylistImage
              : isCached(`${misc.imageCachePath}playlist_${playlistId}.jpg`)
              ? `${misc.imageCachePath}playlist_${playlistId}.jpg`
              : data.image
          }
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'playlist',
            id: data.id,
          }}
          imageHeight={184}
          title={data.title}
          subtitle={
            <div>
              <PageHeaderSubtitleDataLine $top>
                <strong>PLAYLIST</strong> • {data.songCount} songs • {formatDuration(data.duration)}{' '}
                • {data.public ? 'Public' : 'Private'}
              </PageHeaderSubtitleDataLine>
              <PageHeaderSubtitleDataLine>
                {data.owner && `By ${data.owner} • `}
                {data.created && `Created ${formatDate(data.created)}`}
                {data.changed && ` • Modified ${formatDateTime(data.changed)}`}
              </PageHeaderSubtitleDataLine>
              <CustomTooltip text={data.comment}>
                <PageHeaderSubtitleDataLine
                  style={{
                    minHeight: '1.2rem',
                    maxHeight: '1.2rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <span>{data.comment ? data.comment : 'No description'}</span>
                </PageHeaderSubtitleDataLine>
              </CustomTooltip>

              <div style={{ marginTop: '10px' }}>
                <ButtonToolbar>
                  <PlayButton
                    appearance="primary"
                    size="md"
                    onClick={handlePlay}
                    disabled={playlist.entry?.length < 1}
                  />
                  <PlayAppendNextButton
                    appearance="primary"
                    size="md"
                    onClick={() => handlePlayAppend('next')}
                    disabled={playlist.entry?.length < 1}
                  />
                  <PlayAppendButton
                    appearance="primary"
                    size="md"
                    onClick={() => handlePlayAppend('later')}
                    disabled={playlist.entry?.length < 1}
                  />
                  <SaveButton
                    size="md"
                    text={
                      needsRecovery
                        ? 'Recover playlist'
                        : 'Save (WARNING: Closing the application while saving may result in data loss)'
                    }
                    color={needsRecovery ? 'red' : undefined}
                    disabled={
                      (!needsRecovery && !isModified) ||
                      misc.isProcessingPlaylist.includes(data?.id)
                    }
                    loading={misc.isProcessingPlaylist.includes(data?.id)}
                    onClick={() => handleSave(needsRecovery)}
                  />
                  <UndoButton
                    size="md"
                    color={needsRecovery ? 'red' : undefined}
                    disabled={
                      needsRecovery || !isModified || misc.isProcessingPlaylist.includes(data?.id)
                    }
                    onClick={() => dispatch(setPlaylistData(data?.song))}
                  />
                  <Whisper
                    ref={editTriggerRef}
                    enterable
                    placement="auto"
                    trigger="click"
                    speaker={
                      <StyledPopover>
                        <Form>
                          <ControlLabel>Name</ControlLabel>
                          <StyledInput
                            placeholder="Name"
                            value={editName}
                            onChange={(e: string) => setEditName(e)}
                          />
                          <ControlLabel>Description</ControlLabel>
                          <StyledInput
                            placeholder="Description"
                            value={editDescription}
                            onChange={(e: string) => setEditDescription(e)}
                          />
                          <StyledCheckbox
                            defaultChecked={editPublic}
                            value={editPublic}
                            onChange={(_v: any, e: boolean) => setEditPublic(e)}
                            disabled={config.serverType === Server.Jellyfin}
                          >
                            Public
                          </StyledCheckbox>
                          <StyledButton
                            size="md"
                            type="submit"
                            block
                            loading={isSubmittingEdit}
                            disabled={isSubmittingEdit}
                            onClick={handleEdit}
                            appearance="primary"
                          >
                            Save
                          </StyledButton>
                        </Form>
                      </StyledPopover>
                    }
                  >
                    <EditButton size="md" disabled={misc.isProcessingPlaylist.includes(data?.id)} />
                  </Whisper>

                  <Whisper
                    enterable
                    placement="auto"
                    trigger="click"
                    speaker={
                      <StyledPopover>
                        <p>Are you sure you want to delete this playlist?</p>
                        <StyledButton onClick={handleDelete} appearance="link">
                          Yes
                        </StyledButton>
                      </StyledPopover>
                    }
                  >
                    <DeleteButton
                      size="md"
                      disabled={misc.isProcessingPlaylist.includes(data?.id)}
                    />
                  </Whisper>
                </ButtonToolbar>
              </div>
            </div>
          }
        />
      }
    >
      <ListViewType
        data={misc.searchQuery !== '' ? filteredData : playlist[getCurrentEntryList(playlist)]}
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
        playlist
        dnd
        isModal={rest.isModal}
        disabledContextMenuOptions={['deletePlaylist', 'viewInModal']}
        handleFavorite={handleRowFavorite}
        handleRating={handleRowRating}
      />
    </GenericPage>
  );
};

export default PlaylistView;
