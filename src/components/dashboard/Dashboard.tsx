import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import PageLoader from '../loader/PageLoader';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import ScrollingMenu from '../scrollingmenu/ScrollingMenu';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setStar } from '../../redux/playQueueSlice';
import { setActive } from '../../redux/albumSlice';
import { apiController } from '../../api/controller';
import { Server } from '../../types';

const Dashboard = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const folder = useAppSelector((state) => state.folder);
  const config = useAppSelector((state) => state.config);
  const album = useAppSelector((state) => state.album);
  const [musicFolder, setMusicFolder] = useState({ loaded: false, id: undefined });

  useEffect(() => {
    if (folder.applied.dashboard) {
      setMusicFolder({ loaded: true, id: folder.musicFolder });
    } else {
      setMusicFolder({ loaded: true, id: undefined });
    }
  }, [folder]);

  const { isLoading: isLoadingRecent, data: recentAlbums }: any = useQuery(
    ['recentAlbums', musicFolder.id],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: config.serverType === Server.Jellyfin ? 'getSongs' : 'getAlbums',
        args: { type: 'recent', size: 20, offset: 0, order: 'desc', musicFolderId: musicFolder.id },
      }),
    {
      refetchOnWindowFocus: true,
      refetchInterval: 30000,
      enabled: musicFolder.loaded,
    }
  );

  const { isLoading: isLoadingNewest, data: newestAlbums }: any = useQuery(
    ['newestAlbums', musicFolder.id],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getAlbums',
        args: { type: 'newest', size: 20, offset: 0, musicFolderId: musicFolder.id },
      }),
    {
      enabled: musicFolder.loaded,
    }
  );

  const { isLoading: isLoadingRandom, data: randomAlbums }: any = useQuery(
    ['randomAlbums', musicFolder.id],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getAlbums',
        args: { type: 'random', size: 20, offset: 0, musicFolderId: musicFolder.id },
      }),
    {
      enabled: musicFolder.loaded,
    }
  );

  const { isLoading: isLoadingFrequent, data: frequentAlbums }: any = useQuery(
    ['frequentAlbums', musicFolder.id],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: config.serverType === Server.Jellyfin ? 'getSongs' : 'getAlbums',
        args: {
          type: 'frequent',
          size: 20,
          offset: 0,
          order: 'desc',
          musicFolderId: musicFolder.id,
        },
      }),
    {
      enabled: musicFolder.loaded,
    }
  );

  const handleFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'album' },
      });
      dispatch(setStar({ id: [rowData.id], type: 'star' }));
      queryClient.setQueryData(['recentAlbums', musicFolder.id], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = Date.now();
        });

        return oldData;
      });
      queryClient.setQueryData(['newestAlbums', musicFolder.id], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = Date.now();
        });

        return oldData;
      });
      queryClient.setQueryData(['randomAlbums', musicFolder.id], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = Date.now();
        });

        return oldData;
      });
      queryClient.setQueryData(['frequentAlbums', musicFolder.id], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: rowData.id, type: 'album' },
      });
      dispatch(setStar({ id: [rowData.id], type: 'unstar' }));
      queryClient.setQueryData(['recentAlbums', musicFolder.id], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = undefined;
        });

        return oldData;
      });
      queryClient.setQueryData(['newestAlbums', musicFolder.id], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = undefined;
        });

        return oldData;
      });
      queryClient.setQueryData(['randomAlbums', musicFolder.id], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = undefined;
        });

        return oldData;
      });
      queryClient.setQueryData(['frequentAlbums', musicFolder.id], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = undefined;
        });

        return oldData;
      });
    }
  };

  if (isLoadingRecent || isLoadingNewest || isLoadingRandom || isLoadingFrequent) {
    return (
      <GenericPage hideDivider header={<GenericPageHeader title={t('Dashboard')} />}>
        <PageLoader />
      </GenericPage>
    );
  }

  return (
    <GenericPage header={<GenericPageHeader title={t('Dashboard')} />} hideDivider>
      {newestAlbums && recentAlbums && randomAlbums && (
        <>
          <ScrollingMenu
            noScrollbar
            title={t('Recently Played')}
            data={config.serverType === Server.Jellyfin ? recentAlbums.data : recentAlbums}
            cardTitle={{
              prefix: '/library/album',
              property: 'title',
              urlProperty: 'albumId',
            }}
            cardSubtitle={{
              prefix: '/library/artist',
              property: 'albumArtist',
              urlProperty: 'albumArtistId',
            }}
            cardSize={config.lookAndFeel.gridView.cardSize}
            onClickTitle={() => {
              dispatch(setActive({ ...album.active, filter: 'recent' }));
              setTimeout(() => {
                history.push(`/library/album?sortType=recent`);
              }, 50);
            }}
            type="music"
            handleFavorite={handleFavorite}
          />

          <ScrollingMenu
            title={t('Recently Added')}
            noScrollbar
            data={newestAlbums}
            cardTitle={{
              prefix: '/library/album',
              property: 'title',
              urlProperty: 'albumId',
            }}
            cardSubtitle={{
              prefix: '/library/artist',
              property: 'albumArtist',
              urlProperty: 'albumArtistId',
            }}
            cardSize={config.lookAndFeel.gridView.cardSize}
            onClickTitle={() => {
              dispatch(setActive({ ...album.active, filter: 'newest' }));
              setTimeout(() => {
                history.push(`/library/album?sortType=newest`);
              }, 50);
            }}
            type="album"
            handleFavorite={handleFavorite}
          />

          <ScrollingMenu
            title={t('Random')}
            noScrollbar
            data={randomAlbums}
            cardTitle={{
              prefix: '/library/album',
              property: 'title',
              urlProperty: 'albumId',
            }}
            cardSubtitle={{
              prefix: '/library/artist',
              property: 'albumArtist',
              urlProperty: 'albumArtistId',
            }}
            cardSize={config.lookAndFeel.gridView.cardSize}
            onClickTitle={() => {
              dispatch(setActive({ ...album.active, filter: 'random' }));
              setTimeout(() => {
                history.push(`/library/album?sortType=random`);
              }, 50);
            }}
            type="album"
            handleFavorite={handleFavorite}
          />

          <ScrollingMenu
            noScrollbar
            title={t('Most Played')}
            data={config.serverType === Server.Jellyfin ? frequentAlbums.data : frequentAlbums}
            cardTitle={{
              prefix: '/library/album',
              property: 'title',
              urlProperty: 'albumId',
            }}
            cardSubtitle={{
              prefix: '/library/artist',
              property: 'albumArtist',
              urlProperty: 'albumArtistId',
            }}
            cardSize={config.lookAndFeel.gridView.cardSize}
            onClickTitle={() => {
              dispatch(setActive({ ...album.active, filter: 'frequent' }));
              setTimeout(() => {
                history.push(`/library/album?sortType=frequent`);
              }, 50);
            }}
            type="music"
            handleFavorite={handleFavorite}
          />
        </>
      )}
    </GenericPage>
  );
};

export default Dashboard;
