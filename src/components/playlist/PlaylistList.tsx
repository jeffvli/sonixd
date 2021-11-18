import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { Form, Whisper } from 'rsuite';
import settings from 'electron-settings';
import useSearchQuery from '../../hooks/useSearchQuery';
import { createPlaylist, getPlaylists } from '../../api/api';
import ListViewType from '../viewtypes/ListViewType';
import PageLoader from '../loader/PageLoader';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import GridViewType from '../viewtypes/GridViewType';
import { StyledButton, StyledInput, StyledInputGroup, StyledPopover } from '../shared/styled';
import { errorMessages, isFailedResponse } from '../../shared/utils';
import { notifyToast } from '../shared/toast';
import { AddPlaylistButton } from '../shared/ToolbarButtons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  clearSelected,
  setRangeSelected,
  toggleRangeSelected,
  toggleSelected,
} from '../../redux/multiSelectSlice';

const PlaylistList = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const queryClient = useQueryClient();
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const playlistTriggerRef = useRef<any>();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [viewType, setViewType] = useState(settings.getSync('playlistViewType') || 'list');
  const { isLoading, isError, data: playlists, error }: any = useQuery(['playlists'], () =>
    getPlaylists()
  );
  const filteredData = useSearchQuery(misc.searchQuery, playlists, ['title', 'comment', 'owner']);

  const handleCreatePlaylist = async (name: string) => {
    try {
      const res = await createPlaylist({ name });

      if (isFailedResponse(res)) {
        notifyToast('error', errorMessages(res)[0]);
      } else {
        await queryClient.refetchQueries(['playlists'], {
          active: true,
        });
        notifyToast('success', `Playlist "${name}" created!`);
      }
    } catch (err) {
      notifyToast('error', err);
    }
  };

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
    history.push(`playlist/${rowData.id}`);
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
          title="Playlists"
          subtitle={
            <Whisper
              ref={playlistTriggerRef}
              enterable
              placement="auto"
              trigger="click"
              speaker={
                <StyledPopover>
                  <Form>
                    <StyledInputGroup>
                      <StyledInput
                        placeholder="Enter name..."
                        value={newPlaylistName}
                        onChange={(e: string) => setNewPlaylistName(e)}
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
                        handleCreatePlaylist(newPlaylistName);
                        playlistTriggerRef.current.close();
                      }}
                    >
                      Create
                    </StyledButton>
                  </Form>
                </StyledPopover>
              }
            >
              <AddPlaylistButton
                size="sm"
                width={125}
                onClick={() =>
                  playlistTriggerRef.current.state.isOverlayShown
                    ? playlistTriggerRef.current.close()
                    : playlistTriggerRef.current.open()
                }
              />
            </Whisper>
          }
          showViewTypeButtons
          viewTypeSetting="playlist"
          handleListClick={() => setViewType('list')}
          handleGridClick={() => setViewType('grid')}
        />
      }
    >
      {viewType === 'list' && (
        <ListViewType
          data={misc.searchQuery === '' ? playlists : filteredData}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          tableColumns={config.lookAndFeel.listView.playlist.columns}
          rowHeight={config.lookAndFeel.listView.playlist.rowHeight}
          fontSize={config.lookAndFeel.listView.playlist.fontSize}
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'playlist',
            cacheIdProperty: 'id',
          }}
          page="playlistListPage"
          listType="playlist"
          virtualized
          disabledContextMenuOptions={[
            'moveSelectedTo',
            'addToFavorites',
            'removeFromFavorites',
            'removeSelected',
            'viewInFolder',
          ]}
        />
      )}
      {viewType === 'grid' && (
        <GridViewType
          data={misc.searchQuery === '' ? playlists : filteredData}
          cardTitle={{
            prefix: 'playlist',
            property: 'title',
            urlProperty: 'id',
          }}
          cardSubtitle={{
            prefix: 'playlist',
            property: 'songCount',
            unit: ' tracks',
          }}
          playClick={{ type: 'playlist', idProperty: 'id' }}
          size={config.lookAndFeel.gridView.cardSize}
          cacheType="playlist"
        />
      )}
    </GenericPage>
  );
};

export default PlaylistList;
