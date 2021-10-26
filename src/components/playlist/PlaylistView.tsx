import React, { useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import settings from 'electron-settings';
import { ButtonToolbar, Form, Input, Popover, Whisper } from 'rsuite';
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
import {
  clearPlaylist,
  deletePlaylist,
  getPlaylist,
  updatePlaylistSongsLg,
  updatePlaylistSongs,
  updatePlaylist,
  star,
  unstar,
  setRating,
} from '../../api/api';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fixPlayer2Index,
  setPlayQueueByRowClick,
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
import {
  createRecoveryFile,
  errorMessages,
  getCurrentEntryList,
  getRecoveryPath,
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
import { StyledButton, StyledCheckbox, StyledInputGroup } from '../shared/styled';
import {
  moveToIndex,
  removeFromPlaylist,
  setPlaylistData,
  setPlaylistRate,
  setPlaylistStar,
} from '../../redux/playlistSlice';

interface PlaylistParams {
  id: string;
}

const PlaylistView = ({ ...rest }) => {
  const [isModified, setIsModified] = useState(false);
  const dispatch = useAppDispatch();
  const playlist = useAppSelector((state) => state.playlist);
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const history = useHistory();
  const queryClient = useQueryClient();
  const editTriggerRef = useRef<any>();
  const { id } = useParams<PlaylistParams>();
  const playlistId = rest.id ? rest.id : id;
  const { isLoading, isError, data, error }: any = useQuery(['playlist', playlistId], () =>
    getPlaylist(playlistId)
  );
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPublic, setEditPublic] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recoveryPath, setRecoveryPath] = useState('');
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const filteredData = useSearchQuery(searchQuery, playlist.entry, [
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
    dispatch(setPlaylistData(data?.song));
    setEditName(data?.name);
    setEditDescription(data?.comment);
    setEditPublic(data?.public);
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

  const handleRowDoubleClick = (e: any) => {
    window.clearTimeout(timeout);
    timeout = null;

    dispatch(clearSelected());
    dispatch(
      setPlayQueueByRowClick({
        entries: playlist[getCurrentEntryList(playlist)],
        currentIndex: e.rowIndex,
        currentSongId: e.id,
        uniqueSongId: e.uniqueId,
      })
    );
    dispatch(setStatus('PLAYING'));
    dispatch(fixPlayer2Index());
  };

  const handlePlay = () => {
    dispatch(setPlayQueue({ entries: playlist[getCurrentEntryList(playlist)] }));
    dispatch(setStatus('PLAYING'));
    notifyToast('info', `Playing ${playlist.entry.length} song(s)`);
  };

  const handlePlayAppend = (type: 'next' | 'later') => {
    dispatch(appendPlayQueue({ entries: playlist[getCurrentEntryList(playlist)], type }));
    if (playQueue.entry.length < 1) {
      dispatch(setStatus('PLAYING'));
    }
    notifyToast('info', `Added ${playlist.entry.length} song(s)`);
  };

  const handleSave = async (recovery: boolean) => {
    dispatch(clearSelected());
    dispatch(addProcessingPlaylist(data.id));
    try {
      let res;
      const playlistData = recovery
        ? JSON.parse(fs.readFileSync(recoveryPath, { encoding: 'utf-8' }))
        : playlist[getCurrentEntryList(playlist)];

      // Smaller playlists can use the safe /createPlaylist method of saving
      if (playlistData.length <= 400 && !recovery) {
        res = await updatePlaylistSongs(data.id, playlistData);
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
        res = await clearPlaylist(data.id);

        if (isFailedResponse(res)) {
          notifyToast('error', errorMessages(res)[0]);
          return dispatch(removeProcessingPlaylist(data.id));
        }

        res = await updatePlaylistSongsLg(data.id, playlistData);

        if (isFailedResponse(res)) {
          res.forEach((response) => {
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
    return dispatch(removeProcessingPlaylist(data.id));
  };

  const handleEdit = async () => {
    setIsSubmittingEdit(true);
    const res = await updatePlaylist(data.id, editName, editDescription, editPublic);

    if (isFailedResponse(res)) {
      notifyToast('error', errorMessages(res)[0]);
    } else {
      queryClient.setQueryData(['playlist', playlistId], (oldData: any) => {
        return { ...oldData, name: editName, comment: editDescription, public: editPublic };
      });
    }

    setIsSubmittingEdit(false);
    editTriggerRef.current.close();
  };

  const handleDelete = async () => {
    try {
      const res = await deletePlaylist(data.id);

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
      await star(rowData.id, 'music');
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
      await unstar(rowData.id, 'music');
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
    setRating(rowData.id, e);
    dispatch(setRate({ id: [rowData.id], rating: e }));
    dispatch(setPlaylistRate({ id: [rowData.id], rating: e }));
  };

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
          image={data.image}
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'playlist',
            id: data.id,
          }}
          title={data.name}
          subtitle={
            <div>
              <div
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {data.comment ? data.comment : <span>&#8203;</span>}
              </div>
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
                      <Popover>
                        <Form>
                          <StyledInputGroup>
                            <Input
                              placeholder="Name"
                              value={editName}
                              onChange={(e) => setEditName(e)}
                            />
                          </StyledInputGroup>
                          <StyledInputGroup>
                            <Input
                              placeholder="Description"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e)}
                            />
                          </StyledInputGroup>
                          <StyledCheckbox
                            defaultChecked={editPublic}
                            value={editPublic}
                            onChange={(_v: any, e: boolean) => setEditPublic(e)}
                          >
                            Public
                          </StyledCheckbox>
                          <br />
                          <StyledButton
                            size="md"
                            type="submit"
                            block
                            loading={isSubmittingEdit}
                            disabled={isSubmittingEdit}
                            onClick={handleEdit}
                            appearance="primary"
                          >
                            Edit
                          </StyledButton>
                        </Form>
                      </Popover>
                    }
                  >
                    <EditButton size="md" disabled={misc.isProcessingPlaylist.includes(data?.id)} />
                  </Whisper>

                  <Whisper
                    enterable
                    placement="auto"
                    trigger="click"
                    speaker={
                      <Popover>
                        <p>Are you sure you want to delete this playlist?</p>
                        <StyledButton onClick={handleDelete} appearance="link">
                          Yes
                        </StyledButton>
                      </Popover>
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
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showSearchBar
        />
      }
    >
      <ListViewType
        data={searchQuery !== '' ? filteredData : playlist[getCurrentEntryList(playlist)]}
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
