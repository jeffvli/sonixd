import React, { useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router';
import useSearchQuery from '../../hooks/useSearchQuery';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import ListViewType from '../viewtypes/ListViewType';
import PageLoader from '../loader/PageLoader';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  clearSelected,
  setRangeSelected,
  toggleRangeSelected,
  toggleSelected,
} from '../../redux/multiSelectSlice';
import { getGenres } from '../../api/api';
import { setActive } from '../../redux/albumSlice';

const GenreList = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const config = useAppSelector((state) => state.config);
  const { isLoading, isError, data: genres, error }: any = useQuery(['genreList'], async () => {
    const res = await getGenres();
    return _.orderBy(res, 'songCount', 'desc');
  });
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(searchQuery, genres, ['value']);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any, tableData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          dispatch(toggleRangeSelected(tableData));
        }
      }, 100);
    }
  };

  const handleRowDoubleClick = (rowData: any) => {
    window.clearTimeout(timeout);
    timeout = null;
    dispatch(setActive({ filter: rowData.value }));
    dispatch(clearSelected());

    // Needs a small delay or the filter won't set properly when navigating to the album list
    setTimeout(() => {
      history.push(`/library/album?sortType=${rowData.value}`);
    }, 50);
  };

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          title="Genres"
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showSearchBar
        />
      }
    >
      {isLoading && <PageLoader />}
      {isError && <div>Error: {error}</div>}
      {!isLoading && genres && !isError && (
        <ListViewType
          data={searchQuery !== '' ? filteredData : genres}
          tableColumns={config.lookAndFeel.listView.genre.columns}
          rowHeight={config.lookAndFeel.listView.genre.rowHeight}
          fontSize={config.lookAndFeel.listView.genre.fontSize}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          listType="genre"
          virtualized
          disabledContextMenuOptions={[
            'play',
            'addToQueueNext',
            'addToQueueLast',
            'moveSelectedTo',
            'removeSelected',
            'addToPlaylist',
            'deletePlaylist',
            'addToFavorites',
            'removeFromFavorites',
            'viewInModal',
            'viewInFolder',
          ]}
        />
      )}
    </GenericPage>
  );
};

export default GenreList;
