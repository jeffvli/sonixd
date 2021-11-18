import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useQuery, useQueryClient } from 'react-query';
import { Nav } from 'rsuite';
import settings from 'electron-settings';
import useSearchQuery from '../../hooks/useSearchQuery';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fixPlayer2Index, setPlayQueueByRowClick, setStar } from '../../redux/playQueueSlice';
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
import { StyledNavItem } from '../shared/styled';
import { setActive } from '../../redux/favoriteSlice';
import { apiController } from '../../api/controller';
import { Server } from '../../types';

const StarredView = () => {
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
      args: config.serverType === Server.Subsonic ? { musicFolderId: musicFolder } : null,
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
          currentIndex: rowData.index,
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
      args: config.serverType === Server.Subsonic ? { id: rowData.id, type: 'music' } : null,
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
      args: config.serverType === Server.Subsonic ? { id: rowData.id, type: 'album' } : null,
    });
    await queryClient.refetchQueries(['starred', musicFolder], {
      active: true,
    });
  };

  const handleRowFavoriteArtist = async (rowData: any) => {
    await apiController({
      serverType: config.serverType,
      endpoint: 'unstar',
      args: config.serverType === Server.Subsonic ? { id: rowData.id, type: 'artist' } : null,
    });
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
          title="Favorites"
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
                Tracks
              </StyledNavItem>
              <StyledNavItem
                eventKey="albums"
                onKeyDown={(e: any) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    dispatch(setActive({ tab: 'albums' }));
                  }
                }}
              >
                Albums
              </StyledNavItem>
              <StyledNavItem
                eventKey="artists"
                onKeyDown={(e: any) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    dispatch(setActive({ tab: 'artists' }));
                  }
                }}
              >
                Artists
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
            />
          )}
          {favorite.active.tab === 'albums' && (
            <>
              {viewType === 'list' && (
                <ListViewType
                  data={misc.searchQuery !== '' ? filteredData : data.album}
                  tableColumns={config.lookAndFeel.listView.album.columns}
                  rowHeight={config.lookAndFeel.listView.album.rowHeight}
                  fontSize={config.lookAndFeel.listView.album.fontSize}
                  handleRowClick={handleRowClick}
                  handleRowDoubleClick={handleRowDoubleClick}
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
                />
              )}
              {viewType === 'grid' && (
                <GridViewType
                  data={misc.searchQuery !== '' ? filteredData : data.album}
                  cardTitle={{
                    prefix: '/library/album',
                    property: 'title',
                    urlProperty: 'albumId',
                  }}
                  cardSubtitle={{
                    prefix: 'artist',
                    property: 'artist',
                    urlProperty: 'artistId',
                    unit: '',
                  }}
                  playClick={{ type: 'album', idProperty: 'id' }}
                  size={config.lookAndFeel.gridView.cardSize}
                  cacheType="album"
                  handleFavorite={handleRowFavoriteAlbum}
                />
              )}
            </>
          )}
          {favorite.active.tab === 'artists' && (
            <>
              {viewType === 'list' && (
                <ListViewType
                  data={misc.searchQuery !== '' ? filteredData : data.artist}
                  tableColumns={config.lookAndFeel.listView.artist.columns}
                  rowHeight={config.lookAndFeel.listView.artist.rowHeight}
                  fontSize={config.lookAndFeel.listView.artist.fontSize}
                  handleRowClick={handleRowClick}
                  handleRowDoubleClick={handleRowDoubleClick}
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
                />
              )}
              {viewType === 'grid' && (
                <GridViewType
                  data={misc.searchQuery !== '' ? filteredData : data.artist}
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
