import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useQuery, useQueryClient } from 'react-query';
import { Nav } from 'rsuite';
import settings from 'electron-settings';
import { useTranslation } from 'react-i18next';
import useSearchQuery from '../../hooks/useSearchQuery';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fixPlayer2Index,
  setPlayQueueByRowClick,
  setRate,
  setStar,
} from '../../redux/playQueueSlice';
import {
  clearSelected,
  toggleSelected,
  toggleRangeSelected,
  setRangeSelected,
} from '../../redux/multiSelectSlice';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import PageLoader from '../loader/PageLoader';
import ListViewType from '../viewtypes/ListViewType';
import GridViewType from '../viewtypes/GridViewType';
import { setStatus } from '../../redux/playerSlice';
import { StyledNavItem, StyledTag } from '../shared/styled';
import { setActive, setSort } from '../../redux/favoriteSlice';
import { apiController } from '../../api/controller';
import { setPlaylistRate } from '../../redux/playlistSlice';
import useColumnSort from '../../hooks/useColumnSort';
import { Item, Server } from '../../types';
import { FilterButton } from '../shared/ToolbarButtons';
import ColumnSortPopover from '../shared/ColumnSortPopover';

const StarredView = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const folder = useAppSelector((state) => state.folder);
  const favorite = useAppSelector((state) => state.favorite);
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const [viewType, setViewType] = useState(settings.getSync('albumViewType') || 'list');
  const [musicFolder, setMusicFolder] = useState(undefined);

  useEffect(() => {
    if (folder.applied.starred) {
      setMusicFolder(folder.musicFolder);
    }
  }, [folder]);

  const { isLoading, isError, data, error }: any = useQuery(['starred', musicFolder], () =>
    apiController({
      serverType: config.serverType,
      endpoint: 'getStarred',
      args: { musicFolderId: musicFolder },
    })
  );

  const filteredData = useSearchQuery(
    misc.searchQuery,
    favorite.active.tab === 'tracks'
      ? data?.song
      : favorite.active.tab === 'albums'
      ? data?.album
      : data?.artist,
    favorite.active.tab === 'tracks'
      ? ['title', 'artist', 'album', 'genre']
      : favorite.active.tab === 'albums'
      ? ['title', 'artist', 'genre', 'year']
      : ['title']
  );

  const { sortedData, sortColumns } = useColumnSort(
    favorite.active.tab === 'albums' ? data?.album : data?.artist,
    favorite.active.tab === 'albums' ? Item.Album : Item.Artist,
    favorite.active.tab === 'albums' ? favorite.active.album.sort : favorite.active.artist.sort
  );

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

    if (favorite.active.tab === 'tracks') {
      dispatch(
        setPlayQueueByRowClick({
          entries: data.song,
          currentIndex: rowData.rowIndex,
          currentSongId: rowData.id,
          uniqueSongId: rowData.uniqueId,
          filters: config.playback.filters,
        })
      );
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    } else if (favorite.active.tab === 'albums') {
      history.push(`/library/album/${rowData.id}`);
    } else {
      history.push(`/library/artist/${rowData.id}`);
    }
  };

  const handleRowFavorite = async (rowData: any) => {
    await apiController({
      serverType: config.serverType,
      endpoint: 'unstar',
      args: { id: rowData.id, type: 'music' },
    });
    dispatch(setStar({ id: [rowData.id], type: 'unstar' }));
    await queryClient.refetchQueries(['starred', musicFolder], {
      active: true,
    });
  };

  const handleRowFavoriteAlbum = async (rowData: any) => {
    await apiController({
      serverType: config.serverType,
      endpoint: 'unstar',
      args: { id: rowData.id, type: 'album' },
    });
    await queryClient.refetchQueries(['starred', musicFolder], {
      active: true,
    });
  };

  const handleRowFavoriteArtist = async (rowData: any) => {
    await apiController({
      serverType: config.serverType,
      endpoint: 'unstar',
      args: { id: rowData.id, type: 'artist' },
    });
    await queryClient.refetchQueries(['starred', musicFolder], {
      active: true,
    });
  };

  const handleRowRating = async (rowData: any, e: number) => {
    apiController({
      serverType: config.serverType,
      endpoint: 'setRating',
      args: { ids: [rowData.id], rating: e },
    });
    dispatch(setRate({ id: [rowData.id], rating: e }));
    dispatch(setPlaylistRate({ id: [rowData.id], rating: e }));

    await queryClient.refetchQueries(['starred', musicFolder], {
      active: true,
    });
  };

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          title={
            <>
              {t('Favorites')}{' '}
              <StyledTag style={{ verticalAlign: 'middle', cursor: 'default' }}>
                {favorite.active.tab === 'tracks' && (data?.song?.length || '...')}
                {favorite.active.tab === 'albums' && (data?.album?.length || '...')}
                {favorite.active.tab === 'artists' && (data?.artist?.length || '...')}
              </StyledTag>
            </>
          }
          sidetitle={
            <>
              {(favorite.active.tab === 'albums' || favorite.active.tab === 'artists') && (
                <ColumnSortPopover
                  sortColumns={sortColumns}
                  sortColumn={
                    favorite.active.tab === 'albums'
                      ? favorite.active.album.sort.column
                      : favorite.active.artist.sort.column
                  }
                  sortType={
                    favorite.active.tab === 'albums'
                      ? favorite.active.album.sort.type
                      : favorite.active.artist.sort.type
                  }
                  disabledItemValues={
                    config.serverType === Server.Jellyfin
                      ? favorite.active.tab === 'albums'
                        ? ['playCount', 'userRating']
                        : ['albumCount', 'userRating']
                      : favorite.active.tab === 'albums'
                      ? []
                      : ['duration']
                  }
                  clearSortType={() =>
                    dispatch(
                      setSort({
                        type: favorite.active.tab === 'albums' ? 'album' : 'artist',
                        value:
                          favorite.active.tab === 'albums'
                            ? {
                                ...favorite.active.album.sort,
                                column: undefined,
                              }
                            : {
                                ...favorite.active.artist.sort,
                                column: undefined,
                              },
                      })
                    )
                  }
                  setSortType={(e: string) =>
                    dispatch(
                      setSort({
                        type: favorite.active.tab === 'albums' ? 'album' : 'artist',
                        value:
                          favorite.active.tab === 'albums'
                            ? {
                                ...favorite.active.album.sort,
                                type: e,
                              }
                            : {
                                ...favorite.active.artist.sort,
                                type: e,
                              },
                      })
                    )
                  }
                  setSortColumn={(e: string) =>
                    dispatch(
                      setSort({
                        type: favorite.active.tab === 'albums' ? 'album' : 'artist',
                        value:
                          favorite.active.tab === 'albums'
                            ? {
                                ...favorite.active.album.sort,
                                column: e,
                              }
                            : {
                                ...favorite.active.artist.sort,
                                column: e,
                              },
                      })
                    )
                  }
                >
                  <FilterButton
                    size="sm"
                    appearance={
                      (
                        favorite.active.tab === 'albums'
                          ? favorite.active.album.sort.column
                          : favorite.active.artist.sort.column
                      )
                        ? 'primary'
                        : 'subtle'
                    }
                  />
                </ColumnSortPopover>
              )}
            </>
          }
          subtitle={
            <Nav activeKey={favorite.active.tab} onSelect={(e) => dispatch(setActive({ tab: e }))}>
              <StyledNavItem
                eventKey="tracks"
                onKeyDown={(e: any) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    dispatch(setActive({ tab: 'tracks' }));
                  }
                }}
                tabIndex={0}
              >
                {t('Tracks')}
              </StyledNavItem>
              <StyledNavItem
                eventKey="albums"
                onKeyDown={(e: any) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    dispatch(setActive({ tab: 'albums' }));
                  }
                }}
              >
                {t('Albums')}
              </StyledNavItem>
              <StyledNavItem
                eventKey="artists"
                onKeyDown={(e: any) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    dispatch(setActive({ tab: 'artists' }));
                  }
                }}
              >
                {t('Artists')}
              </StyledNavItem>
            </Nav>
          }
          showViewTypeButtons={favorite.active.tab !== 'tracks'}
          viewTypeSetting="album"
          handleListClick={() => setViewType('list')}
          handleGridClick={() => setViewType('grid')}
        />
      }
    >
      {(isLoading || !data) && <PageLoader />}
      {data && (
        <>
          {favorite.active.tab === 'tracks' && (
            <ListViewType
              data={misc.searchQuery !== '' ? filteredData : data.song}
              tableColumns={config.lookAndFeel.listView.music.columns}
              handleRowClick={handleRowClick}
              handleRowDoubleClick={handleRowDoubleClick}
              handleRating={handleRowRating}
              rowHeight={config.lookAndFeel.listView.music.rowHeight}
              fontSize={config.lookAndFeel.listView.music.fontSize}
              cacheImages={{
                enabled: settings.getSync('cacheImages'),
                cacheType: 'album',
                cacheIdProperty: 'albumId',
              }}
              page="favoriteTracksPage"
              listType="music"
              virtualized
              disabledContextMenuOptions={[
                'removeSelected',
                'moveSelectedTo',
                'deletePlaylist',
                'viewInModal',
              ]}
              handleFavorite={handleRowFavorite}
              initialScrollOffset={Number(localStorage.getItem('scroll_list_starredMusicList'))}
              onScroll={(scrollIndex: number) => {
                localStorage.setItem('scroll_list_starredMusicList', String(Math.abs(scrollIndex)));
              }}
            />
          )}
          {favorite.active.tab === 'albums' && (
            <>
              {viewType === 'list' && (
                <ListViewType
                  data={misc.searchQuery !== '' ? filteredData : sortedData}
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
                  page="favoriteAlbumsPage"
                  listType="album"
                  virtualized
                  disabledContextMenuOptions={[
                    'removeSelected',
                    'moveSelectedTo',
                    'deletePlaylist',
                  ]}
                  handleFavorite={handleRowFavoriteAlbum}
                  initialScrollOffset={Number(localStorage.getItem('scroll_list_starredAlbumList'))}
                  onScroll={(scrollIndex: number) => {
                    localStorage.setItem(
                      'scroll_list_starredAlbumList',
                      String(Math.abs(scrollIndex))
                    );
                  }}
                />
              )}
              {viewType === 'grid' && (
                <GridViewType
                  data={misc.searchQuery !== '' ? filteredData : sortedData}
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
                  handleFavorite={handleRowFavoriteAlbum}
                  initialScrollOffset={Number(localStorage.getItem('scroll_grid_starredAlbumList'))}
                  onScroll={(scrollIndex: number) => {
                    localStorage.setItem('scroll_grid_starredAlbumList', String(scrollIndex));
                  }}
                />
              )}
            </>
          )}
          {favorite.active.tab === 'artists' && (
            <>
              {viewType === 'list' && (
                <ListViewType
                  data={misc.searchQuery !== '' ? filteredData : sortedData}
                  tableColumns={config.lookAndFeel.listView.artist.columns}
                  rowHeight={config.lookAndFeel.listView.artist.rowHeight}
                  fontSize={config.lookAndFeel.listView.artist.fontSize}
                  handleRowClick={handleRowClick}
                  handleRowDoubleClick={handleRowDoubleClick}
                  handleRating={handleRowRating}
                  cacheImages={{
                    enabled: false,
                    cacheType: 'artist',
                    cacheIdProperty: 'id',
                  }}
                  page="favoriteArtistsPage"
                  listType="artist"
                  virtualized
                  disabledContextMenuOptions={[
                    'removeSelected',
                    'moveSelectedTo',
                    'addToPlaylist',
                    'deletePlaylist',
                  ]}
                  handleFavorite={handleRowFavoriteArtist}
                  initialScrollOffset={Number(
                    localStorage.getItem('scroll_list_starredArtistList')
                  )}
                  onScroll={(scrollIndex: number) => {
                    localStorage.setItem(
                      'scroll_list_starredArtistList',
                      String(Math.abs(scrollIndex))
                    );
                  }}
                />
              )}
              {viewType === 'grid' && (
                <GridViewType
                  data={misc.searchQuery !== '' ? filteredData : sortedData}
                  cardTitle={{
                    prefix: '/library/artist',
                    property: 'title',
                    urlProperty: 'id',
                  }}
                  cardSubtitle={{
                    property: 'albumCount',
                    unit: ' albums',
                  }}
                  playClick={{ type: 'artist', idProperty: 'id' }}
                  size={config.lookAndFeel.gridView.cardSize}
                  cacheType="artist"
                  handleFavorite={handleRowFavoriteArtist}
                  initialScrollOffset={Number(
                    localStorage.getItem('scroll_grid_starredArtistList')
                  )}
                  onScroll={(scrollIndex: number) => {
                    localStorage.setItem('scroll_grid_starredArtistList', String(scrollIndex));
                  }}
                />
              )}
            </>
          )}
        </>
      )}
    </GenericPage>
  );
};

export default StarredView;
