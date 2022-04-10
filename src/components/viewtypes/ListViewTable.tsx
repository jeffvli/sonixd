/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';
import { nanoid } from 'nanoid';
import { Table, Grid, Row, Col, Icon } from 'rsuite';
import { useHistory } from 'react-router';
import useLongPress from 'react-use/lib/useLongPress';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import {
  CombinedTitleContainer,
  CombinedTitleTextWrapper,
  TableLinkButton,
  StyledTableHeaderCell,
  TableCellWrapper,
} from './styled';
import {
  formatSongDuration,
  isCached,
  formatDate,
  convertByteToMegabyte,
  sliceRangeByUniqueId,
} from '../../shared/utils';
import cacheImage from '../shared/cacheImage';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fixPlayer2Index,
  setPlayerIndex,
  setSort,
  sortPlayQueue,
} from '../../redux/playQueueSlice';
import {
  SecondaryTextWrapper,
  StyledCheckbox,
  StyledIconButton,
  StyledIconToggle,
  StyledRate,
} from '../shared/styled';
import { addModalPage, setContextMenu } from '../../redux/miscSlice';
import {
  clearSelected,
  setCurrentMouseOverId,
  setIsDragging,
  setIsSelectDragging,
  setSelected,
  setSelectedSingle,
  toggleSelectedSingle,
} from '../../redux/multiSelectSlice';
import CustomTooltip from '../shared/CustomTooltip';
import { sortPlaylist } from '../../redux/playlistSlice';
import {
  removePlaybackFilter,
  setColumnList,
  setPageSort,
  setPlaybackFilter,
} from '../../redux/configSlice';
import { setStatus } from '../../redux/playerSlice';
import { GenericItem, Item } from '../../types';
import { CoverArtWrapper } from '../layout/styled';
import Paginator from '../shared/Paginator';
import { setFilter, setPagination } from '../../redux/viewSlice';
import CoverArtCell from './TableCells/CoverArtCell';
import TextCell from './TableCells/TextCell';
import LinkCell from './TableCells/LinkCell';
import CustomCell from './TableCells/CustomCell';

