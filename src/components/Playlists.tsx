import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Table, Checkbox } from 'rsuite';
import { getPlaylists } from '../api/api';

const CheckCell = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => (
  <Table.Cell {...props} style={{ padding: 0 }}>
    <div style={{ lineHeight: '46px' }}>
      <Checkbox
        value={rowData[dataKey]}
        inline
        onChange={onChange}
        checked={checkedKeys.some((item) => item === rowData[dataKey])}
      />
    </div>
  </Table.Cell>
);

const Playlists = () => {
  const { isLoading, isError, data: playlists, error }: any = useQuery(
    'playlists',
    getPlaylists
  );
  const [checkedKeys, setCheckedKeys] = useState([]);

  const handleRowClick = (e) => {
    console.log(e);
  };

  // console.log(data);
  console.log(playlists);

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <Table
      data={playlists}
      height={420}
      autoHeight
      bordered
      cellBordered
      onRowClick={handleRowClick}
    >
      <Table.Column width={70} align="center" resizable>
        <Table.HeaderCell>Id</Table.HeaderCell>
        <Table.Cell dataKey="id" />
      </Table.Column>
      <Table.Column width={150} align="left" resizable>
        <Table.HeaderCell>Name</Table.HeaderCell>
        <Table.Cell dataKey="name" />
      </Table.Column>
      <Table.Column width={150} align="left" resizable>
        <Table.HeaderCell>Description</Table.HeaderCell>
        <Table.Cell dataKey="comment" />
      </Table.Column>
    </Table>
  );
};

export default Playlists;
