import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { Tag } from 'rsuite';
import settings from 'electron-settings';
import useSearchQuery from '../../hooks/useSearchQuery';
import { getPlaylists } from '../../api/api';
import ListViewType from '../viewtypes/ListViewType';
import PageLoader from '../loader/PageLoader';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import GridViewType from '../viewtypes/GridViewType';

const PlaylistList = () => {
  const history = useHistory();
  const [sortBy] = useState('');
  const [viewType, setViewType] = useState(
    settings.getSync('playlistViewType') || 'list'
  );
  const { isLoading, isError, data: playlists, error }: any = useQuery(
    ['playlists', sortBy],
    () => getPlaylists(sortBy)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(searchQuery, playlists, [
    'name',
    'comment',
  ]);

  const handleRowClick = (_e: any, rowData: any) => {
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
          subtitle={<Tag>{playlists.length} playlists</Tag>}
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
                    playlist.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    playlist.comment
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  );
                })
          }
          handleRowClick={handleRowClick}
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
