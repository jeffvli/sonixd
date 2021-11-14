import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { useHistory } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { search3, star, unstar } from '../../api/api';
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
import { fixPlayer2Index, setPlayQueueByRowClick } from '../../redux/playQueueSlice';
import { setStatus } from '../../redux/playerSlice';
import ListViewTable from '../viewtypes/ListViewTable';
import { SectionTitle, SectionTitleWrapper, StyledPanel } from '../shared/styled';

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
    search3({ query: urlQuery, songCount: 100, musicFolderId: musicFolder })
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
          currentIndex: rowData.index,
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
      await star(rowData.id, 'music');
      queryClient.setQueryData(['search', urlQuery, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.song, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.song[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await unstar(rowData.id, 'album');
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
      await star(rowData.id, 'artist');
      queryClient.setQueryData(['search', urlQuery, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.artist, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.artist[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await unstar(rowData.id, 'album');
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
      await star(rowData.id, 'artist');
      queryClient.setQueryData(['search', urlQuery, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await unstar(rowData.id, 'album');
      queryClient.setQueryData(['search', urlQuery, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = undefined;
        });

        return oldData;
      });
    }
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
              property: 'name',
              urlProperty: 'id',
            }}
            cardSubtitle={{
              property: 'albumCount',
              unit: ' albums',
            }}
            cardSize={config.lookAndFeel.gridView.cardSize}
            type="artist"
            handleFavorite={handleArtistFavorite}
          />

          <ScrollingMenu
            title="Albums"
            data={data.album}
            cardTitle={{
              prefix: '/library/album',
              property: 'name',
              urlProperty: 'albumId',
            }}
            cardSubtitle={{
              prefix: '/library/artist',
              property: 'artist',
              urlProperty: 'artistId',
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