const StyledTable = styled(Table)<{ rowHeight: number; $isDragging: boolean }>`
  .rs-table-row.selected {
    background: ${(props) => props.theme.colors.table.selectedRow} !important;
    // Resolve bug from rsuite-table where certain scrollpoints show a horizontal border
    height: ${(props) => `${props.rowHeight + 1}px !important`};
  }

  .col-default-hide {
    display: none;
  }

  .rs-table-row {
    &:hover {
      .col-default-hide {
        display: block !important;
      }

      .col-default-show {
        display: none;
      }
    }
  }

  .rs-table-row.dragover {
    box-shadow: ${(props) => `inset 0px 5px 0px -3px ${props.theme.colors.primary}`};
  }

  .rs-table-row.playing {
    color: ${(props) => props.theme.colors.primary} !important;

    span {
      color: ${(props) => props.theme.colors.primary} !important;
    }

    .rs-btn {
      color: ${(props) => props.theme.colors.primary};
    }
  }

  .rs-table-cell {
    background: transparent;
  }

  .rs-table-row,
  .rs-table-cell-group,
  .rs-table-cell {
    transition: none;
  }

  .rs-table-loader-wrapper {
    background-color: transparent;
  }

  .rs-table-loader-text {
    display: none;
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
  cacheImages,
  autoHeight,
  page,
  listType,
  isModal,
  nowPlaying,
  playlist,
  config,
  handleDragEnd,
  miniView,
  dnd,
  disableRowClick,
  disableContextMenu,
  disabledContextMenuOptions,
  handleFavorite,
  handleRating,
  onScroll,
  loading,
  paginationProps,
  affixHeader,
}: any) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const misc = useAppSelector((state) => state.misc);
  const configState = useAppSelector((state) => state.config);
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
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
      } else if (page) {
        dispatch(
          setPageSort({
            page,
            sort: {
              sortColumn: column,
              sortType: type,
            },
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
          } else if (page) {
            dispatch(
              setPageSort({
                page,
                sort: {
                  sortColumn: undefined,
                  sortType: 'asc',
                },
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

  const handleSelectMouseDown = useCallback(
    (e: any, rowData: any) => {
      if (!disableRowClick) {
        dispatch(setContextMenu({ show: false }));
        // If ctrl or shift is used, we want to ignore this drag selection handler and use the ones
        // provided in handleRowClick
        if (e.button === 0 && !e.ctrlKey && !e.shiftKey) {
          dispatch(toggleSelectedSingle(rowData));
        }
      }
    },
    [disableRowClick, dispatch]
  );

  const handleSelectMouseUp = useCallback(() => {
    dispatch(setIsDragging(false));
    dispatch(setIsSelectDragging(false));
    document.body.style.cursor = 'default';
  }, [dispatch]);

  const handleStartSelectDrag = useLongPress(
    ({ e, rowData }: any) => {
      // Only allow left click
      if (e.button === 0) {
        dispatch(setSelectedSingle(rowData));
        dispatch(setIsSelectDragging(true));
        document.body.style.cursor = 'crosshair';
      }
    },
    { isPreventDefault: true, delay: 150 }
  );

  const handleContinueSelectDrag = useMemo(
    () =>
      _.debounce((rowData: any) => {
        if (multiSelect.isSelectDragging) {
          dispatch(
            setSelected(
              sliceRangeByUniqueId(
                sortColumn && !nowPlaying ? sortedData : data,
                multiSelect.lastSelected.uniqueId,
                rowData.uniqueId
              )
            )
          );
        }
      }, 200),
    [
      data,
      dispatch,
      multiSelect.isSelectDragging,
      multiSelect.lastSelected.uniqueId,
      nowPlaying,
      sortColumn,
      sortedData,
    ]
  );

  useEffect(() => {
    if (!nowPlaying) {
      if (page === 'favoritePage') {
        setSortColumn(configState.sort[page.split('.')[0]][page.split('.')[1]]?.sortColumn);
        setSortType(configState.sort[page.split('.')[0]][page.split('.')[1]]?.sortType);
      } else if (page) {
        setSortColumn(configState.sort[page]?.sortColumn);
        setSortType(configState.sort[page]?.sortType);
      }

      if (sortColumn && sortType) {
        // Since the column title(id) won't always match the actual column dataKey, we need to match it
        const actualSortColumn = columns.find((c: any) => c.id === sortColumn);
        if (actualSortColumn) {
          const sortColumnDataKey =
            actualSortColumn.dataKey === 'combinedtitle'
              ? 'title'
              : actualSortColumn.dataKey === 'artist'
              ? 'albumArtist'
              : actualSortColumn.dataKey === 'genre'
              ? 'albumGenre'
              : actualSortColumn.dataKey;

          const sortData = _.orderBy(
            data,
            [
              (entry: any) => {
                return typeof entry[sortColumnDataKey] === 'string'
                  ? entry[sortColumnDataKey].toLowerCase() || ''
                  : +entry[sortColumnDataKey] || '';
              },
            ],
            sortType
          );
          setSortedData(sortData);
        } else {
          setSortedData(data);
        }
      }
    }
  }, [columns, configState.sort, data, nowPlaying, page, sortColumn, sortType]);

  useEffect(() => {
    if (nowPlaying) {
      if (playQueue.sortColumn && playQueue.sortType) {
        const actualSortColumn = columns.find((c: any) => c.id === playQueue.sortColumn);
        if (actualSortColumn) {
          const sortColumnDataKey =
            actualSortColumn?.dataKey === 'combinedtitle'
              ? 'title'
              : actualSortColumn?.dataKey === 'artist'
              ? 'albumArtist'
              : actualSortColumn?.dataKey === 'genre'
              ? 'albumGenre'
              : actualSortColumn?.dataKey;

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
    } else if (playlist) {
      if (sortColumn && sortType) {
        const actualSortColumn = columns.find((c: any) => c.id === sortColumn);
        const sortColumnDataKey =
          actualSortColumn.dataKey === 'combinedtitle'
            ? 'title'
            : actualSortColumn.dataKey === 'artist'
            ? 'albumArtist'
            : actualSortColumn.dataKey === 'genre'
            ? 'albumGenre'
            : actualSortColumn.dataKey;

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
          } ${rowData?.isDir ? 'isdir' : ''} ${
            (nowPlaying &&
              rowData?.uniqueId === playQueue.current?.uniqueId &&
              playQueue?.current) ||
            (!nowPlaying && rowData?.id === playQueue?.currentSongId && playQueue?.currentSongId)
              ? 'playing'
              : ''
          }`
        }
        loading={loading}
        ref={tableRef}
        height={height}
        data={sortColumn && !nowPlaying ? sortedData : data}
        virtualized={virtualized}
        rowHeight={rowHeight}
        hover={multiSelect.isDragging ? false : misc.highlightOnRowHover}
        cellBordered={false}
        bordered={false}
        affixHeader={affixHeader || true}
        autoHeight={autoHeight}
        affixHorizontalScrollbar
        shouldUpdateScroll={false}
        style={{ fontSize: `${fontSize}px` }}
        sortColumn={nowPlaying ? playQueue.sortColumn : sortColumn}
        sortType={nowPlaying ? playQueue.sortType : sortType}
        onSortColumn={handleSortColumn}
        onScroll={(_e: any, offset: number) => {
          if (onScroll) {
            onScroll(offset);
          }
        }}
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
            const contextMenuHeight = 12 * 30 + 3 * 1.5;
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

              const newCols = configState.lookAndFeel.listView[
                miniView ? 'mini' : listType
              ].columns.map((c: any) => {
                if (c.dataKey === column.dataKey) {
                  const { width, ...props } = c;
                  return { width: newWidth, ...props };
                }

                return { ...c };
              });
              dispatch(
                setColumnList({
                  listType: miniView ? 'mini' : listType,
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
                      style={{
                        cursor: multiSelect.isDragging ? 'grabbing' : dnd ? 'grab' : undefined,
                      }}
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
                            tableData: sortColumn && !nowPlaying ? sortedData : data,
                          });
                        }
                      }}
                      onMouseEnter={() => handleContinueSelectDrag(rowData)}
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
                          document.body.style.cursor = 'grabbing';

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
                          handleStartSelectDrag.onMouseDown({ e, rowData });
                          handleSelectMouseDown(e, rowData);
                        }
                      }}
                      onMouseUp={() => {
                        if (dnd) {
                          document.body.style.cursor = 'default';
                          handleDragEnd(sortColumn && !nowPlaying ? sortedData : data);

                          if (nowPlaying && playQueue.currentPlayer === 1) {
                            dispatch(fixPlayer2Index());
                          }
                        } else {
                          handleSelectMouseUp();
                          handleStartSelectDrag.onMouseUp();
                        }
                      }}
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
                    <CombinedTitleContainer
                      height={rowHeight}
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
                          tableData: sortColumn && !nowPlaying ? sortedData : data,
                        })
                      }
                      onMouseDown={(e: any) => {
                        handleStartSelectDrag.onMouseDown({ e, rowData });
                        handleSelectMouseDown(e, rowData);
                      }}
                      onMouseEnter={() => handleContinueSelectDrag(rowData)}
                      onMouseUp={() => {
                        handleSelectMouseUp();
                        handleStartSelectDrag.onMouseUp();
                      }}
                    >
                      <Grid fluid>
                        <Row className="row-main">
                          <Col className="col-cover">
                            <CoverArtWrapper size={rowHeight - 10}>
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
                                visibleByDefault
                                afterLoad={() => {
                                  if (cacheImages.enabled) {
                                    cacheImage(
                                      `${cacheImages.cacheType}_${
                                        rowData[cacheImages.cacheIdProperty]
                                      }.jpg`,
                                      rowData.image.replaceAll(/=150/gi, '=350')
                                    );
                                  }
                                }}
                              />
                            </CoverArtWrapper>
                          </Col>
                          <Col className="col-text">
                            <Row className="row-sub-text">
                              <CombinedTitleTextWrapper
                                tabIndex={0}
                                onKeyDown={(e: any) => {
                                  if (e.key === ' ' || e.key === 'Enter') {
                                    e.preventDefault();
                                    if (nowPlaying) {
                                      dispatch(clearSelected());
                                      dispatch(setPlayerIndex(rowData));
                                      dispatch(fixPlayer2Index());
                                      dispatch(setStatus('PLAYING'));
                                    }
                                  }
                                }}
                              >
                                {rowData.title || rowData.name}
                              </CombinedTitleTextWrapper>
                            </Row>
                            <Row className="row-sub-secondarytext">
                              {rowData.artist?.map((artist: GenericItem, i: number) => (
                                <SecondaryTextWrapper
                                  subtitle="true"
                                  key={`${rowData.uniqueId}-${artist.id}`}
                                  style={{
                                    fontFamily: configState.lookAndFeel.font,
                                    fontSize: `${fontSize}px`,
                                  }}
                                >
                                  {i > 0 && ', '}
                                  <CustomTooltip text={artist.title}>
                                    <TableLinkButton
                                      font={`${fontSize}px`}
                                      subtitle="true"
                                      onClick={(e: any) => {
                                        if (!e.ctrlKey && !e.shiftKey) {
                                          if (artist.id && !isModal) {
                                            history.push(`/library/artist/${artist.id}`);
                                          } else if (artist.id && isModal) {
                                            dispatch(
                                              addModalPage({
                                                pageType: 'artist',
                                                id: artist.id,
                                              })
                                            );
                                          }
                                        }
                                      }}
                                    >
                                      {artist.title}
                                    </TableLinkButton>
                                  </CustomTooltip>
                                </SecondaryTextWrapper>
                              ))}
                            </Row>
                          </Col>
                        </Row>
                      </Grid>
                    </CombinedTitleContainer>
                  );
                }}
              </Table.Cell>
            ) : (
              <Table.Cell dataKey={column.id}>
                {(rowData: any, rowIndex: any) => {
                  // Playback filter columns -------------------------------------------------------
                  if (column.dataKey === 'filter') {
                    return <div style={{ userSelect: 'text' }}>{rowData.filter}</div>;
                  }

                  if (column.dataKey === 'filterDelete') {
                    return (
                      <>
                        <StyledIconButton
                          appearance="subtle"
                          icon={<Icon icon="trash2" />}
                          onClick={() => {
                            dispatch(removePlaybackFilter({ filterName: rowData.filter }));
                          }}
                        />
                      </>
                    );
                  }

                  if (column.dataKey === 'filterEnabled') {
                    return (
                      <>
                        <StyledCheckbox
                          defaultChecked={
                            configState.playback.filters.find(
                              (f: any) => f.filter === rowData.filter
                            )?.enabled === true
                          }
                          checked={
                            configState.playback.filters.find(
                              (f: any) => f.filter === rowData.filter
                            )?.enabled === true
                          }
                          onChange={(_v: any, e: boolean) => {
                            dispatch(
                              setPlaybackFilter({
                                filterName: rowData.filter,
                                newFilter: {
                                  ...configState.playback.filters.find(
                                    (f: any) => f.filter === rowData.filter
                                  ),
                                  enabled: e,
                                },
                              })
                            );
                          }}
                        />
                      </>
                    );
                  }
                  // -------------------------------------------------------------------------------

                  // List-view column selector columns
                  if (column.dataKey === 'columnResizable') {
                    return (
                      <>
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
                      </>
                    );
                  }
                  // -------------------------------------------------------------------------------

                  // Misc --------------------------------------------------------------------------
                  if (column.dataKey === 'custom') {
                    <div>{column.custom}</div>;
                  }
                  // -------------------------------------------------------------------------------

                  // List-view columns -------------------------------------------------------------
                  if (column.dataKey === 'coverart') {
                    return (
                      <CoverArtCell
                        rowData={rowData}
                        rowIndex={rowIndex}
                        column={column}
                        misc={misc}
                        rowHeight={rowHeight}
                        cacheImages={cacheImages}
                        handleRowClick={(e: any) => {
                          handleRowClick(
                            e,
                            {
                              ...rowData,
                              rowIndex,
                            },
                            sortColumn && !nowPlaying ? sortedData : data
                          );
                        }}
                        handleRowDoubleClick={() => {
                          handleRowDoubleClick({
                            ...rowData,
                            rowIndex,
                          });
                        }}
                        onMouseDown={(e: any) => {
                          handleStartSelectDrag.onMouseDown({ e, rowData });
                          handleSelectMouseDown(e, rowData);
                        }}
                        onMouseEnter={() => handleContinueSelectDrag(rowData)}
                        onMouseUp={() => {
                          handleSelectMouseUp();
                          handleStartSelectDrag.onMouseUp();
                        }}
                      />
                    );
                  }

                  if (column.dataKey === 'album') {
                    return (
                      <LinkCell
                        linkProp="album"
                        onClickLink={(e: any) => {
                          if (!e.ctrlKey && !e.shiftKey) {
                            if (rowData.albumId && !isModal) {
                              history.push(`/library/album/${rowData.albumId}`);
                            } else if (rowData[0]?.id && isModal) {
                              dispatch(
                                addModalPage({
                                  pageType: 'album',
                                  id: rowData[0]?.id,
                                })
                              );
                            }
                          }
                        }}
                        rowData={rowData}
                        column={column}
                        misc={misc}
                        rowHeight={rowHeight}
                        cacheImages={cacheImages}
                        handleRowClick={(e: any) => {
                          handleRowClick(
                            e,
                            {
                              ...rowData,
                              rowIndex,
                            },
                            sortColumn && !nowPlaying ? sortedData : data
                          );
                        }}
                        handleRowDoubleClick={() => {
                          handleRowDoubleClick({
                            ...rowData,
                            rowIndex,
                          });
                        }}
                        onMouseDown={(e: any) => {
                          handleStartSelectDrag.onMouseDown({ e, rowData });
                          handleSelectMouseDown(e, rowData);
                        }}
                        onMouseEnter={() => handleContinueSelectDrag(rowData)}
                        onMouseUp={() => {
                          handleSelectMouseUp();
                          handleStartSelectDrag.onMouseUp();
                        }}
                        fontSize={fontSize}
                      />
                    );
                  }

                  if (column.dataKey === 'artist') {
                    return (
                      <LinkCell
                        linkProp="albumArtist"
                        onClickLink={(e: any) => {
                          if (!e.ctrlKey && !e.shiftKey) {
                            if (rowData.albumArtistId && !isModal) {
                              history.push(`/library/artist/${rowData.albumArtistId}`);
                            } else if (rowData[0]?.id && isModal) {
                              dispatch(
                                addModalPage({
                                  pageType: 'artist',
                                  id: rowData[0]?.id,
                                })
                              );
                            }
                          }
                        }}
                        rowData={rowData}
                        column={column}
                        misc={misc}
                        rowHeight={rowHeight}
                        cacheImages={cacheImages}
                        handleRowClick={handleRowClick}
                        handleRowDoubleClick={() => {
                          handleRowDoubleClick({
                            ...rowData,
                            rowIndex,
                          });
                        }}
                        onMouseDown={(e: any) => {
                          handleStartSelectDrag.onMouseDown({ e, rowData });
                          handleSelectMouseDown(e, rowData);
                        }}
                        onMouseEnter={() => handleContinueSelectDrag(rowData)}
                        onMouseUp={() => {
                          handleSelectMouseUp();
                          handleStartSelectDrag.onMouseUp();
                        }}
                        fontSize={fontSize}
                      />
                    );
                  }

                  if (column.dataKey === 'bitRate') {
                    return (
                      <CustomCell
                        rowData={rowData}
                        rowIndex={rowIndex}
                        column={column}
                        rowHeight={rowHeight}
                        handleRowClick={(e: any) => {
                          handleRowClick(
                            e,
                            {
                              ...rowData,
                              rowIndex,
                            },
                            sortColumn && !nowPlaying ? sortedData : data
                          );
                        }}
                        handleRowDoubleClick={() => {
                          handleRowDoubleClick({
                            ...rowData,
                            rowIndex,
                          });
                        }}
                        onMouseDown={(e: any) => {
                          handleStartSelectDrag.onMouseDown({ e, rowData });
                          handleSelectMouseDown(e, rowData);
                        }}
                        onMouseEnter={() => handleContinueSelectDrag(rowData)}
                        onMouseUp={() => {
                          handleSelectMouseUp();
                          handleStartSelectDrag.onMouseUp();
                        }}
                      >
                        {rowData[column.dataKey]} kbps
                      </CustomCell>
                    );
                  }

                  if (column.dataKey === 'changed' || column.dataKey === 'created') {
                    return (
                      <CustomCell
                        rowData={rowData}
                        rowIndex={rowIndex}
                        column={column}
                        rowHeight={rowHeight}
                        handleRowClick={(e: any) => {
                          handleRowClick(
                            e,
                            {
                              ...rowData,
                              rowIndex,
                            },
                            sortColumn && !nowPlaying ? sortedData : data
                          );
                        }}
                        handleRowDoubleClick={() => {
                          handleRowDoubleClick({
                            ...rowData,
                            rowIndex,
                          });
                        }}
                        onMouseDown={(e: any) => {
                          handleStartSelectDrag.onMouseDown({ e, rowData });
                          handleSelectMouseDown(e, rowData);
                        }}
                        onMouseEnter={() => handleContinueSelectDrag(rowData)}
                        onMouseUp={() => {
                          handleSelectMouseUp();
                          handleStartSelectDrag.onMouseUp();
                        }}
                      >
                        {formatDate(rowData[column.dataKey])}
                      </CustomCell>
                    );
                  }

                  if (column.dataKey === 'duration') {
                    return (
                      <CustomCell
                        rowData={rowData}
                        rowIndex={rowIndex}
                        column={column}
                        rowHeight={rowHeight}
                        handleRowClick={(e: any) => {
                          handleRowClick(
                            e,
                            {
                              ...rowData,
                              rowIndex,
                            },
                            sortColumn && !nowPlaying ? sortedData : data
                          );
                        }}
                        handleRowDoubleClick={() => {
                          handleRowDoubleClick({
                            ...rowData,
                            rowIndex,
                          });
                        }}
                        onMouseDown={(e: any) => {
                          handleStartSelectDrag.onMouseDown({ e, rowData });
                          handleSelectMouseDown(e, rowData);
                        }}
                        onMouseEnter={() => handleContinueSelectDrag(rowData)}
                        onMouseUp={() => {
                          handleSelectMouseUp();
                          handleStartSelectDrag.onMouseUp();
                        }}
                      >
                        {formatSongDuration(rowData.duration)}
                      </CustomCell>
                    );
                  }

                  if (column.dataKey === 'genre') {
                    return (
                      <LinkCell
                        linkProp="genre"
                        onClickLink={(e: any, index: number) => {
                          if (!e.ctrlKey && !e.shiftKey) {
                            dispatch(
                              setFilter({
                                listType: Item.Album,
                                data: rowData.genre[index].title,
                              })
                            );
                            dispatch(
                              setPagination({
                                listType: Item.Album,
                                data: { activePage: 1 },
                              })
                            );

                            localStorage.setItem('scroll_list_albumList', '0');
                            localStorage.setItem('scroll_grid_albumList', '0');
                            setTimeout(() => {
                              history.push(`/library/album?sortType=${rowData.genre[index].title}`);
                            }, 50);
                          }
                        }}
                        rowData={rowData}
                        column={column}
                        misc={misc}
                        rowHeight={rowHeight}
                        cacheImages={cacheImages}
                        handleRowClick={(e: any) => {
                          handleRowClick(
                            e,
                            {
                              ...rowData,
                              rowIndex,
                            },
                            sortColumn && !nowPlaying ? sortedData : data
                          );
                        }}
                        handleRowDoubleClick={() => {
                          handleRowDoubleClick({
                            ...rowData,
                            rowIndex,
                          });
                        }}
                        onMouseDown={(e: any) => {
                          handleStartSelectDrag.onMouseDown({ e, rowData });
                          handleSelectMouseDown(e, rowData);
                        }}
                        onMouseEnter={() => handleContinueSelectDrag(rowData)}
                        onMouseUp={() => {
                          handleSelectMouseUp();
                          handleStartSelectDrag.onMouseUp();
                        }}
                        fontSize={fontSize}
                      />
                    );
                  }

                  if (column.dataKey === 'size') {
                    return (
                      <CustomCell
                        rowData={rowData}
                        rowIndex={rowIndex}
                        column={column}
                        rowHeight={rowHeight}
                        handleRowClick={(e: any) => {
                          handleRowClick(
                            e,
                            {
                              ...rowData,
                              rowIndex,
                            },
                            sortColumn && !nowPlaying ? sortedData : data
                          );
                        }}
                        handleRowDoubleClick={() => {
                          handleRowDoubleClick({
                            ...rowData,
                            rowIndex,
                          });
                        }}
                        onMouseDown={(e: any) => {
                          handleStartSelectDrag.onMouseDown({ e, rowData });
                          handleSelectMouseDown(e, rowData);
                        }}
                        onMouseEnter={() => handleContinueSelectDrag(rowData)}
                        onMouseUp={() => {
                          handleSelectMouseUp();
                          handleStartSelectDrag.onMouseUp();
                        }}
                      >
                        {convertByteToMegabyte(rowData[column.dataKey])} MB
                      </CustomCell>
                    );
                  }

                  if (column.dataKey === 'starred') {
                    return (
                      <CustomCell
                        rowData={rowData}
                        rowIndex={rowIndex}
                        column={column}
                        rowHeight={rowHeight}
                        handleRowClick={(e: any) => {
                          handleRowClick(
                            e,
                            {
                              ...rowData,
                              rowIndex,
                            },
                            sortColumn && !nowPlaying ? sortedData : data
                          );
                        }}
                        handleRowDoubleClick={() => {
                          handleRowDoubleClick({
                            ...rowData,
                            rowIndex,
                          });
                        }}
                        onMouseDown={(e: any) => {
                          handleStartSelectDrag.onMouseDown({ e, rowData });
                          handleSelectMouseDown(e, rowData);
                        }}
                        onMouseEnter={() => handleContinueSelectDrag(rowData)}
                        onMouseUp={() => {
                          handleSelectMouseUp();
                          handleStartSelectDrag.onMouseUp();
                        }}
                      >
                        {rowData.isDir ? (
                          <span>&#8203;</span>
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
                      </CustomCell>
                    );
                  }

                  if (column.dataKey === 'userRating') {
                    return (
                      <CustomCell
                        rowData={rowData}
                        rowIndex={rowIndex}
                        column={column}
                        rowHeight={rowHeight}
                        handleRowClick={(e: any) => {
                          handleRowClick(
                            e,
                            {
                              ...rowData,
                              rowIndex,
                            },
                            sortColumn && !nowPlaying ? sortedData : data
                          );
                        }}
                        handleRowDoubleClick={() => {
                          handleRowDoubleClick({
                            ...rowData,
                            rowIndex,
                          });
                        }}
                        onMouseDown={(e: any) => {
                          handleStartSelectDrag.onMouseDown({ e, rowData });
                          handleSelectMouseDown(e, rowData);
                        }}
                        onMouseEnter={() => handleContinueSelectDrag(rowData)}
                        onMouseUp={() => {
                          handleSelectMouseUp();
                          handleStartSelectDrag.onMouseUp();
                        }}
                      >
                        <StyledRate
                          size="xs"
                          readOnly={false}
                          value={rowData.userRating ? rowData.userRating : 0}
                          defaultValue={rowData?.userRating ? rowData.userRating : 0}
                          onChange={(e: any) => handleRating(rowData, e)}
                        />
                      </CustomCell>
                    );
                  }

                  return (
                    <TextCell
                      rowData={rowData}
                      rowIndex={rowIndex}
                      column={column}
                      rowHeight={rowHeight}
                      handleRowClick={(e: any) => {
                        handleRowClick(
                          e,
                          {
                            ...rowData,
                            rowIndex,
                          },
                          sortColumn && !nowPlaying ? sortedData : data
                        );
                      }}
                      handleRowDoubleClick={() => {
                        handleRowDoubleClick({
                          ...rowData,
                          rowIndex,
                          tableData: sortColumn && !nowPlaying ? sortedData : data,
                        });
                      }}
                      onMouseDown={(e: any) => {
                        handleStartSelectDrag.onMouseDown({ e, rowData });
                        handleSelectMouseDown(e, rowData);
                      }}
                      onMouseEnter={() => handleContinueSelectDrag(rowData)}
                      onMouseUp={() => {
                        handleSelectMouseUp();
                        handleStartSelectDrag.onMouseUp();
                      }}
                    />
                  );
                  // -------------------------------------------------------------------------------
                }}
              </Table.Cell>
            )}
          </Table.Column>
        ))}
      </StyledTable>
      {paginationProps && paginationProps?.recordsPerPage !== 0 && (
        <Paginator {...paginationProps} />
      )}
    </>
  );
};

export default ListViewTable;
