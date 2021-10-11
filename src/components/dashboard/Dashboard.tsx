import React, { useState } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { useHistory } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { getAlbums, star, unstar } from '../../api/api';
import PageLoader from '../loader/PageLoader';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import ScrollingMenu from '../scrollingmenu/ScrollingMenu';
import { useAppDispatch } from '../../redux/hooks';
import { setStar } from '../../redux/playQueueSlice';

const Dashboard = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
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

  const handleFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await star(rowData.id, 'album');
      dispatch(setStar({ id: [rowData.id], type: 'star' }));
      queryClient.setQueryData(['recentAlbums'], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = Date.now();
        });

        return oldData;
      });
      queryClient.setQueryData(['newestAlbums'], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = Date.now();
        });

        return oldData;
      });
      queryClient.setQueryData(['randomAlbums'], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = Date.now();
        });

        return oldData;
      });
      queryClient.setQueryData(['frequentAlbums'], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await unstar(rowData.id, 'album');
      dispatch(setStar({ id: [rowData.id], type: 'unstar' }));
      queryClient.setQueryData(['recentAlbums'], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = undefined;
        });

        return oldData;
      });
      queryClient.setQueryData(['newestAlbums'], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = undefined;
        });

        return oldData;
      });
      queryClient.setQueryData(['randomAlbums'], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = undefined;
        });

        return oldData;
      });
      queryClient.setQueryData(['frequentAlbums'], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = undefined;
        });

        return oldData;
      });
    }
  };

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
              prefix: '/library/artist',
              property: 'artist',
              urlProperty: 'artistId',
            }}
            cardSize={cardSize}
            onClickTitle={() => history.push(`/library/album?sortType=recent`)}
            type="album"
            handleFavorite={handleFavorite}
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
              prefix: '/library/artist',
              property: 'artist',
              urlProperty: 'artistId',
            }}
            cardSize={cardSize}
            onClickTitle={() => history.push(`/library/album?sortType=newest`)}
            type="album"
            handleFavorite={handleFavorite}
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
              prefix: '/library/artist',
              property: 'artist',
              urlProperty: 'artistId',
            }}
            cardSize={cardSize}
            onClickTitle={() => history.push(`/library/album?sortType=random`)}
            type="album"
            handleFavorite={handleFavorite}
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
              prefix: '/library/artist',
              property: 'artist',
              urlProperty: 'artistId',
            }}
            cardSize={cardSize}
            onClickTitle={() => history.push(`/library/album?sortType=frequent`)}
            type="album"
            handleFavorite={handleFavorite}
          />
        </>
      )}
    </GenericPage>
  );
};

export default Dashboard;
