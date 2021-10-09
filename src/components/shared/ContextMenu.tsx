/* eslint-disable no-await-in-loop */
import React, { useRef, useState } from 'react';
import _ from 'lodash';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router';
import { Col, FlexboxGrid, Form, Grid, Icon, Input, Row, Whisper } from 'rsuite';
import {
  getPlaylists,
  updatePlaylistSongsLg,
  createPlaylist,
  batchStar,
  batchUnstar,
  getAlbum,
  getPlaylist,
  deletePlaylist,
  getAllArtistSongs,
} from '../../api/api';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  addProcessingPlaylist,
  removeProcessingPlaylist,
  setContextMenu,
} from '../../redux/miscSlice';
import {
  appendPlayQueue,
  fixPlayer2Index,
  moveDown,
  moveToBottom,
  moveToIndex,
  moveToTop,
  moveUp,
  removeFromPlayQueue,
  setPlayQueue,
  setStar,
} from '../../redux/playQueueSlice';
import {
  moveToIndex as plMoveToIndex,
  moveToBottom as plMoveToBottom,
  moveToTop as plMoveToTop,
  moveUp as plMoveUp,
  moveDown as plMoveDown,
  removeFromPlaylist,
} from '../../redux/playlistSlice';
import {
  ContextMenuDivider,
  ContextMenuWindow,
  StyledContextMenuButton,
  StyledInputPicker,
  StyledButton,
  StyledInputGroup,
  StyledPopover,
  StyledInputNumber,
  StyledIconButton,
} from './styled';
import { notifyToast } from './toast';
import { errorMessages, getCurrentEntryList, isFailedResponse } from '../../shared/utils';
import { setStatus } from '../../redux/playerSlice';

export const ContextMenuButton = ({ text, hotkey, children, ...rest }: any) => {
  return (
    <StyledContextMenuButton {...rest} appearance="subtle" size="sm" block>
      {children}
      <FlexboxGrid justify="space-between">
        <FlexboxGrid.Item>{text}</FlexboxGrid.Item>
        <FlexboxGrid.Item>{hotkey}</FlexboxGrid.Item>
      </FlexboxGrid>
    </StyledContextMenuButton>
  );
};

export const ContextMenu = ({
  yPos,
  xPos,
  width,
  numOfButtons,
  numOfDividers,
  hasTitle,
  children,
}: any) => {
  return (
    <ContextMenuWindow
      yPos={yPos}
      xPos={xPos}
      width={width}
      numOfButtons={numOfButtons}
      numOfDividers={numOfDividers}
      hasTitle={hasTitle}
    >
      {children}
    </ContextMenuWindow>
  );
};

