/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// Resize derived from @nimrod-cohen https://gitter.im/rsuite/rsuite?at=5e1cd3f165540a529a0f5deb
import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  DOMHelper,
  FlexboxGrid,
  Button,
  Icon,
  Tag,
  ButtonToolbar,
  IconButton,
} from 'rsuite';
import { nanoid } from '@reduxjs/toolkit';
import '../../styles/ListView.global.css';
import { formatSongDuration } from '../../shared/utils';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearSelected } from '../../redux/multiSelectSlice';
import DraggableHeaderCell from '../table/DraggableHeaderCell';
import Loader from '../loader/Loader';

declare global {
  interface Window {
    resizeInterval: any;
  }
}

const sort = (source: any, sourceId: any, targetId: any) => {
  const nextData = source.filter((item: any) => item.id !== sourceId);
  const dragItem = source.find((item: any) => item.id === sourceId);
  const index = nextData.findIndex((item: any) => item.id === targetId);

  nextData.splice(index + 1, 0, dragItem);
  return nextData;
};

const ListViewType = ({
  data,
  handleRowClick,
  handleRowDoubleClick,
  tableColumns,
  hasDraggableColumns,
  rowHeight,
  virtualized,
  children,
}: any) => {
  const [height, setHeight] = useState(0);
  const [show, setShow] = useState(false);
  const [columns, setColumns] = useState(tableColumns);

  const { getHeight } = DOMHelper;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const multiSelect = useAppSelector((state: any) => state.multiSelect);
  const playQueue = useAppSelector((state: any) => state.playQueue);
  const dispatch = useAppDispatch();

  const handleDragColumn = (sourceId: any, targetId: any) => {
    setColumns(sort(columns, sourceId, targetId));
  };

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
      {!show && <Loader />}
      {multiSelect.selected.length >= 1 && (
        <div
          style={{
            backgroundColor: '#000000',
            padding: '5px',
            border: '1px solid #169de0',
            borderRadius: '0px',
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            width: '600px',
            boxShadow: '0 0 20px #000',
          }}
        >
          <FlexboxGrid justify="space-between">
            <FlexboxGrid.Item colspan={4} style={{ textAlign: 'left' }}>
              <Tag style={{ color: '#CACBD0', background: 'transparent' }}>
                {multiSelect.selected.length} selected
              </Tag>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={4} style={{ textAlign: 'center' }}>
              <ButtonToolbar>
                <IconButton size="md" icon={<Icon icon="file-text" />} />
                <IconButton size="md" icon={<Icon icon="save" />} />
              </ButtonToolbar>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={4} style={{ textAlign: 'right' }}>
              <Button
                appearance="subtle"
                size="xs"
                onClick={() => dispatch(clearSelected())}
              >
                Deselect All
              </Button>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </div>
      )}
      <div
        className="table__container"
        style={{ flexGrow: 1 }}
        ref={wrapperRef}
      >
        {show && (
          <Table
            height={height}
            data={data}
            virtualized={virtualized}
            rowHeight={rowHeight}
            onRowContextMenu={(e) => {
              console.log(e);
            }}
            affixHeader
            affixHorizontalScrollbar
            shouldUpdateScroll={false}
          >
            {columns.map((column: any) => (
              <Table.Column
                key={nanoid()}
                align={column.alignment}
                flexGrow={column.flexGrow}
                resizable={column.resizable}
                width={column.width}
                fixed={column.fixed}
                verticalAlign="middle"
              >
                {hasDraggableColumns ? (
                  <DraggableHeaderCell onDrag={handleDragColumn} id={column.id}>
                    {column.id}
                  </DraggableHeaderCell>
                ) : (
                  <Table.HeaderCell>{column.id}</Table.HeaderCell>
                )}

                {column.dataKey === 'index' ? (
                  <Table.Cell>
                    {(rowData: any, rowIndex: any) => {
                      return (
                        <div
                          className={
                            rowData.id === playQueue.currentSongId
                              ? 'active'
                              : ''
                          }
                          style={
                            multiSelect.selected.find(
                              (e: any) => e.id === rowData.id
                            )
                              ? { background: '#4D5156', lineHeight: '46px' }
                              : { lineHeight: '46px' }
                          }
                        >
                          {rowIndex + 1}
                          {rowData['-empty']}
                        </div>
                      );
                    }}
                  </Table.Cell>
                ) : column.dataKey === 'duration' ? (
                  <Table.Cell>
                    {(rowData: any) => {
                      return (
                        <div
                          className={
                            rowData.id === playQueue.currentSongId
                              ? 'active'
                              : ''
                          }
                          style={
                            multiSelect.selected.find(
                              (e: any) => e.id === rowData.id
                            )
                              ? { background: '#4D5156', lineHeight: '46px' }
                              : { lineHeight: '46px' }
                          }
                        >
                          {formatSongDuration(rowData.duration)}
                        </div>
                      );
                    }}
                  </Table.Cell>
                ) : (
                  <Table.Cell>
                    {(rowData: any, rowIndex: any) => {
                      return (
                        <div
                          onClick={(e: any) =>
                            handleRowClick(e, {
                              ...rowData,
                              rowIndex,
                            })
                          }
                          onDoubleClick={(e: any) =>
                            handleRowDoubleClick({
                              ...rowData,
                              rowIndex,
                            })
                          }
                          className={
                            rowData.id === playQueue.currentSongId
                              ? 'active'
                              : ''
                          }
                          style={
                            multiSelect.selected.find(
                              (e: any) => e.id === rowData.id
                            )
                              ? { background: '#4D5156', lineHeight: '46px' }
                              : { lineHeight: '46px' }
                          }
                        >
                          {rowData[column.dataKey]}
                        </div>
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
