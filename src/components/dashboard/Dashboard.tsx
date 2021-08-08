import React from 'react';
import { useQuery } from 'react-query';
import { getAlbumList, getRandomSongs } from '../../api/api';
import Loader from '../loader/Loader';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import ScrollingMenu from '../scrollingmenu/ScrollingMenu';

const Dashboard = () => {
  const {
    isLoading: isLoadingRecentAlbums,
    isError: isErrorRecentAlbums,
    data: recentAlbums,
    error: errorRecentAlbums,
  }: any = useQuery(
    ['recentAlbums', 'options'],
    () => getAlbumList({ type: 'recent', size: 50 }),
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const {
    isLoading: isLoadingNewestAlbums,
    isError: isErrorNewestAlbums,
    data: newestAlbums,
    error: errorNewestAlbums,
  }: any = useQuery(
    ['newestAlbums', 'options'],
    () => getAlbumList({ type: 'newest', size: 50 }),
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const {
    isLoading: isLoadingRandomAlbums,
    isError: isErrorRandomAlbums,
    data: randomAlbums,
    error: errorRandomAlbums,
  }: any = useQuery(
    ['randomAlbums', 'options'],
    () => getAlbumList({ type: 'random', size: 50 }),
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  if (isLoadingRecentAlbums || isLoadingNewestAlbums || isLoadingRandomAlbums) {
    return <Loader />;
  }

  if (isErrorRecentAlbums || isErrorNewestAlbums || isErrorRandomAlbums) {
    return <span>Error</span>;
  }

  return (
    <GenericPage header={<GenericPageHeader title="Dashboard" />}>
      <ScrollingMenu
        title="Recently Added"
        data={newestAlbums.album}
        routePrefix="album"
      />

      <ScrollingMenu
        title="Recently Played"
        data={recentAlbums.album}
        routePrefix="album"
      />

      <ScrollingMenu
        title="Random"
        data={randomAlbums.album}
        routePrefix="album"
      />
    </GenericPage>
  );
};

export default Dashboard;
