import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router';
import { ButtonToolbar } from 'rsuite';
import useSearchQuery from '../../hooks/useSearchQuery';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import ListViewType from '../viewtypes/ListViewType';
import PageLoader from '../loader/PageLoader';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  clearSelected,
  setRangeSelected,
  toggleRangeSelected,
  toggleSelected,
} from '../../redux/multiSelectSlice';
import GridViewType from '../viewtypes/GridViewType';
import { RefreshButton } from '../shared/ToolbarButtons';
import { apiController } from '../../api/controller';
import { Server } from '../../types';

const ArtistList = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const queryClient = useQueryClient();
  const folder = useAppSelector((state) => state.folder);
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewType, setViewType] = useState(settings.getSync('artistViewType'));
  const [musicFolder, setMusicFolder] = useState(undefined);

  useEffect(() => {
    if (folder.applied.artists) {
      setMusicFolder(folder.musicFolder);
    }
  }, [folder]);

  const { isLoading, isError, data: artists, error }: any = useQuery(
    ['artistList', musicFolder],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getArtists',
        args: { musicFolderId: musicFolder },
      }),
    {
      cacheTime: 3600000, // Stay in cache for 1 hour
      staleTime: Infinity, // Only allow manual refresh
    }
  );
  const filteredData = useSearchQuery(misc.searchQuery, artists, ['title']);

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
    history.push(`/library/artist/${rowData.id}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.refetchQueries(['artistList', musicFolder], { active: true });
    setIsRefreshing(false);
  };

  const handleRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'artist' },
      });
      queryClient.setQueryData(['artistList', musicFolder], (oldData: any) => {
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
        args: { id: rowData.id, type: 'artist' },
      });
      queryClient.setQueryData(['artistList', musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = undefined;
        });

        return oldData;
      });
    }
  };

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          title="Artists"
          subtitle={
            <ButtonToolbar>
              <RefreshButton onClick={handleRefresh} size="sm" loading={isRefreshing} width={100} />
            </ButtonToolbar>
          }
          showViewTypeButtons
          viewTypeSetting="artist"
          handleListClick={() => setViewType('list')}
          handleGridClick={() => setViewType('grid')}
        />
      }
    >
      {isLoading && <PageLoader />}
      {isError && <div>Error: {error}</div>}
      {!isLoading && !isError && viewType === 'list' && (
        <ListViewType
          data={misc.searchQuery !== '' ? filteredData : artists}
          tableColumns={config.lookAndFeel.listView.artist.columns}
          rowHeight={config.lookAndFeel.listView.artist.rowHeight}
          fontSize={config.lookAndFeel.listView.artist.fontSize}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'artist',
            cacheIdProperty: 'id',
          }}
          page="artistListPage"
          listType="artist"
          virtualized
          disabledContextMenuOptions={[
            'moveSelectedTo',
            'removeSelected',
            'deletePlaylist',
            'viewInFolder',
          ]}
          handleFavorite={handleRowFavorite}
        />
      )}
      {!isLoading && !isError && viewType === 'grid' && (
        <GridViewType
          data={misc.searchQuery !== '' ? filteredData : artists}
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
          playClick={{ type: 'artist', idProperty: 'id' }}
          size={config.lookAndFeel.gridView.cardSize}
          cacheType="artist"
          handleFavorite={handleRowFavorite}
        />
      )}
    </GenericPage>
  );
};

export default ArtistList;
