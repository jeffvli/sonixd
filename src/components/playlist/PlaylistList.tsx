import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { Form, Input, Popover, Whisper } from 'rsuite';
import settings from 'electron-settings';
import useSearchQuery from '../../hooks/useSearchQuery';
import { createPlaylist, getPlaylists } from '../../api/api';
import ListViewType from '../viewtypes/ListViewType';
import PageLoader from '../loader/PageLoader';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import GridViewType from '../viewtypes/GridViewType';
import { StyledButton, StyledInputGroup } from '../shared/styled';
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
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const playlistTriggerRef = useRef<any>();
  const [sortBy] = useState('name');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [viewType, setViewType] = useState(settings.getSync('playlistViewType') || 'list');
  const { isLoading, isError, data: playlists, error }: any = useQuery(
    ['playlists', sortBy],
    () => getPlaylists(sortBy),
    { refetchOnWindowFocus: multiSelect.selected.length < 1 }
  );
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(searchQuery, playlists, ['name', 'comment']);

  const handleCreatePlaylist = async (name: string) => {
    try {
      const res = await createPlaylist(name);

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
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          dispatch(toggleRangeSelected(searchQuery !== '' ? filteredData : playlists));
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
                <Popover>
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
                        handleCreatePlaylist(newPlaylistName);
                        playlistTriggerRef.current.close();
                      }}
                    >
                      Create
                    </StyledButton>
                  </Form>
                </Popover>
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
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showViewTypeButtons
          viewTypeSetting="playlist"
          showSearchBar
          handleListClick={() => setViewType('list')}
          handleGridClick={() => setViewType('grid')}
        />
      }
    >
      {viewType === 'list' && (
        <ListViewType
          data={
            searchQuery === ''
              ? playlists
              : playlists.filter((playlist: any) => {
                  return (
                    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    playlist.comment?.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                })
          }
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          tableColumns={settings.getSync('playlistListColumns')}
          rowHeight={Number(settings.getSync('playlistListRowHeight'))}
          fontSize={settings.getSync('playlistListFontSize')}
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'playlist',
            cacheIdProperty: 'id',
          }}
          listType="playlist"
          virtualized
          disabledContextMenuOptions={[
            'moveSelectedTo',
            'addToFavorites',
            'removeFromFavorites',
            'removeFromCurrent',
          ]}
        />
      )}
      {viewType === 'grid' && (
        <GridViewType
          data={searchQuery === '' ? playlists : filteredData}
          cardTitle={{
            prefix: 'playlist',
            property: 'name',
            urlProperty: 'id',
          }}
          cardSubtitle={{
            prefix: 'playlist',
            property: 'songCount',
            unit: ' tracks',
          }}
          playClick={{ type: 'playlist', idProperty: 'id' }}
          size={Number(settings.getSync('gridCardSize'))}
          cacheType="playlist"
        />
      )}
    </GenericPage>
  );
};

export default PlaylistList;
