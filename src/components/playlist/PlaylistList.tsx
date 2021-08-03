import React from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { Table, Icon } from 'rsuite';
import { Helmet } from 'react-helmet-async';
import { getPlaylists } from '../../api/api';
import ListView from '../views/ListView';
import Loader from '../loader/Loader';
import GenericPage from '../layout/GenericPage';
import PlaylistViewHeader from './PlaylistViewHeader';

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
  const { isLoading, isError, data: playlists, error }: any = useQuery(
    'playlists',
    getPlaylists
  );
  const history = useHistory();

  // console.log(data);
  console.log(playlists);

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
    <GenericPage>
      <Helmet>
        <title>sonicd - Playlists</title>
      </Helmet>
      <ListView
        data={playlists}
        handleRowClick={handleRowClick}
        tableColumns={tableColumns}
      >
        <Table.Column width={150} align="center" flexGrow={1}>
          <Table.HeaderCell>Actions</Table.HeaderCell>
          <Table.Cell>
            <Icon icon="ellipsis-v" />
          </Table.Cell>
        </Table.Column>
      </ListView>
    </GenericPage>
  );
};

export default PlaylistList;
