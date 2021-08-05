import React from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setCurrentIndex } from '../../redux/playQueueSlice';

import GenericPage from '../layout/GenericPage';
import ListViewType from '../viewtypes/ListViewType';
import Loader from '../loader/Loader';

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
  const playQueue = useAppSelector((state) => state.playQueue);
  const dispatch = useAppDispatch();

  const handleRowClick = (e: any) => {
    dispatch(setCurrentIndex(e));
  };

  if (!playQueue) {
    return <Loader />;
  }

  return (
    <GenericPage header={<h1>Now Playing</h1>}>
      <ListViewType
        data={playQueue.entry}
        currentIndex={playQueue.currentIndex}
        tableColumns={tableColumns}
        handleRowClick={handleRowClick}
        virtualized
      />
    </GenericPage>
  );
};

export default NowPlayingView;
