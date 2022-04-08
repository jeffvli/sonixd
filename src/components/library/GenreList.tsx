import React from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import useSearchQuery from '../../hooks/useSearchQuery';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import ListViewType from '../viewtypes/ListViewType';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { apiController } from '../../api/controller';
import { StyledTag } from '../shared/styled';
import { setFilter, setPagination } from '../../redux/viewSlice';
import { Item } from '../../types';
import CenterLoader from '../loader/CenterLoader';
import useListClickHandler from '../../hooks/useListClickHandler';

const GenreList = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const config = useAppSelector((state) => state.config);
  const misc = useAppSelector((state) => state.misc);
  const folder = useAppSelector((state) => state.folder);
  const {
    isLoading,
    isError,
    data: genres,
    error,
  }: any = useQuery(['genrePageList'], async () => {
    const res = await apiController({
      serverType: config.serverType,
      endpoint: 'getGenres',
      args: { musicFolderId: folder.musicFolder },
    });
    return _.orderBy(res, 'songCount', 'desc');
  });
  const filteredData = useSearchQuery(misc.searchQuery, genres, ['title']);

  const { handleRowClick, handleRowDoubleClick } = useListClickHandler({
    doubleClick: (rowData: any) => {
      dispatch(setFilter({ listType: Item.Album, data: rowData.title }));
      dispatch(setPagination({ listType: Item.Album, data: { activePage: 1 } }));
      localStorage.setItem('scroll_list_albumList', '0');
      localStorage.setItem('scroll_grid_albumList', '0');

      // Needs a small delay or the filter won't set properly when navigating to the album list
      setTimeout(() => {
        history.push(`/library/album?sortType=${rowData.title}`);
      }, 50);
    },
  });

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          title={
            <>
              {t('Genres')}{' '}
              <StyledTag style={{ verticalAlign: 'middle', cursor: 'default' }}>
                {genres?.length || '...'}
              </StyledTag>
            </>
          }
        />
      }
    >
      {isLoading && <CenterLoader />}
      {isError && <div>{t('Error: {{error}}', { error })}</div>}
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
            'moveSelectedTo',
            'removeSelected',
            'addToPlaylist',
            'deletePlaylist',
            'addToFavorites',
            'removeFromFavorites',
            'viewInModal',
            'viewInFolder',
            'setRating',
          ]}
          initialScrollOffset={Number(localStorage.getItem('scroll_list_genreList'))}
          onScroll={(scrollIndex: number) => {
            localStorage.setItem('scroll_list_genreList', String(Math.abs(scrollIndex)));
          }}
        />
      )}
    </GenericPage>
  );
};

export default GenreList;
