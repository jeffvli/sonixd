import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { ButtonGroup, Button } from 'rsuite';
import { useAppDispatch } from '../../redux/hooks';
import { clearPlayQueue, setPlayQueue } from '../../redux/playQueueSlice';
import { getStarred } from '../../api/api';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import Loader from '../loader/Loader';
import ListViewType from '../viewtypes/ListViewType';

const trackTableColumns = [
  {
    header: '#',
    dataKey: 'index',
    alignment: 'center',
    width: 70,
  },
  {
    header: 'Title',
    dataKey: 'title',
    alignment: 'left',
    resizable: true,
    width: 350,
  },

  {
    header: 'Artist',
    dataKey: 'artist',
    alignment: 'center',
    resizable: true,
    width: 300,
  },
  {
    header: 'Album',
    dataKey: 'album',
    alignment: 'center',
    resizable: true,
    width: 300,
  },
  {
    header: 'Duration',
    dataKey: 'duration',
    alignment: 'center',
    resizable: true,
    width: 70,
  },
];

const albumTableColumns = [
  {
    header: '#',
    dataKey: 'index',
    alignment: 'center',
    width: 70,
  },
  {
    header: 'Title',
    dataKey: 'name',
    alignment: 'left',
    resizable: true,
    width: 350,
  },

  {
    header: 'Artist',
    dataKey: 'artist',
    alignment: 'center',
    resizable: true,
    width: 300,
  },
  {
    header: 'Tracks',
    dataKey: 'songCount',
    alignment: 'center',
    resizable: true,
    width: 300,
  },
  {
    header: 'Duration',
    dataKey: 'duration',
    alignment: 'center',
    resizable: true,
    width: 70,
  },
];

const StarredView = () => {
  const [currentPage, setCurrentPage] = useState('Tracks');
  const [searchQuery, setSearchQuery] = useState('');
  const { isLoading, isError, data: starred, error }: any = useQuery(
    'starred',
    getStarred
  );

  const dispatch = useAppDispatch();

  const handleRowClick = (e: any) => {
    const newPlayQueue = starred.song.slice([e.index], starred.song.length);
    dispatch(clearPlayQueue());
    dispatch(setPlayQueue(newPlayQueue));
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <GenericPage
      header={
        <GenericPageHeader
          title={`Starred (${currentPage})`}
          subtitle={
            <ButtonGroup>
              <Button
                appearance="subtle"
                onClick={() => setCurrentPage('Tracks')}
              >
                Tracks
              </Button>
              <Button
                appearance="subtle"
                onClick={() => setCurrentPage('Albums')}
              >
                Albums
              </Button>
              <Button
                appearance="subtle"
                onClick={() => setCurrentPage('Artists')}
              >
                Artists
              </Button>
            </ButtonGroup>
          }
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showViewTypeButtons={currentPage !== 'Tracks'}
          showSearchBar
        />
      }
    >
      {currentPage === 'Tracks' && (
        <ListViewType
          data={
            searchQuery === ''
              ? starred.song
              : starred.song.filter((song: any) => {
                  return song.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
                })
          }
          tableColumns={trackTableColumns}
          handleRowClick={handleRowClick}
          virtualized
        />
      )}
      {currentPage === 'Albums' && (
        <ListViewType
          data={
            searchQuery === ''
              ? starred.album
              : starred.album.filter((album: any) => {
                  return album.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
                })
          }
          tableColumns={albumTableColumns}
          handleRowClick={handleRowClick}
          virtualized
        />
      )}
    </GenericPage>
  );
};

export default StarredView;
