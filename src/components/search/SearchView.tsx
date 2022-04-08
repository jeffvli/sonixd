import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { Icon, Nav } from 'rsuite';
import { useHistory } from 'react-router-dom';
import { useInfiniteQuery, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import useRouterQuery from '../../hooks/useRouterQuery';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fixPlayer2Index, setPlayQueueByRowClick } from '../../redux/playQueueSlice';
import { setStatus } from '../../redux/playerSlice';
import {
  StyledButton,
  StyledInput,
  StyledInputGroup,
  StyledInputGroupButton,
  StyledNavItem,
} from '../shared/styled';
import { apiController } from '../../api/controller';
import { Album, Artist, Item, Song } from '../../types';
import useListClickHandler from '../../hooks/useListClickHandler';
import ListViewType from '../viewtypes/ListViewType';
import useFavorite from '../../hooks/useFavorite';
import { useRating } from '../../hooks/useRating';

const SearchView = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const history = useHistory();
  const query = useRouterQuery();
  const urlQuery = query.get('query') || '';
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const playQueue = useAppSelector((state) => state.playQueue);
  const folder = useAppSelector((state) => state.folder);
  const config = useAppSelector((state) => state.config);
  const [search, setSearch] = useState(urlQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(urlQuery);
  const [musicFolder, setMusicFolder] = useState({ loaded: false, id: undefined });
  const [nav, setNav] = useState<'songs' | 'albums' | 'artists'>('songs');
  const [artistData, setArtistData] = useState<Artist[]>([]);
  const [albumData, setAlbumData] = useState<Album[]>([]);
  const [songData, setSongData] = useState<Song[]>([]);

  useEffect(() => {
    if (folder.applied.search) {
      setMusicFolder({ loaded: true, id: folder.musicFolder });
    } else {
      setMusicFolder({ loaded: true, id: undefined });
    }
  }, [folder]);

  const debouncedSearchHandler = useMemo(
    () =>
      _.debounce((e) => {
        setDebouncedSearchQuery(e);
        history.replace(`/search?query=${e}`);
      }, 300),
    [history]
  );

  const {
    data: songResults,
    isLoading: isLoadingSongs,
    fetchNextPage: fetchNextSongPage,
    isFetchingNextPage: isFetchingNextSongPage,
    hasNextPage: hasNextSongPage,
  }: any = useInfiniteQuery(
    ['searchpage', debouncedSearchQuery, { type: Item.Music, count: 50 }, musicFolder.id],
    ({ pageParam = 0 }) =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getSearch',
        args: {
          query: debouncedSearchQuery,
          songCount: 50,
          songOffset: pageParam,
          albumCount: 0,
          artistCount: 0,
          musicFolderId: musicFolder.id,
        },
      }),
    {
      enabled: debouncedSearchQuery !== '' && musicFolder.loaded,
      getNextPageParam: (lastPage) => lastPage.song.nextCursor,
      staleTime: 5 * 60 * 1000,
    }
  );

  const {
    data: albumResults,
    isLoading: isLoadingAlbums,
    fetchNextPage: fetchNextAlbumPage,
    isFetchingNextPage: isFetchingNextAlbumPage,
    hasNextPage: hasNextAlbumPage,
  }: any = useInfiniteQuery(
    ['searchpage', debouncedSearchQuery, { type: Item.Album, count: 25 }, musicFolder.id],
    ({ pageParam = 0 }) =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getSearch',
        args: {
          query: debouncedSearchQuery,
          albumCount: 25,
          albumOffset: pageParam,
          songCount: 0,
          artistCount: 0,
          musicFolderId: musicFolder.id,
        },
      }),
    {
      enabled: debouncedSearchQuery !== '' && musicFolder.loaded,
      getNextPageParam: (lastPage) => lastPage.album.nextCursor,
      staleTime: 5 * 60 * 1000,
    }
  );

  const {
    data: artistResults,
    isLoading: isLoadingArtists,
    fetchNextPage: fetchNextArtistPage,
    isFetchingNextPage: isFetchingNextArtistPage,
    hasNextPage: hasNextArtistPage,
  }: any = useInfiniteQuery(
    ['searchpage', debouncedSearchQuery, { type: Item.Artist, count: 15 }, musicFolder.id],
    ({ pageParam = 0 }) =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getSearch',
        args: {
          query: debouncedSearchQuery,
          artistCount: 15,
          artistOffset: pageParam,
          songCount: 0,
          albumCount: 0,
          musicFolderId: musicFolder.id,
        },
      }),
    {
      enabled: debouncedSearchQuery !== '' && musicFolder.loaded,
      getNextPageParam: (lastPage) => lastPage.artist.nextCursor,
      staleTime: 5 * 60 * 1000,
    }
  );

  useEffect(() => {
    setSongData(
      _.flatten(
        songResults?.pages.map((page: any) => {
          return page.song.data;
        })
      )
    );
  }, [songResults]);

  useEffect(() => {
    setAlbumData(
      _.flatten(
        albumResults?.pages.map((page: any) => {
          return page.album.data;
        })
      )
    );
  }, [albumResults]);

  useEffect(() => {
    setArtistData(
      _.flatten(
        artistResults?.pages.map((page: any) => {
          return page.artist.data;
        })
      )
    );
  }, [artistResults]);

  const { handleFavorite } = useFavorite();
  const { handleRating } = useRating();

  const { handleRowClick, handleRowDoubleClick } = useListClickHandler({
    doubleClick: (rowData: any) => {
      if (rowData.isDir) {
        history.push(`/library/folder?folderId=${rowData.parent}`);
      } else {
        dispatch(
          setPlayQueueByRowClick({
            entries: songData.filter((entry: any) => entry.isDir !== true),
            currentIndex: rowData.rowIndex,
            currentSongId: rowData.id,
            uniqueSongId: rowData.uniqueId,
            filters: config.playback.filters,
          })
        );
        dispatch(setStatus('PLAYING'));
        dispatch(fixPlayer2Index());
      }
    },
  });

  const { handleRowClick: handleAlbumRowClick, handleRowDoubleClick: handleAlbumRowDoubleClick } =
    useListClickHandler({
      doubleClick: (rowData: any) => history.push(`/library/album/${rowData.id}`),
    });

  const { handleRowClick: handleArtistRowClick, handleRowDoubleClick: handleArtistRowDoubleClick } =
    useListClickHandler({
      doubleClick: (rowData: any) => history.push(`/library/artist/${rowData.id}`),
    });

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          title={
            <>
              {t('Search')}{' '}
              <StyledButton
                loading={
                  nav === 'songs'
                    ? isFetchingNextSongPage
                    : nav === 'albums'
                    ? isFetchingNextAlbumPage
                    : nav === 'artists'
                    ? isFetchingNextArtistPage
                    : false
                }
                disabled={
                  nav === 'songs'
                    ? !hasNextSongPage
                    : nav === 'albums'
                    ? !hasNextAlbumPage
                    : nav === 'artists'
                    ? !hasNextArtistPage
                    : false
                }
                onClick={() => {
                  if (nav === 'songs') {
                    fetchNextSongPage();
                  }

                  if (nav === 'albums') {
                    fetchNextAlbumPage();
                  }

                  if (nav === 'artists') {
                    fetchNextArtistPage();
                  }
                }}
              >
                {t('Load more')}
              </StyledButton>
            </>
          }
          subtitle={
            <>
              <StyledInputGroup inside style={{ width: '50vw', maxWidth: '95%' }}>
                <StyledInput
                  id="local-search-input"
                  value={search}
                  onChange={(e: string) => {
                    debouncedSearchHandler(e);
                    setSearch(e);
                  }}
                />
                {search !== '' && (
                  <StyledInputGroupButton
                    height={30}
                    appearance="subtle"
                    tabIndex={0}
                    onClick={() => {
                      setDebouncedSearchQuery('');
                      setSearch('');
                    }}
                    onKeyDown={(e: KeyboardEvent) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        setDebouncedSearchQuery('');
                        setSearch('');
                      }
                    }}
                  >
                    <Icon icon="close" />
                  </StyledInputGroupButton>
                )}
              </StyledInputGroup>

              <Nav activeKey={nav} onSelect={setNav}>
                <StyledNavItem eventKey="songs">
                  {t('Songs')} ({songData?.length}
                  {hasNextSongPage && '+'})
                </StyledNavItem>
                <StyledNavItem eventKey="albums">
                  {t('Albums')} ({albumData?.length}
                  {hasNextAlbumPage && '+'})
                </StyledNavItem>
                <StyledNavItem eventKey="artists">
                  {t('Artists')} ({artistData?.length}
                  {hasNextArtistPage && '+'})
                </StyledNavItem>
              </Nav>
            </>
          }
        />
      }
    >
      {nav === 'songs' && (
        <ListViewType
          loading={isLoadingSongs}
          data={songData}
          tableColumns={config.lookAndFeel.listView.music.columns}
          rowHeight={config.lookAndFeel.listView.music.rowHeight}
          fontSize={config.lookAndFeel.listView.music.fontSize}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          handleRating={(rowData: any, rating: number) =>
            handleRating(rowData, {
              rating,
              custom: () =>
                queryClient.refetchQueries([
                  'searchpage',
                  debouncedSearchQuery,
                  { type: Item.Music, count: 50 },
                  musicFolder.id,
                ]),
            })
          }
          handleFavorite={(rowData: any) =>
            handleFavorite(rowData, {
              custom: () =>
                queryClient.refetchQueries([
                  'searchpage',
                  debouncedSearchQuery,
                  { type: Item.Music, count: 50 },
                  musicFolder.id,
                ]),
            })
          }
          listType="music"
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'album',
            cacheIdProperty: 'albumId',
          }}
          disabledContextMenuOptions={['deletePlaylist', 'viewInModal']}
          playQueue={playQueue}
          multiSelect={multiSelect}
          isModal={false}
          miniView={false}
          dnd={false}
          virtualized
        />
      )}

      {nav === 'albums' && (
        <ListViewType
          loading={isLoadingAlbums}
          data={albumData}
          tableColumns={config.lookAndFeel.listView.album.columns}
          rowHeight={config.lookAndFeel.listView.album.rowHeight}
          fontSize={config.lookAndFeel.listView.album.fontSize}
          handleRowClick={handleAlbumRowClick}
          handleRowDoubleClick={handleAlbumRowDoubleClick}
          handleRating={(rowData: any, rating: number) =>
            handleRating(rowData, {
              rating,
              custom: () =>
                queryClient.refetchQueries([
                  'searchpage',
                  debouncedSearchQuery,
                  { type: Item.Album, count: 25 },
                  musicFolder.id,
                ]),
            })
          }
          handleFavorite={(rowData: any) =>
            handleFavorite(rowData, {
              custom: () =>
                queryClient.refetchQueries([
                  'searchpage',
                  debouncedSearchQuery,
                  { type: Item.Album, count: 25 },
                  musicFolder.id,
                ]),
            })
          }
          listType="album"
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'album',
            cacheIdProperty: 'albumId',
          }}
          disabledContextMenuOptions={['deletePlaylist', 'viewInModal']}
          playQueue={playQueue}
          multiSelect={multiSelect}
          isModal={false}
          miniView={false}
          dnd={false}
          virtualized
        />
      )}

      {nav === 'artists' && (
        <ListViewType
          loading={isLoadingArtists}
          data={artistData}
          tableColumns={config.lookAndFeel.listView.artist.columns}
          rowHeight={config.lookAndFeel.listView.artist.rowHeight}
          fontSize={config.lookAndFeel.listView.artist.fontSize}
          handleRowClick={handleArtistRowClick}
          handleRowDoubleClick={handleArtistRowDoubleClick}
          handleRating={(rowData: any, rating: number) =>
            handleRating(rowData, {
              rating,
              custom: () =>
                queryClient.refetchQueries([
                  'searchpage',
                  debouncedSearchQuery,
                  { type: Item.Artist, count: 15 },
                  musicFolder.id,
                ]),
            })
          }
          handleFavorite={(rowData: any) =>
            handleFavorite(rowData, {
              custom: () =>
                queryClient.refetchQueries([
                  'searchpage',
                  debouncedSearchQuery,
                  { type: Item.Artist, count: 15 },
                  musicFolder.id,
                ]),
            })
          }
          listType="artist"
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'artist',
            cacheIdProperty: 'id',
          }}
          disabledContextMenuOptions={['deletePlaylist', 'viewInModal']}
          playQueue={playQueue}
          multiSelect={multiSelect}
          isModal={false}
          miniView={false}
          dnd={false}
          virtualized
        />
      )}
    </GenericPage>
  );
};

export default SearchView;
