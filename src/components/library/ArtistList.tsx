import React from 'react';
import { useHistory } from 'react-router';
import ListViewType from '../viewtypes/ListViewType';

const tableColumns = [
  {
    id: '#',
    dataKey: 'index',
    alignment: 'center',
    width: 70,
  },
  {
    id: 'Name',
    dataKey: 'name',
    alignment: 'left',
    width: 250,
    resizable: false,
  },
  {
    id: 'Albums',
    dataKey: 'albumCount',
    alignment: 'center',
    width: 70,
    resizable: false,
  },
];

const ArtistList = ({ data }: any) => {
  const history = useHistory();
  const handleRowClick = (_e: any, rowData: any) => {
    history.push(`artist/${rowData.id}`);
  };

  return (
    <>
      {data && (
        <ListViewType
          data={data}
          handleRowClick={handleRowClick}
          tableColumns={tableColumns}
          virtualized
        />
      )}
    </>
  );
};

export default ArtistList;
