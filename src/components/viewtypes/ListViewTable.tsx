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
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fixPlayer2Index,
  setSort,
  setStar,
  sortPlayQueue,
} from '../../redux/playQueueSlice';
import { StyledIconToggle, StyledRate } from '../shared/styled';
import { addModalPage, setContextMenu } from '../../redux/miscSlice';
import {
  clearSelected,
  setCurrentMouseOverId,
  setIsDragging,
  setIsSelectDragging,
  setRangeSelected,
  setSelectedSingle,
  toggleRangeSelected,
  toggleSelected,
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
  miniView,
  dnd,
  disabledContextMenuOptions,
}: any) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const misc = useAppSelector((state) => state.misc);
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
    if (nowPlaying) {
      dispatch(
        setSort({
          sortColumn: column,
          sortType: type,
        })
      );
    }

    if (column === (nowPlaying ? playQueue.sortColumn : sortColumn)) {
      setSortedCount(sortedCount + 1);

      if (sortedCount >= 1) {
        if (nowPlaying) {
          dispatch(
            setSort({
              sortColumn: undefined,
              sortType: 'asc',
            })
          );
        }

        setSortColumn(undefined);
        setSortType('asc');
        setSortedCount(0);
      }
    } else {
      setSortedCount(0);
    }
  };

  // Acts as our initial multiSelect handler by toggling the selected row
  // and continuing the selection drag if the mouse button is held down
  const handleSelectMouseDown = (e: any, rowData: any) => {
    // If ctrl or shift is used, we want to ignore this drag selection handler
    // and use the ones provided in handleRowClick
    if (e.button === 0 && !e.ctrlKey && !e.shiftKey) {
      if (
        multiSelect.selected.length === 1 &&
        multiSelect.selected[0].uniqueId === rowData.uniqueId
      ) {
        // Toggle single entry if the same entry is clicked
        dispatch(clearSelected());
      } else {
        if (multiSelect.selected.length > 0) {
          dispatch(clearSelected());
        }
        dispatch(setIsSelectDragging(true));
        dispatch(toggleSelected(rowData));
      }
    }
  };

  // Completes the multiSelect handler once the mouse button is lifted
  const handleSelectMouseUp = () => {
    dispatch(setIsDragging(false));
    dispatch(setIsSelectDragging(false));
  };

  // If mouse is still held down from the handleSelectMouseDown function, then
  // mousing over a row will set the range selection from the initial mousedown location
  // to the mouse-entered row
  const debouncedMouseEnterFn = _.debounce((rowData: any) => {
    dispatch(setRangeSelected(rowData));
    dispatch(
      toggleRangeSelected(sortColumn && !nowPlaying ? sortedData : data)
    );
  }, 100);

  const handleSelectMouseEnter = (rowData: any) => {
    if (multiSelect.isSelectDragging) {
      debouncedMouseEnterFn(rowData);
    }
  };

  useEffect(() => {
    if (!nowPlaying) {
      if (sortColumn && sortType) {
        // Since the column title(id) won't always match the actual column dataKey, we need to match it
        const normalizedSortColumn = columns.find(
          (c: any) => c.id === sortColumn
        );
        const sortColumnDataKey =
          normalizedSortColumn.dataKey === 'combinedtitle'
            ? 'title'
            : normalizedSortColumn.dataKey;

        const sortData = _.orderBy(
          data,
          [
            (entry: any) =>
              typeof entry[sortColumnDataKey] === 'string'
                ? entry[sortColumnDataKey].toLowerCase()
                : entry[sortColumnDataKey],
          ],
          sortType
        );
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
      if (playQueue.currentPlayer === 1 && !playQueue.isFading) {
        dispatch(fixPlayer2Index());
      }
    }
  }, [
    columns,
    dispatch,
    nowPlaying,
    playQueue.currentPlayer,
    playQueue.isFading,
    playQueue.sortColumn,
    playQueue.sortType,
    sortedData,
  ]);

  return (
    <>
      <Table
        ref={tableRef}
        height={height}
        data={sortColumn && !nowPlaying ? sortedData : data}
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
        onRowContextMenu={(rowData: any, e: any) => {
          e.preventDefault();
          if (
            (misc.contextMenu.show === false ||
              misc.contextMenu.rowId !== rowData.uniqueId) &&
            multiSelect.selected.filter(
              (entry: any) => entry.uniqueId === rowData.uniqueId
            ).length > 0
          ) {
            dispatch(
              setContextMenu({
                show: true,
                xPos: e.pageX,
                yPos: e.pageY,
                rowId: rowData.uniqueId,
                type: nowPlaying ? 'nowPlaying' : 'other',
                disabledOptions: disabledContextMenuOptions || [],
              })
            );
          } else {
            dispatch(
              setContextMenu({
                show: false,
              })
            );
          }
        }}
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

              if (!miniView) {
                settings.setSync(
                  `${listType}ListColumns[${resizedColumnIndex}].width`,
                  width
                );
              } else {
                settings.setSync(
                  `miniListColumns[${resizedColumnIndex}].width`,
                  width
                );
              }
            }}
          >
            <StyledTableHeaderCell>{column.id}</StyledTableHeaderCell>

            {column.dataKey === 'index' ? (
              <Table.Cell dataKey={column.id}>
                {(rowData: any, rowIndex: any) => {
                  return (
                    <TableCellWrapper
                      playing={
                        (rowData.uniqueId === playQueue?.currentSongUniqueId &&
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
                      onMouseDown={(e: any) =>
                        handleSelectMouseDown(e, rowData)
                      }
                      onMouseEnter={() => handleSelectMouseEnter(rowData)}
                      onMouseUp={() => handleSelectMouseUp()}
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
                                      'size=500'
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
                                  (rowData.uniqueId ===
                                    playQueue?.currentSongUniqueId &&
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
                                    (rowData.uniqueId ===
                                      playQueue?.currentSongUniqueId &&
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
                      onMouseDown={(e: any) =>
                        handleSelectMouseDown(e, rowData)
                      }
                      onMouseEnter={() => handleSelectMouseEnter(rowData)}
                      onMouseUp={() => handleSelectMouseUp()}
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
                              rowData.image.replace(/size=\d+/, 'size=500')
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
                        (rowData.uniqueId === playQueue?.currentSongUniqueId &&
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
                      onMouseDown={(e: any) =>
                        handleSelectMouseDown(e, rowData)
                      }
                      onMouseEnter={() => handleSelectMouseEnter(rowData)}
                      onMouseUp={() => handleSelectMouseUp()}
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
                              (rowData.uniqueId ===
                                playQueue?.currentSongUniqueId &&
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
                            size="sm"
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
