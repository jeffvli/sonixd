import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { useHistory } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import useRouterQuery from '../../hooks/useRouterQuery';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import PageLoader from '../loader/PageLoader';
import ScrollingMenu from '../scrollingmenu/ScrollingMenu';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  clearSelected,
  setRangeSelected,
  toggleRangeSelected,
  toggleSelected,
} from '../../redux/multiSelectSlice';
import { fixPlayer2Index, setPlayQueueByRowClick, setRate } from '../../redux/playQueueSlice';
import { setStatus } from '../../redux/playerSlice';
import ListViewTable from '../viewtypes/ListViewTable';
import { SectionTitle, SectionTitleWrapper, StyledPanel } from '../shared/styled';
import { apiController } from '../../api/controller';
import { Server } from '../../types';
import { setPlaylistRate } from '../../redux/playlistSlice';

const SearchView = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const query = useRouterQuery();
  const queryClient = useQueryClient();
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const playQueue = useAppSelector((state) => state.playQueue);
  const folder = useAppSelector((state) => state.folder);
  const config = useAppSelector((state) => state.config);
  const urlQuery = query.get('query') || '';
  const [musicFolder, setMusicFolder] = useState(undefined);

  useEffect(() => {
    if (folder.applied.search) {
      setMusicFolder(folder.musicFolder);
    }
  }, [folder]);

  const { isLoading, isError, data, error }: any = useQuery(['search', urlQuery, musicFolder], () =>
    apiController({
      serverType: config.serverType,
      endpoint: 'getSearch',
      args: { query: urlQuery, songCount: 100, musicFolderId: musicFolder },
    })
  );

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any, tableData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          dispatch(toggleRangeSelected(tableData));
        }
      }, 100);
    }
  };

  const handleRowDoubleClick = (rowData: any) => {
    window.clearTimeout(timeout);
    timeout = null;

    dispatch(clearSelected());
    if (rowData.isDir) {
      history.push(`/library/folder?folderId=${rowData.parent}`);
    } else {
      dispatch(
        setPlayQueueByRowClick({
          entries: data.song.filter((entry: any) => entry.isDir !== true),
          currentIndex: rowData.rowIndex,
          currentSongId: rowData.id,
          uniqueSongId: rowData.uniqueId,
          filters: config.playback.filters,
        })
      );
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    }
  };

  const handleRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'music' },
      });
      queryClient.setQueryData(['search', urlQuery, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.song, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.song[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: rowData.id, type: 'album' },
      });
      queryClient.setQueryData(['search', urlQuery, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.song, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.song[index].starred = undefined;
        });

        return oldData;
      });
    }
  };

  const handleArtistFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'artist' },
      });
      queryClient.setQueryData(['search', urlQuery, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.artist, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.artist[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: rowData.id, type: 'album' },
      });
      queryClient.setQueryData(['search', urlQuery, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.artist, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.artist[index].starred = undefined;
        });

        return oldData;
      });
    }
  };

  const handleAlbumFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'artist' },
      });
      queryClient.setQueryData(['search', urlQuery, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: rowData.id, type: 'album' },
      });
      queryClient.setQueryData(['search', urlQuery, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = undefined;
        });

        return oldData;
      });
    }
  };

  const handleRowRating = async (rowData: any, e: number) => {
    apiController({
      serverType: config.serverType,
      endpoint: 'setRating',
      args: { ids: [rowData.id], rating: e },
    });
    dispatch(setRate({ id: [rowData.id], rating: e }));
    dispatch(setPlaylistRate({ id: [rowData.id], rating: e }));

    queryClient.setQueryData(['search', urlQuery, musicFolder], (oldData: any) => {
      const ratedIndices = _.keys(_.pickBy(oldData.song, { id: rowData.id }));
      ratedIndices.forEach((index) => {
        oldData.song[index].userRating = e;
      });

      return oldData;
    });
  };

  return (
    <GenericPage header={<GenericPageHeader title={`Search: ${urlQuery}`} />}>
      {isLoading && <PageLoader />}
      {isError && <div>Error: {error}</div>}
      {!isLoading && data && (
        <>
          <ScrollingMenu
            title="Artists"
            data={data.artist}
            cardTitle={{
              prefix: '/library/artist',
              property: 'title',
              urlProperty: 'id',
            }}
            cardSubtitle={
              config.serverType === Server.Subsonic && {
                property: 'albumCount',
                unit: ' albums',
              }
            }
            cardSize={config.lookAndFeel.gridView.cardSize}
            type="artist"
            handleFavorite={handleArtistFavorite}
          />

          <ScrollingMenu
            title="Albums"
            data={data.album}
            cardTitle={{
              prefix: '/library/album',
              property: 'title',
              urlProperty: 'albumId',
            }}
            cardSubtitle={{
              prefix: '/library/artist',
              property: 'albumArtist',
              urlProperty: 'albumArtistId',
              unit: '',
            }}
            cardSize={config.lookAndFeel.gridView.cardSize}
            type="album"
            handleFavorite={handleAlbumFavorite}
          />
          <SectionTitleWrapper>
            <SectionTitle>Songs</SectionTitle>
          </SectionTitleWrapper>
          <StyledPanel bodyFill bordered>
            <ListViewTable
              height={500}
              data={data.song}
              columns={settings.getSync('musicListColumns')}
              rowHeight={Number(settings.getSync('musicListRowHeight'))}
              fontSize={settings.getSync('musicListFontSize')}
              handleRowClick={handleRowClick}
              handleRowDoubleClick={handleRowDoubleClick}
              handleRating={handleRowRating}
              listType="music"
              cacheImages={{
                enabled: settings.getSync('cacheImages'),
                cacheType: 'album',
                cacheIdProperty: 'albumId',
              }}
              disabledContextMenuOptions={['deletePlaylist', 'viewInModal']}
              playQueue={playQueue}
              multiSelect={multiSelect}
              isModal={false}
              miniView={false}
              dnd={false}
              virtualized
              handleFavorite={handleRowFavorite}
            />
          </StyledPanel>
        </>
      )}
    </GenericPage>
  );
};

export default SearchView;
