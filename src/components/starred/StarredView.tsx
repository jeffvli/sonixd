/* eslint-disable no-lonely-if */
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { Nav } from 'rsuite';
import settings from 'electron-settings';
import { useAppDispatch } from '../../redux/hooks';
import { clearPlayQueue, setPlayQueue } from '../../redux/playQueueSlice';
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
import Loader from '../loader/Loader';
import ListViewType from '../viewtypes/ListViewType';
import GridViewType from '../viewtypes/GridViewType';

const trackTableColumns = [
  {
    id: '#',
    dataKey: 'index',
    alignment: 'center',
    width: 70,
  },
  {
    id: 'Title',
    dataKey: 'title',
    alignment: 'left',
    resizable: true,
    width: 350,
  },

  {
    id: 'Artist',
    dataKey: 'artist',
    alignment: 'center',
    resizable: true,
    width: 300,
  },
  {
    id: 'Album',
    dataKey: 'album',
    alignment: 'center',
    resizable: true,
    width: 300,
  },
  {
    id: 'Duration',
    dataKey: 'duration',
    alignment: 'center',
    resizable: true,
    width: 70,
  },
];

const albumTableColumns = [
  {
    id: '#',
    dataKey: 'index',
    alignment: 'center',
    width: 70,
  },
  {
    id: 'Title',
    dataKey: 'name',
    alignment: 'left',
    resizable: true,
    width: 350,
  },

  {
    id: 'Artist',
    dataKey: 'artist',
    alignment: 'center',
    resizable: true,
    width: 300,
  },
  {
    id: 'Tracks',
    dataKey: 'songCount',
    alignment: 'center',
    resizable: true,
    width: 300,
  },
  {
    id: 'Duration',
    dataKey: 'duration',
    alignment: 'center',
    resizable: true,
    width: 70,
  },
];

const StarredView = () => {
  const [currentPage, setCurrentPage] = useState('Tracks');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [viewType, setViewType] = useState(
    settings.getSync('viewType') || 'list'
  );
  const { isLoading, isError, data, error }: any = useQuery(
    'starred',
    getStarred
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (searchQuery !== '') {
      switch (currentPage) {
        case 'Tracks':
          setFilteredData(
            data.song.filter((song: any) => {
              return song.title
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            })
          );
          break;
        case 'Albums':
          setFilteredData(
            data.album.filter((album: any) => {
              return album.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            })
          );
          break;
        default:
          break;
      }
    } else {
      setFilteredData([]);
    }
  }, [currentPage, searchQuery, data?.album, data?.song]);

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
    const newPlayQueue = data.song.slice([e.index], data.song.length);
    dispatch(clearPlayQueue());
    dispatch(clearSelected());
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
          title="Starred"
          subtitle={
            <Nav activeKey={currentPage} onSelect={(e) => setCurrentPage(e)}>
              <Nav.Item eventKey="Tracks">Tracks</Nav.Item>
              <Nav.Item eventKey="Albums">Albums</Nav.Item>
              <Nav.Item eventKey="Artists">Artists</Nav.Item>
            </Nav>
          }
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showViewTypeButtons={currentPage !== 'Tracks'}
          showSearchBar
          handleListClick={() => setViewType('list')}
          handleGridClick={() => setViewType('grid')}
        />
      }
    >
      {currentPage === 'Tracks' && (
        <ListViewType
          data={searchQuery !== '' ? filteredData : data.song}
          tableColumns={trackTableColumns}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          virtualized
        />
      )}
      {currentPage === 'Albums' && (
        <>
          {viewType === 'list' && (
            <ListViewType
              data={searchQuery !== '' ? filteredData : data.album}
              tableColumns={albumTableColumns}
              handleRowClick={handleRowClick}
              virtualized
            />
          )}
          {viewType === 'grid' && (
            <GridViewType
              data={searchQuery === '' ? data.album : filteredData}
              cardTitle={{
                prefix: 'playlist',
                property: 'name',
                urlProperty: 'id',
              }}
              cardSubtitle={{ prefix: 'playlist', property: 'songCount' }}
              playClick={{ type: 'album', idProperty: 'id' }}
              size="150px"
            />
          )}
        </>
      )}
    </GenericPage>
  );
};

export default StarredView;
