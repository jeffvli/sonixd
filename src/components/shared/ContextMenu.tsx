/* eslint-disable no-await-in-loop */
import React, { useRef, useState } from 'react';
import _ from 'lodash';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router';
import { Popover, Whisper } from 'rsuite';
import {
  getPlaylists,
  updatePlaylistSongsLg,
  star,
  unstar,
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
  removeFromPlayQueue,
  setStar,
} from '../../redux/playQueueSlice';
import {
  ContextMenuDivider,
  ContextMenuWindow,
  StyledContextMenuButton,
  StyledInputPicker,
  StyledButton,
} from './styled';
import { notifyToast } from './toast';
import { errorMessages, isFailedResponse, sleep } from '../../shared/utils';

export const ContextMenuButton = ({ text, children, ...rest }: any) => {
  return (
    <StyledContextMenuButton {...rest} appearance="subtle" size="sm" block>
      {children}
      {text}
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

  const { data: playlists }: any = useQuery(['playlists', 'name'], () =>
    getPlaylists('name')
  );

  const handleAddToQueue = () => {
    const entriesByRowIndexAsc = _.orderBy(
      multiSelect.selected,
      'rowIndex',
      'asc'
    );

    notifyToast(
      'info',
      `Added ${multiSelect.selected.length} song(s) to the queue`
    );

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
      const res = await updatePlaylistSongsLg(
        localSelectedPlaylistId,
        sortedEntries
      );

      if (isFailedResponse(res)) {
        notifyToast('error', errorMessages(res)[0]);
      } else {
        notifyToast(
          'success',
          <>
            <p>
              Added {sortedEntries.length} song(s) to playlist &quot;
              {
                playlists.find(
                  (playlist: any) => playlist.id === localSelectedPlaylistId
                )?.name
              }
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

  const handleFavorite = async (ordered: boolean) => {
    dispatch(setContextMenu({ show: false }));

    const sortedEntries = [...multiSelect.selected].sort(
      (a: any, b: any) => a.rowIndex - b.rowIndex
    );

    for (let i = 0; i < sortedEntries.length; i += 1) {
      await star(sortedEntries[i].id, sortedEntries[i].type);
      dispatch(setStar({ id: sortedEntries[i].id, type: 'star' }));
      if (ordered) {
        await sleep(350);
      }
    }

    await refetchAfterFavorite();
  };

  const handleUnfavorite = async () => {
    dispatch(setContextMenu({ show: false }));

    const starredEntries = multiSelect.selected.filter(
      (entry: any) => entry.starred
    );

    for (let i = 0; i < starredEntries.length; i += 1) {
      await unstar(starredEntries[i].id, starredEntries[i].type);
      dispatch(setStar({ id: starredEntries[i].id, type: 'unstar' }));
    }

    await refetchAfterFavorite();
  };

  return (
    <>
      {misc.contextMenu.show && misc.contextMenu.type === 'nowPlaying' && (
        <ContextMenu
          xPos={misc.contextMenu.xPos}
          yPos={misc.contextMenu.yPos}
          width={190}
          numOfButtons={7}
          numOfDividers={3}
        >
          <ContextMenuButton
            text={`Selected: ${multiSelect.selected.length}`}
          />
          <ContextMenuDivider />
          <ContextMenuButton text="Add to queue" onClick={handleAddToQueue} />
          <ContextMenuButton
            text="Remove from current"
            onClick={handleRemoveFromQueue}
          />
          <ContextMenuDivider />

          <Whisper
            ref={playlistTriggerRef}
            enterable
            placement="autoHorizontalStart"
            trigger="none"
            speaker={
              <Popover>
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
                    !selectedPlaylistId ||
                    misc.isProcessingPlaylist.includes(selectedPlaylistId)
                  }
                  loading={misc.isProcessingPlaylist.includes(
                    selectedPlaylistId
                  )}
                  onClick={handleAddToPlaylist}
                >
                  Add
                </StyledButton>
              </Popover>
            }
          >
            <ContextMenuButton
              text="Add to playlist"
              onClick={() =>
                playlistTriggerRef.current.state.isOverlayShown
                  ? playlistTriggerRef.current.close()
                  : playlistTriggerRef.current.open()
              }
            />
          </Whisper>
          <ContextMenuDivider />
          <ContextMenuButton
            text="Add to favorites"
            onClick={() => handleFavorite(false)}
          />
          <ContextMenuButton
            text="Add to favorites (ordered)"
            onClick={() => handleFavorite(true)}
          />
          <ContextMenuButton
            text="Remove from favorites"
            onClick={handleUnfavorite}
          />
        </ContextMenu>
      )}
    </>
  );
};
