import React, { useState } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router';
import useSearchQuery from '../../hooks/useSearchQuery';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import ListViewType from '../viewtypes/ListViewType';
import PageLoader from '../loader/PageLoader';
import { useAppDispatch } from '../../redux/hooks';
import {
  clearSelected,
  setRangeSelected,
  toggleRangeSelected,
  toggleSelected,
} from '../../redux/multiSelectSlice';
import { getGenres } from '../../api/api';

const GenreList = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { isLoading, isError, data: genres, error }: any = useQuery(['genreList'], async () => {
    const res = await getGenres();
    return _.orderBy(res, 'songCount', 'desc');
  });
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(searchQuery, genres, ['value']);

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          dispatch(toggleRangeSelected(searchQuery !== '' ? filteredData : genres));
        }
      }, 100);
    }
  };

  const handleRowDoubleClick = (rowData: any) => {
    window.clearTimeout(timeout);
    timeout = null;

    dispatch(clearSelected());
    history.push(`/library/album?sortType=${rowData.value}`);
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
          tableColumns={settings.getSync('genreListColumns')}
          rowHeight={Number(settings.getSync('genreListRowHeight'))}
          fontSize={settings.getSync('genreListFontSize')}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          listType="genre"
          virtualized
          disabledContextMenuOptions={[
            'play',
            'addToQueueNext',
            'addToQueueLast',
            'moveSelectedTo',
            'removeFromCurrent',
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
