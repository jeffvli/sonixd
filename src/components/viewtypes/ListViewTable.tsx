/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import path from 'path';
import settings from 'electron-settings';
import { useQueryClient } from 'react-query';
import { nanoid } from 'nanoid';
import { Table, Grid, Row, Col } from 'rsuite';
import { useHistory } from 'react-router';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import {
  CombinedTitleTextWrapper,
  RsuiteLinkButton,
  TableCellWrapper,
} from './styled';
import {
  formatSongDuration,
  isCached,
  getImageCachePath,
  formatDate,
} from '../../shared/utils';
import cacheImage from '../shared/cacheImage';
import { setRating, star, unstar } from '../../api/api';
import { useAppDispatch } from '../../redux/hooks';
import { setStar } from '../../redux/playQueueSlice';
import { StyledIconToggle, StyledRate } from '../shared/styled';

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
  listType,
  // onScroll,
  nowPlaying,
}: any) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [cachePath] = useState(path.join(getImageCachePath(), '/'));

  const handleFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await star(rowData.id, listType);
      dispatch(setStar({ id: rowData.id, type: 'star' }));
    } else {
      await unstar(rowData.id, listType);
      dispatch(setStar({ id: rowData.id, type: 'unstar' }));
    }
    await queryClient.refetchQueries(['starred'], {
      active: true,
    });
    await queryClient.refetchQueries(['album'], {
      active: true,
    });
    await queryClient.refetchQueries(['albumList'], {
      active: true,
    });
    await queryClient.refetchQueries(['playlist'], {
      active: true,
    });
  };

  const handleRating = (rowData: any, e: number) => {
    setRating(rowData.id, e);
  };

  return (
    <Table
      ref={tableRef}
      height={height}
      data={data}
      virtualized={virtualized}
      rowHeight={rowHeight}
      hover
      affixHeader
      autoHeight={autoHeight}
      affixHorizontalScrollbar
      shouldUpdateScroll={false}
      style={{ fontSize: `${fontSize}px` }}
      // onScroll={onScroll}
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
            const resizedColumnIndex = columns.findIndex(
              (c: any) => c.dataKey === column.dataKey
            );

            settings.setSync(
              `${listType}ListColumns[${resizedColumnIndex}].width`,
              width
            );
          }}
        >
          <Table.HeaderCell>{column.id}</Table.HeaderCell>

          {column.dataKey === 'index' ? (
            <Table.Cell>
              {(rowData: any, rowIndex: any) => {
                return (
                  <TableCellWrapper
                    playing={
                      (rowData.id === playQueue?.currentSongId &&
                        playQueue.currentIndex === rowIndex &&
                        nowPlaying) ||
                      (!nowPlaying && rowData.id === playQueue?.currentSongId)
                        ? 'true'
                        : 'false'
                    }
                    rowselected={
                      multiSelect?.selected.find(
                        (e: any) => e.id === rowData.id
                      )
                        ? 'true'
                        : 'false'
                    }
                    height={rowHeight}
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
                  >
                    {rowIndex + 1}
                    {rowData['-empty']}
                  </TableCellWrapper>
                );
              }}
            </Table.Cell>
          ) : column.dataKey === 'combinedtitle' ? (
            <Table.Cell>
              {(rowData: any, rowIndex: any) => {
                return (
                  <TableCellWrapper
                    rowselected={
                      multiSelect?.selected.find(
                        (e: any) => e.id === rowData.id
                      )
                        ? 'true'
                        : 'false'
                    }
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
                                `${cachePath}${cacheImages.cacheType}_${
                                  rowData[cacheImages.cacheIdProperty]
                                }.jpg`
                              )
                                ? `${cachePath}${cacheImages.cacheType}_${
                                    rowData[cacheImages.cacheIdProperty]
                                  }.jpg`
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
                                  `${cacheImages.cacheType}_${
                                    rowData[cacheImages.cacheIdProperty]
                                  }.jpg`,
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
                            <CombinedTitleTextWrapper
                              playing={
                                (rowData.id === playQueue?.currentSongId &&
                                  playQueue.currentIndex === rowIndex &&
                                  nowPlaying) ||
                                (!nowPlaying &&
                                  rowData.id === playQueue?.currentSongId)
                                  ? 'true'
                                  : 'false'
                              }
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
                            </CombinedTitleTextWrapper>
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
                                onClick={() => {
                                  if (rowData.artistId) {
                                    history.push(
                                      `/library/artist/${rowData.artistId}`
                                    );
                                  }
                                }}
                                style={{
                                  fontSize: `${fontSize}px`,
                                }}
                                playing={
                                  (rowData.id === playQueue?.currentSongId &&
                                    playQueue.currentIndex === rowIndex &&
                                    nowPlaying) ||
                                  (!nowPlaying &&
                                    rowData.id === playQueue?.currentSongId)
                                    ? 'true'
                                    : 'false'
                                }
                              >
                                {rowData.artist}
                              </RsuiteLinkButton>
                            </span>
                          </Row>
                        </Col>
                      </Row>
                    </Grid>
                  </TableCellWrapper>
                );
              }}
            </Table.Cell>
          ) : column.dataKey === 'coverart' ? (
            <Table.Cell>
              {(rowData: any) => {
                return (
                  <TableCellWrapper
                    rowselected={
                      multiSelect?.selected.find(
                        (e: any) => e.id === rowData.id
                      )
                        ? 'true'
                        : 'false'
                    }
                    height={rowHeight}
                  >
                    <LazyLoadImage
                      src={
                        isCached(
                          `${cachePath}${cacheImages.cacheType}_${
                            rowData[cacheImages.cacheIdProperty]
                          }.jpg`
                        )
                          ? `${cachePath}${cacheImages.cacheType}_${
                              rowData[cacheImages.cacheIdProperty]
                            }.jpg`
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
                            `${cacheImages.cacheType}_${
                              rowData[cacheImages.cacheIdProperty]
                            }.jpg`,
                            rowData.image.replace(/size=\d+/, 'size=350')
                          );
                        }
                      }}
                    />
                  </TableCellWrapper>
                );
              }}
            </Table.Cell>
          ) : (
            <Table.Cell>
              {(rowData: any, rowIndex: any) => {
                return (
                  <TableCellWrapper
                    playing={
                      (rowData.id === playQueue?.currentSongId &&
                        playQueue.currentIndex === rowIndex &&
                        nowPlaying) ||
                      (!nowPlaying && rowData.id === playQueue?.currentSongId)
                        ? 'true'
                        : 'false'
                    }
                    rowselected={
                      multiSelect?.selected.find(
                        (e: any) => e.id === rowData.id
                      )
                        ? 'true'
                        : 'false'
                    }
                    height={rowHeight}
                    onClick={(e: any) => {
                      if (
                        !column.dataKey?.match(
                          /starred|songCount|duration|userRating/
                        )
                      ) {
                        handleRowClick(e, {
                          ...rowData,
                          rowIndex,
                        });
                      }
                    }}
                    onDoubleClick={() => {
                      if (
                        !column.dataKey?.match(
                          /starred|songCount|duration|userRating/
                        )
                      ) {
                        handleRowDoubleClick({
                          ...rowData,
                          rowIndex,
                        });
                      }
                    }}
                    className={
                      (rowData.id === playQueue?.currentSongId &&
                        (column.dataKey === 'title' ||
                          column.dataKey === 'name') &&
                        playQueue.currentIndex === rowIndex &&
                        nowPlaying) ||
                      (!nowPlaying &&
                        rowData.id === playQueue?.currentSongId &&
                        (column.dataKey === 'title' ||
                          column.dataKey === 'name'))
                        ? 'active'
                        : ''
                    }
                  >
                    <div
                      style={{
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        paddingRight: !column.dataKey?.match(
                          /starred|songCount|duration|userRating/
                        )
                          ? '10px'
                          : undefined,
                      }}
                    >
                      {column.dataKey.match(/album|artist/) ? (
                        <RsuiteLinkButton
                          appearance="link"
                          onClick={() => {
                            if (column.dataKey === 'album') {
                              if (rowData.albumId) {
                                history.push(
                                  `/library/album/${rowData.albumId}`
                                );
                              }
                            } else if (column.dataKey === 'artist') {
                              if (rowData.artistId) {
                                history.push(
                                  `/library/artist/${rowData.artistId}`
                                );
                              }
                            }
                          }}
                          playing={
                            (rowData.id === playQueue?.currentSongId &&
                              playQueue.currentIndex === rowIndex &&
                              nowPlaying) ||
                            (!nowPlaying &&
                              rowData.id === playQueue?.currentSongId)
                              ? 'true'
                              : 'false'
                          }
                          style={{
                            fontSize: `${fontSize}px`,
                          }}
                        >
                          {rowData[column.dataKey]}
                        </RsuiteLinkButton>
                      ) : column.dataKey === 'duration' ? (
                        formatSongDuration(rowData[column.dataKey])
                      ) : column.dataKey === 'changed' ||
                        column.dataKey === 'created' ? (
                        formatDate(rowData[column.dataKey])
                      ) : column.dataKey === 'starred' ? (
                        <StyledIconToggle
                          tabIndex={0}
                          icon={rowData?.starred ? 'heart' : 'heart-o'}
                          size="lg"
                          fixedWidth
                          active={rowData?.starred ? 'true' : 'false'}
                          onClick={() => handleFavorite(rowData)}
                        />
                      ) : column.dataKey === 'userRating' ? (
                        <StyledRate
                          size="xs"
                          readOnly={false}
                          defaultValue={
                            rowData?.userRating ? rowData.userRating : 0
                          }
                          onChange={(e: any) => handleRating(rowData, e)}
                        />
                      ) : (
                        rowData[column.dataKey]
                      )}

                      {column.dataKey === 'bitRate' && rowData[column.dataKey]
                        ? ' kbps'
                        : ''}
                    </div>
                  </TableCellWrapper>
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
