/* eslint-disable react/button-has-type */
import React, { useEffect, useState } from 'react';
import { Loader as RsuiteLoader, Nav, SelectPicker } from 'rsuite';
import { useQuery } from 'react-query';
import VisibilitySensor from 'react-visibility-sensor';
import settings from 'electron-settings';
import _ from 'lodash';
import { getAlbumsDirect, getArtists } from '../../api/api';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import AlbumList from './AlbumList';
import ArtistList from './ArtistList';
import Loader from '../loader/Loader';

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

const LibraryView = () => {
  const [currentPage, setCurrentPage] = useState('albums');
  const [sortBy, setCurrentSort] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [viewType, setViewType] = useState(settings.getSync('viewType'));

  const { isLoading: isLoadingArtists, data: artists }: any = useQuery(
    'playlists',
    getArtists,
    {
      enabled: currentPage === 'artists',
    }
  );

  useEffect(() => {
    if (searchQuery !== '') {
      if (currentPage === 'albums') {
        setFilteredData(
          data.filter((entry: any) => {
            return entry.name.toLowerCase().includes(searchQuery.toLowerCase());
          })
        );
      } else if (currentPage === 'artists') {
        setFilteredData(
          artists.filter((entry: any) => {
            return entry.name.toLowerCase().includes(searchQuery.toLowerCase());
          })
        );
      }
    } else {
      setFilteredData([]);
    }
  }, [artists, currentPage, data, searchQuery]);

  const onChange = (isVisible: boolean) => {
    if (isVisible) {
      setOffset(offset + 50);

      setTimeout(async () => {
        const res = await getAlbumsDirect({
          type: sortBy || 'random',
          size: 50,
          offset,
        });

        const combinedData = data.concat(res);

        // Ensure that no duplicates are added in the case of random fetching
        const uniqueCombinedData = _.uniqBy(combinedData, (e: any) => e.id);

        return setData(uniqueCombinedData);
      }, 0);
    }
  };

  const handleNavClick = (e: React.SetStateAction<string>) => {
    setData([]);
    setOffset(0);
    setCurrentPage(e);
  };

  return (
    <GenericPage
      header={
        <GenericPageHeader
          title="Library"
          subtitle={
            <Nav activeKey={currentPage} onSelect={handleNavClick}>
              <Nav.Item eventKey="albums">Albums</Nav.Item>
              <Nav.Item eventKey="artists">Artists</Nav.Item>
              <Nav.Item eventKey="genres">Genres</Nav.Item>
            </Nav>
          }
          subsidetitle={
            currentPage === 'albums' ? (
              <SelectPicker
                data={ALBUM_SORT_TYPES}
                searchable={false}
                placeholder="Sort Type"
                menuAutoWidth
                onChange={(value) => {
                  setData([]);
                  setOffset(0);
                  setCurrentSort(value);
                }}
              />
            ) : undefined
          }
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showViewTypeButtons={currentPage === 'albums'}
          showSearchBar
          handleListClick={() => setViewType('list')}
          handleGridClick={() => setViewType('grid')}
        />
      }
    >
      {isLoadingArtists && <Loader />}
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

      {artists && (
        <>
          {currentPage === 'artists' && (
            <ArtistList
              viewType={viewType}
              data={searchQuery === '' ? artists : filteredData}
            />
          )}
        </>
      )}

      {data.length !== 1 && searchQuery === '' && currentPage === 'albums' && (
        <VisibilitySensor onChange={onChange}>
          <div
            style={{
              textAlign: 'center',
              marginTop: '25px',
              marginBottom: '25px',
            }}
          >
            <RsuiteLoader size="md" />
          </div>
        </VisibilitySensor>
      )}
    </GenericPage>
  );
};

export default LibraryView;
