/* eslint-disable import/no-cycle */
import React, { useState } from 'react';
import settings from 'electron-settings';
import { ButtonToolbar, Tag, Whisper, Button, Popover, TagGroup } from 'rsuite';
import { useQuery } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import { PlayAppendButton, PlayButton } from '../shared/ToolbarButtons';
import { getArtist, getArtistInfo } from '../../api/api';
import { useAppDispatch } from '../../redux/hooks';
import { fixPlayer2Index, setPlayQueueByRowClick } from '../../redux/playQueueSlice';
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
import { setStatus } from '../../redux/playerSlice';
import { addModalPage } from '../../redux/miscSlice';

interface ArtistParams {
  id: string;
}

const ArtistView = ({ ...rest }: any) => {
  const dispatch = useAppDispatch();
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
  const filteredData = useSearchQuery(searchQuery, data?.album, ['name', 'artist']);

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
    dispatch(
      setPlayQueueByRowClick({
        entries: data.album,
        currentIndex: e.index,
        currentSongId: e.id,
        uniqueSongId: e.uniqueId,
      })
    );
    dispatch(setStatus('PLAYING'));
    dispatch(fixPlayer2Index());
  };

  if (isLoading || isLoadingAI) {
    return <PageLoader />;
  }

  if (isError || isErrorAI) {
    return (
      <span>
        Error: {error.message} {errorAI.message}
      </span>
    );
  }

  return (
    <GenericPage
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
                    .replace('Read more on Last.fm</a>', '') !== ''
                    ? `${artistInfo.biography
                        ?.replace(/<[^>]*>/, '')
                        .replace('Read more on Last.fm</a>', '')}`
                    : 'No artist biography found'}
                </span>
              </CustomTooltip>
              <div style={{ marginTop: '10px' }}>
                <ButtonToolbar>
                  <PlayButton appearance="primary" size="lg" />
                  <PlayAppendButton appearance="primary" size="lg" />
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
                    <Button size="lg">Related Artists</Button>
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
          />
        )}
      </>
    </GenericPage>
  );
};

export default ArtistView;
