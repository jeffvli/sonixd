import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { ButtonToolbar } from 'rsuite';
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
import { StyledInputPicker, StyledInputPickerContainer } from '../shared/styled';
import { RefreshButton } from '../shared/ToolbarButtons';
import { setActive } from '../../redux/albumSlice';
import { setSearchQuery } from '../../redux/miscSlice';
import { apiController } from '../../api/controller';
import { Server } from '../../types';

const ALBUM_SORT_TYPES = [
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
  const [sortTypes, setSortTypes] = useState<any[]>();
  const [viewType, setViewType] = useState(settings.getSync('albumViewType'));
  const [musicFolder, setMusicFolder] = useState(undefined);
  const albumFilterPickerContainerRef = useRef(null);

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
                : null,
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
                : null,
          }),
    {
      cacheTime: 3600000, // Stay in cache for 1 hour
      staleTime: Infinity, // Only allow manual refresh
    }
  );
  const { data: genres }: any = useQuery(['genreList'], async () => {
    const res = await apiController({ serverType: config.serverType, endpoint: 'getGenres' });
    return res.map((genre: any) => {
      if (genre.albumCount !== 0) {
        return {
          label: `${genre.title} (${genre.albumCount})`,
          value: genre.title,
          role: 'Genre',
        };
      }
      return null;
    });
  });
  const filteredData = useSearchQuery(misc.searchQuery, albums, [
    'title',
    'artist',
    'genre',
    'year',
  ]);

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
        args: config.serverType === Server.Subsonic ? { id: rowData.id, type: 'album' } : null,
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
        args: config.serverType === Server.Subsonic ? { id: rowData.id, type: 'album' } : null,
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

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          title="Albums"
          subtitle={
            <StyledInputPickerContainer ref={albumFilterPickerContainerRef}>
              <ButtonToolbar>
                <StyledInputPicker
                  container={() => albumFilterPickerContainerRef.current}
                  size="sm"
                  width={180}
                  defaultValue={album.active.filter}
                  groupBy="role"
                  data={sortTypes}
                  cleanable={false}
                  placeholder="Sort Type"
                  onChange={async (value: string) => {
                    await queryClient.cancelQueries([
                      'albumList',
                      album.active.filter,
                      musicFolder,
                    ]);
                    dispatch(setSearchQuery(''));
                    dispatch(setActive({ ...album.active, filter: value }));
                  }}
                />

                <RefreshButton
                  onClick={handleRefresh}
                  size="sm"
                  loading={isRefreshing}
                  width={100}
                />
              </ButtonToolbar>
            </StyledInputPickerContainer>
          }
          subsidetitle={<></>}
          showViewTypeButtons
          viewTypeSetting="album"
          handleListClick={() => setViewType('list')}
          handleGridClick={() => setViewType('grid')}
        />
      }
    >
      {isLoading && <PageLoader />}
      {isError && <div>Error: {error}</div>}
      {!isLoading && !isError && viewType === 'list' && (
        <ListViewType
          data={misc.searchQuery !== '' ? filteredData : albums}
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
        />
      )}
      {!isLoading && !isError && viewType === 'grid' && (
        <GridViewType
          data={misc.searchQuery !== '' ? filteredData : albums}
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
          handleFavorite={handleRowFavorite}
        />
      )}
    </GenericPage>
  );
};

export default AlbumList;
