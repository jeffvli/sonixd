import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { ButtonToolbar, Nav, Whisper } from 'rsuite';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import GridViewType from '../viewtypes/GridViewType';
import ListViewType from '../viewtypes/ListViewType';
import useSearchQuery from '../../hooks/useSearchQuery';
import GenericPageHeader from '../layout/GenericPageHeader';
import GenericPage from '../layout/GenericPage';
import PageLoader from '../loader/PageLoader';
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
import { setActive, setAdvancedFilters } from '../../redux/albumSlice';
import { setSearchQuery } from '../../redux/miscSlice';
import { apiController } from '../../api/controller';
import { Item, Server } from '../../types';
import AdvancedFilters from './AdvancedFilters';
import useAdvancedFilter from '../../hooks/useAdvancedFilter';
import ColumnSort from '../shared/ColumnSort';
import useColumnSort from '../../hooks/useColumnSort';

export const ALBUM_SORT_TYPES = [
  { label: 'A-Z (Name)', value: 'alphabeticalByName', role: 'Default' },
  { label: 'A-Z (Artist)', value: 'alphabeticalByArtist', role: 'Default' },
  { label: 'Most Played', value: 'frequent', role: 'Default' },
  { label: 'Random', value: 'random', role: 'Default' },
  { label: 'Recently Added', value: 'newest', role: 'Default' },
  { label: 'Recently Played', value: 'recent', role: 'Default' },
];

const AlbumList = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const queryClient = useQueryClient();
  const folder = useAppSelector((state) => state.folder);
  const album = useAppSelector((state) => state.album);
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortTypes, setSortTypes] = useState<any[]>([]);
  const [viewType, setViewType] = useState(settings.getSync('albumViewType'));
  const [musicFolder, setMusicFolder] = useState(undefined);
  const albumFilterPickerContainerRef = useRef(null);
  const [isRefresh, setIsRefresh] = useState(false);

  useEffect(() => {
    if (folder.applied.albums) {
      setMusicFolder(folder.musicFolder);
    }
  }, [folder]);

  const { isLoading, isError, data: albums, error }: any = useQuery(
    ['albumList', album.active.filter, musicFolder],
    () =>
      album.active.filter === 'random'
        ? apiController({
            serverType: config.serverType,
            endpoint: 'getAlbums',
            args:
              config.serverType === Server.Subsonic
                ? {
                    type: 'random',
                    size: 100,
                    offset: 0,
                    musicFolderId: musicFolder,
                  }
                : {
                    type: 'random',
                    size: 100,
                    offset: 0,
                    recursive: false,
                    musicFolderId: musicFolder,
                  },
          })
        : apiController({
            serverType: config.serverType,
            endpoint: 'getAlbums',
            args:
              config.serverType === Server.Subsonic
                ? {
                    type: album.active.filter,
                    size: 500,
                    offset: 0,
                    musicFolderId: musicFolder,
                    recursive: true,
                  }
                : {
                    type: album.active.filter,
                    recursive: true,
                    musicFolderId: musicFolder,
                  },
          }),
    {
      cacheTime: 3600000, // Stay in cache for 1 hour
      staleTime: Infinity, // Only allow manual refresh
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

  const searchedData = useSearchQuery(misc.searchQuery, albums, [
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
  } = useAdvancedFilter(albums, album.advancedFilters);

  const { sortColumns, sortedData } = useColumnSort(
    filteredData,
    Item.Album,
    album.advancedFilters.properties.sort
  );

  useEffect(() => {
    setSortTypes(_.compact(_.concat(ALBUM_SORT_TYPES, genres)));
  }, [genres]);

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
      queryClient.setQueryData(['albumList', album.active.filter, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: rowData.id, type: 'album' },
      });
      queryClient.setQueryData(['albumList', album.active.filter, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = undefined;
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

    queryClient.setQueryData(['albumList', album.active.filter, musicFolder], (oldData: any) => {
      const ratedIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
      ratedIndices.forEach((index) => {
        oldData[index].userRating = e;
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
              Albums{' '}
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
                  defaultValue={album.active.filter}
                  value={album.active.filter}
                  groupBy="role"
                  data={sortTypes || ALBUM_SORT_TYPES}
                  disabledItemValues={
                    config.serverType === Server.Jellyfin ? ['frequent', 'recent'] : []
                  }
                  cleanable={false}
                  placeholder="Sort Type"
                  onChange={async (value: string) => {
                    setIsRefresh(true);
                    await queryClient.cancelQueries([
                      'albumList',
                      album.active.filter,
                      musicFolder,
                    ]);
                    dispatch(setSearchQuery(''));
                    dispatch(setActive({ ...album.active, filter: value }));
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
                      activeKey={album.advancedFilters.nav}
                      onSelect={(e) => dispatch(setAdvancedFilters({ filter: 'nav', value: e }))}
                      justified
                      appearance="tabs"
                    >
                      <StyledNavItem eventKey="filters">Filters</StyledNavItem>
                      <StyledNavItem eventKey="sort">Sort</StyledNavItem>
                    </Nav>
                    <br />
                    {album.advancedFilters.nav === 'filters' && (
                      <AdvancedFilters
                        filteredData={{
                          filteredData,
                          byArtistData,
                          byArtistBaseData,
                          byGenreData,
                          byStarredData,
                          byYearData,
                        }}
                        originalData={albums}
                        filter={album.advancedFilters}
                        setAdvancedFilters={setAdvancedFilters}
                      />
                    )}

                    {album.advancedFilters.nav === 'sort' && (
                      <ColumnSort
                        sortColumns={sortColumns}
                        sortColumn={album.advancedFilters.properties.sort.column}
                        sortType={album.advancedFilters.properties.sort.type}
                        disabledItemValues={
                          config.serverType === Server.Jellyfin ? ['playCount', 'userRating'] : []
                        }
                        clearSortType={() =>
                          dispatch(
                            setAdvancedFilters({
                              filter: 'sort',
                              value: {
                                ...album.advancedFilters.properties.sort,
                                column: undefined,
                              },
                            })
                          )
                        }
                        setSortType={(e: string) =>
                          dispatch(
                            setAdvancedFilters({
                              filter: 'sort',
                              value: { ...album.advancedFilters.properties.sort, type: e },
                            })
                          )
                        }
                        setSortColumn={(e: string) =>
                          dispatch(
                            setAdvancedFilters({
                              filter: 'sort',
                              value: { ...album.advancedFilters.properties.sort, column: e },
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
                    album.advancedFilters.enabled || album.advancedFilters.properties.sort.column
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
      {isLoading && <PageLoader />}
      {isError && <div>Error: {error}</div>}
      {!isLoading && !isError && sortedData?.length > 0 && viewType === 'list' && (
        <ListViewType
          data={misc.searchQuery !== '' ? searchedData : sortedData}
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
          handleFavorite={handleRowFavorite}
          initialScrollOffset={Number(localStorage.getItem('scroll_list_albumList'))}
          onScroll={(scrollIndex: number) => {
            localStorage.setItem('scroll_list_albumList', String(Math.abs(scrollIndex)));
          }}
        />
      )}
      {!isLoading && !isError && sortedData?.length > 0 && viewType === 'grid' && (
        <GridViewType
          data={misc.searchQuery !== '' ? searchedData : sortedData}
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
          refresh={isRefresh}
        />
      )}
    </GenericPage>
  );
};

export default AlbumList;
