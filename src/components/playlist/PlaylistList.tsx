import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { Tag, SelectPicker } from 'rsuite';
import settings from 'electron-settings';
import useSearchQuery from '../../hooks/useSearchQuery';
import { getPlaylists } from '../../api/api';
import ListViewType from '../viewtypes/ListViewType';
import Loader from '../loader/Loader';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import GridViewType from '../viewtypes/GridViewType';

const PLAYLIST_SORT_TYPES = [
  { label: 'Date Modified', value: 'dateModified' },
  { label: 'Date Created', value: 'dateCreated' },
];

const tableColumns = [
  {
    id: '#',
    dataKey: 'index',
    alignment: 'center',
    width: 70,
    resizable: false,
  },
  {
    id: 'Name',
    dataKey: 'name',
    alignment: 'left',
    flexGrow: 1,
    resizable: false,
  },
  {
    id: 'Tracks',
    dataKey: 'songCount',
    alignment: 'center',
    flexGrow: 1,
    resizable: false,
  },
  {
    id: 'Description',
    dataKey: 'comment',
    alignment: 'left',
    flexGrow: 2,
    resizable: false,
  },
];

const PlaylistList = () => {
  const history = useHistory();
  const [sortBy, setSortBy] = useState('');
  const [viewType, setViewType] = useState(
    settings.getSync('viewType') || 'list'
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
    return <Loader />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <GenericPage
      header={
        <GenericPageHeader
          title="Playlists"
          subtitle={<Tag>{playlists.length} playlists</Tag>}
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showViewTypeButtons
          showSearchBar
          handleListClick={() => setViewType('list')}
          handleGridClick={() => setViewType('grid')}
          subsidetitle={
            <SelectPicker
              data={PLAYLIST_SORT_TYPES}
              searchable={false}
              placeholder="Sort Type"
              menuAutoWidth
              onChange={(value) => {
                setSortBy(value);
              }}
            />
          }
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
          tableColumns={tableColumns}
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
          size="150px"
        />
      )}
    </GenericPage>
  );
};

export default PlaylistList;
