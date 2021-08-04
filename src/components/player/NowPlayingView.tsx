import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { startPlayback } from '../../redux/playerSlice';

import { getPlayQueue } from '../../api/api';
import GenericPage from '../layout/GenericPage';
import ListViewType from '../viewtypes/ListViewType';
import Loader from '../loader/Loader';

type PlaylistParams = {
  id: string;
};

const tableColumns = [
  {
    header: '#',
    dataKey: 'index',
    alignment: 'center',
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

const NowPlayingView = () => {
  const player = useAppSelector((state) => state.player);
  const playQueue = useAppSelector((state) => state.playQueue);
  const dispatch = useAppDispatch();

  console.log(playQueue);

  const handleRowClick = (e: any) => {
    console.log(e);
    dispatch(startPlayback({ url: e.streamUrl }));
    console.log(player);
  };

  return (
    <GenericPage title="Playlists">
      <ListViewType
        data={playQueue.entry}
        tableColumns={tableColumns}
        handleRowClick={handleRowClick}
        autoHeight
        virtualized
      />
    </GenericPage>
  );
};

export default NowPlayingView;
