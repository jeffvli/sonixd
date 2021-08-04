import React from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { getPlaylist } from '../../api/api';
import { useAppDispatch } from '../../redux/hooks';
import { setPlayQueue, clearPlayQueue } from '../../redux/playQueueSlice';
import GenericPage from '../layout/GenericPage';
import ListViewType from '../viewtypes/ListViewType';
import Loader from '../loader/Loader';
import PlaylistViewHeader from './PlaylistViewHeader';

interface PlaylistParams {
  id: string;
}

const tableColumns = [
  {
    header: '#',
    dataKey: 'index',
    alignment: 'center',
    resizable: true,
    width: 70,
  },
  {
    header: 'Title',
    dataKey: 'title',
    alignment: 'left',
    resizable: true,
    width: 350,
  },

  {
    header: 'Artist',
    dataKey: 'artist',
    alignment: 'center',
    resizable: true,
    width: 300,
  },
  {
    header: 'Album',
    dataKey: 'album',
    alignment: 'center',
    resizable: true,
    width: 300,
  },
  {
    header: 'Duration',
    dataKey: 'duration',
    alignment: 'center',
    resizable: true,
    width: 70,
  },
];

const PlaylistView = () => {
  const { id } = useParams<PlaylistParams>();
  const { isLoading, isError, data: playlist, error }: any = useQuery(
    ['playlist', id],
    () => getPlaylist(id)
  );

  const dispatch = useAppDispatch();

  const handleRowClick = (e: any) => {
    const newPlayQueue = playlist.entry.slice([e.index], playlist.entry.length);
    dispatch(clearPlayQueue());
    dispatch(setPlayQueue(newPlayQueue));
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <GenericPage
      title="Playlists"
      header={
        <PlaylistViewHeader
          name={playlist.name}
          comment={playlist.comment}
          songCount={playlist.songCount}
          image={playlist.image}
        />
      }
    >
      <ListViewType
        data={playlist.entry}
        tableColumns={tableColumns}
        handleRowClick={handleRowClick}
        tableHeight={700}
        virtualized
        autoHeight
      />
    </GenericPage>
  );
};

export default PlaylistView;
