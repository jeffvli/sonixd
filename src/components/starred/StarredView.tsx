import React from 'react';
import { useQuery } from 'react-query';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearPlayQueue, setPlayQueue } from '../../redux/playQueueSlice';
import { getStarred } from '../../api/api';
import GenericPage from '../layout/GenericPage';
import Loader from '../loader/Loader';
import ListViewType from '../viewtypes/ListViewType';

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

const StarredView = () => {
  const { isLoading, isError, data: starred, error }: any = useQuery(
    'starred',
    getStarred
  );

  const tracks = useAppSelector((state) => state.playQueue);

  const dispatch = useAppDispatch();

  const handleRowClick = (e: any) => {
    const newPlayQueue = starred.entry.slice([e.index], starred.entry.length);
    console.log(newPlayQueue);
    dispatch(clearPlayQueue());
    dispatch(setPlayQueue(newPlayQueue));
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  console.log(tracks);

  return (
    <GenericPage header={<h1>Starred</h1>}>
      <ListViewType
        data={starred.entry}
        tableColumns={tableColumns}
        handleRowClick={handleRowClick}
        virtualized
      />
    </GenericPage>
  );
};

export default StarredView;
