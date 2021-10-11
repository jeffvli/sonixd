/* eslint-disable import/no-cycle */
import React, { useState } from 'react';
import _ from 'lodash';
import settings from 'electron-settings';
import { ButtonToolbar, Tag, Whisper, Button, Popover, TagGroup } from 'rsuite';
import { useQuery, useQueryClient } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import {
  FavoriteButton,
  PlayAppendButton,
  PlayAppendNextButton,
  PlayButton,
} from '../shared/ToolbarButtons';
import { getAllArtistSongs, getArtist, getArtistInfo, star, unstar } from '../../api/api';
import { useAppDispatch } from '../../redux/hooks';
import {
  toggleSelected,
  setRangeSelected,
  toggleRangeSelected,
  clearSelected,
} from '../../redux/multiSelectSlice';
import useSearchQuery from '../../hooks/useSearchQuery';
import GenericPage from '../layout/GenericPage';
import ListViewType from '../viewtypes/ListViewType';
import GridViewType from '../viewtypes/GridViewType';
import PageLoader from '../loader/PageLoader';
import GenericPageHeader from '../layout/GenericPageHeader';
import CustomTooltip from '../shared/CustomTooltip';
import { TagLink } from './styled';
import { addModalPage } from '../../redux/miscSlice';
import { appendPlayQueue, setPlayQueue } from '../../redux/playQueueSlice';
import { notifyToast } from '../shared/toast';

interface ArtistParams {
  id: string;
}

