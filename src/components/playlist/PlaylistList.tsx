import React from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { getPlaylists } from '../../api/api';
import ListViewType from '../viewtypes/ListViewType';
import Loader from '../loader/Loader';
import GenericPage from '../layout/GenericPage';

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
    <GenericPage header={<h1>Playlists</h1>}>
      <ListViewType
        data={playlists}
        handleRowClick={handleRowClick}
        tableColumns={tableColumns}
        virtualized={false}
        autoHeight
      >
        {/* <Table.Column width={150} align="center" flexGrow={1}>
          <Table.HeaderCell>Actions</Table.HeaderCell>
          <Table.Cell>
            <Icon icon="ellipsis-v" />
          </Table.Cell>
        </Table.Column> */}
      </ListViewType>
    </GenericPage>
  );
};

export default PlaylistList;
