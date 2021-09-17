import React, { useState } from 'react';
import settings from 'electron-settings';
import { ButtonToolbar, Tag } from 'rsuite';
import { useQuery, useQueryClient } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import {
  FavoriteButton,
  PlayAppendButton,
  PlayButton,
} from '../shared/ToolbarButtons';
import { getAlbum, star, unstar } from '../../api/api';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  appendPlayQueue,
  fixPlayer2Index,
  setPlayQueue,
  setPlayQueueByRowClick,
} from '../../redux/playQueueSlice';
import {
  toggleSelected,
  setRangeSelected,
  toggleRangeSelected,
  setSelected,
  clearSelected,
} from '../../redux/multiSelectSlice';
import useSearchQuery from '../../hooks/useSearchQuery';
import GenericPage from '../layout/GenericPage';
import ListViewType from '../viewtypes/ListViewType';
import PageLoader from '../loader/PageLoader';
import GenericPageHeader from '../layout/GenericPageHeader';
import { TagLink } from './styled';
import { setStatus } from '../../redux/playerSlice';
import { addModalPage } from '../../redux/miscSlice';

interface AlbumParams {
  id: string;
}

const AlbumView = ({ ...rest }: any) => {
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const history = useHistory();
  const queryClient = useQueryClient();

  const { id } = useParams<AlbumParams>();
  const albumId = rest.id ? rest.id : id;

  const { isLoading, isError, data, error }: any = useQuery(
    ['album', albumId],
    () => getAlbum(albumId)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(searchQuery, data?.song, [
    'title',
    'artist',
    'album',
    'genre',
  ]);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));

          dispatch(toggleRangeSelected(data.song));
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
        entries: data.song,
        currentIndex: e.index,
        currentSongId: e.id,
        uniqueSongId: e.uniqueId,
      })
    );
    dispatch(setStatus('PLAYING'));
    dispatch(fixPlayer2Index());
  };

  const handlePlay = () => {
    dispatch(setPlayQueue({ entries: data.song }));
    dispatch(setStatus('PLAYING'));
  };

  const handlePlayAppend = () => {
    dispatch(appendPlayQueue({ entries: data.song }));
    if (playQueue.entry.length < 1) {
      dispatch(setStatus('PLAYING'));
    }
  };

  const handleFavorite = async () => {
    if (!data.starred) {
      await star(data.id, 'album');
    } else {
      await unstar(data.id, 'album');
    }
    await queryClient.refetchQueries(['album', id], {
      active: true,
      exact: true,
    });
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
                {data.artist && (
                  <Tag>
                    <TagLink
                      onClick={() => {
                        if (!rest.isModal) {
                          history.push(`/library/artist/${data.artistId}`);
                        } else {
                          dispatch(
                            addModalPage({
                              pageType: 'artist',
                              id: data.artistId,
                            })
                          );
                        }
                      }}
                    >
                      Artist: {data.artist}
                    </TagLink>
                  </Tag>
                )}
                {data.year && (
                  <Tag>
                    <TagLink>Year: {data.year}</TagLink>
                  </Tag>
                )}
                {data.genre && (
                  <Tag>
                    <TagLink>Genre: {data.genre}</TagLink>
                  </Tag>
                )}
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
                  <FavoriteButton
                    size="lg"
                    isFavorite={data.starred}
                    onClick={handleFavorite}
                  />
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
        data={searchQuery !== '' ? filteredData : data.song}
        tableColumns={settings.getSync('musicListColumns')}
        handleRowClick={handleRowClick}
        handleRowDoubleClick={handleRowDoubleClick}
        tableHeight={700}
        virtualized
        rowHeight={Number(settings.getSync('musicListRowHeight'))}
        fontSize={Number(settings.getSync('musicListFontSize'))}
        cacheImages={{
          enabled: settings.getSync('cacheImages'),
          cacheType: 'album',
          cacheIdProperty: 'albumId',
        }}
        listType="music"
        isModal={rest.isModal}
      />
    </GenericPage>
  );
};

export default AlbumView;
