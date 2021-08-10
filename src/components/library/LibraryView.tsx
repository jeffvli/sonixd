/* eslint-disable react/button-has-type */
import React, { useEffect, useState } from 'react';
import { Loader, Nav, SelectPicker } from 'rsuite';
import VisibilitySensor from 'react-visibility-sensor';
import settings from 'electron-settings';
import _ from 'lodash';
import { getAlbumListDirect } from '../../api/api';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import AlbumList from './AlbumList';

const LibraryView = () => {
  const [currentPage, setCurrentPage] = useState('albums');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [viewType, setViewType] = useState(settings.getSync('viewType'));

  useEffect(() => {
    if (searchQuery !== '') {
      setFilteredData(
        data.filter((entry: any) => {
          return entry.name.toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    } else {
      setFilteredData([]);
    }
  }, [data, searchQuery]);

  // Deprecate react-query's infinite query in favor of VisibilitySensor
  // as infinite query as the caching is causing errors when reloading the page
  /* const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery(
    ['albumList', 'options'],
    () => getAlbumListDirect({ type: 'newest', size: 50, offset }),
    {
      // API does not provide a method to determine the total number of albums
      // thus we will always attempt to continue fetching
      getNextPageParam: () => 1,
      getPreviousPageParam: (firstPage, pages) => 1,
    }
  ); */

  function onChange(isVisible: boolean) {
    if (isVisible) {
      setOffset(offset + 50);

      setTimeout(async () => {
        const res = await getAlbumListDirect({
          type: 'random',
          size: 50,
          offset,
        });

        const combinedData = data.concat(res);

        // Ensure that no duplicates are added in the case of random fetching
        const uniqueCombinedData = _.uniqBy(combinedData, (e: any) => e.id);

        setData(uniqueCombinedData);
      }, 0);
    }
  }

  return (
    <GenericPage
      header={
        <GenericPageHeader
          title="Library"
          subtitle={
            <Nav activeKey={currentPage} onSelect={(e) => setCurrentPage(e)}>
              <Nav.Item eventKey="Albums">Albums</Nav.Item>
              <Nav.Item eventKey="Artists">Artists</Nav.Item>
              <Nav.Item eventKey="Genres">Genres</Nav.Item>
            </Nav>
          }
          subsidetitle={
            <SelectPicker
              data={[
                { label: 'A-Z (Name)', value: 'alphabeticaln' },
                {
                  label: 'A-Z (Artist)',
                  value: 'alphabeticala',
                },
                { label: 'Most Played', value: 'mostplayed' },
                { label: 'Newly Added', value: 'newlyadded' },
                { label: 'Recently Played', value: 'recent' },
              ]}
              searchable={false}
              placeholder="Sort Type"
              menuAutoWidth
            />
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
      {data && (
        <>
          {currentPage === 'albums' && (
            <AlbumList
              viewType={viewType}
              data={searchQuery === '' ? data : filteredData}
            />
          )}
        </>
      )}

      {data.length !== 1 && searchQuery === '' && (
        <VisibilitySensor onChange={onChange}>
          <div
            style={{
              textAlign: 'center',
              marginTop: '25px',
              marginBottom: '25px',
            }}
          >
            <Loader size="md" />
          </div>
        </VisibilitySensor>
      )}
    </GenericPage>
  );
};

export default LibraryView;
