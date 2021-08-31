/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import path from 'path';
import settings from 'electron-settings';
import { nanoid } from 'nanoid';
import { Table, Grid, Row, Col } from 'rsuite';
import { useHistory } from 'react-router';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { RsuiteLinkButton } from './styled';
import {
  formatSongDuration,
  isCached,
  getImageCachePath,
} from '../../shared/utils';
import cacheImage from '../shared/cacheImage';

const ListViewTable = ({
  tableRef,
  height,
  data,
  virtualized,
  rowHeight,
  fontSize,
  columns,
  handleRowClick,
  handleRowDoubleClick,
  playQueue,
  multiSelect,
  cacheImages,
  autoHeight,
}: any) => {
  const history = useHistory();
  return (
    <Table
      ref={tableRef}
      height={height}
      data={data}
      virtualized={virtualized}
      rowHeight={rowHeight}
      hover={false}
      affixHeader
      autoHeight={autoHeight}
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
            const resizedColumn: any = settings.getSync('songListColumns');

            const resizedColumnIndex = resizedColumn.findIndex(
              (c: any) => c.dataKey === column.dataKey
            );

            settings.setSync(
              `songListColumns[${resizedColumnIndex}].width`,
              width
            );
          }}
        >
          <Table.HeaderCell>{column.id}</Table.HeaderCell>

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
                      rowData.id === playQueue?.currentSongId ? 'active' : ''
                    }
                    style={
                      multiSelect?.selected.find(
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
                      rowData.id === playQueue?.currentSongId ? 'active' : ''
                    }
                    style={
                      multiSelect?.selected.find(
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
                                  rowData.image.replace(/size=\d+/, 'size=350')
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
                              {rowData.title || rowData.name}
                            </span>
                          </Row>
                          <Row
                            style={{
                              height: `${rowHeight / 2}px`,
                              fontSize: 'smaller',
                              overflow: 'hidden',
                              position: 'relative',
                              width: '100%',
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                top: 0,
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                width: '100%',
                              }}
                            >
                              <RsuiteLinkButton
                                subtitle="true"
                                appearance="link"
                                className={
                                  rowData.id === playQueue?.currentSongId
                                    ? 'active'
                                    : ''
                                }
                                onClick={() => {
                                  history.push(
                                    `/library/artist/${rowData.artistId}`
                                  );
                                }}
                                style={{
                                  fontSize: `${fontSize}px`,
                                }}
                              >
                                {rowData.artist}
                              </RsuiteLinkButton>
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
                      rowData.id === playQueue?.currentSongId ? 'active' : ''
                    }
                    style={
                      multiSelect?.selected.find(
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
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                      }}
                    >
                      {column.dataKey === 'album' ||
                      column.dataKey === 'artist' ? (
                        <RsuiteLinkButton
                          appearance="link"
                          className={
                            rowData.id === playQueue?.currentSongId
                              ? 'active'
                              : ''
                          }
                          onClick={() => {
                            if (column.dataKey === 'album') {
                              history.push(`/library/album/${rowData.albumId}`);
                            } else if (column.dataKey === 'artist') {
                              history.push(
                                `/library/artist/${rowData.artistId}`
                              );
                            }
                          }}
                          style={{
                            fontSize: `${fontSize}px`,
                          }}
                        >
                          {rowData[column.dataKey]}
                        </RsuiteLinkButton>
                      ) : column.dataKey === 'duration' ? (
                        formatSongDuration(rowData.duration)
                      ) : (
                        rowData[column.dataKey]
                      )}

                      {column.dataKey === 'bitRate' && rowData[column.dataKey]
                        ? ' kbps'
                        : ''}
                    </div>
                  </div>
                );
              }}
            </Table.Cell>
          )}
        </Table.Column>
      ))}
    </Table>
  );
};

export default ListViewTable;
