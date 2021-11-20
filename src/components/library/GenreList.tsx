import React from 'react';
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
import { setActive } from '../../redux/albumSlice';
import { apiController } from '../../api/controller';

const GenreList = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const config = useAppSelector((state) => state.config);
  const album = useAppSelector((state) => state.album);
  const misc = useAppSelector((state) => state.misc);
  const folder = useAppSelector((state) => state.folder);
  const { isLoading, isError, data: genres, error }: any = useQuery(['genrePageList'], async () => {
    const res = await apiController({
      serverType: config.serverType,
      endpoint: 'getGenres',
      args: { musicFolderId: folder.musicFolder },
    });
    return _.orderBy(res, 'songCount', 'desc');
  });
  const filteredData = useSearchQuery(misc.searchQuery, genres, ['title']);

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
    dispatch(setActive({ ...album.active, filter: rowData.title }));
    dispatch(clearSelected());

    // Needs a small delay or the filter won't set properly when navigating to the album list
    setTimeout(() => {
      history.push(`/library/album?sortType=${rowData.title}`);
    }, 50);
  };

  return (
    <GenericPage hideDivider header={<GenericPageHeader title="Genres" />}>
      {isLoading && <PageLoader />}
      {isError && <div>Error: {error}</div>}
      {!isLoading && genres && !isError && (
        <ListViewType
          data={misc.searchQuery !== '' ? filteredData : genres}
          tableColumns={config.lookAndFeel.listView.genre.columns}
          rowHeight={config.lookAndFeel.listView.genre.rowHeight}
          fontSize={config.lookAndFeel.listView.genre.fontSize}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          page="genreListPage"
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
