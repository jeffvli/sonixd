import React, { useEffect, useRef, useState } from 'react';
import settings from 'electron-settings';
import _ from 'lodash';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { ButtonToolbar, Icon } from 'rsuite';
import { useTranslation } from 'react-i18next';
import ListViewType from '../viewtypes/ListViewType';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import { StyledButton, StyledInputPicker, StyledInputPickerContainer } from '../shared/styled';
import { fixPlayer2Index, setPlayQueueByRowClick } from '../../redux/playQueueSlice';
import { setStatus } from '../../redux/playerSlice';
import useSearchQuery from '../../hooks/useSearchQuery';
import { setCurrentViewedFolder } from '../../redux/folderSlice';
import useRouterQuery from '../../hooks/useRouterQuery';
import { Server } from '../../types';
import { apiController } from '../../api/controller';
import CenterLoader from '../loader/CenterLoader';
import useListClickHandler from '../../hooks/useListClickHandler';
import useFavorite from '../../hooks/useFavorite';
import { useRating } from '../../hooks/useRating';

const FolderList = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const query = useRouterQuery();
  const queryClient = useQueryClient();
  const folder = useAppSelector((state) => state.folder);
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const [musicFolder, setMusicFolder] = useState(folder.musicFolder);
  const folderPickerContainerRef = useRef(null);

  const {
    isLoading,
    isError,
    data: indexData,
    error,
  }: any = useQuery(['indexes', musicFolder], () =>
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

  const { handleRowClick, handleRowDoubleClick } = useListClickHandler({
    doubleClick: (rowData: any) => {
      if (rowData.isDir) {
        history.push(`/library/folder?folderId=${rowData.id}`);
        dispatch(setCurrentViewedFolder(rowData.id));
      } else {
        const selected = folderData?.id ? folderData?.child : indexData?.child;
        dispatch(
          setPlayQueueByRowClick({
            entries: selected.filter((entry: any) => entry?.isDir === false),
            currentIndex: rowData.rowIndex,
            currentSongId: rowData.id,
            uniqueSongId: rowData.uniqueId,
            filters: config.playback.filters,
          })
        );
        dispatch(setStatus('PLAYING'));
        dispatch(fixPlayer2Index());
      }
    },
  });

  const { handleFavorite } = useFavorite();
  const { handleRating } = useRating();

  return (
    <>
      {(isLoading || isLoadingMusicFolders) && <CenterLoader />}
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
                  ? t('Loading...')
                  : t('Select a folder')
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
                        placeholder={t('Select')}
                        onChange={(e: any) => {
                          setMusicFolder(e);
                        }}
                        disabled={config.serverType === Server.Jellyfin}
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
                        {t('Go up')}
                      </StyledButton>
                    </ButtonToolbar>
                  </StyledInputPickerContainer>
                </>
              }
            />
          }
        >
          <ListViewType
            data={
              misc.searchQuery !== ''
                ? filteredData
                : folder.currentViewedFolder
                ? folderData?.child
                : indexData
            }
            loading={isLoadingFolderData}
            tableColumns={settings.getSync('musicListColumns')}
            rowHeight={Number(settings.getSync('musicListRowHeight'))}
            fontSize={Number(settings.getSync('musicListFontSize'))}
            handleRowClick={handleRowClick}
            handleRowDoubleClick={handleRowDoubleClick}
            handleFavorite={(rowData: any) =>
              handleFavorite(rowData, {
                custom: () => {
                  queryClient.setQueryData(
                    ['folder', folder.currentViewedFolder],
                    (oldData: any) => {
                      const starredIndices = _.keys(_.pickBy(oldData.child, { id: rowData.id }));
                      starredIndices.forEach((index) => {
                        oldData.child[index].starred = rowData.starred ? undefined : Date.now();
                      });

                      return oldData;
                    }
                  );
                },
              })
            }
            handleRating={(rowData: any, rating: number) =>
              handleRating(rowData, { queryKey: ['folder', folder.currentViewedFolder], rating })
            }
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
        </GenericPage>
      )}
    </>
  );
};

export default FolderList;
