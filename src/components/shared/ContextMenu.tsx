import React, { useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router';
import { Popover, Whisper } from 'rsuite';
import { getPlaylists, populatePlaylist } from '../../api/api';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  addProcessingPlaylist,
  removeProcessingPlaylist,
  setContextMenu,
} from '../../redux/miscSlice';
import {
  ContextMenuTitle,
  ContextMenuDivider,
  ContextMenuWindow,
  StyledContextMenuButton,
  StyledInputPicker,
  StyledButton,
} from './styled';
import { notifyToast } from './toast';

export const ContextMenuButton = ({ children, ...rest }: any) => {
  return (
    <StyledContextMenuButton {...rest} appearance="subtle" size="xs" block>
      {children}
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
  const misc = useAppSelector((state) => state.misc);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const playlistTriggerRef = useRef<any>();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');

  const { data: playlists }: any = useQuery(['playlists', 'name'], () =>
    getPlaylists('name')
  );

  const handleAddToPlaylist = async () => {
    // If the window is closed, the selectedPlaylistId will be deleted
    const localSelectedPlaylistId = selectedPlaylistId;
    dispatch(addProcessingPlaylist(selectedPlaylistId));

    const sortedEntries = [...multiSelect.selected].sort(
      (a: any, b: any) => a.rowIndex - b.rowIndex
    );

    try {
      const res = await populatePlaylist(
        localSelectedPlaylistId,
        sortedEntries
      );

      if (res.status === 'failed') {
        notifyToast('error', res.error.message);
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
      console.log(err);
    }

    dispatch(removeProcessingPlaylist(localSelectedPlaylistId));
  };

  return (
    <>
      {misc.contextMenu.show && misc.contextMenu.type === 'nowPlaying' && (
        <>
          <ContextMenu
            xPos={misc.contextMenu.xPos}
            yPos={misc.contextMenu.yPos}
            width={140}
            numOfButtons={5}
            numOfDividers={3}
            hasTitle
          >
            <ContextMenuTitle>
              Selected: {multiSelect.selected.length}
            </ContextMenuTitle>
            <ContextMenuDivider />
            <ContextMenuButton>Add to queue</ContextMenuButton>
            <ContextMenuButton>Remove from current</ContextMenuButton>
            <ContextMenuDivider />

            <Whisper
              ref={playlistTriggerRef}
              enterable
              placement="autoHorizontal"
              trigger="none"
              speaker={
                <Popover>
                  <StyledInputPicker
                    data={playlists}
                    virtualized
                    style={{ width: '150px' }}
                    labelKey="name"
                    valueKey="id"
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
                onClick={() =>
                  playlistTriggerRef.current.state.isOverlayShown
                    ? playlistTriggerRef.current.close()
                    : playlistTriggerRef.current.open()
                }
              >
                Add to playlist
              </ContextMenuButton>
            </Whisper>

            <ContextMenuDivider />
            <ContextMenuButton>Add to favorites</ContextMenuButton>
            <ContextMenuButton>Remove from favorites</ContextMenuButton>
          </ContextMenu>
        </>
      )}
    </>
  );
};
