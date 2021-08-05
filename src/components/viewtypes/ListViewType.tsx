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
  currentIndex,
}: any) => {
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
            <Table.Cell>
              {(rowData: any, rowIndex: any) => {
                return (
                  <span className={rowIndex === currentIndex ? 'playing' : ''}>
                    {rowIndex + 1}
                    {rowData['-empty']}
                  </span>
                );
              }}
            </Table.Cell>
          ) : column.dataKey === 'duration' ? (
            <Table.Cell>
              {(rowData: any, rowIndex: any) => {
                return (
                  <span className={rowIndex === currentIndex ? 'playing' : ''}>
                    {formatSongDuration(rowData.duration)}
                  </span>
                );
              }}
            </Table.Cell>
          ) : (
            <Table.Cell>
              {(rowData: any, rowIndex: any) => {
                return (
                  <span className={rowIndex === currentIndex ? 'playing' : ''}>
                    {rowData[column.dataKey]}
                  </span>
                );
              }}
            </Table.Cell>
          )}
        </Table.Column>
      ))}
      {children}
    </Table>
  );
};

export default ListViewType;
