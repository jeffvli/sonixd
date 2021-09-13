import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Nav } from 'rsuite';
import settings from 'electron-settings';
import useSearchQuery from '../../hooks/useSearchQuery';
import { useAppDispatch } from '../../redux/hooks';
import {
  fixPlayer2Index,
  setPlayQueueByRowClick,
} from '../../redux/playQueueSlice';
import {
  clearSelected,
  setSelected,
  toggleSelected,
  toggleRangeSelected,
  setRangeSelected,
} from '../../redux/multiSelectSlice';
import { getStarred } from '../../api/api';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import PageLoader from '../loader/PageLoader';
import ListViewType from '../viewtypes/ListViewType';
import GridViewType from '../viewtypes/GridViewType';
import { setStatus } from '../../redux/playerSlice';
import { StyledNavItem } from '../shared/styled';

const StarredView = () => {
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState('Tracks');
  const [viewType, setViewType] = useState(
    settings.getSync('albumViewType') || 'list'
  );
  const { isLoading, isError, data, error }: any = useQuery(
    'starred',
    getStarred
  );
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(
    searchQuery,
    currentPage === 'Tracks'
      ? data?.song
      : currentPage === 'Albums'
      ? data?.album
      : data?.song,
    ['title', 'artist', 'album', 'name', 'genre']
  );

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          if (currentPage === 'Tracks') {
            dispatch(setRangeSelected(rowData));
            if (searchQuery !== '') {
              dispatch(toggleRangeSelected(filteredData));
            } else {
              dispatch(toggleRangeSelected(data.song));
            }
          } else if (currentPage === 'Albums') {
            dispatch(setRangeSelected(rowData));
            if (searchQuery !== '') {
              dispatch(toggleRangeSelected(filteredData));
            } else {
              dispatch(toggleRangeSelected(data.album));
            }
          } else {
            // !TODO
            data.song.slice();
          }
        } else {
          dispatch(setSelected(rowData));
        }
      }, 300);
    }
  };

  const handleRowDoubleClick = (e: any) => {
    window.clearTimeout(timeout);
    timeout = null;
    dispatch(clearSelected());
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
  };

  if (isLoading) {
    return <PageLoader />;
  }

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
            <Nav activeKey={currentPage} onSelect={(e) => setCurrentPage(e)}>
              <StyledNavItem eventKey="Tracks">Tracks</StyledNavItem>
              <StyledNavItem eventKey="Albums">Albums</StyledNavItem>
              <StyledNavItem eventKey="Artists">Artists</StyledNavItem>
            </Nav>
          }
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showViewTypeButtons={currentPage !== 'Tracks'}
          viewTypeSetting="album"
          showSearchBar
          handleListClick={() => setViewType('list')}
          handleGridClick={() => setViewType('grid')}
        />
      }
    >
      {currentPage === 'Tracks' && (
        <ListViewType
          data={searchQuery !== '' ? filteredData : data.song}
          tableColumns={settings.getSync('songListColumns')}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          rowHeight={Number(settings.getSync('songListRowHeight'))}
          fontSize={settings.getSync('songListFontSize')}
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'album',
            cacheIdProperty: 'albumId',
          }}
          listType="song"
          virtualized
        />
      )}
      {currentPage === 'Albums' && (
        <>
          {viewType === 'list' && (
            <ListViewType
              data={searchQuery !== '' ? filteredData : data.album}
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
          {viewType === 'grid' && (
            <GridViewType
              data={searchQuery === '' ? data.album : filteredData}
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
        </>
      )}
    </GenericPage>
  );
};

export default StarredView;