export const GlobalContextMenu = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const playlist = useAppSelector((state) => state.playlist);
  const playQueue = useAppSelector((state) => state.playQueue);
  const misc = useAppSelector((state) => state.misc);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const addToPlaylistTriggerRef = useRef<any>();
  const deletePlaylistTriggerRef = useRef<any>();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [shouldCreatePlaylist, setShouldCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [indexToMoveTo, setIndexToMoveTo] = useState(0);

  const { data: playlists }: any = useQuery(['playlists', 'name'], () => getPlaylists('name'), {
    refetchOnWindowFocus: false,
  });

  const handlePlay = async () => {
    dispatch(setContextMenu({ show: false }));
    const promises = [];

    if (misc.contextMenu.type === 'music' || misc.contextMenu.type === 'nowPlaying') {
      const entriesByRowIndexAsc = _.orderBy(multiSelect.selected, 'rowIndex', 'asc');
      dispatch(setPlayQueue({ entries: entriesByRowIndexAsc }));
      notifyToast('info', `Playing ${multiSelect.selected.length} song(s)`);
    } else if (misc.contextMenu.type === 'playlist') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(getPlaylist(multiSelect.selected[i].id));
      }

      const res = await Promise.all(promises);
      const songs = _.flatten(_.map(res, 'song'));
      dispatch(setPlayQueue({ entries: songs }));
      notifyToast('info', `Playing ${songs.length} song(s)`);
    } else if (misc.contextMenu.type === 'album') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(getAlbum(multiSelect.selected[i].id));
      }

      const res = await Promise.all(promises);
      const songs = _.flatten(_.map(res, 'song'));
      dispatch(setPlayQueue({ entries: songs }));
      notifyToast('info', `Playing ${songs.length} song(s)`);
    } else if (misc.contextMenu.type === 'artist') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(getAllArtistSongs(multiSelect.selected[i].id));
      }

      const res = await Promise.all(promises);
      const songs = _.flatten(res);
      dispatch(setPlayQueue({ entries: songs }));
      notifyToast('info', `Playing ${songs.length} song(s)`);
    }

    if (playQueue.entry.length < 1 || playQueue.currentPlayer === 1) {
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    }
  };

  const handleAddToQueue = async (type: 'next' | 'later') => {
    dispatch(setContextMenu({ show: false }));
    const promises = [];

    if (misc.contextMenu.type === 'music' || misc.contextMenu.type === 'nowPlaying') {
      const entriesByRowIndexAsc = _.orderBy(multiSelect.selected, 'rowIndex', 'asc');
      dispatch(appendPlayQueue({ entries: entriesByRowIndexAsc, type }));
      notifyToast('info', `Added ${multiSelect.selected.length} song(s)`);
    } else if (misc.contextMenu.type === 'playlist') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(getPlaylist(multiSelect.selected[i].id));
      }

      const res = await Promise.all(promises);
      const songs = _.flatten(_.map(res, 'song'));
      dispatch(appendPlayQueue({ entries: songs, type }));
      notifyToast('info', `Added ${songs.length} song(s)`);
    } else if (misc.contextMenu.type === 'album') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(getAlbum(multiSelect.selected[i].id));
      }

      const res = await Promise.all(promises);
      const songs = _.flatten(_.map(res, 'song'));
      dispatch(appendPlayQueue({ entries: songs, type }));
      notifyToast('info', `Added ${songs.length} song(s)`);
    } else if (misc.contextMenu.type === 'artist') {
      for (let i = 0; i < multiSelect.selected.length; i += 1) {
        promises.push(getAllArtistSongs(multiSelect.selected[i].id));
      }

      const res = await Promise.all(promises);
      const songs = _.flatten(res);
      dispatch(appendPlayQueue({ entries: songs, type }));
      notifyToast('info', `Added ${songs.length} song(s)`);
    }

    if (playQueue.entry.length < 1 || playQueue.currentPlayer === 1) {
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    }
  };

  const handleRemoveFromCurrent = async () => {
    if (misc.contextMenu.type === 'nowPlaying') {
      dispatch(removeFromPlayQueue({ entries: multiSelect.selected }));
      if (playQueue.currentPlayer === 1) {
        dispatch(fixPlayer2Index());
      }
    } else {
      dispatch(removeFromPlaylist({ selectedEntries: multiSelect.selected }));
    }

    dispatch(setContextMenu({ show: false }));
  };

  const playlistSuccessToast = (songCount: number, playlistId: string) => {
    notifyToast(
      'success',
      `Added ${songCount} song(s) to playlist ${
        playlists.find((pl: any) => pl.id === playlistId)?.name
      }`,
      <>
        <StyledButton
          appearance="link"
          onClick={() => {
            history.push(`/playlist/${playlistId}`);
            dispatch(setContextMenu({ show: false }));
          }}
        >
          Go to playlist
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
      if (misc.contextMenu.type === 'music' || misc.contextMenu.type === 'nowPlaying') {
        songs = [...multiSelect.selected].sort((a: any, b: any) => a.rowIndex - b.rowIndex);

        res = await updatePlaylistSongsLg(localSelectedPlaylistId, songs);

        if (isFailedResponse(res)) {
          notifyToast('error', errorMessages(res)[0]);
        } else {
          playlistSuccessToast(songs.length, localSelectedPlaylistId);
        }
      } else if (misc.contextMenu.type === 'playlist') {
        for (let i = 0; i < multiSelect.selected.length; i += 1) {
          promises.push(getPlaylist(multiSelect.selected[i].id));
        }

        res = await Promise.all(promises);
        songs = _.flatten(_.map(res, 'song'));
        res = await updatePlaylistSongsLg(localSelectedPlaylistId, songs);

        if (isFailedResponse(res)) {
          notifyToast('error', errorMessages(res)[0]);
        } else {
          playlistSuccessToast(songs.length, localSelectedPlaylistId);
        }
      } else if (misc.contextMenu.type === 'album') {
        for (let i = 0; i < multiSelect.selected.length; i += 1) {
          promises.push(getAlbum(multiSelect.selected[i].id));
        }

        res = await Promise.all(promises);
        songs = _.flatten(_.map(res, 'song'));
        res = await updatePlaylistSongsLg(localSelectedPlaylistId, songs);

        if (isFailedResponse(res)) {
          notifyToast('error', errorMessages(res)[0]);
        } else {
          playlistSuccessToast(songs.length, localSelectedPlaylistId);
        }
      }
    } catch (err) {
      notifyToast('error', err);
    }

    await queryClient.refetchQueries(['playlists'], {
      active: true,
    });

    dispatch(removeProcessingPlaylist(localSelectedPlaylistId));
  };

  const handleDeletePlaylist = async () => {
    dispatch(setContextMenu({ show: false }));

    // Navidrome throws internal server error when using Promise.all() so we do it sequentially
    const res = [];
    for (let i = 0; i < multiSelect.selected.length; i += 1) {
      try {
        res.push(await deletePlaylist(multiSelect.selected[i].id));
      } catch (err) {
        notifyToast('error', err);
      }
    }

    if (isFailedResponse(res)) {
      notifyToast('error', errorMessages(res)[0]);
    } else {
      notifyToast('info', `Deleted ${multiSelect.selected.length} playlist(s)`);
    }

    await queryClient.refetchQueries(['playlists'], {
      active: true,
    });
  };

  const handleCreatePlaylist = async () => {
    try {
      const res = await createPlaylist(newPlaylistName);

      if (isFailedResponse(res)) {
        notifyToast('error', errorMessages(res)[0]);
      } else {
        await queryClient.refetchQueries(['playlists'], {
          active: true,
        });
        notifyToast('success', `Playlist "${newPlaylistName}" created!`);
      }
    } catch (err) {
      notifyToast('error', err);
    }
  };

  const refetchAfterFavorite = async () => {
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
  };

  const handleFavorite = async () => {
    dispatch(setContextMenu({ show: false }));

    const sortedEntries = [...multiSelect.selected].sort(
      (a: any, b: any) => a.rowIndex - b.rowIndex
    );

    const ids = _.map(sortedEntries, 'id');

    try {
      const res = await batchStar(ids, sortedEntries[0].type);

      if (isFailedResponse(res)) {
        notifyToast('error', errorMessages(res)[0]);
      } else {
        dispatch(setStar({ id: ids, type: 'star' }));
      }

      await refetchAfterFavorite();
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
      const res = await batchUnstar(ids, multiSelect.selected[0].type);

      if (isFailedResponse(res)) {
        notifyToast('error', errorMessages(res)[0]);
      } else {
        dispatch(setStar({ id: ids, type: 'unstar' }));
      }

      await refetchAfterFavorite();
    } catch (err) {
      notifyToast('error', err);
    }
  };

  const handleMoveSelectedToIndex = () => {
    if (misc.contextMenu.type === 'nowPlaying') {
      const currentEntryList = getCurrentEntryList(playQueue);
      const uniqueIdOfIndexToMoveTo = playQueue[currentEntryList][indexToMoveTo].uniqueId;
      dispatch(
        moveToIndex({ entries: multiSelect.selected, moveBeforeId: uniqueIdOfIndexToMoveTo })
      );
    } else {
      const uniqueIdOfIndexToMoveTo = playlist.entry[indexToMoveTo].uniqueId;
      dispatch(
        plMoveToIndex({
          selectedEntries: multiSelect.selected,
          moveBeforeId: uniqueIdOfIndexToMoveTo,
        })
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

  return (
    <>
      {misc.contextMenu.show && (
        <ContextMenu
          xPos={misc.contextMenu.xPos}
          yPos={misc.contextMenu.yPos}
          width={190}
          numOfButtons={9}
          numOfDividers={3}
        >
          <ContextMenuButton
            text="Play"
            onClick={handlePlay}
            disabled={misc.contextMenu.disabledOptions.includes('play')}
          />
          <ContextMenuButton
            text="Add to queue (next)"
            onClick={() => handleAddToQueue('next')}
            disabled={misc.contextMenu.disabledOptions.includes('addToQueueNext')}
          />
          <ContextMenuButton
            text="Add to queue (later)"
            onClick={() => handleAddToQueue('later')}
            disabled={misc.contextMenu.disabledOptions.includes('addToQueueLast')}
          />
          <ContextMenuButton
            text="Remove from current"
            onClick={handleRemoveFromCurrent}
            disabled={misc.contextMenu.disabledOptions.includes('removeFromCurrent')}
          />
          <ContextMenuDivider />

          <Whisper
            ref={addToPlaylistTriggerRef}
            enterable
            placement="autoHorizontalStart"
            trigger="none"
            speaker={
              <StyledPopover>
                <StyledInputGroup>
                  <StyledInputPicker
                    data={playlists}
                    placement="autoVerticalStart"
                    virtualized
                    labelKey="name"
                    valueKey="id"
                    width={200}
                    onChange={(e: any) => setSelectedPlaylistId(e)}
                  />
                  <StyledButton
                    disabled={
                      !selectedPlaylistId || misc.isProcessingPlaylist.includes(selectedPlaylistId)
                    }
                    loading={misc.isProcessingPlaylist.includes(selectedPlaylistId)}
                    onClick={handleAddToPlaylist}
                  >
                    Add
                  </StyledButton>
                </StyledInputGroup>

                <div>
                  <StyledButton
                    appearance="link"
                    onClick={() => setShouldCreatePlaylist(!shouldCreatePlaylist)}
                  >
                    Create new playlist
                  </StyledButton>
                </div>

                {shouldCreatePlaylist && (
                  <Form>
                    <StyledInputGroup>
                      <Input
                        placeholder="Enter name..."
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e)}
                      />
                    </StyledInputGroup>
                    <br />
                    <StyledButton
                      size="sm"
                      type="submit"
                      block
                      loading={false}
                      appearance="primary"
                      onClick={() => {
                        handleCreatePlaylist();
                        setShouldCreatePlaylist(false);
                      }}
                    >
                      Create playlist
                    </StyledButton>
                  </Form>
                )}
              </StyledPopover>
            }
          >
            <ContextMenuButton
              text="Add to playlist"
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
            placement="autoHorizontalStart"
            trigger="none"
            speaker={
              <StyledPopover>
                <p>Are you sure you want to delete {multiSelect.selected?.length} playlist(s)?</p>
                <StyledButton onClick={handleDeletePlaylist} appearance="link">
                  Yes
                </StyledButton>
              </StyledPopover>
            }
          >
            <ContextMenuButton
              text="Delete playlist(s)"
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
            text="Add to favorites"
            onClick={handleFavorite}
            disabled={misc.contextMenu.disabledOptions.includes('addToFavorites')}
          />
          <ContextMenuButton
            text="Remove from favorites"
            onClick={handleUnfavorite}
            disabled={misc.contextMenu.disabledOptions.includes('removeFromFavorites')}
          />
          <ContextMenuDivider />

          <Whisper
            enterable
            placement="autoHorizontalStart"
            trigger="hover"
            speaker={
              <StyledPopover>
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
                    <StyledButton
                      type="submit"
                      onClick={handleMoveSelectedToIndex}
                      disabled={
                        (misc.contextMenu.type === 'nowPlaying'
                          ? indexToMoveTo > playQueue[getCurrentEntryList(playQueue)]?.length
                          : indexToMoveTo > playlist.entry?.length) || indexToMoveTo < 0
                      }
                    >
                      Go
                    </StyledButton>
                  </StyledInputGroup>
                </Form>

                <Grid fluid>
                  <Row>
                    <Col xs={12}>
                      <StyledIconButton
                        icon={<Icon icon="angle-double-up" />}
                        onClick={handleMoveToTop}
                        block
                      >
                        Top
                      </StyledIconButton>
                    </Col>
                    <Col xs={12}>
                      <StyledIconButton
                        icon={<Icon icon="angle-up" />}
                        onClick={handleMoveUpOne}
                        block
                      >
                        Up
                      </StyledIconButton>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <StyledIconButton
                        icon={<Icon icon="angle-double-down" />}
                        onClick={handleMoveToBottom}
                        block
                      >
                        Bottom
                      </StyledIconButton>
                    </Col>

                    <Col xs={12}>
                      <StyledIconButton
                        icon={<Icon icon="angle-down" />}
                        onClick={handleMoveDownOne}
                        block
                      >
                        Down
                      </StyledIconButton>
                    </Col>
                  </Row>
                </Grid>
              </StyledPopover>
            }
          >
            <ContextMenuButton
              text="Move selected to [...]"
              disabled={misc.contextMenu.disabledOptions.includes('moveSelectedTo')}
            />
          </Whisper>
        </ContextMenu>
      )}
    </>
  );
};
