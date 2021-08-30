/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// Resize derived from @nimrod-cohen https://gitter.im/rsuite/rsuite?at=5e1cd3f165540a529a0f5deb
import React, { useState, useEffect, useRef } from 'react';
import { Table, DOMHelper, Grid, Col, Row } from 'rsuite';
import path from 'path';
import settings from 'electron-settings';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { nanoid } from '@reduxjs/toolkit';
import '../../styles/ListView.global.css';
import {
  formatSongDuration,
  getImageCachePath,
  isCached,
} from '../../shared/utils';
import { useAppSelector } from '../../redux/hooks';
import DraggableHeaderCell from '../table/DraggableHeaderCell';
import Loader from '../loader/Loader';
import SelectionBar from '../selectionbar/SelectionBar';
import cacheImage from '../shared/cacheImage';

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
  fontSize,
  cacheImages,
  children,
  ...rest
}: any) => {
  // const [isDragging, setIsDragging] = useState(false);
  // const [dragDirection, setDragDirection] = useState('down');
  // const [dragSpeed, setDragSpeed] = useState('medium');

  const [height, setHeight] = useState(0);
  const [show, setShow] = useState(false);
  const [columns, setColumns] = useState(tableColumns);

  const { getHeight } = DOMHelper;
  const tableRef = useRef<any>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const multiSelect = useAppSelector((state: any) => state.multiSelect);
  const playQueue = useAppSelector((state: any) => state.playQueue);

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

  /* useEffect(() => {
    let scrollDistance = 0;
    switch (dragSpeed) {
      case 'slow':
        scrollDistance = 15;
        break;
      case 'medium':
        scrollDistance = 30;
        break;
      case 'fast':
        scrollDistance = 60;
        break;
      default:
        scrollDistance = 15;
        break;
    }

    if (isDragging) {
      const interval = setInterval(() => {
        const currentScroll = Math.abs(tableRef?.current.scrollY);
        tableRef.current.scrollTop(
          dragDirection === 'down'
            ? currentScroll + scrollDistance
            : dragDirection === 'up' && currentScroll - scrollDistance > 0
            ? currentScroll - scrollDistance
            : 0
        );
      }, 50);

      return () => clearInterval(interval);
    }
    return () => clearInterval();
  }, [dragDirection, dragSpeed, isDragging]); */

  return (
    <>
      {!show && <Loader />}
      {multiSelect.selected.length >= 1 && (
        <SelectionBar
          handleUpClick={rest.handleUpClick}
          handleDownClick={rest.handleDownClick}
          handleManualClick={rest.handleManualClick}
        />
      )}

      {/* <Button onClick={() => tableRef.current.scrollTop(16000)}>Scroll</Button> */}
      {/* <Button onClick={() => console.log(tableRef.current)}>Info</Button> */}
      {/* <div
        style={{ position: 'absolute', left: '50%', top: '200px', zIndex: 1 }}
      >
        <div>Direction: {dragDirection}</div>
        <div>IsDragging: {isDragging ? 'true' : 'false'}</div>
        <div>DragSpeed: {dragSpeed}</div>
      </div> */}

      <div
        className="table__container"
        style={{ flexGrow: 1 }}
        ref={wrapperRef}
      >
        {/* <div
          id="scroll-top"
          style={{
            position: 'absolute',
            background: 'blue',
            height: '15%',
            width: '100%',
            top: 0,
            left: 0,
            right: 0,
            zIndex: isDragging ? 1 : undefined,
          }}
          onMouseEnter={() => {
            console.log('panning down');
            setIsDragging(true);
            setDragDirection('up');
          }}
          onMouseLeave={() => {
            console.log('stopped panning down');
            setIsDragging(false);
            setDragDirection('none');
          }}
        >
          <div
            id="scroll-top-fast"
            style={{ height: 'calc(100% / 3)', background: 'green' }}
            onMouseEnter={() => {
              setDragSpeed('fast');
            }}
          />
          <div
            id="scroll-top-medium"
            style={{ height: 'calc(100% / 3)', background: 'blue' }}
            onMouseEnter={() => {
              setDragSpeed('medium');
            }}
          />
          <div
            id="scroll-top-slow"
            style={{ height: 'calc(100% / 3)', background: 'red' }}
            onMouseEnter={() => {
              setDragSpeed('slow');
            }}
          />
        </div>
        <div
          id="scroll-bottom"
          style={{
            position: 'absolute',
            background: 'red',
            height: '15%',
            width: '100%',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: isDragging ? 1 : undefined,
          }}
          onMouseEnter={() => {
            console.log('panning down');
            setIsDragging(true);
            setDragDirection('down');
          }}
          onMouseLeave={() => {
            console.log('stopped panning down');
            setIsDragging(false);
            setDragDirection('none');
          }}
        >
          <div
            id="scroll-bottom-slow"
            style={{ height: 'calc(100% / 3)', background: 'red' }}
            onMouseEnter={() => {
              setDragSpeed('slow');
            }}
          />
          <div
            id="scroll-bottom-medium"
            style={{ height: 'calc(100% / 3)', background: 'blue' }}
            onMouseEnter={() => {
              setDragSpeed('medium');
            }}
          />
          <div
            id="scroll-bottom-fast"
            style={{ height: 'calc(100% / 3)', background: 'green' }}
            onMouseEnter={() => {
              setDragSpeed('fast');
            }}
          />
        </div> */}

        {show && (
          <Table
            ref={tableRef}
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
            style={{ fontSize: `${fontSize}px` }}
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
                onResize={(width: any) => {
                  const resizedColumn: any = settings.getSync(
                    'songListColumns'
                  );

                  const resizedColumnIndex = resizedColumn.findIndex(
                    (c: any) => c.dataKey === column.dataKey
                  );

                  settings.setSync(
                    `songListColumns[${resizedColumnIndex}].width`,
                    width
                  );

                  console.log(`resize ${column.id}`, width, resizedColumnIndex);
                }}
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
                          onClick={(e: any) =>
                            handleRowClick(e, {
                              ...rowData,
                              rowIndex,
                            })
                          }
                          onDoubleClick={() =>
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
                              ? {
                                  background: '#4D5156',
                                  lineHeight: `${rowHeight}px`,
                                }
                              : { lineHeight: `${rowHeight}px` }
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
                    {(rowData: any, rowIndex: any) => {
                      return (
                        <div
                          onClick={(e: any) =>
                            handleRowClick(e, {
                              ...rowData,
                              rowIndex,
                            })
                          }
                          onDoubleClick={() =>
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
                              ? {
                                  background: '#4D5156',
                                  lineHeight: `${rowHeight}px`,
                                }
                              : { lineHeight: `${rowHeight}px` }
                          }
                        >
                          <div
                            style={{
                              width: '100%',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                            }}
                          >
                            {formatSongDuration(rowData.duration)}
                          </div>
                        </div>
                      );
                    }}
                  </Table.Cell>
                ) : column.dataKey === 'combinedtitle' ? (
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
                          onDoubleClick={() =>
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
                              ? {
                                  background: '#4D5156',
                                }
                              : {}
                          }
                        >
                          <Grid fluid>
                            <Row
                              style={{
                                height: `${rowHeight}px`,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <Col
                                style={{
                                  paddingRight: '5px',
                                  width: `${rowHeight}px`,
                                }}
                              >
                                <LazyLoadImage
                                  src={
                                    isCached(
                                      path.join(
                                        getImageCachePath(),
                                        `${cacheImages.cacheType}_${rowData.albumId}.jpg`
                                      )
                                    )
                                      ? path.join(
                                          getImageCachePath(),
                                          `${cacheImages.cacheType}_${rowData.albumId}.jpg`
                                        )
                                      : rowData.image
                                  }
                                  alt="track-img"
                                  effect="opacity"
                                  width={rowHeight - 10}
                                  height={rowHeight - 10}
                                  visibleByDefault={cacheImages.enabled}
                                  afterLoad={() => {
                                    if (cacheImages.enabled) {
                                      cacheImage(
                                        `${cacheImages.cacheType}_${rowData.albumId}.jpg`,
                                        rowData.image.replace(
                                          /size=\d+/,
                                          'size=350'
                                        )
                                      );
                                    }
                                  }}
                                />
                              </Col>
                              <Col
                                style={{
                                  width: '100%',
                                  overflow: 'hidden',
                                  paddingLeft: '10px',
                                  paddingRight: '20px',
                                }}
                              >
                                <Row
                                  style={{
                                    height: `${rowHeight / 2}px`,
                                    overflow: 'hidden',
                                    position: 'relative',
                                  }}
                                >
                                  <span
                                    style={{
                                      position: 'absolute',
                                      bottom: 0,
                                      width: '100%',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {rowData.title}
                                  </span>
                                </Row>
                                <Row
                                  style={{
                                    height: `${rowHeight / 2}px`,
                                    fontSize: 'smaller',
                                    overflow: 'hidden',
                                    position: 'relative',
                                  }}
                                >
                                  <span
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      width: '100%',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {rowData.artist}
                                  </span>
                                </Row>
                              </Col>
                            </Row>
                          </Grid>
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
                          onDoubleClick={() =>
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
                              ? {
                                  background: '#4D5156',
                                  lineHeight: `${rowHeight}px`,
                                }
                              : {
                                  lineHeight: `${rowHeight}px`,
                                }
                          }
                        >
                          <div
                            style={{
                              width: '100%',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                            }}
                          >
                            {rowData[column.dataKey]}{' '}
                            {column.dataKey === 'bitRate' ? ' kbps' : ''}
                          </div>
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
