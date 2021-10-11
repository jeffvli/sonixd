import React, { useState } from 'react';
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
import { getStarred, unstar } from '../../api/api';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import PageLoader from '../loader/PageLoader';
import ListViewType from '../viewtypes/ListViewType';
import GridViewType from '../viewtypes/GridViewType';
import { setStatus } from '../../redux/playerSlice';
import { StyledNavItem } from '../shared/styled';
import useRouterQuery from '../../hooks/useRouterQuery';

const StarredView = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const query = useRouterQuery();
  const queryClient = useQueryClient();
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const [page, setPage] = useState(query.get('page') || 'tracks');
  const [viewType, setViewType] = useState(settings.getSync('albumViewType') || 'list');
  const { isLoading, isError, data, error }: any = useQuery('starred', getStarred, {
    refetchOnWindowFocus: multiSelect.selected.length < 1,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(
    searchQuery,
    page === 'tracks' ? data?.song : page === 'albums' ? data?.album : data?.artist,
    page === 'tracks'
      ? ['title', 'artist', 'album', 'name', 'genre']
      : page === 'albums'
      ? ['name', 'artist', 'genre', 'year']
      : ['name']
  );

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          if (page === 'tracks') {
            dispatch(setRangeSelected(rowData));
            if (searchQuery !== '') {
              dispatch(toggleRangeSelected(filteredData));
            } else {
              dispatch(toggleRangeSelected(data.song));
            }
          } else if (page === 'albums') {
            dispatch(setRangeSelected(rowData));
            dispatch(toggleRangeSelected(searchQuery !== '' ? filteredData : data?.album));
          }
        }
      }, 100);
    }
  };

  const handleRowDoubleClick = (e: any) => {
    window.clearTimeout(timeout);
    timeout = null;
    dispatch(clearSelected());

    if (page === 'tracks') {
      dispatch(
        setPlayQueueByRowClick({
          entries: data.song,
          currentIndex: e.index,
          currentSongId: e.id,
          uniqueSongId: e.uniqueId,
        })
      );
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    } else if (page === 'albums') {
      history.push(`/library/album/${e.id}`);
    } else {
      history.push(`/library/artist/${e.id}`);
    }
  };

  const handleRowFavorite = async (rowData: any) => {
    await unstar(rowData.id, 'music');
    dispatch(setStar({ id: [rowData.id], type: 'unstar' }));
    await queryClient.refetchQueries(['starred'], {
      active: true,
    });
  };

  const handleRowFavoriteAlbum = async (rowData: any) => {
    await unstar(rowData.id, 'album');
    await queryClient.refetchQueries(['starred'], {
      active: true,
    });
  };

  const handleRowFavoriteArtist = async (rowData: any) => {
    await unstar(rowData.id, 'artist');
    await queryClient.refetchQueries(['starred'], {
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
            <Nav activeKey={page} onSelect={(e) => setPage(e)}>
              <StyledNavItem eventKey="tracks">Tracks</StyledNavItem>
              <StyledNavItem eventKey="albums">Albums</StyledNavItem>
              <StyledNavItem eventKey="artists">Artists</StyledNavItem>
            </Nav>
          }
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showViewTypeButtons={page !== 'tracks'}
          viewTypeSetting="album"
          showSearchBar
          handleListClick={() => setViewType('list')}
          handleGridClick={() => setViewType('grid')}
        />
      }
    >
      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          {page === 'tracks' && (
            <ListViewType
              data={searchQuery !== '' ? filteredData : data.song}
              tableColumns={settings.getSync('musicListColumns')}
              handleRowClick={handleRowClick}
              handleRowDoubleClick={handleRowDoubleClick}
              rowHeight={Number(settings.getSync('musicListRowHeight'))}
              fontSize={settings.getSync('musicListFontSize')}
              cacheImages={{
                enabled: settings.getSync('cacheImages'),
                cacheType: 'album',
                cacheIdProperty: 'albumId',
              }}
              listType="music"
              virtualized
              disabledContextMenuOptions={['removeFromCurrent', 'moveSelectedTo', 'deletePlaylist']}
              handleFavorite={handleRowFavorite}
            />
          )}
          {page === 'albums' && (
            <>
              {viewType === 'list' && (
                <ListViewType
                  data={searchQuery !== '' ? filteredData : data.album}
                  tableColumns={settings.getSync('albumListColumns')}
                  rowHeight={Number(settings.getSync('albumListRowHeight'))}
                  fontSize={settings.getSync('albumListFontSize')}
                  handleRowClick={handleRowClick}
                  handleRowDoubleClick={handleRowDoubleClick}
                  cacheImages={{
                    enabled: settings.getSync('cacheImages'),
                    cacheType: 'album',
                    cacheIdProperty: 'albumId',
                  }}
                  listType="album"
                  virtualized
                  disabledContextMenuOptions={[
                    'removeFromCurrent',
                    'moveSelectedTo',
                    'deletePlaylist',
                  ]}
                  handleFavorite={handleRowFavoriteAlbum}
                />
              )}
              {viewType === 'grid' && (
                <GridViewType
                  data={searchQuery !== '' ? filteredData : data.album}
                  cardTitle={{
                    prefix: '/library/album',
                    property: 'name',
                    urlProperty: 'albumId',
                  }}
                  cardSubtitle={{
                    prefix: 'artist',
                    property: 'artist',
                    urlProperty: 'artistId',
                    unit: '',
                  }}
                  playClick={{ type: 'album', idProperty: 'id' }}
                  size={Number(settings.getSync('gridCardSize'))}
                  cacheType="album"
                  handleFavorite={handleRowFavoriteAlbum}
                />
              )}
            </>
          )}
          {page === 'artists' && (
            <>
              {viewType === 'list' && (
                <ListViewType
                  data={searchQuery !== '' ? filteredData : data.artist}
                  tableColumns={settings.getSync('artistListColumns')}
                  rowHeight={Number(settings.getSync('artistListRowHeight'))}
                  fontSize={settings.getSync('artistListFontSize')}
                  handleRowClick={handleRowClick}
                  handleRowDoubleClick={handleRowDoubleClick}
                  cacheImages={{
                    enabled: false,
                    cacheType: 'artist',
                    cacheIdProperty: 'id',
                  }}
                  listType="artist"
                  virtualized
                  disabledContextMenuOptions={[
                    'removeFromCurrent',
                    'moveSelectedTo',
                    'addToPlaylist',
                    'deletePlaylist',
                  ]}
                  handleFavorite={handleRowFavoriteArtist}
                />
              )}
              {viewType === 'grid' && (
                <GridViewType
                  data={searchQuery !== '' ? filteredData : data.artist}
                  cardTitle={{
                    prefix: '/library/artist',
                    property: 'name',
                    urlProperty: 'id',
                  }}
                  cardSubtitle={{
                    property: 'albumCount',
                    unit: ' albums',
                  }}
                  playClick={{ type: 'artist', idProperty: 'id' }}
                  size={Number(settings.getSync('gridCardSize'))}
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
