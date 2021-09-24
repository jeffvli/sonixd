import React, { useEffect, useState, useRef } from 'react';
import fs from 'fs';
import path from 'path';
import settings from 'electron-settings';
import { ButtonToolbar, Form, Input, Popover, Whisper } from 'rsuite';
import { useQuery, useQueryClient } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import {
  DeleteButton,
  EditButton,
  PlayAppendButton,
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
} from '../../api/api';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fixPlayer2Index,
  setPlayQueueByRowClick,
  setPlayQueue,
  appendPlayQueue,
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
  getRecoveryPath,
  isFailedResponse,
  moveToIndex,
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

interface PlaylistParams {
  id: string;
}

const PlaylistView = ({ ...rest }) => {
  const [isModified, setIsModified] = useState(false);
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const misc = useAppSelector((state) => state.misc);
  const history = useHistory();
  const queryClient = useQueryClient();
  const editTriggerRef = useRef<any>();
  const { id } = useParams<PlaylistParams>();
  const playlistId = rest.id ? rest.id : id;
  const { isLoading, isError, data, error }: any = useQuery(
    ['playlist', playlistId],
    () => getPlaylist(playlistId),
    {
      refetchOnWindowFocus: multiSelect.selected.length < 1 || !isModified,
    }
  );
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPublic, setEditPublic] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [localPlaylistData, setLocalPlaylistData] = useState(data);
  const [searchQuery, setSearchQuery] = useState('');
  const [recoveryPath, setRecoveryPath] = useState('');
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const filteredData = useSearchQuery(searchQuery, localPlaylistData, ['title', 'artist', 'album']);

  useEffect(() => {
    const recoveryFilePath = path.join(getRecoveryPath(), `playlist_${data?.id}.json`);

    setRecoveryPath(recoveryFilePath);
    setNeedsRecovery(fs.existsSync(recoveryFilePath));
  }, [data?.id]);

  useEffect(() => {
    // Set the local playlist data on any changes
    setLocalPlaylistData(data?.song);
    setEditName(data?.name);
    setEditDescription(data?.comment);
    setEditPublic(data?.public);
  }, [data]);

  useEffect(() => {
    if (data?.song !== localPlaylistData) {
      setIsModified(true);
    } else {
      setIsModified(false);
    }
  }, [data?.song, localPlaylistData]);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          dispatch(toggleRangeSelected(searchQuery !== '' ? filteredData : localPlaylistData));
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
        entries: localPlaylistData,
        currentIndex: e.rowIndex,
        currentSongId: e.id,
        uniqueSongId: e.uniqueId,
      })
    );
    dispatch(setStatus('PLAYING'));
    dispatch(fixPlayer2Index());
  };

  const handlePlay = () => {
    dispatch(setPlayQueue({ entries: localPlaylistData }));
    dispatch(setStatus('PLAYING'));
  };

  const handlePlayAppend = () => {
    dispatch(appendPlayQueue({ entries: localPlaylistData }));
    if (playQueue.entry.length < 1) {
      dispatch(setStatus('PLAYING'));
    }
  };

  const handleSave = async (recovery: boolean) => {
    dispatch(clearSelected());
    dispatch(addProcessingPlaylist(data.id));
    try {
      let res;
      const playlistData = recovery
        ? JSON.parse(fs.readFileSync(recoveryPath, { encoding: 'utf-8' }))
        : localPlaylistData;

      // Smaller playlists can use the safe /createPlaylist method of saving
      if (playlistData.length <= 400 && !recovery) {
        res = await updatePlaylistSongs(data.id, playlistData);
        if (res.status === 'failed') {
          notifyToast('error', res.error.message);
        } else {
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
        } else {
          res = await updatePlaylistSongsLg(data.id, playlistData);

          if (isFailedResponse(res)) {
            res.forEach((response) => {
              if (isFailedResponse(response)) {
                return notifyToast('error', errorMessages(response)[0]);
              }
              return false;
            });

            // If there are any failures (network, etc.), then we'll need a way to recover the playlist.
            // Write the localPlaylistData to a file so we can re-run the save command.
            createRecoveryFile(data.id, 'playlist', playlistData);
            setNeedsRecovery(true);
          }

          if (recovery) {
            // If the recovery succeeds, we can remove the recovery file
            fs.unlinkSync(recoveryPath);
            setNeedsRecovery(false);
          }

          await queryClient.refetchQueries(['playlist'], {
            active: true,
          });
        }
      }
    } catch (err) {
      notifyToast('error', err);
    }
    dispatch(removeProcessingPlaylist(data.id));
  };

  const handleEdit = async () => {
    setIsSubmittingEdit(true);
    const res = await updatePlaylist(data.id, editName, editDescription, editPublic);

    if (isFailedResponse(res)) {
      notifyToast('error', errorMessages(res)[0]);
    } else {
      queryClient.refetchQueries(['playlist'], {
        active: true,
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
      setLocalPlaylistData(
        moveToIndex(localPlaylistData, multiSelect.selected, multiSelect.currentMouseOverId)
      );
      dispatch(setIsDragging(false));
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <GenericPage
      header={
        <GenericPageHeader
          image={data.image}
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
                    size="lg"
                    onClick={handlePlay}
                    disabled={localPlaylistData?.length < 1}
                  />
                  <PlayAppendButton
                    appearance="primary"
                    size="lg"
                    onClick={handlePlayAppend}
                    disabled={localPlaylistData?.length < 1}
                  />
                  <SaveButton
                    size="lg"
                    text={needsRecovery ? 'Recover playlist' : undefined}
                    color={needsRecovery ? 'red' : isModified ? 'green' : undefined}
                    disabled={
                      (!needsRecovery && !isModified) ||
                      misc.isProcessingPlaylist.includes(data?.id)
                    }
                    loading={misc.isProcessingPlaylist.includes(data?.id)}
                    onClick={() => handleSave(needsRecovery)}
                  />
                  <UndoButton
                    size="lg"
                    color={needsRecovery ? 'red' : isModified ? 'green' : undefined}
                    disabled={
                      needsRecovery || !isModified || misc.isProcessingPlaylist.includes(data?.id)
                    }
                    onClick={() => setLocalPlaylistData(data?.song)}
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
                            onChange={() => setEditPublic(!editPublic)}
                          >
                            Public
                          </StyledCheckbox>
                          <br />
                          <StyledButton
                            size="sm"
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
                    <EditButton size="lg" disabled={misc.isProcessingPlaylist.includes(data?.id)} />
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
                      size="lg"
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
        data={searchQuery !== '' ? filteredData : localPlaylistData}
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
        dnd
        isModal={rest.isModal}
      />
    </GenericPage>
  );
};

export default PlaylistView;
