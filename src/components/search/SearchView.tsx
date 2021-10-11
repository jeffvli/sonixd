import React, { useState } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { useQuery, useQueryClient } from 'react-query';
import { Panel } from 'rsuite';
import { search3, star, unstar } from '../../api/api';
import useRouterQuery from '../../hooks/useRouterQuery';
import GenericPage from '../layout/GenericPage';
import GenericPageHeader from '../layout/GenericPageHeader';
import PageLoader from '../loader/PageLoader';
import ScrollingMenu from '../scrollingmenu/ScrollingMenu';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  clearSelected,
  setRangeSelected,
  toggleRangeSelected,
  toggleSelected,
} from '../../redux/multiSelectSlice';
import { fixPlayer2Index, setPlayQueueByRowClick } from '../../redux/playQueueSlice';
import { setStatus } from '../../redux/playerSlice';
import ListViewTable from '../viewtypes/ListViewTable';
import { SectionTitle, SectionTitleWrapper } from '../shared/styled';

const SearchView = () => {
  const dispatch = useAppDispatch();
  const query = useRouterQuery();
  const queryClient = useQueryClient();
  const multiSelect = useAppSelector((state) => state.multiSelect);
  const playQueue = useAppSelector((state) => state.playQueue);
  const urlQuery = query.get('query') || '';
  const cardSize = Number(settings.getSync('gridCardSize'));
  const [searchQuery, setSearchQuery] = useState(query.get('query') || '');
  const { isLoading, isError, data, error }: any = useQuery(['search', urlQuery], () =>
    search3(urlQuery)
  );

  let timeout: any = null;
  const handleRowClick = (e: any, rowData: any) => {
    if (timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null;

        if (e.ctrlKey) {
          dispatch(toggleSelected(rowData));
        } else if (e.shiftKey) {
          dispatch(setRangeSelected(rowData));
          dispatch(toggleRangeSelected(data.song));
        }
      }, 100);
    }
  };

  const handleRowDoubleClick = (e: any) => {
    window.clearTimeout(timeout);
    timeout = null;

    dispatch(clearSelected());
    dispatch(
      setPlayQueueByRowClick({
        entries: data.song,
        currentIndex: e.index,
        currentSongId: e.id,
        uniqueSongId: e.uniqueId,
      })
    );
    dispatch(setStatus('PLAYING'));
    dispatch(fixPlayer2Index());
  };

  const handleRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await star(rowData.id, 'music');
      queryClient.setQueryData(['search', urlQuery], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.song, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.song[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await unstar(rowData.id, 'album');
      queryClient.setQueryData(['search', urlQuery], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData.song, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.song[index].starred = undefined;
        });

        return oldData;
      });
    }
  };

  return (
    <GenericPage
      header={
        <GenericPageHeader
          title="Search"
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showSearchBar
        />
      }
    >
      {isLoading && <PageLoader />}
      {isError && <div>Error: {error}</div>}
      {!isLoading && data && (
        <>
          <ScrollingMenu
            title="Artists"
            data={data.artist}
            cardTitle={{
              prefix: '/library/artist',
              property: 'name',
              urlProperty: 'id',
            }}
            cardSubtitle={{
              property: 'albumCount',
              unit: ' albums',
            }}
            cardSize={cardSize}
            type="artist"
          />

          <ScrollingMenu
            title="Albums"
            data={data.album}
            cardTitle={{
              prefix: '/library/album',
              property: 'name',
              urlProperty: 'albumId',
            }}
            cardSubtitle={{
              prefix: 'artist',
              property: 'artist',
              urlProperty: 'artistId',
              unit: '',
            }}
            cardSize={cardSize}
            type="album"
          />
          <SectionTitleWrapper>
            <SectionTitle>Songs</SectionTitle>
          </SectionTitleWrapper>
          <Panel bodyFill bordered>
            <ListViewTable
              height={500}
              data={data.song}
              columns={settings.getSync('musicListColumns')}
              rowHeight={Number(settings.getSync('musicListRowHeight'))}
              fontSize={settings.getSync('musicListFontSize')}
              handleRowClick={handleRowClick}
              handleRowDoubleClick={handleRowDoubleClick}
              listType="music"
              cacheImages={{
                enabled: settings.getSync('cacheImages'),
                cacheType: 'album',
                cacheIdProperty: 'albumId',
              }}
              disabledContextMenuOptions={['deletePlaylist', 'viewInModal']}
              playQueue={playQueue}
              multiSelect={multiSelect}
              isModal={false}
              miniView={false}
              dnd={false}
              virtualized
              handleFavorite={handleRowFavorite}
            />
          </Panel>
        </>
      )}
    </GenericPage>
  );
};

export default SearchView;
