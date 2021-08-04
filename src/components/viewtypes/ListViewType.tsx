import React from 'react';
import { Table } from 'rsuite';
import { nanoid } from '@reduxjs/toolkit';
import '../../styles/ListView.global.css';
import { formatSongDuration } from '../../shared/utils';

const ListViewType = ({
  data,
  handleRowClick,
  handleContextMenu,
  tableColumns,
  children,
  tableHeight,
  autoHeight,
  rowHeight,
  virtualized,
}: any) => {
  const height = document.getElementsByClassName('page__content')[0]
    ?.clientHeight;
  console.log(height);
  return (
    <Table
      data={data}
      height={tableHeight}
      autoHeight={autoHeight}
      onRowClick={handleRowClick}
      virtualized={virtualized}
      rowHeight={rowHeight}
      onRowContextMenu={handleContextMenu}
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
          {column.dataKey === 'index' ? (
            <Table.Cell dataKey={column.dataKey} />
          ) : column.dataKey === 'duration' ? (
            <Table.Cell>
              {(rowData: any) => {
                return <span>{formatSongDuration(rowData.duration)}</span>;
              }}
            </Table.Cell>
          ) : (
            <Table.Cell dataKey={column.dataKey} />
          )}
        </Table.Column>
      ))}
      {children}
    </Table>
  );
};

export default ListViewType;
