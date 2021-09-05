import React, { useState } from 'react';
import settings from 'electron-settings';
import { useQuery, useQueryClient } from 'react-query';
import { SelectPicker } from 'rsuite';
import GridViewType from '../viewtypes/GridViewType';
import ListViewType from '../viewtypes/ListViewType';
import useSearchQuery from '../../hooks/useSearchQuery';
import GenericPageHeader from '../layout/GenericPageHeader';
import GenericPage from '../layout/GenericPage';
import { getAllAlbums } from '../../api/api';
import PageLoader from '../loader/PageLoader';
import { useAppDispatch } from '../../redux/hooks';
import {
  toggleSelected,
  setRangeSelected,
  toggleRangeSelected,
  setSelected,
} from '../../redux/multiSelectSlice';

const ALBUM_SORT_TYPES = [
  { label: 'A-Z (Name)', value: 'alphabeticalByName' },
  {
    label: 'A-Z (Artist)',
    value: 'alphabeticalByArtist',
  },
  { label: 'Most Played', value: 'frequent' },
  { label: 'Newly Added', value: 'newest' },
  { label: 'Recently Played', value: 'recent' },
];

const AlbumList = () => {
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState('newest');
  const [offset, setOffset] = useState(0);
  const [viewType, setViewType] = useState(settings.getSync('albumViewType'));
  const { isLoading, isError, data: albums, error }: any = useQuery(
    ['albumList', offset, sortBy],
    () => getAllAlbums(offset, sortBy),
    {
      refetchOnWindowFocus: false,
    }
  );
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(searchQuery, albums, ['name', 'artist']);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          if (searchQuery !== '') {
            dispatch(toggleRangeSelected(filteredData));
          } else {
            dispatch(toggleRangeSelected(albums));
          }
        } else {
          dispatch(setSelected(rowData));
        }
      }, 300);
    }
  };

  return (
    <GenericPage
      header={
        <GenericPageHeader
          title="Albums"
          subsidetitle={
            <SelectPicker
              defaultValue={sortBy}
              data={ALBUM_SORT_TYPES}
              searchable={false}
              placeholder="Sort Type"
              menuAutoWidth
              onChange={async (value) => {
                setOffset(0);
                setSortBy(value);
                await queryClient.refetchQueries(['albumList'], {
                  active: true,
                });
              }}
            />
          }
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showViewTypeButtons
          viewTypeSetting="album"
          showSearchBar
          handleListClick={() => setViewType('list')}
          handleGridClick={() => setViewType('grid')}
        />
      }
    >
      {isLoading && <PageLoader />}
      {isError && <div>Error: {error}</div>}
      {!isLoading && !isError && viewType === 'list' && (
        <ListViewType
          data={searchQuery !== '' ? filteredData : albums}
          tableColumns={settings.getSync('albumListColumns')}
          rowHeight={Number(settings.getSync('albumListRowHeight'))}
          fontSize={settings.getSync('albumListFontSize')}
          handleRowClick={handleRowClick}
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'album',
            cacheIdProperty: 'albumId',
          }}
          listType="album"
          virtualized
        />
      )}

      {!isLoading && !isError && viewType === 'grid' && (
        <GridViewType
          data={searchQuery !== '' ? filteredData : albums}
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
          size="150px"
          cacheType="album"
        />
      )}
    </GenericPage>
  );
};

export default AlbumList;
