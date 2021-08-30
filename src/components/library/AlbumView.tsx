import React, { useState } from 'react';
import settings from 'electron-settings';
import { ButtonToolbar, Tag } from 'rsuite';
import { useQuery } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import {
  DeleteButton,
  EditButton,
  PlayAppendButton,
  PlayButton,
  PlayShuffleAppendButton,
  PlayShuffleButton,
} from '../shared/ToolbarButtons';
import { getAlbum } from '../../api/api';
import { useAppDispatch } from '../../redux/hooks';
import { fixPlayer2Index, setPlayQueue } from '../../redux/playQueueSlice';
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
import Loader from '../loader/Loader';
import GenericPageHeader from '../layout/GenericPageHeader';
import { TagLink } from './styled';

interface AlbumParams {
  id: string;
}

const AlbumView = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { id } = useParams<AlbumParams>();
  const { isLoading, isError, data, error }: any = useQuery(['album', id], () =>
    getAlbum(id)
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
    const newPlayQueue = data.song.slice([e.index], data.song.length);

    dispatch(clearSelected());
    dispatch(setPlayQueue(newPlayQueue));
    dispatch(fixPlayer2Index());
  };

  if (isLoading) {
    return <Loader />;
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
                      onClick={() =>
                        history.push(`/library/artist/${data.artistId}`)
                      }
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
                  <PlayButton appearance="primary" size="lg" circle />
                  <PlayShuffleButton />
                  <PlayAppendButton />
                  <PlayShuffleAppendButton />
                  <EditButton />
                  <DeleteButton />
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
        tableColumns={settings.getSync('songListColumns')}
        handleRowClick={handleRowClick}
        handleRowDoubleClick={handleRowDoubleClick}
        tableHeight={700}
        virtualized
        rowHeight={Number(settings.getSync('songListRowHeight'))}
        fontSize={Number(settings.getSync('songListFontSize'))}
        cacheImages={{
          enabled: settings.getSync('cacheImages'),
          cacheType: 'album',
        }}
      />
    </GenericPage>
  );
};

export default AlbumView;
