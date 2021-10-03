import React, { useState } from 'react';
import settings from 'electron-settings';
import { useHistory } from 'react-router-dom';
import { useQuery } from 'react-query';
import { getAlbums } from '../../api/api';
import PageLoader from '../loader/PageLoader';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import ScrollingMenu from '../scrollingmenu/ScrollingMenu';

const Dashboard = () => {
  const history = useHistory();
  const cardSize = Number(settings.getSync('gridCardSize'));
  const [searchQuery, setSearchQuery] = useState('');

  const { isLoading: isLoadingRecent, data: recentAlbums }: any = useQuery(
    ['recentAlbums'],
    () => getAlbums({ type: 'recent', size: 20 }, 250),
    { refetchOnWindowFocus: false }
  );

  const { isLoading: isLoadingNewest, data: newestAlbums }: any = useQuery(
    ['newestAlbums'],
    () => getAlbums({ type: 'newest', size: 20 }, 250),
    { refetchOnWindowFocus: false }
  );

  const { isLoading: isLoadingRandom, data: randomAlbums }: any = useQuery(
    ['randomAlbums'],
    () => getAlbums({ type: 'random', size: 20 }, 250),
    { refetchOnWindowFocus: false }
  );

  const { isLoading: isLoadingFrequent, data: frequentAlbums }: any = useQuery(
    ['frequentAlbums'],
    () => getAlbums({ type: 'frequent', size: 20 }, 250),
    { refetchOnWindowFocus: false }
  );

  if (isLoadingRecent || isLoadingNewest || isLoadingRandom || isLoadingFrequent) {
    return (
      <GenericPage hideDivider header={<GenericPageHeader title="Dashboard" />}>
        <PageLoader />
      </GenericPage>
    );
  }

  return (
    <GenericPage
      header={
        <GenericPageHeader
          title="Dashboard"
          showSearchBar
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
        />
      }
      hideDivider
    >
      {newestAlbums && recentAlbums && randomAlbums && (
        <>
          <ScrollingMenu
            title="Recently Played"
            data={recentAlbums.album}
            cardTitle={{
              prefix: '/library/album',
              property: 'name',
              urlProperty: 'albumId',
            }}
            cardSubtitle={{
              prefix: 'artist',
              property: 'artist',
              urlProperty: 'artistId',
            }}
            cardSize={cardSize}
            onClickTitle={() => history.push(`/library/album?sortType=recent`)}
            type="album"
          />

          <ScrollingMenu
            title="Recently Added"
            data={newestAlbums.album}
            cardTitle={{
              prefix: '/library/album',
              property: 'name',
              urlProperty: 'albumId',
            }}
            cardSubtitle={{
              prefix: 'artist',
              property: 'artist',
              urlProperty: 'artistId',
            }}
            cardSize={cardSize}
            onClickTitle={() => history.push(`/library/album?sortType=newest`)}
            type="album"
          />

          <ScrollingMenu
            title="Random"
            data={randomAlbums.album}
            cardTitle={{
              prefix: '/library/album',
              property: 'name',
              urlProperty: 'albumId',
            }}
            cardSubtitle={{
              prefix: 'artist',
              property: 'artist',
              urlProperty: 'artistId',
            }}
            cardSize={cardSize}
            onClickTitle={() => history.push(`/library/album?sortType=random`)}
            type="album"
          />

          <ScrollingMenu
            title="Most Played"
            data={frequentAlbums.album}
            cardTitle={{
              prefix: '/library/album',
              property: 'name',
              urlProperty: 'albumId',
            }}
            cardSubtitle={{
              prefix: 'artist',
              property: 'artist',
              urlProperty: 'artistId',
            }}
            cardSize={cardSize}
            onClickTitle={() => history.push(`/library/album?sortType=frequent`)}
            type="album"
          />
        </>
      )}
    </GenericPage>
  );
};

export default Dashboard;
