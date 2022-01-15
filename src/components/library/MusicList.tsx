import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { ButtonToolbar } from 'rsuite';
import { useQuery, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
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
import { StyledInputPicker, StyledInputPickerContainer, StyledTag } from '../shared/styled';
import { RefreshButton } from '../shared/ToolbarButtons';
import { setSearchQuery } from '../../redux/miscSlice';
import { apiController } from '../../api/controller';
import { Item } from '../../types';
import useColumnSort from '../../hooks/useColumnSort';
import { fixPlayer2Index, setPlayQueueByRowClick, setStar } from '../../redux/playQueueSlice';
import { setFilter, setPagination } from '../../redux/viewSlice';
import { setStatus } from '../../redux/playerSlice';

export const MUSIC_SORT_TYPES = [
  { label: i18next.t('A-Z (Name)'), value: 'alphabeticalByName', role: i18next.t('Default') },
  { label: i18next.t('A-Z (Album)'), value: 'alphabeticalByAlbum', role: i18next.t('Default') },
  { label: i18next.t('A-Z (Album Artist)'), value: 'alphabeticalByArtist', role: i18next.t('Default') },
  { label: i18next.t('A-Z (Artist)'), value: 'alphabeticalByTrackArtist', replacement: 'Artist' },
  { label: i18next.t('Most Played'), value: 'frequent', role: i18next.t('Default') },
  { label: i18next.t('Random'), value: 'random', role: i18next.t('Default') },
  { label: i18next.t('Recently Added'), value: 'newest', role: i18next.t('Default') },
  { label: i18next.t('Recently Played'), value: 'recent', role: i18next.t('Default') },
  { label: i18next.t('Release Date'), value: 'year', role: i18next.t('Default') },
];

const MusicList = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const folder = useAppSelector((state) => state.folder);
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const view = useAppSelector((state) => state.view);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortTypes, setSortTypes] = useState<any[]>([]);
  const [musicFolder, setMusicFolder] = useState({ loaded: false, id: undefined });

  const musicFilterPickerContainerRef = useRef(null);
  const [currentQueryKey, setCurrentQueryKey] = useState<any>(['musicList']);

  useEffect(() => {
    if (folder.applied.music) {
      setMusicFolder({ loaded: true, id: folder.musicFolder });
    } else {
      setMusicFolder({ loaded: true, id: undefined });
    }

    setCurrentQueryKey([
      'musicList',
      view.music.filter,
      view.music.pagination.activePage,
      musicFolder.id,
    ]);
  }, [
    folder.applied.music,
    folder.musicFolder,
    musicFolder.id,
    view.music.filter,
    view.music.pagination.activePage,
  ]);

  const { isLoading, isError, data: musicData, error }: any = useQuery(
    currentQueryKey,
    () =>
      view.music.filter === 'random' || view.music.pagination.recordsPerPage !== 0
        ? apiController({
            serverType: config.serverType,
            endpoint: 'getSongs',
            args: {
              type: view.music.filter,
              size:
                view.music.pagination.recordsPerPage === 0
                  ? 100
                  : view.music.pagination.recordsPerPage,
              offset: (view.music.pagination.activePage - 1) * view.music.pagination.recordsPerPage,
              recursive: false,
              musicFolderId: musicFolder.id,
              order: [
                'alphabeticalByName',
                'alphabeticalByAlbum',
                'alphabeticalByArtist',
                'alphabeticalByTrackArtist',
                'newest',
              ].includes(view.music.filter)
                ? 'asc'
                : 'desc',
            },
          })
        : apiController({
            serverType: config.serverType,
            endpoint: 'getSongs',
            args: {
              type: view.music.filter,
              recursive: true,
              musicFolderId: musicFolder.id,
            },
          }),
    {
      // Due to extensive fetch times without pagination, we want to cache for the entire session
      cacheTime: view.music.pagination.recordsPerPage !== 0 ? 600000 : Infinity,
      staleTime: view.music.pagination.recordsPerPage !== 0 ? 600000 : Infinity,
      enabled: currentQueryKey !== ['musicList'] && musicFolder.loaded,
      onSuccess: (e) => {
        dispatch(
          setPagination({
            listType: Item.Music,
            data: {
              pages: Math.floor(e.totalRecordCount / view.music.pagination.recordsPerPage) + 1,
            },
          })
        );
      },
    }
  );

  const searchedData = useSearchQuery(misc.searchQuery, musicData?.data, [
    'title',
    'artist',
    'genre',
    'year',
  ]);

  const { sortedData } = useColumnSort(musicData?.data, Item.Album, view.music.sort);

  useEffect(() => {
    setSortTypes(MUSIC_SORT_TYPES);
  }, []);

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
    dispatch(
      setPlayQueueByRowClick({
        entries: musicData.data,
        currentIndex: rowData.rowIndex,
        currentSongId: rowData.id,
        uniqueSongId: rowData.uniqueId,
        filters: config.playback.filters,
      })
    );
    dispatch(setStatus('PLAYING'));
    dispatch(fixPlayer2Index());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.removeQueries(['musicList'], { exact: false });
    setIsRefreshing(false);
  };

  const handleRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'music' },
      });
      dispatch(setStar({ id: [rowData.id], type: 'star' }));

      queryClient.setQueryData(currentQueryKey, (oldData: any) => {
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
        args: { id: rowData.id, type: 'music' },
      });
      dispatch(setStar({ id: [rowData.id], type: 'unstar' }));

      queryClient.setQueryData(currentQueryKey, (oldData: any) => {
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

    queryClient.setQueryData(currentQueryKey, (oldData: any) => {
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
              {t('Songs')}{' '}
              <StyledTag style={{ verticalAlign: 'middle', cursor: 'default' }}>
                {musicData?.totalRecordCount || '...'}
              </StyledTag>
            </>
          }
          subtitle={
            <>
              <StyledInputPickerContainer ref={musicFilterPickerContainerRef}>
                <ButtonToolbar>
                  <StyledInputPicker
                    container={() => musicFilterPickerContainerRef.current}
                    size="sm"
                    width={180}
                    defaultValue={view.music.filter}
                    value={view.music.filter}
                    data={sortTypes || MUSIC_SORT_TYPES}
                    cleanable={false}
                    placeholder={t('Sort Type')}
                    onChange={async (value: string) => {
                      setIsRefreshing(true);
                      await queryClient.cancelQueries([
                        'musicList',
                        view.music.filter,
                        musicFolder.id,
                      ]);
                      dispatch(setSearchQuery(''));
                      dispatch(setFilter({ listType: Item.Music, data: value }));
                      dispatch(setPagination({ listType: Item.Music, data: { activePage: 1 } }));
                      localStorage.setItem('scroll_list_musicList', '0');
                      setIsRefreshing(false);
                    }}
                  />
                  <RefreshButton onClick={handleRefresh} size="sm" loading={isRefreshing} />
                </ButtonToolbar>
              </StyledInputPickerContainer>
            </>
          }
        />
      }
    >
      {isError && <div>Error: {error}</div>}
      {!isError && (
        <ListViewType
          data={misc.searchQuery !== '' ? searchedData : sortedData}
          tableColumns={config.lookAndFeel.listView.music.columns}
          rowHeight={config.lookAndFeel.listView.music.rowHeight}
          fontSize={config.lookAndFeel.listView.music.fontSize}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          handleRating={handleRowRating}
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'album',
            cacheIdProperty: 'albumId',
          }}
          page="musicListPage"
          listType="music"
          virtualized
          disabledContextMenuOptions={[
            'moveSelectedTo',
            'removeSelected',
            'deletePlaylist',
            'viewInModal',
            'viewInFolder',
          ]}
          loading={isLoading}
          handleFavorite={handleRowFavorite}
          initialScrollOffset={Number(localStorage.getItem('scroll_list_musicList'))}
          onScroll={(scrollIndex: number) => {
            localStorage.setItem('scroll_list_musicList', String(Math.abs(scrollIndex)));
          }}
          paginationProps={
            view.music.pagination.recordsPerPage !== 0 && {
              pages: view.music.pagination.pages,
              activePage: view.music.pagination.activePage,
              maxButtons: 3,
              prev: true,
              next: true,
              ellipsis: true,
              boundaryLinks: true,
              startIndex:
                view.music.pagination.recordsPerPage * (view.music.pagination.activePage - 1) + 1,
              endIndex: view.music.pagination.recordsPerPage * view.music.pagination.activePage,
              handleGoToButton: (e: number) => {
                localStorage.setItem('scroll_list_musicList', '0');
                dispatch(
                  setPagination({
                    listType: Item.Music,
                    data: {
                      activePage: e,
                    },
                  })
                );
              },
              onSelect: async (e: number) => {
                localStorage.setItem('scroll_list_musicList', '0');
                await queryClient.cancelQueries(['musicList'], { active: true });
                dispatch(
                  setPagination({
                    listType: Item.Music,
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

export default MusicList;
