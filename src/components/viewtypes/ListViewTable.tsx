/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
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
  StyledTableHeaderCell,
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
import {
  fixPlayer2Index,
  setSort,
  setStar,
  sortPlayQueue,
} from '../../redux/playQueueSlice';
import { StyledIconToggle, StyledRate } from '../shared/styled';
import { addModalPage } from '../../redux/miscSlice';
import {
  setCurrentMouseOverId,
  setIsDragging,
  setSelectedSingle,
} from '../../redux/multiSelectSlice';

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
  isModal,
  // onScroll,
  nowPlaying,
  handleDragEnd,
  dnd,
}: any) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [cachePath] = useState(path.join(getImageCachePath(), '/'));
  const [sortColumn, setSortColumn] = useState<any>();
  const [sortType, setSortType] = useState<any>();
  const [sortedData, setSortedData] = useState(data);
  const [sortedCount, setSortedCount] = useState(0);

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

  const handleSortColumn = (column: any, type: any) => {
    setSortColumn(column);
    setSortType(type);
    dispatch(
      setSort({
        sortColumn: column,
        sortType: type,
      })
    );

    if (column === playQueue.sortColumn) {
      setSortedCount(sortedCount + 1);
    } else {
      setSortedCount(0);
    }

    if (sortedCount >= 1) {
      dispatch(
        setSort({
          sortColumn: undefined,
          sortType: 'asc',
        })
      );
      setSortColumn(undefined);
      setSortType('asc');
      setSortedCount(0);
    }
  };

  useEffect(() => {
    if (!nowPlaying) {
      if (sortColumn && sortType) {
        const actualSortColumn = columns.find((c: any) => c.id === sortColumn);
        const sortColumnDataKey =
          actualSortColumn.dataKey === 'combinedtitle'
            ? 'title'
            : actualSortColumn.dataKey;

        const sortData = _.orderBy(data, sortColumnDataKey, sortType);
        setSortedData(sortData);
      } else {
        setSortedData(data);
      }
    }
  }, [columns, data, nowPlaying, sortColumn, sortType]);

  useEffect(() => {
    if (nowPlaying) {
      if (playQueue.sortColumn && playQueue.sortType) {
        const actualSortColumn = columns.find(
          (c: any) => c.id === playQueue.sortColumn
        );
        const sortColumnDataKey =
          actualSortColumn.dataKey === 'combinedtitle'
            ? 'title'
            : actualSortColumn.dataKey;

        dispatch(
          sortPlayQueue({
            columnDataKey: sortColumnDataKey,
            sortType: playQueue.sortType,
          })
        );
      } else {
        // Clear the sortedEntry[]
        dispatch(
          sortPlayQueue({
            columnDataKey: '',
            sortType: playQueue.sortType,
          })
        );
      }
    }
    if (playQueue.currentPlayer === 1) {
      dispatch(fixPlayer2Index());
    }
  }, [
    columns,
    dispatch,
    nowPlaying,
    playQueue.currentPlayer,
    playQueue.sortColumn,
    playQueue.sortType,
    sortedData,
  ]);

  return (
    <>
      <Table
        ref={tableRef}
        height={height}
        data={playQueue.sortColumn && !nowPlaying ? sortedData : data}
        virtualized={virtualized}
        rowHeight={rowHeight}
        hover
        affixHeader
        autoHeight={autoHeight}
        affixHorizontalScrollbar
        shouldUpdateScroll={false}
        style={{ fontSize: `${fontSize}px` }}
        sortColumn={nowPlaying ? playQueue.sortColumn : sortColumn}
        sortType={nowPlaying ? playQueue.sortType : sortType}
        onSortColumn={handleSortColumn}
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
            sortable
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
            <StyledTableHeaderCell>{column.id}</StyledTableHeaderCell>

            {column.dataKey === 'index' ? (
              <Table.Cell dataKey={column.id}>
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
                          (e: any) => e.uniqueId === rowData.uniqueId
                        )
                          ? 'true'
                          : 'false'
                      }
                      height={rowHeight}
                      onClick={(e: any) => {
                        if (!dnd) {
                          handleRowClick(e, {
                            ...rowData,
                            rowIndex,
                          });
                        }
                      }}
                      onDoubleClick={() => {
                        if (!dnd) {
                          handleRowDoubleClick({
                            ...rowData,
                            rowIndex,
                          });
                        }
                      }}
                      onMouseOver={() => {
                        if (multiSelect.isDragging && dnd) {
                          dispatch(
                            setCurrentMouseOverId({
                              uniqueId: rowData.uniqueId,
                              index: rowIndex,
                            })
                          );
                        }
                      }}
                      onMouseLeave={() => {
                        if (
                          (multiSelect.currentMouseOverId ||
                            multiSelect.isDragging) &&
                          dnd
                        ) {
                          dispatch(
                            setCurrentMouseOverId({
                              uniqueId: undefined,
                              index: undefined,
                            })
                          );
                        }
                      }}
                      onMouseDown={(e: any) => {
                        if (dnd) {
                          if (e.button === 0) {
                            const isSelected = multiSelect.selected.find(
                              (item: any) => item.uniqueId === rowData.uniqueId
                            );

                            // Handle cases where we want to quickly drag/drop single rows
                            if (
                              multiSelect.selected.length <= 1 ||
                              !isSelected
                            ) {
                              dispatch(setSelectedSingle(rowData));
                              dispatch(
                                setCurrentMouseOverId({
                                  uniqueId: rowData.uniqueId,
                                  index: rowIndex,
                                })
                              );
                              dispatch(setIsDragging(true));
                            }

                            // Otherwise use regular multi-drag behavior
                            if (isSelected) {
                              dispatch(
                                setCurrentMouseOverId({
                                  uniqueId: rowData.uniqueId,
                                  index: rowIndex,
                                })
                              );
                              dispatch(setIsDragging(true));
                            }
                          }
                        }
                      }}
                      onMouseUp={() => {
                        if (dnd) {
                          handleDragEnd();
                        }
                      }}
                      dragover={
                        multiSelect.currentMouseOverId === rowData.uniqueId &&
                        multiSelect.isDragging
                          ? 'true'
                          : 'false'
                      }
                      dragfield={dnd ? 'true' : 'false'}
                    >
                      {rowIndex + 1}
                      {rowData['-empty']}
                    </TableCellWrapper>
                  );
                }}
              </Table.Cell>
            ) : column.dataKey === 'combinedtitle' ? (
              <Table.Cell dataKey={column.id}>
                {(rowData: any, rowIndex: any) => {
                  return (
                    <TableCellWrapper
                      rowselected={
                        multiSelect?.selected.find(
                          (e: any) => e.uniqueId === rowData.uniqueId
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
                      onMouseUp={() => dispatch(setIsDragging(false))}
                      dragover={
                        multiSelect.currentMouseOverId === rowData.uniqueId &&
                        multiSelect.isDragging
                          ? 'true'
                          : 'false'
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
                                    if (rowData.artistId && !isModal) {
                                      history.push(
                                        `/library/artist/${rowData.artistId}`
                                      );
                                    } else if (rowData.artistId && isModal) {
                                      dispatch(
                                        addModalPage({
                                          pageType: 'artist',
                                          id: rowData.artistId,
                                        })
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
              <Table.Cell dataKey={column.id}>
                {(rowData: any) => {
                  return (
                    <TableCellWrapper
                      rowselected={
                        multiSelect?.selected.find(
                          (e: any) => e.uniqueId === rowData.uniqueId
                        )
                          ? 'true'
                          : 'false'
                      }
                      height={rowHeight}
                      onMouseUp={() => dispatch(setIsDragging(false))}
                      dragover={
                        multiSelect.currentMouseOverId === rowData.uniqueId &&
                        multiSelect.isDragging
                          ? 'true'
                          : 'false'
                      }
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
              <Table.Cell dataKey={column.id}>
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
                          (e: any) => e.uniqueId === rowData.uniqueId
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
                      onMouseUp={() => dispatch(setIsDragging(false))}
                      dragover={
                        multiSelect.currentMouseOverId === rowData.uniqueId &&
                        multiSelect.isDragging
                          ? 'true'
                          : 'false'
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
                                if (rowData.albumId && !isModal) {
                                  history.push(
                                    `/library/album/${rowData.albumId}`
                                  );
                                } else if (rowData.albumId && isModal) {
                                  dispatch(
                                    addModalPage({
                                      pageType: 'album',
                                      id: rowData.albumId,
                                    })
                                  );
                                }
                              } else if (column.dataKey === 'artist') {
                                if (rowData.artistId && !isModal) {
                                  history.push(
                                    `/library/artist/${rowData.artistId}`
                                  );
                                } else if (rowData.artistId && isModal) {
                                  dispatch(
                                    addModalPage({
                                      pageType: 'artist',
                                      id: rowData.artistId,
                                    })
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
                        ) : column.dataKey === 'bitRate' ? (
                          !rowData[column.dataKey] ? (
                            'N/a'
                          ) : (
                            `${rowData[column.dataKey]} kbps`
                          )
                        ) : rowData[column.dataKey] ? (
                          rowData[column.dataKey]
                        ) : (
                          'N/a'
                        )}
                      </div>
                    </TableCellWrapper>
                  );
                }}
              </Table.Cell>
            )}
          </Table.Column>
        ))}
      </Table>
    </>
  );
};

export default ListViewTable;
