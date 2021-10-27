/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';
import { nanoid } from 'nanoid';
import { Table, Grid, Row, Col, Icon } from 'rsuite';
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
  formatDate,
  convertByteToMegabyte,
} from '../../shared/utils';
import cacheImage from '../shared/cacheImage';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fixPlayer2Index, setSort, sortPlayQueue } from '../../redux/playQueueSlice';
import { StyledCheckbox, StyledIconToggle, StyledRate } from '../shared/styled';
import { addModalPage, setContextMenu } from '../../redux/miscSlice';
import {
  clearSelected,
  setCurrentMouseOverId,
  setIsDragging,
  setIsSelectDragging,
  setRangeSelected,
  setSelected,
  setSelectedSingle,
  toggleRangeSelected,
  toggleSelected,
} from '../../redux/multiSelectSlice';
import CustomTooltip from '../shared/CustomTooltip';
import { sortPlaylist } from '../../redux/playlistSlice';
import { setColumnList } from '../../redux/configSlice';
import { setActive } from '../../redux/albumSlice';

const StyledTable = styled(Table)<{ rowHeight: number; $isDragging: boolean }>`
  .rs-table-row.selected {
    background: ${(props) => props.theme.primary.rowSelected};
    // Resolve bug from rsuite-table where certain scrollpoints show a horizontal border
    height: ${(props) => `${props.rowHeight + 1}px !important`};
  }

  .rs-table-row.dragover {
    box-shadow: ${(props) => `inset 0px 5px 0px -3px ${props.theme.primary.main}`};
  }

  .rs-table-row,
  .rs-table-cell-group,
  .rs-table-cell {
    transition: none;
  }

  // Prevent default drag
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

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
  playlist,
  config,
  handleDragEnd,
  miniView,
  dnd,
  disableContextMenu,
  disabledContextMenuOptions,
  handleFavorite,
  handleRating,
}: any) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const misc = useAppSelector((state) => state.misc);
  const configState = useAppSelector((state) => state.config);
  const album = useAppSelector((state) => state.album);
  const [sortColumn, setSortColumn] = useState<any>();
  const [sortType, setSortType] = useState<any>();
  const [sortedData, setSortedData] = useState(data);
  const [sortedCount, setSortedCount] = useState(0);

  useHotkeys(
    'ctrl+a',
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (multiSelect.selected.length === data.length) {
        dispatch(clearSelected());
      } else {
        dispatch(clearSelected());
        dispatch(setSelected(sortColumn && !nowPlaying ? sortedData : data));
      }
    },
    [multiSelect.selected, data]
  );

  const handleSortColumn = (column: any, type: any) => {
    if (!config) {
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
    }
  };

  // Acts as our initial multiSelect handler by toggling the selected row
  // and continuing the selection drag if the mouse button is held down
  const handleSelectMouseDown = (e: any, rowData: any) => {
    // If ctrl or shift is used, we want to ignore this drag selection handler
    // and use the ones provided in handleRowClick
    dispatch(setContextMenu({ show: false }));
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
    dispatch(toggleRangeSelected(sortColumn && !nowPlaying ? sortedData : data));
  }, 200);

  const handleSelectMouseEnter = (rowData: any) => {
    if (multiSelect.isSelectDragging) {
      debouncedMouseEnterFn(rowData);
    }
  };

  useEffect(() => {
    if (!nowPlaying) {
      if (sortColumn && sortType) {
        // Since the column title(id) won't always match the actual column dataKey, we need to match it
        const normalizedSortColumn = columns.find((c: any) => c.id === sortColumn);
        const sortColumnDataKey =
          normalizedSortColumn.dataKey === 'combinedtitle' ? 'title' : normalizedSortColumn.dataKey;

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
        const actualSortColumn = columns.find((c: any) => c.id === playQueue.sortColumn);
        const sortColumnDataKey =
          actualSortColumn.dataKey === 'combinedtitle' ? 'title' : actualSortColumn.dataKey;

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
    } else if (playlist) {
      if (sortColumn && sortType) {
        const actualSortColumn = columns.find((c: any) => c.id === sortColumn);
        const sortColumnDataKey =
          actualSortColumn.dataKey === 'combinedtitle' ? 'title' : actualSortColumn.dataKey;

        dispatch(
          sortPlaylist({
            columnDataKey: sortColumnDataKey,
            sortType,
          })
        );
      } else {
        dispatch(
          sortPlaylist({
            columnDataKey: '',
            sortType,
          })
        );
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
    playlist,
    sortColumn,
    sortType,
  ]);

  return (
    <>
      <StyledTable
        draggable="false"
        rowClassName={(rowData: any) =>
          `${
            multiSelect?.selected.find((e: any) => e?.uniqueId === rowData?.uniqueId)
              ? 'selected'
              : ''
          } ${
            multiSelect?.currentMouseOverId === rowData?.uniqueId &&
            multiSelect?.isDragging &&
            multiSelect.currentMouseOverId
              ? 'dragover'
              : ''
          } ${rowData?.isDir ? 'isdir' : ''}`
        }
        ref={tableRef}
        height={height}
        data={sortColumn && !nowPlaying ? sortedData : data}
        virtualized={virtualized}
        rowHeight={rowHeight}
        hover={misc.highlightOnRowHover}
        cellBordered={false}
        bordered={false}
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

          if (!disableContextMenu) {
            let pageX;
            let pageY;
            // Use ContextMenu width from the component
            if (e.pageX + 190 >= window.innerWidth) {
              pageX = e.pageX - 190;
            } else {
              pageX = e.pageX;
            }

            // Use the calculated ContextMenu height
            // numOfButtons * 30 + props.numOfDividers * 1.5
            const contextMenuHeight = 11 * 30 + 3 * 1.5;
            if (e.pageY + contextMenuHeight >= window.innerHeight) {
              pageY = e.pageY - contextMenuHeight;
            } else {
              pageY = e.pageY;
            }

            if (
              (misc.contextMenu.show === false ||
                misc.contextMenu.details.uniqueId !== rowData.uniqueId) &&
              multiSelect.selected.filter((entry: any) => entry.uniqueId === rowData.uniqueId)
                .length > 0
            ) {
              // Handle when right clicking a selected row
              dispatch(
                setContextMenu({
                  show: true,
                  xPos: pageX,
                  yPos: pageY,
                  type: nowPlaying ? 'nowPlaying' : rowData.type,
                  details: rowData,
                  disabledOptions: disabledContextMenuOptions || [],
                })
              );
            } else {
              // Handle when right clicking a non-selected row
              dispatch(setSelectedSingle(rowData));
              dispatch(
                setContextMenu({
                  show: true,
                  xPos: pageX,
                  yPos: pageY,
                  type: nowPlaying ? 'nowPlaying' : rowData.type,
                  details: rowData,
                  disabledOptions: disabledContextMenuOptions || [],
                })
              );
            }
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
            onResize={(newWidth: any) => {
              const resizedColumnIndex = columns.findIndex(
                (c: any) => c.dataKey === column.dataKey
              );

              if (!miniView) {
                settings.setSync(`${listType}ListColumns[${resizedColumnIndex}].width`, newWidth);
              } else {
                settings.setSync(`miniListColumns[${resizedColumnIndex}].width`, newWidth);
              }

              const newCols = configState.lookAndFeel.listView[listType].columns.map((c: any) => {
                if (c.dataKey === column.dataKey) {
                  const { width, ...rest } = c;
                  return { width: newWidth, ...rest };
                }

                return { ...c };
              });
              dispatch(
                setColumnList({
                  listType,
                  entries: newCols,
                })
              );
            }}
          >
            <StyledTableHeaderCell>{column.id}</StyledTableHeaderCell>

            {column.dataKey === 'index' ? (
              <Table.Cell dataKey={column.id}>
                {(rowData: any, rowIndex: any) => {
                  return (
                    <TableCellWrapper
                      className={
                        multiSelect?.selected.find((e: any) => e.uniqueId === rowData.uniqueId)
                          ? 'custom-cell selected'
                          : 'custom-cell'
                      }
                      playing={
                        (rowData.uniqueId === playQueue?.currentSongUniqueId && nowPlaying) ||
                        (!nowPlaying && rowData.id === playQueue?.currentSongId)
                          ? 'true'
                          : 'false'
                      }
                      height={rowHeight}
                      onClick={(e: any) => {
                        if (!dnd) {
                          handleRowClick(
                            e,
                            {
                              ...rowData,
                              rowIndex,
                            },
                            sortColumn && !nowPlaying ? sortedData : data
                          );
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
                      onMouseEnter={() => handleSelectMouseEnter(rowData)}
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
                        if ((multiSelect.currentMouseOverId || multiSelect.isDragging) && dnd) {
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
                            if (multiSelect.selected.length <= 1 || !isSelected) {
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
                        } else {
                          handleSelectMouseDown(e, rowData);
                        }
                      }}
                      onMouseUp={() => {
                        if (dnd) {
                          handleDragEnd();
                        } else {
                          handleSelectMouseUp();
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
                      {rowData.isDir ? (
                        <Icon size="lg" icon="folder-open" style={{ color: '#FFD662' }} />
                      ) : (
                        rowIndex + 1
                      )}
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
                      onClick={(e: any) =>
                        handleRowClick(
                          e,
                          {
                            ...rowData,
                            rowIndex,
                          },
                          sortColumn && !nowPlaying ? sortedData : data
                        )
                      }
                      onDoubleClick={() =>
                        handleRowDoubleClick({
                          ...rowData,
                          rowIndex,
                        })
                      }
                      onMouseDown={(e: any) => handleSelectMouseDown(e, rowData)}
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
                                  `${misc.imageCachePath}${cacheImages.cacheType}_${
                                    rowData[cacheImages.cacheIdProperty]
                                  }.jpg`
                                )
                                  ? `${misc.imageCachePath}${cacheImages.cacheType}_${
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
                                  (rowData.uniqueId === playQueue?.currentSongUniqueId &&
                                    nowPlaying) ||
                                  (!nowPlaying && rowData.id === playQueue?.currentSongId)
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
                                <CustomTooltip text={rowData.artist}>
                                  <RsuiteLinkButton
                                    subtitle="true"
                                    appearance="link"
                                    onClick={() => {
                                      if (rowData.artistId && !isModal) {
                                        history.push(`/library/artist/${rowData.artistId}`);
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
                                      (rowData.uniqueId === playQueue?.currentSongUniqueId &&
                                        nowPlaying) ||
                                      (!nowPlaying && rowData.id === playQueue?.currentSongId)
                                        ? 'true'
                                        : 'false'
                                    }
                                  >
                                    {rowData.artist}
                                  </RsuiteLinkButton>
                                </CustomTooltip>
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
                      height={rowHeight}
                      onMouseDown={(e: any) => handleSelectMouseDown(e, rowData)}
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
                            `${misc.imageCachePath}${cacheImages.cacheType}_${
                              rowData[cacheImages.cacheIdProperty]
                            }.jpg`
                          )
                            ? `${misc.imageCachePath}${cacheImages.cacheType}_${
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
                        (rowData.uniqueId === playQueue?.currentSongUniqueId && nowPlaying) ||
                        (!nowPlaying && rowData.id === playQueue?.currentSongId)
                          ? 'true'
                          : 'false'
                      }
                      height={rowHeight}
                      onClick={(e: any) => {
                        if (
                          !column.dataKey?.match(
                            /starred|userRating|genre|columnResizable|columnDefaultSort/
                          )
                        ) {
                          handleRowClick(
                            e,
                            {
                              ...rowData,
                              rowIndex,
                            },
                            sortColumn && !nowPlaying ? sortedData : data
                          );
                        }
                      }}
                      onDoubleClick={() => {
                        if (
                          !column.dataKey?.match(
                            /starred|userRating|genre|columnResizable|columnDefaultSort/
                          )
                        ) {
                          handleRowDoubleClick({
                            ...rowData,
                            rowIndex,
                          });
                        }
                      }}
                      onMouseDown={(e: any) => handleSelectMouseDown(e, rowData)}
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
                            /starred|userRating|columnResizable|columnDefaultSort/
                          )
                            ? '10px'
                            : undefined,
                        }}
                      >
                        {column.dataKey.match(/album|artist|genre/) ? (
                          <CustomTooltip text={rowData[column.dataKey]}>
                            <RsuiteLinkButton
                              appearance="link"
                              onClick={() => {
                                if (column.dataKey === 'album') {
                                  if (rowData.albumId && !isModal) {
                                    history.push(`/library/album/${rowData.albumId}`);
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
                                    history.push(`/library/artist/${rowData.artistId}`);
                                  } else if (rowData.artistId && isModal) {
                                    dispatch(
                                      addModalPage({
                                        pageType: 'artist',
                                        id: rowData.artistId,
                                      })
                                    );
                                  }
                                } else if (column.dataKey === 'genre') {
                                  dispatch(setActive({ ...album.active, filter: rowData.genre }));
                                  setTimeout(() => {
                                    history.push(`/library/album?sortType=${rowData.genre}`);
                                  }, 50);
                                }
                              }}
                              playing={
                                (rowData.uniqueId === playQueue?.currentSongUniqueId &&
                                  nowPlaying) ||
                                (!nowPlaying && rowData.id === playQueue?.currentSongId)
                                  ? 'true'
                                  : 'false'
                              }
                              style={{
                                fontSize: `${fontSize}px`,
                              }}
                            >
                              {rowData[column.dataKey]}
                            </RsuiteLinkButton>
                          </CustomTooltip>
                        ) : column.dataKey === 'duration' ? (
                          !formatSongDuration(rowData[column.dataKey]) ? (
                            <span>&#8203;</span>
                          ) : (
                            formatSongDuration(rowData[column.dataKey])
                          )
                        ) : column.dataKey === 'changed' || column.dataKey === 'created' ? (
                          formatDate(rowData[column.dataKey])
                        ) : column.dataKey === 'size' ? (
                          `${convertByteToMegabyte(rowData[column.dataKey])} MB`
                        ) : column.dataKey === 'starred' ? (
                          <>
                            {rowData.isDir ? (
                              <></>
                            ) : (
                              <StyledIconToggle
                                tabIndex={0}
                                icon={rowData?.starred ? 'heart' : 'heart-o'}
                                size="lg"
                                fixedWidth
                                active={rowData?.starred ? 'true' : 'false'}
                                onClick={() => handleFavorite(rowData)}
                              />
                            )}
                          </>
                        ) : column.dataKey === 'userRating' ? (
                          <StyledRate
                            size="xs"
                            readOnly={false}
                            value={rowData.userRating ? rowData.userRating : 0}
                            defaultValue={rowData?.userRating ? rowData.userRating : 0}
                            onChange={(e: any) => handleRating(rowData, e)}
                          />
                        ) : column.dataKey === 'bitRate' ? (
                          !rowData[column.dataKey] ? (
                            <span>&#8203;</span>
                          ) : (
                            `${rowData[column.dataKey]} kbps`
                          )
                        ) : column.dataKey === 'custom' ? (
                          <div>{column.custom}</div>
                        ) : column.dataKey === 'columnResizable' ? (
                          <div>
                            <StyledCheckbox
                              defaultChecked={
                                configState.lookAndFeel.listView[config.option].columns[
                                  configState.lookAndFeel.listView[config.option].columns.findIndex(
                                    (col: any) => col.dataKey === rowData.dataKey
                                  )
                                ]?.resizable === true
                              }
                              checked={
                                configState.lookAndFeel.listView[config.option].columns[
                                  configState.lookAndFeel.listView[config.option].columns.findIndex(
                                    (col: any) => col.dataKey === rowData.dataKey
                                  )
                                ]?.resizable === true
                              }
                              onChange={(_v: any, e: any) => {
                                const cols = configState.lookAndFeel.listView[
                                  config.option
                                ].columns.map((col: any) => {
                                  if (rowData.dataKey === col.dataKey) {
                                    if (e === true) {
                                      const { flexGrow, ...newCols } = col;
                                      return { ...newCols, resizable: e };
                                    }
                                    const columnPickerMatch = config.columnList.findIndex(
                                      (picker: any) => picker.value.dataKey === rowData.dataKey
                                    );
                                    const matchedFlexGrowValue =
                                      config.columnList[columnPickerMatch]?.value.flexGrow || 1;

                                    const { width, rowIndex: r, ...newCols } = col;

                                    return {
                                      ...newCols,
                                      flexGrow: matchedFlexGrowValue,
                                      resizable: e,
                                    };
                                  }

                                  return { ...col };
                                });

                                dispatch(setColumnList({ listType: config.option, entries: cols }));
                              }}
                            />
                          </div>
                        ) : rowData[column.dataKey] ? (
                          rowData[column.dataKey]
                        ) : (
                          <span>&#8203;</span>
                        )}
                      </div>
                    </TableCellWrapper>
                  );
                }}
              </Table.Cell>
            )}
          </Table.Column>
        ))}
      </StyledTable>
    </>
  );
};

export default ListViewTable;
