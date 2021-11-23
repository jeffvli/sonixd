import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
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
  const history = useHistory();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const folder = useAppSelector((state) => state.folder);
  const config = useAppSelector((state) => state.config);
  const album = useAppSelector((state) => state.album);
  const [musicFolder, setMusicFolder] = useState(undefined);

  useEffect(() => {
    if (folder.applied.dashboard) {
      setMusicFolder(folder.musicFolder);
    }
  }, [folder]);

  const { isLoading: isLoadingRecent, data: recentAlbums }: any = useQuery(
    ['recentAlbums', musicFolder],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getAlbums',
        args:
          config.serverType === Server.Subsonic
            ? { type: 'recent', size: 20, offset: 0, musicFolderId: musicFolder }
            : { type: 'recent', size: 20, offset: 0 },
      })
  );

  const { isLoading: isLoadingNewest, data: newestAlbums }: any = useQuery(
    ['newestAlbums', musicFolder],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getAlbums',
        args:
          config.serverType === Server.Subsonic
            ? { type: 'newest', size: 20, offset: 0, musicFolderId: musicFolder }
            : { type: 'newest', size: 20, offset: 0 },
      })
  );

  const { isLoading: isLoadingRandom, data: randomAlbums }: any = useQuery(
    ['randomAlbums', musicFolder],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getAlbums',
        args:
          config.serverType === Server.Subsonic
            ? { type: 'random', size: 20, offset: 0, musicFolderId: musicFolder }
            : { type: 'random', size: 20, offset: 0 },
      })
  );

  const { isLoading: isLoadingFrequent, data: frequentAlbums }: any = useQuery(
    ['frequentAlbums', musicFolder],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getAlbums',
        args:
          config.serverType === Server.Subsonic
            ? { type: 'frequent', size: 20, offset: 0, musicFolderId: musicFolder }
            : { type: 'frequent', size: 20, offset: 0 },
      })
  );

  const handleFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'album' },
      });
      dispatch(setStar({ id: [rowData.id], type: 'star' }));
      queryClient.setQueryData(['recentAlbums', musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = Date.now();
        });

        return oldData;
      });
      queryClient.setQueryData(['newestAlbums', musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = Date.now();
        });

        return oldData;
      });
      queryClient.setQueryData(['randomAlbums', musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = Date.now();
        });

        return oldData;
      });
      queryClient.setQueryData(['frequentAlbums', musicFolder], (oldData: any) => {
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
      queryClient.setQueryData(['recentAlbums', musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = undefined;
        });

        return oldData;
      });
      queryClient.setQueryData(['newestAlbums', musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = undefined;
        });

        return oldData;
      });
      queryClient.setQueryData(['randomAlbums', musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = undefined;
        });

        return oldData;
      });
      queryClient.setQueryData(['frequentAlbums', musicFolder], (oldData: any) => {
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
      <GenericPage hideDivider header={<GenericPageHeader title="Dashboard" />}>
        <PageLoader />
      </GenericPage>
    );
  }

  return (
    <GenericPage header={<GenericPageHeader title="Dashboard" />} hideDivider>
      {newestAlbums && recentAlbums && randomAlbums && (
        <>
          <ScrollingMenu
            title="Recently Played"
            data={recentAlbums}
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
            type="album"
            handleFavorite={handleFavorite}
          />

          <ScrollingMenu
            title="Recently Added"
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
            title="Random"
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
            title="Most Played"
            data={frequentAlbums}
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
            type="album"
            handleFavorite={handleFavorite}
          />
        </>
      )}
    </GenericPage>
  );
};

export default Dashboard;
