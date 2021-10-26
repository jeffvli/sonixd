import React, { useEffect, useState } from 'react';
import settings from 'electron-settings';
import _ from 'lodash';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { ButtonToolbar, Icon } from 'rsuite';
import {
  getIndexes,
  getMusicDirectory,
  getMusicFolders,
  setRating,
  star,
  unstar,
} from '../../api/api';
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
import { StyledButton, StyledInputPicker } from '../shared/styled';
import { fixPlayer2Index, setPlayQueueByRowClick, setRate } from '../../redux/playQueueSlice';
import { setStatus } from '../../redux/playerSlice';
import useSearchQuery from '../../hooks/useSearchQuery';
import { setCurrentViewedFolder } from '../../redux/folderSlice';
import useRouterQuery from '../../hooks/useRouterQuery';

const FolderList = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const query = useRouterQuery();
  const queryClient = useQueryClient();
  const folder = useAppSelector((state) => state.folder);
  const [musicFolder, setMusicFolder] = useState(undefined);

  const { isLoading, isError, data: indexData, error }: any = useQuery(
    ['indexes', musicFolder],
    () => getIndexes({ musicFolderId: musicFolder })
  );
  const { isLoading: isLoadingFolderData, data: folderData }: any = useQuery(
    ['folder', folder.currentViewedFolder],
    () => getMusicDirectory({ id: folder.currentViewedFolder }),
    {
      enabled: folder.currentViewedFolder !== '',
    }
  );

  const { isLoading: isLoadingMusicFolders, data: musicFolders } = useQuery(
    ['musicFolders'],
    getMusicFolders
  );

  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(
    searchQuery,
    folderData?.id ? folderData?.child : indexData?.child,
    ['title', 'artist', 'album', 'year', 'genre', 'path']
  );

  useEffect(() => {
    if (query.get('folderId') !== 'null') {
      dispatch(setCurrentViewedFolder(query.get('folderId') || ''));
    }
  }, [dispatch, query]);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          dispatch(toggleRangeSelected(folderData.child));
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
          entries: selected.filter((entry: any) => entry.isDir === false),
          currentIndex: rowData.index,
          currentSongId: rowData.id,
          uniqueSongId: rowData.uniqueId,
        })
      );
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    }
  };

  const handleRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await star(rowData.id, 'album');
      queryClient.setQueryData(['folder', folder.currentViewedFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.child, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.child[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await unstar(rowData.id, 'album');
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
    setRating(rowData.id, e);
    dispatch(setRate({ id: [rowData.id], rating: e }));
  };

  return (
    <>
      {isLoading && <PageLoader />}
      {isError && <div>Error: {error}</div>}
      {!isLoading && indexData && (
        <GenericPage
          hideDivider
          header={
            <GenericPageHeader
              title={`${
                folderData?.name
                  ? folderData.name
                  : isLoadingFolderData
                  ? 'Loading...'
                  : 'Select a folder'
              }`}
              showSearchBar
              searchQuery={searchQuery}
              handleSearch={(e: any) => setSearchQuery(e)}
              clearSearchQuery={() => setSearchQuery('')}
              showTitleTooltip
              subtitle={
                <>
                  <ButtonToolbar>
                    <StyledInputPicker
                      data={isLoadingMusicFolders ? [] : musicFolders}
                      defaultValue={settings.getSync('musicFolder.id')}
                      valueKey="id"
                      labelKey="name"
                      onChange={(e: any) => {
                        setMusicFolder(e);
                      }}
                      style={{ width: '250px' }}
                    />

                    <StyledButton
                      size="sm"
                      onClick={() => {
                        history.push(
                          `/library/folder?folderId=${folderData?.parent ? folderData.parent : ''}`
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
                searchQuery !== ''
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
