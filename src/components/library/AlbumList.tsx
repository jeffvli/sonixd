import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { ButtonToolbar, Nav, Whisper } from 'rsuite';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import GridViewType from '../viewtypes/GridViewType';
import ListViewType from '../viewtypes/ListViewType';
import useSearchQuery from '../../hooks/useSearchQuery';
import GenericPageHeader from '../layout/GenericPageHeader';
import GenericPage from '../layout/GenericPage';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  toggleSelected,
  setRangeSelected,
  toggleRangeSelected,
  clearSelected,
} from '../../redux/multiSelectSlice';
import {
  StyledInputPicker,
  StyledInputPickerContainer,
  StyledNavItem,
  StyledPopover,
  StyledTag,
} from '../shared/styled';
import { FilterButton, RefreshButton } from '../shared/ToolbarButtons';
import { setSearchQuery } from '../../redux/miscSlice';
import { apiController } from '../../api/controller';
import { Item, Server } from '../../types';
import AdvancedFilters from './AdvancedFilters';
import useAdvancedFilter from '../../hooks/useAdvancedFilter';
import ColumnSort from '../shared/ColumnSort';
import useColumnSort from '../../hooks/useColumnSort';
import { setFilter, setPagination, setAdvancedFilters, setColumnSort } from '../../redux/viewSlice';

export const ALBUM_SORT_TYPES = [
  { label: i18next.t('A-Z (Name)'), value: 'alphabeticalByName', role: i18next.t('Default') },
  { label: i18next.t('A-Z (Artist)'), value: 'alphabeticalByArtist', role: i18next.t('Default') },
  { label: i18next.t('Most Played'), value: 'frequent', role: i18next.t('Default') },
  { label: i18next.t('Random'), value: 'random', role: i18next.t('Default') },
  { label: i18next.t('Recently Added'), value: 'newest', role: i18next.t('Default') },
  { label: i18next.t('Recently Played'), value: 'recent', role: i18next.t('Default') },
];