const ArtistView = ({ ...rest }: any) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const history = useHistory();
  const [viewType, setViewType] = useState(settings.getSync('albumViewType') || 'list');
  const { id } = useParams<ArtistParams>();
  const artistId = rest.id ? rest.id : id;
  const { isLoading, isError, data, error }: any = useQuery(['artist', artistId], () =>
    getArtist(artistId)
  );
  const {
    isLoading: isLoadingAI,
    isError: isErrorAI,
    data: artistInfo,
    error: errorAI,
  }: any = useQuery(['artistInfo', artistId], () => getArtistInfo(artistId, 8));

  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(searchQuery, data?.album, [
    'name',
    'artist',
    'genre',
    'year',
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
          dispatch(toggleRangeSelected(searchQuery !== '' ? filteredData : data.album));
        }
      }, 100);
    }
  };

  const handleRowDoubleClick = (e: any) => {
    window.clearTimeout(timeout);
    timeout = null;
    dispatch(clearSelected());
    history.push(`/library/album/${e.id}`);
  };

  const handleFavorite = async () => {
    if (!data.starred) {
      await star(data.id, 'artist');
      queryClient.setQueryData(['artist', artistId], { ...data, starred: Date.now() });
    } else {
      await unstar(data.id, 'artist');
      queryClient.setQueryData(['artist', artistId], { ...data, starred: undefined });
    }
  };

  const handlePlay = async () => {
    const songs = await getAllArtistSongs(data.id);
    dispatch(setPlayQueue({ entries: songs }));
    notifyToast('info', `Playing ${songs.length} song(s)`);
  };

  const handlePlayAppend = async (type: 'next' | 'later') => {
    const songs = await getAllArtistSongs(data.id);
    dispatch(appendPlayQueue({ entries: songs, type }));
    notifyToast('info', `Added ${songs.length} song(s)`);
  };

  if (isLoading || isLoadingAI) {
    return <PageLoader />;
  }

  if (isError || isErrorAI) {
    return (
      <span>
        Error: {error?.message} {errorAI?.message}
      </span>
    );
  }

  const handleRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await star(rowData.id, 'album');
      queryClient.setQueryData(['artist', artistId], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await unstar(rowData.id, 'album');
      queryClient.setQueryData(['artist', artistId], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = undefined;
        });

        return oldData;
      });
    }
  };

  return (
    <GenericPage
      hideDivider
      header={
        <GenericPageHeader
          image={data.image}
          imageHeight={145}
          title={data.name}
          subtitle={
            <>
              <CustomTooltip
                text={artistInfo.biography
                  ?.replace(/<[^>]*>/, '')
                  .replace('Read more on Last.fm</a>', '')}
                placement="bottomStart"
              >
                <span>
                  {artistInfo.biography
                    ?.replace(/<[^>]*>/, '')
                    .replace('Read more on Last.fm</a>', '')
                    ?.trim() !== ''
                    ? `${artistInfo.biography
                        ?.replace(/<[^>]*>/, '')
                        .replace('Read more on Last.fm</a>', '')}`
                    : 'No artist biography found'}
                </span>
              </CustomTooltip>
              <div style={{ marginTop: '10px' }}>
                <ButtonToolbar>
                  <PlayButton appearance="primary" size="md" onClick={handlePlay} />
                  <PlayAppendNextButton
                    appearance="primary"
                    size="md"
                    onClick={() => handlePlayAppend('next')}
                  />
                  <PlayAppendButton
                    appearance="primary"
                    size="md"
                    onClick={() => handlePlayAppend('later')}
                  />
                  <FavoriteButton size="md" isFavorite={data.starred} onClick={handleFavorite} />
                  <Whisper
                    placement="bottomStart"
                    trigger="hover"
                    enterable
                    speaker={
                      <Popover style={{ width: '400px' }}>
                        <TagGroup>
                          {artistInfo.similarArtist?.map((artist: any) => (
                            <Tag key={artist.id}>
                              <TagLink
                                onClick={() => {
                                  if (!rest.isModal) {
                                    history.push(`/library/artist/${artist.id}`);
                                  } else {
                                    dispatch(
                                      addModalPage({
                                        pageType: 'artist',
                                        id: artist.id,
                                      })
                                    );
                                  }
                                }}
                              >
                                {artist.name}
                              </TagLink>
                            </Tag>
                          ))}
                        </TagGroup>
                      </Popover>
                    }
                  >
                    <Button size="md">Related Artists</Button>
                  </Whisper>
                </ButtonToolbar>
              </div>
            </>
          }
          searchQuery={searchQuery}
          handleSearch={(e: any) => setSearchQuery(e)}
          clearSearchQuery={() => setSearchQuery('')}
          showSearchBar
          showViewTypeButtons
          viewTypeSetting="album"
          handleListClick={() => setViewType('list')}
          handleGridClick={() => setViewType('grid')}
        />
      }
    >
      <>
        {viewType === 'list' && (
          <ListViewType
            data={searchQuery !== '' ? filteredData : data.album}
            tableColumns={settings.getSync('albumListColumns')}
            handleRowClick={handleRowClick}
            handleRowDoubleClick={handleRowDoubleClick}
            virtualized
            rowHeight={Number(settings.getSync('albumListRowHeight'))}
            fontSize={Number(settings.getSync('albumListFontSize'))}
            cacheImages={{
              enabled: settings.getSync('cacheImages'),
              cacheType: 'album',
              cacheIdProperty: 'albumId',
            }}
            listType="album"
            isModal={rest.isModal}
            disabledContextMenuOptions={['removeFromCurrent', 'moveSelectedTo', 'deletePlaylist']}
            handleFavorite={handleRowFavorite}
          />
        )}

        {viewType === 'grid' && (
          <GridViewType
            data={searchQuery === '' ? data.album : filteredData}
            cardTitle={{
              prefix: '/library/album',
              property: 'name',
              urlProperty: 'albumId',
            }}
            cardSubtitle={{
              property: 'songCount',
              unit: ' tracks',
            }}
            playClick={{ type: 'album', idProperty: 'id' }}
            size={Number(settings.getSync('gridCardSize'))}
            cacheType="album"
            isModal={rest.isModal}
            handleFavorite={handleRowFavorite}
          />
        )}
      </>
    </GenericPage>
  );
};

export default ArtistView;
