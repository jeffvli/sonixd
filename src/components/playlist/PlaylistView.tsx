import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getPlaylist, getStream } from '../../api/api';
import GenericPage from '../layout/GenericPage';
import ListView from '../views/ListView';
import Loader from '../loader/Loader';
import PlaylistViewHeader from './PlaylistViewHeader';
import Player from '../player/Player';

type PlaylistParams = {
  id: string;
};

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
  const [playing, setPlaying] = useState(null);

  const handleRowClick = (e: any) => {
    console.log(e);
    setPlaying(e.streamUrl);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  console.log(playlist);

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
      <Helmet>
        <title>sonicd - {playlist.name}</title>
      </Helmet>
      <ListView
        data={playlist.entry}
        tableColumns={tableColumns}
        handleRowClick={handleRowClick}
      />
      {/* {setPlaying && <Player url={playing} />} */}
    </GenericPage>
  );
};

export default PlaylistView;