const AlbumList = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const queryClient = useQueryClient();
  const folder = useAppSelector((state) => state.folder);
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const view = useAppSelector((state) => state.view);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortTypes, setSortTypes] = useState<any[]>([]);
  const [viewType, setViewType] = useState(settings.getSync('albumViewType'));
  const [musicFolder, setMusicFolder] = useState({ loaded: false, id: undefined });
  const albumFilterPickerContainerRef = useRef(null);
  const [isRefresh, setIsRefresh] = useState(false);
  const [currentQueryKey, setCurrentQueryKey] = useState<any>(['albumList']);

  useEffect(() => {
    if (folder.applied.albums) {
      setMusicFolder({ loaded: true, id: folder.musicFolder });
    } else {
      setMusicFolder({ loaded: true, id: undefined });
    }

    if (config.serverType === Server.Subsonic || !view.album.pagination.serverSide) {
      // Client-side paging won't require a separate key for the active page
      setCurrentQueryKey(['albumList', view.album.filter, musicFolder.id]);
    } else {
      setCurrentQueryKey(['albumList', view.album.filter, view.album.pagination, musicFolder.id]);
    }
  }, [
    config.serverType,
    folder.applied.albums,
    folder.musicFolder,
    musicFolder.id,
    view.album.filter,
    view.album.pagination,
  ]);

  const { isLoading, isError, data: albums, error }: any = useQuery(
    currentQueryKey,
    () =>
      view.album.filter === 'random' ||
      (view.album.pagination.recordsPerPage !== 0 && view.album.pagination.serverSide)
        ? apiController({
            serverType: config.serverType,
            endpoint: 'getAlbums',
            args:
              config.serverType === Server.Subsonic
                ? {
                    type: view.album.filter,
                    size: 500,
                    offset: 0,
                    musicFolderId: musicFolder,
                    recursive: view.album.filter !== 'random',
                  }
                : {
                    type: view.album.filter,
                    size:
                      view.album.pagination.recordsPerPage === 0
                        ? 100
                        : view.album.pagination.recordsPerPage,
                    offset:
                      (view.album.pagination.activePage - 1) * view.album.pagination.recordsPerPage,
                    recursive: false,
                    musicFolderId: musicFolder.id,
                  },
          })
        : apiController({
            serverType: config.serverType,
            endpoint: 'getAlbums',
            args:
              config.serverType === Server.Subsonic
                ? {
                    type: view.album.filter,
                    size: 500,
                    offset: 0,
                    musicFolderId: musicFolder.id,
                    recursive: true,
                  }
                : {
                    type: view.album.filter,
                    recursive: true,
                    musicFolderId: musicFolder.id,
                  },
          }),
    {
      cacheTime:
        view.album.pagination.recordsPerPage !== 0 && config.serverType === Server.Jellyfin
          ? 600000
          : Infinity,
      staleTime:
        view.album.pagination.recordsPerPage !== 0 && config.serverType === Server.Jellyfin
          ? 600000
          : Infinity,
      enabled: currentQueryKey !== ['albumList'] && musicFolder.loaded,
    }
  );

  const { data: genres }: any = useQuery(['genreList'], async () => {
    const res = await apiController({
      serverType: config.serverType,
      endpoint: 'getGenres',
      args: { musicFolderId: folder.musicFolder },
    });
    return res.map((genre: any) => {
      if (genre.albumCount !== 0) {
        return {
          label: `${genre.title}${genre.albumCount ? ` (${genre.albumCount})` : ''}`,
          value: genre.title,
          role: 'Genre',
        };
      }
      return null;
    });
  });

  const searchedData = useSearchQuery(misc.searchQuery, albums?.data, [
    'title',
    'artist',
    'genre',
    'year',
  ]);

  const {
    filteredData,
    byArtistData,
    byArtistBaseData,
    byGenreData,
    byStarredData,
    byYearData,
  } = useAdvancedFilter(albums?.data, view.album.advancedFilters);

  const { sortColumns, sortedData } = useColumnSort(filteredData, Item.Album, view.album.sort);

  useEffect(() => {
    setSortTypes(_.compact(_.concat(ALBUM_SORT_TYPES, genres)));
  }, [genres]);

  useEffect(() => {
    const pages =
      Math.floor(
        (view.album.pagination.serverSide && config.serverType === Server.Jellyfin
          ? albums?.totalRecordCount
          : sortedData?.length) / view.album.pagination.recordsPerPage
      ) + 1;

    if (albums && view.album.pagination.pages !== pages) {
      dispatch(
        setPagination({
          listType: Item.Album,
          data: {
            pages,
          },
        })
      );
    }
  }, [
    albums,
    config.serverType,
    dispatch,
    sortedData?.length,
    view.album.pagination.pages,
    view.album.pagination.recordsPerPage,
    view.album.pagination.serverSide,
  ]);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any, tableData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          dispatch(toggleRangeSelected(tableData));
        }
      }, 100);
    }
  };

  const handleRowDoubleClick = (rowData: any) => {
    window.clearTimeout(timeout);
    timeout = null;

    dispatch(clearSelected());
    history.push(`/library/album/${rowData.id}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.refetchQueries(['albumList'], { active: true });
    setIsRefreshing(false);
  };

  const handleRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'album' },
      });
      queryClient.setQueryData(['albumList', view.album.filter, musicFolder.id], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.data, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.data[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: rowData.id, type: 'album' },
      });
      queryClient.setQueryData(['albumList', view.album.filter, musicFolder.id], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.data, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.data[index].starred = undefined;
        });

        return oldData;
      });
    }
  };

  const handleRowRating = (rowData: any, e: number) => {
    apiController({
      serverType: config.serverType,
      endpoint: 'setRating',
      args: { ids: [rowData.id], rating: e },
    });

    queryClient.setQueryData(['albumList', view.album.filter, musicFolder.id], (oldData: any) => {
      const ratedIndices = _.keys(_.pickBy(oldData.data, { id: rowData.id }));
      ratedIndices.forEach((index) => {
        oldData.data[index].userRating = e;
      });

      return oldData;
    });
  };

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          title={
            <>
              {t('Albums')}{' '}
              <StyledTag style={{ verticalAlign: 'middle', cursor: 'default' }}>
                {filteredData?.length || '...'}
              </StyledTag>
            </>
          }
          subtitle={
            <StyledInputPickerContainer ref={albumFilterPickerContainerRef}>
              <ButtonToolbar>
                <StyledInputPicker
                  container={() => albumFilterPickerContainerRef.current}
                  size="sm"
                  width={180}
                  defaultValue={view.album.filter}
                  value={view.album.filter}
                  groupBy="role"
                  data={sortTypes || ALBUM_SORT_TYPES}
                  disabledItemValues={
                    config.serverType === Server.Jellyfin ? ['frequent', 'recent'] : []
                  }
                  cleanable={false}
                  placeholder={t('Sort Type')}
                  onChange={async (value: string) => {
                    setIsRefresh(true);
                    await queryClient.cancelQueries([
                      'albumList',
                      view.album.filter,
                      musicFolder.id,
                    ]);
                    dispatch(setSearchQuery(''));
                    dispatch(setFilter({ listType: Item.Album, data: value }));
                    dispatch(setPagination({ listType: Item.Album, data: { activePage: 1 } }));
                    localStorage.setItem('scroll_grid_albumList', '0');
                    localStorage.setItem('scroll_list_albumList', '0');
                    setIsRefresh(false);
                  }}
                />
                <RefreshButton onClick={handleRefresh} size="sm" loading={isRefreshing} />
              </ButtonToolbar>
            </StyledInputPickerContainer>
          }
          sidetitle={
            <>
              <Whisper
                trigger="click"
                enterable
                placement="bottomEnd"
                preventOverflow
                speaker={
                  <StyledPopover width="275px" opacity={0.97}>
                    <Nav
                      activeKey={view.album.advancedFilters.nav}
                      onSelect={(e) =>
                        dispatch(
                          setAdvancedFilters({ listType: Item.Album, filter: 'nav', value: e })
                        )
                      }
                      justified
                      appearance="tabs"
                    >
                      <StyledNavItem eventKey="filters">Filters</StyledNavItem>
                      <StyledNavItem eventKey="sort">Sort</StyledNavItem>
                    </Nav>
                    <br />
                    {view.album.advancedFilters.nav === 'filters' && (
                      <AdvancedFilters
                        filteredData={{
                          filteredData,
                          byArtistData,
                          byArtistBaseData,
                          byGenreData,
                          byStarredData,
                          byYearData,
                        }}
                        originalData={albums?.data}
                        filter={view.album.advancedFilters}
                        setAdvancedFilters={setAdvancedFilters}
                      />
                    )}

                    {view.album.advancedFilters.nav === 'sort' && (
                      <ColumnSort
                        sortColumns={sortColumns}
                        sortColumn={view.album.sort.column}
                        sortType={view.album.sort.type}
                        disabledItemValues={
                          config.serverType === Server.Jellyfin ? ['playCount', 'userRating'] : []
                        }
                        clearSortType={() =>
                          dispatch(
                            setColumnSort({
                              listType: Item.Album,
                              data: {
                                ...view.album.sort,
                                column: undefined,
                              },
                            })
                          )
                        }
                        setSortType={(e: string) =>
                          dispatch(
                            setColumnSort({
                              listType: Item.Album,
                              data: { ...view.album.sort, type: e },
                            })
                          )
                        }
                        setSortColumn={(e: string) =>
                          dispatch(
                            setColumnSort({
                              listType: Item.Album,
                              data: { ...view.album.sort, column: e },
                            })
                          )
                        }
                      />
                    )}
                  </StyledPopover>
                }
              >
                <FilterButton
                  size="sm"
                  appearance={
                    view.album.advancedFilters.enabled || view.album.sort.column
                      ? 'primary'
                      : 'subtle'
                  }
                />
              </Whisper>
            </>
          }
          showViewTypeButtons
          viewTypeSetting="album"
          handleListClick={() => setViewType('list')}
          handleGridClick={() => setViewType('grid')}
        />
      }
    >
      {isError && <div>Error: {error}</div>}
      {!isError && viewType === 'list' && (
        <ListViewType
          data={
            misc.searchQuery !== ''
              ? searchedData
              : (config.serverType === Server.Subsonic || !view.album.pagination.serverSide) &&
                view.album.pagination.recordsPerPage !== 0
              ? sortedData?.slice(
                  (view.album.pagination.activePage - 1) * view.album.pagination.recordsPerPage,
                  view.album.pagination.activePage * view.album.pagination.recordsPerPage
                )
              : sortedData
          }
          tableColumns={config.lookAndFeel.listView.album.columns}
          rowHeight={config.lookAndFeel.listView.album.rowHeight}
          fontSize={config.lookAndFeel.listView.album.fontSize}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          handleRating={handleRowRating}
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'album',
            cacheIdProperty: 'albumId',
          }}
          page="albumListPage"
          listType="album"
          virtualized
          disabledContextMenuOptions={[
            'moveSelectedTo',
            'removeSelected',
            'deletePlaylist',
            'viewInFolder',
          ]}
          loading={isLoading}
          handleFavorite={handleRowFavorite}
          initialScrollOffset={Number(localStorage.getItem('scroll_list_albumList'))}
          onScroll={(scrollIndex: number) => {
            localStorage.setItem('scroll_list_albumList', String(Math.abs(scrollIndex)));
          }}
          paginationProps={
            view.album.pagination.recordsPerPage !== 0 && {
              disabled: misc.searchQuery !== '' ? true : null,
              pages: view.album.pagination.pages,
              activePage: view.album.pagination.activePage,
              maxButtons: 3,
              prev: true,
              next: true,
              ellipsis: true,
              boundaryLinks: true,
              startIndex:
                view.album.pagination.recordsPerPage * (view.album.pagination.activePage - 1) + 1,
              endIndex: view.album.pagination.recordsPerPage * view.album.pagination.activePage,
              handleGoToButton: (e: number) => {
                localStorage.setItem('scroll_list_albumList', '0');
                dispatch(
                  setPagination({
                    listType: Item.Album,
                    data: {
                      activePage: e,
                    },
                  })
                );
              },
              onSelect: async (e: number) => {
                localStorage.setItem('scroll_list_albumList', '0');
                await queryClient.cancelQueries(['albumList'], { active: true });
                dispatch(
                  setPagination({
                    listType: Item.Album,
                    data: {
                      activePage: e,
                    },
                  })
                );
              },
            }
          }
        />
      )}
      {!isError && viewType === 'grid' && (
        <GridViewType
          data={
            misc.searchQuery !== ''
              ? searchedData
              : (config.serverType === Server.Subsonic || !view.album.pagination.serverSide) &&
                view.album.pagination.recordsPerPage !== 0
              ? sortedData?.slice(
                  (view.album.pagination.activePage - 1) * view.album.pagination.recordsPerPage,
                  view.album.pagination.activePage * view.album.pagination.recordsPerPage
                )
              : sortedData
          }
          cardTitle={{
            prefix: '/library/album',
            property: 'title',
            urlProperty: 'albumId',
          }}
          cardSubtitle={{
            prefix: 'artist',
            property: 'albumArtist',
            urlProperty: 'albumArtistId',
            unit: '',
          }}
          playClick={{ type: 'album', idProperty: 'id' }}
          size={config.lookAndFeel.gridView.cardSize}
          cacheType="album"
          handleFavorite={handleRowFavorite}
          initialScrollOffset={Number(localStorage.getItem('scroll_grid_albumList'))}
          onScroll={(scrollIndex: number) => {
            localStorage.setItem('scroll_grid_albumList', String(scrollIndex));
          }}
          loading={isLoading}
          refresh={isRefresh}
          paginationProps={
            view.album.pagination.recordsPerPage !== 0 && {
              disabled: misc.searchQuery !== '' ? true : null,
              pages: view.album.pagination.pages,
              activePage: view.album.pagination.activePage,
              maxButtons: 3,
              prev: true,
              next: true,
              ellipsis: true,
              boundaryLinks: true,
              startIndex:
                view.album.pagination.recordsPerPage * (view.album.pagination.activePage - 1) + 1,
              endIndex: view.album.pagination.recordsPerPage * view.album.pagination.activePage,
              handleGoToButton: (e: number) => {
                localStorage.setItem('scroll_list_albumList', '0');
                dispatch(
                  setPagination({
                    listType: Item.Album,
                    data: {
                      activePage: e,
                    },
                  })
                );
              },
              onSelect: async (e: number) => {
                localStorage.setItem('scroll_list_albumList', '0');
                await queryClient.cancelQueries(['albumList'], { active: true });
                dispatch(
                  setPagination({
                    listType: Item.Album,
                    data: {
                      activePage: e,
                    },
                  })
                );
              },
            }
          }
        />
      )}
    </GenericPage>
  );
};

export default AlbumList;
