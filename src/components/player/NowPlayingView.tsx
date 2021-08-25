import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import useSearchQuery from '../../hooks/useSearchQuery';
import {
  moveUp,
  moveDown,
  setPlayerIndex,
  setPlayerVolume,
} from '../../redux/playQueueSlice';
import {
  toggleSelected,
  setRangeSelected,
  toggleRangeSelected,
  setSelected,
  clearSelected,
} from '../../redux/multiSelectSlice';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import ListViewType from '../viewtypes/ListViewType';
import Loader from '../loader/Loader';

const tableColumns = [
  {
    id: '#',
    dataKey: 'index',
    alignment: 'center',
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

const NowPlayingView = () => {
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(searchQuery, playQueue.entry, [
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
          if (searchQuery !== '') {
            dispatch(toggleRangeSelected(filteredData));
          } else {
            dispatch(toggleRangeSelected(playQueue.entry));
          }
        } else {
          dispatch(setSelected(rowData));
        }
      }, 300);
    }
  };

  const handleRowDoubleClick = (rowData: any) => {
    window.clearTimeout(timeout);
    timeout = null;

    // Reset volumes when changing to a new track
    dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
    dispatch(setPlayerVolume({ player: 2, volume: 0 }));

    dispatch(clearSelected());
    dispatch(setPlayerIndex(rowData));
  };

  if (!playQueue) {
    return <Loader />;
  }

  const handleUpClick = () => {
    const selectedIndexes: any[] = [];
    multiSelect.selected.map((selected: any) => {
      return selectedIndexes.push(
        playQueue.entry.findIndex((item: any) => item.id === selected.id)
      );
    });
    dispatch(moveUp(selectedIndexes));
  };

  const handleDownClick = () => {
    const selectedIndexes: any[] = [];
    multiSelect.selected.map((selected: any) => {
      return selectedIndexes.push(
        playQueue.entry.findIndex((item: any) => item.id === selected.id)
      );
    });
    dispatch(moveDown(selectedIndexes));
  };

  return (
    <GenericPage
      header={
        <GenericPageHeader
          title="Now Playing"
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showSearchBar
        />
      }
    >
      <ListViewType
        data={searchQuery !== '' ? filteredData : playQueue.entry}
        currentIndex={playQueue.currentIndex}
        tableColumns={tableColumns}
        handleRowClick={handleRowClick}
        handleRowDoubleClick={handleRowDoubleClick}
        handleUpClick={handleUpClick}
        handleDownClick={handleDownClick}
        virtualized
      />
    </GenericPage>
  );
};

export default NowPlayingView;
