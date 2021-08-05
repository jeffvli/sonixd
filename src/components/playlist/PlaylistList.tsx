import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { Tag } from 'rsuite';
import { getPlaylists } from '../../api/api';
import ListViewType from '../viewtypes/ListViewType';
import Loader from '../loader/Loader';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';

const tableColumns = [
  {
    header: 'Name',
    dataKey: 'name',
    alignment: 'left',
    flexGrow: 2,
    resizable: false,
  },
  {
    header: 'Tracks',
    dataKey: 'songCount',
    alignment: 'center',
    flexGrow: 1,
    resizable: false,
  },
  {
    header: 'Description',
    dataKey: 'comment',
    alignment: 'left',
    flexGrow: 2,
    resizable: false,
  },
  {
    header: 'Created',
    dataKey: 'created',
    alignment: 'left',
    flexGrow: 1,
    resizable: false,
  },
];

const PlaylistList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const history = useHistory();
  const { isLoading, isError, data: playlists, error }: any = useQuery(
    'playlists',
    getPlaylists
  );

  const handleRowClick = (e: any) => {
    history.push(`playlist/${e.id}`);
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
        />
      }
    >
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
    </GenericPage>
  );
};

export default PlaylistList;
