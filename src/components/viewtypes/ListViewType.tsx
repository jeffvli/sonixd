// Resize derived from @nimrod-cohen https://gitter.im/rsuite/rsuite?at=5e1cd3f165540a529a0f5deb
import React, { useState, useEffect, useRef } from 'react';
import { Table, DOMHelper } from 'rsuite';
import { nanoid } from '@reduxjs/toolkit';
import '../../styles/ListView.global.css';
import { formatSongDuration } from '../../shared/utils';
import Loader from '../loader/Loader';

declare global {
  interface Window {
    resizeInterval: any;
  }
}

const ListViewType = ({
  data,
  handleRowClick,
  handleContextMenu,
  tableColumns,
  rowHeight,
  virtualized,
  currentIndex,
  children,
}: any) => {
  const [height, setHeight] = useState(0);
  const [show, setShow] = useState(false);
  const { getHeight } = DOMHelper;
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleResize() {
      setShow(false);
      window.clearTimeout(window.resizeInterval);
      window.resizeInterval = window.setTimeout(() => {
        setShow(true);
      }, 500);

      setHeight(wrapperRef.current ? getHeight(wrapperRef.current) : 200);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [getHeight]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      setHeight(wrapperRef.current ? getHeight(wrapperRef.current) : 200);
      setShow(true);
    });
  }, [getHeight]);

  return (
    <>
      {!show && <Loader text="Resizing..." />}
      <div
        className="table__container"
        style={{ flexGrow: 1 }}
        ref={wrapperRef}
      >
        {show && (
          <Table
            height={height}
            data={data}
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
                        <span
                          className={rowIndex === currentIndex ? 'playing' : ''}
                        >
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
                        <span
                          className={rowIndex === currentIndex ? 'playing' : ''}
                        >
                          {formatSongDuration(rowData.duration)}
                        </span>
                      );
                    }}
                  </Table.Cell>
                ) : (
                  <Table.Cell>
                    {(rowData: any, rowIndex: any) => {
                      return (
                        <span
                          className={rowIndex === currentIndex ? 'playing' : ''}
                        >
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
        )}
      </div>
    </>
  );
};

export default ListViewType;
