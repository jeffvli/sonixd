import React, { useState } from 'react';
import { ButtonToolbar } from 'rsuite';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import {
  DeleteButton,
  EditButton,
  PlayAppendButton,
  PlayButton,
  PlayShuffleAppendButton,
  PlayShuffleButton,
} from '../shared/ToolbarButtons';
import { getPlaylist } from '../../api/api';
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

interface PlaylistParams {
  id: string;
}

const tableColumns = [
  {
    id: '#',
    dataKey: 'index',
    alignment: 'center',
    resizable: true,
    width: 70,
  },
  {
    id: 'Title',
    dataKey: 'title',
    alignment: 'left',
    resizable: true,
    width: 350,
  },

  {
    id: 'Artist',
    dataKey: 'artist',
    alignment: 'center',
    resizable: true,
    width: 300,
  },
  {
    id: 'Album',
    dataKey: 'album',
    alignment: 'center',
    resizable: true,
    width: 300,
  },
  {
    id: 'Duration',
    dataKey: 'duration',
    alignment: 'center',
    resizable: true,
    width: 70,
  },
];

const PlaylistView = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<PlaylistParams>();
  const { isLoading, isError, data, error }: any = useQuery(
    ['playlist', id],
    () => getPlaylist(id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(searchQuery, data?.entry, [
    'title',
    'artist',
    'album',
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

          dispatch(toggleRangeSelected(data.entry));
        } else {
          dispatch(setSelected(rowData));
        }
      }, 300);
    }
  };

  const handleRowDoubleClick = (e: any) => {
    window.clearTimeout(timeout);
    timeout = null;
    const newPlayQueue = data.entry.slice([e.index], data.entry.length);

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
                {data.comment}
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
        data={searchQuery !== '' ? filteredData : data.entry}
        tableColumns={tableColumns}
        handleRowClick={handleRowClick}
        handleRowDoubleClick={handleRowDoubleClick}
        tableHeight={700}
        virtualized
        autoHeight
      />
    </GenericPage>
  );
};

export default PlaylistView;
