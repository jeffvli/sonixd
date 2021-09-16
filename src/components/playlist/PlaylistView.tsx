import React, { useEffect, useState } from 'react';
import settings from 'electron-settings';
import { ButtonToolbar } from 'rsuite';
import { useQuery, useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';
import {
  DeleteButton,
  EditButton,
  PlayAppendButton,
  PlayButton,
  SaveButton,
  UndoButton,
} from '../shared/ToolbarButtons';
import { getPlaylist, updatePlaylistSongs } from '../../api/api';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fixPlayer2Index,
  setPlayQueueByRowClick,
  setPlayQueue,
  appendPlayQueue,
} from '../../redux/playQueueSlice';
import {
  toggleSelected,
  setRangeSelected,
  toggleRangeSelected,
  setSelected,
  clearSelected,
  setIsDragging,
} from '../../redux/multiSelectSlice';
import { moveToIndex } from '../../shared/utils';
import useSearchQuery from '../../hooks/useSearchQuery';
import GenericPage from '../layout/GenericPage';
import ListViewType from '../viewtypes/ListViewType';
import PageLoader from '../loader/PageLoader';
import GenericPageHeader from '../layout/GenericPageHeader';
import { setStatus } from '../../redux/playerSlice';

interface PlaylistParams {
  id: string;
}

const PlaylistView = ({ ...rest }) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { id } = useParams<PlaylistParams>();
  const playlistId = rest.id ? rest.id : id;
  const { isLoading, isError, data, error }: any = useQuery(
    ['playlist', playlistId],
    () => getPlaylist(playlistId),
    {
      refetchOnWindowFocus: false,
    }
  );
  const [localPlaylistData, setLocalPlaylistData] = useState(data);
  const [isModified, setIsModified] = useState(false);
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(searchQuery, localPlaylistData, [
    'title',
    'artist',
    'album',
  ]);

  useEffect(() => {
    // Set the local playlist data on any changes
    setLocalPlaylistData(data?.song);
  }, [data]);

  useEffect(() => {
    if (data?.song !== localPlaylistData) {
      setIsModified(true);
    } else {
      setIsModified(false);
    }
  }, [data?.song, localPlaylistData]);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          dispatch(
            toggleRangeSelected(
              searchQuery !== '' ? filteredData : localPlaylistData
            )
          );
        } else {
          dispatch(setSelected(rowData));
        }
      }, 300);
    }
  };

  const handleRowDoubleClick = (e: any) => {
    window.clearTimeout(timeout);
    timeout = null;

    dispatch(clearSelected());
    dispatch(
      setPlayQueueByRowClick({
        entries: localPlaylistData,
        currentIndex: e.index,
        currentSongId: e.id,
        uniqueSongId: e.uniqueId,
      })
    );
    dispatch(setStatus('PLAYING'));
    dispatch(fixPlayer2Index());
  };

  const handlePlay = () => {
    dispatch(setPlayQueue({ entries: localPlaylistData }));
    dispatch(setStatus('PLAYING'));
  };

  const handlePlayAppend = () => {
    dispatch(appendPlayQueue({ entries: localPlaylistData }));
    if (playQueue.entry.length < 1) {
      dispatch(setStatus('PLAYING'));
    }
  };

  const handleSave = async () => {
    try {
      const res = await updatePlaylistSongs(data.id, localPlaylistData);

      if (res.status === 'failed') {
        console.log('error', res.error.message);
      } else {
        await queryClient.refetchQueries(['playlist'], {
          active: true,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDragEnd = () => {
    if (multiSelect.isDragging) {
      setLocalPlaylistData(
        moveToIndex(
          localPlaylistData,
          multiSelect.selected,
          multiSelect.currentMouseOverId
        )
      );
      dispatch(setIsDragging(false));
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <GenericPage
      header={
        <GenericPageHeader
          image={data.image}
          title={data.name}
          subtitle={
            <div>
              <div
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {data.comment ? data.comment : ' '}
              </div>
              <div style={{ marginTop: '10px' }}>
                <ButtonToolbar>
                  <PlayButton
                    appearance="primary"
                    size="lg"
                    onClick={handlePlay}
                  />
                  <PlayAppendButton
                    appearance="primary"
                    size="lg"
                    onClick={handlePlayAppend}
                  />
                  <SaveButton
                    size="lg"
                    color={isModified ? 'green' : undefined}
                    disabled={!isModified}
                    onClick={handleSave}
                  />
                  <UndoButton
                    size="lg"
                    color={isModified ? 'green' : undefined}
                    disabled={!isModified}
                    onClick={() => setLocalPlaylistData(data?.song)}
                  />
                  <EditButton size="lg" />
                  <DeleteButton size="lg" />
                </ButtonToolbar>
              </div>
            </div>
          }
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showSearchBar
        />
      }
    >
      <ListViewType
        data={searchQuery !== '' ? filteredData : localPlaylistData}
        tableColumns={settings.getSync('songListColumns')}
        handleRowClick={handleRowClick}
        handleRowDoubleClick={handleRowDoubleClick}
        handleDragEnd={handleDragEnd}
        virtualized
        rowHeight={Number(settings.getSync('songListRowHeight'))}
        fontSize={Number(settings.getSync('songListFontSize'))}
        cacheImages={{
          enabled: settings.getSync('cacheImages'),
          cacheType: 'album',
          cacheIdProperty: 'albumId',
        }}
        listType="song"
        dnd
        isModal={rest.isModal}
      />
    </GenericPage>
  );
};

export default PlaylistView;
