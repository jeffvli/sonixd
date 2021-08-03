import React from 'react';
import { Table } from 'rsuite';
import { nanoid } from '@reduxjs/toolkit';
import '../../styles/ListView.global.css';

const ListView = ({ data, handleRowClick, tableColumns, children }: any) => {
  return (
    <Table
      data={data}
      height={420}
      autoHeight
      onRowClick={handleRowClick}
      affixHeader
      affixHorizontalScrollbar
    >
      {tableColumns.map((column: any) => (
        <Table.Column
          key={nanoid()}
          align={column.alignment}
          flexGrow={column.flexGrow}
          resizable={column.resizable}
          width={column.width}
          fixed={column.fixed}
        >
          <Table.HeaderCell>{column.header}</Table.HeaderCell>
          <Table.Cell dataKey={column.dataKey} />
        </Table.Column>
      ))}
      {children}
    </Table>
  );
};

export default ListView;
