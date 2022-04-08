import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { Form, Whisper } from 'rsuite';
import settings from 'electron-settings';
import { useTranslation } from 'react-i18next';
import useSearchQuery from '../../hooks/useSearchQuery';
import ListViewType from '../viewtypes/ListViewType';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import GridViewType from '../viewtypes/GridViewType';
import { StyledButton, StyledInput, StyledInputGroup, StyledTag } from '../shared/styled';
import { errorMessages, isFailedResponse } from '../../shared/utils';
import { notifyToast } from '../shared/toast';
import { AddPlaylistButton, FilterButton } from '../shared/ToolbarButtons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { apiController } from '../../api/controller';
import useColumnSort from '../../hooks/useColumnSort';
import { Item, Server } from '../../types';
import { setSort } from '../../redux/playlistSlice';
import ColumnSortPopover from '../shared/ColumnSortPopover';
import useListClickHandler from '../../hooks/useListClickHandler';
import Popup from '../shared/Popup';

const PlaylistList = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const queryClient = useQueryClient();
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const playlist = useAppSelector((state) => state.playlist);
  const playlistTriggerRef = useRef<any>();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [viewType, setViewType] = useState(settings.getSync('playlistViewType') || 'list');
  const {
    isLoading,
    isError,
    data: playlists,
    error,
  }: any = useQuery(['playlists'], () =>
    apiController({ serverType: config.serverType, endpoint: 'getPlaylists' })
  );
  const filteredData = useSearchQuery(misc.searchQuery, playlists, ['title', 'comment', 'owner']);
  const { sortedData, sortColumns } = useColumnSort(
    playlists,
    Item.Playlist,
    playlist.active.list.sort
  );

  const handleCreatePlaylist = async (name: string) => {
    try {
      const res = await apiController({
        serverType: config.serverType,
        endpoint: 'createPlaylist',
        args: { name },
      });

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

  const { handleRowClick, handleRowDoubleClick } = useListClickHandler({
    doubleClick: (rowData: any) => history.push(`playlist/${rowData.id}`),
  });

  if (isError) {
    return <span>{t('Error: {{error}}', { error: error.message })}</span>;
  }

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          title={
            <>
              {t('Playlists')}{' '}
              <StyledTag style={{ verticalAlign: 'middle', cursor: 'default' }}>
                {sortedData?.length || '...'}
              </StyledTag>
            </>
          }
          sidetitle={
            <>
              <ColumnSortPopover
                sortColumns={sortColumns}
                sortColumn={playlist.active.list.sort.column}
                sortType={playlist.active.list.sort.type}
                disabledItemValues={
                  config.serverType === Server.Jellyfin ? ['changed', 'owner', 'public'] : []
                }
                clearSortType={() =>
                  dispatch(
                    setSort({
                      type: 'list',
                      value: {
                        ...playlist.active.list.sort,
                        column: undefined,
                      },
                    })
                  )
                }
                setSortType={(e: string) =>
                  dispatch(
                    setSort({
                      type: 'list',
                      value: {
                        ...playlist.active.list.sort,
                        type: e,
                      },
                    })
                  )
                }
                setSortColumn={(e: string) =>
                  dispatch(
                    setSort({
                      type: 'list',
                      value: {
                        ...playlist.active.list.sort,
                        column: e,
                      },
                    })
                  )
                }
              >
                <FilterButton
                  size="sm"
                  appearance={playlist.active.list.sort.column ? 'primary' : 'subtle'}
                />
              </ColumnSortPopover>
            </>
          }
          subtitle={
            <Whisper
              ref={playlistTriggerRef}
              enterable
              placement="auto"
              trigger="click"
              speaker={
                <Popup>
                  <Form>
                    <StyledInputGroup>
                      <StyledInput
                        placeholder={t('Enter name...')}
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
                      {t('Create')}
                    </StyledButton>
                  </Form>
                </Popup>
              }
            >
              <AddPlaylistButton
                size="sm"
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
          data={misc.searchQuery === '' ? sortedData : filteredData}
          loading={isLoading}
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
          initialScrollOffset={Number(localStorage.getItem('scroll_list_playlistList'))}
          onScroll={(scrollIndex: number) => {
            localStorage.setItem('scroll_list_playlistList', String(Math.abs(scrollIndex)));
          }}
        />
      )}
      {viewType === 'grid' && (
        <GridViewType
          data={misc.searchQuery === '' ? sortedData : filteredData}
          loading={isLoading}
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
          initialScrollOffset={Number(localStorage.getItem('scroll_grid_playlistList'))}
          onScroll={(scrollIndex: number) => {
            localStorage.setItem('scroll_grid_playlistList', String(scrollIndex));
          }}
        />
      )}
    </GenericPage>
  );
};

export default PlaylistList;
