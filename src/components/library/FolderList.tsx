import React, { useEffect, useRef, useState } from 'react';
import settings from 'electron-settings';
import _ from 'lodash';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { ButtonToolbar, Icon } from 'rsuite';
import PageLoader from '../loader/PageLoader';
import ListViewType from '../viewtypes/ListViewType';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  clearSelected,
  setRangeSelected,
  toggleRangeSelected,
  toggleSelected,
} from '../../redux/multiSelectSlice';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import { StyledButton, StyledInputPicker, StyledInputPickerContainer } from '../shared/styled';
import { fixPlayer2Index, setPlayQueueByRowClick, setRate } from '../../redux/playQueueSlice';
import { setStatus } from '../../redux/playerSlice';
import useSearchQuery from '../../hooks/useSearchQuery';
import { setCurrentViewedFolder } from '../../redux/folderSlice';
import useRouterQuery from '../../hooks/useRouterQuery';
import { Server } from '../../types';
import { apiController } from '../../api/controller';

const FolderList = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const query = useRouterQuery();
  const queryClient = useQueryClient();
  const folder = useAppSelector((state) => state.folder);
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const [musicFolder, setMusicFolder] = useState(folder.musicFolder);
  const folderPickerContainerRef = useRef(null);

  const { isLoading, isError, data: indexData, error }: any = useQuery(
    ['indexes', musicFolder],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getIndexes',
        args: config.serverType === Server.Subsonic ? { musicFolderId: musicFolder } : null,
      })
  );
  const { isLoading: isLoadingFolderData, data: folderData }: any = useQuery(
    ['folder', folder.currentViewedFolder],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getMusicDirectory',
        args: { id: folder.currentViewedFolder },
      }),
    {
      enabled: folder.currentViewedFolder !== '',
    }
  );

  const { isLoading: isLoadingMusicFolders, data: musicFolders } = useQuery(['musicFolders'], () =>
    apiController({ serverType: config.serverType, endpoint: 'getMusicFolders' })
  );

  const filteredData = useSearchQuery(
    misc.searchQuery,
    folderData?.id ? folderData?.child : indexData,
    ['title', 'artist', 'album', 'year', 'genre', 'path']
  );

  useEffect(() => {
    if (query.get('folderId') !== 'null') {
      dispatch(setCurrentViewedFolder(query.get('folderId') || ''));
    }
  }, [dispatch, query]);

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
      history.push(`/library/folder?folderId=${rowData.id}`);
      dispatch(setCurrentViewedFolder(rowData.id));
    } else {
      const selected = folderData?.id ? folderData?.child : indexData?.child;
      dispatch(
        setPlayQueueByRowClick({
          entries: selected.filter((entry: any) => entry?.isDir === false),
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
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'album' },
      });
      queryClient.setQueryData(['folder', folder.currentViewedFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.child, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.child[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: rowData.id, type: 'album' },
      });
      queryClient.setQueryData(['folder', folder.currentViewedFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.child, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.child[index].starred = undefined;
        });

        return oldData;
      });
    }
  };

  const handleRowRating = (rowData: any, e: number) => {
    apiController({
      serverType: config.serverType,
      endpoint: 'setRating',
      args: { id: rowData.id, rating: e },
    });
    dispatch(setRate({ id: [rowData.id], rating: e }));
  };

  return (
    <>
      {(isLoading || isLoadingMusicFolders) && <PageLoader />}
      {isError && <div>Error: {error}</div>}
      {!isLoading && indexData && (
        <GenericPage
          hideDivider
          header={
            <GenericPageHeader
              title={`${
                folderData?.title
                  ? folderData.title
                  : isLoadingFolderData
                  ? 'Loading...'
                  : 'Select a folder'
              }`}
              showTitleTooltip
              subtitle={
                <>
                  <StyledInputPickerContainer ref={folderPickerContainerRef}>
                    <ButtonToolbar>
                      <StyledInputPicker
                        container={() => folderPickerContainerRef.current}
                        size="sm"
                        width={180}
                        data={musicFolders}
                        defaultValue={musicFolder}
                        valueKey="id"
                        labelKey="title"
                        onChange={(e: any) => {
                          setMusicFolder(e);
                        }}
                      />

                      <StyledButton
                        size="sm"
                        onClick={() => {
                          history.push(
                            `/library/folder?folderId=${
                              folderData?.parent ? folderData.parent : ''
                            }`
                          );
                          dispatch(
                            setCurrentViewedFolder(folderData?.parent ? folderData.parent : '')
                          );
                        }}
                      >
                        <Icon icon="level-up" style={{ marginRight: '10px' }} />
                        Go up
                      </StyledButton>
                    </ButtonToolbar>
                  </StyledInputPickerContainer>
                </>
              }
            />
          }
        >
          {isLoadingFolderData ? (
            <PageLoader />
          ) : (
            <ListViewType
              data={
                misc.searchQuery !== ''
                  ? filteredData
                  : folder.currentViewedFolder
                  ? folderData?.child
                  : indexData
              }
              tableColumns={settings.getSync('musicListColumns')}
              rowHeight={Number(settings.getSync('musicListRowHeight'))}
              fontSize={Number(settings.getSync('musicListFontSize'))}
              handleRowClick={handleRowClick}
              handleRowDoubleClick={handleRowDoubleClick}
              handleFavorite={handleRowFavorite}
              handleRating={handleRowRating}
              cacheImages={{
                enabled: settings.getSync('cacheImages'),
                cacheType: 'folder',
                cacheIdProperty: 'albumId',
              }}
              page="folderListPage"
              listType="folder"
              virtualized
              disabledContextMenuOptions={[
                'addToFavorites',
                'removeFromFavorites',
                'viewInModal',
                'moveSelectedTo',
                'removeSelected',
                'deletePlaylist',
                'viewInFolder',
              ]}
            />
          )}
        </GenericPage>
      )}
    </>
  );
};

export default FolderList;
