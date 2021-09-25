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
  setStar,
} from '../../redux/playQueueSlice';
import {
  moveToBottom as plMoveToBottom,
  moveToTop as plMoveToTop,
  moveUp as plMoveUp,
  moveDown as plMoveDown,
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
  const playQueue = useAppSelector((state) => state.playQueue);
  const misc = useAppSelector((state) => state.misc);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const playlistTriggerRef = useRef<any>();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [shouldCreatePlaylist, setShouldCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [indexToMoveTo, setIndexToMoveTo] = useState(0);

  const { data: playlists }: any = useQuery(['playlists', 'name'], () => getPlaylists('name'), {
    refetchOnWindowFocus: false,
  });

  const handleAddToQueue = () => {
    const entriesByRowIndexAsc = _.orderBy(multiSelect.selected, 'rowIndex', 'asc');

    notifyToast('info', `Added ${multiSelect.selected.length} song(s) to the queue`);

    dispatch(appendPlayQueue({ entries: entriesByRowIndexAsc }));
    dispatch(setContextMenu({ show: false }));
  };

  const handleRemoveFromQueue = async () => {
    dispatch(removeFromPlayQueue({ entries: multiSelect.selected }));
    if (playQueue.currentPlayer === 1) {
      dispatch(fixPlayer2Index());
    }
    dispatch(setContextMenu({ show: false }));
  };

  const handleAddToPlaylist = async () => {
    // If the window is closed, the selectedPlaylistId will be deleted
    const localSelectedPlaylistId = selectedPlaylistId;
    dispatch(addProcessingPlaylist(selectedPlaylistId));

    const sortedEntries = [...multiSelect.selected].sort(
      (a: any, b: any) => a.rowIndex - b.rowIndex
    );

    try {
      const res = await updatePlaylistSongsLg(localSelectedPlaylistId, sortedEntries);

      if (isFailedResponse(res)) {
        notifyToast('error', errorMessages(res)[0]);
      } else {
        notifyToast(
          'success',
          <>
            <p>
              Added {sortedEntries.length} song(s) to playlist &quot;
              {playlists.find((pl: any) => pl.id === localSelectedPlaylistId)?.name}
              &quot;
            </p>
            <StyledButton
              appearance="link"
              onClick={() => {
                history.push(`/playlist/${localSelectedPlaylistId}`);
                dispatch(setContextMenu({ show: false }));
              }}
            >
              Go to playlist
            </StyledButton>
          </>
        );
      }
    } catch (err) {
      notifyToast('error', err);
    }

    dispatch(removeProcessingPlaylist(localSelectedPlaylistId));
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
        ids.forEach((id) => dispatch(setStar({ id, type: 'star' })));
      }

      await refetchAfterFavorite();
    } catch (err) {
      notifyToast('error', err);
    }
  };

  const handleUnfavorite = async () => {
    dispatch(setContextMenu({ show: false }));

    const starredEntries = multiSelect.selected.filter((entry: any) => entry.starred);

    const ids = _.map(starredEntries, 'id');

    try {
      const res = await batchUnstar(ids, starredEntries[0].type);

      if (isFailedResponse(res)) {
        notifyToast('error', errorMessages(res)[0]);
      } else {
        ids.forEach((id) => dispatch(setStar({ id, type: 'unstar' })));
      }

      await refetchAfterFavorite();
    } catch (err) {
      notifyToast('error', err);
    }
  };

  const handleMoveSelectedToIndex = () => {
    const currentEntryList = getCurrentEntryList(playQueue);
    const uniqueIdOfIndexToMoveTo = playQueue[currentEntryList][indexToMoveTo].uniqueId;

    dispatch(moveToIndex({ entries: multiSelect.selected, moveBeforeId: uniqueIdOfIndexToMoveTo }));
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
          numOfButtons={7}
          numOfDividers={4}
        >
          <ContextMenuButton text={`Selected: ${multiSelect.selected.length}`} disabled />
          <ContextMenuDivider />
          <ContextMenuButton
            text="Add to queue"
            onClick={handleAddToQueue}
            disabled={misc.contextMenu.disabledOptions.includes('addToQueue')}
          />
          <ContextMenuButton
            text="Remove from current"
            onClick={handleRemoveFromQueue}
            disabled={misc.contextMenu.disabledOptions.includes('removeFromCurrent')}
          />
          <ContextMenuDivider />

          <Whisper
            ref={playlistTriggerRef}
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
                playlistTriggerRef.current.state.isOverlayShown
                  ? playlistTriggerRef.current.close()
                  : playlistTriggerRef.current.open()
              }
              disabled={misc.contextMenu.disabledOptions.includes('addToPlaylist')}
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
                      max={playQueue[getCurrentEntryList(playQueue)].length}
                      value={indexToMoveTo}
                      onChange={(e: number) => setIndexToMoveTo(e)}
                    />
                    <StyledButton
                      type="submit"
                      onClick={handleMoveSelectedToIndex}
                      disabled={
                        indexToMoveTo > playQueue[getCurrentEntryList(playQueue)].length ||
                        indexToMoveTo < 0
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
