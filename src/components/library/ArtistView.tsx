import React, { useState } from 'react';
import settings from 'electron-settings';
import { ButtonToolbar, Tag, Whisper, Button, Popover, TagGroup } from 'rsuite';
import { useQuery } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import {
  PlayAppendButton,
  PlayButton,
  PlayShuffleAppendButton,
  PlayShuffleButton,
  EditButton,
} from '../shared/ToolbarButtons';
import { getArtist, getArtistInfo } from '../../api/api';
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
import GridViewType from '../viewtypes/GridViewType';
import Loader from '../loader/Loader';
import GenericPageHeader from '../layout/GenericPageHeader';
import CustomTooltip from '../shared/CustomTooltip';
import { TagLink } from './styled';

interface ArtistParams {
  id: string;
}

const ArtistView = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [viewType, setViewType] = useState(
    settings.getSync('albumViewType') || 'list'
  );
  const { id } = useParams<ArtistParams>();
  const { isLoading, isError, data, error }: any = useQuery(
    ['artist', id],
    () => getArtist(id)
  );
  const {
    isLoading: isLoadingAI,
    isError: isErrorAI,
    data: artistInfo,
    error: errorAI,
  }: any = useQuery(['artistInfo', id], () => getArtistInfo(id, 8));

  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = useSearchQuery(searchQuery, data?.song, [
    'title',
    'artist',
    'album',
    'genre',
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

          dispatch(toggleRangeSelected(data.album));
        } else {
          dispatch(setSelected(rowData));
        }
      }, 300);
    }
  };

  const handleRowDoubleClick = (e: any) => {
    window.clearTimeout(timeout);
    timeout = null;
    const newPlayQueue = data.album.slice([e.index], data.album.length);

    dispatch(clearSelected());
    dispatch(setPlayQueue(newPlayQueue));
    dispatch(fixPlayer2Index());
  };

  if (isLoading || isLoadingAI) {
    return <Loader />;
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
                  <PlayButton appearance="primary" size="lg" circle />
                  <PlayShuffleButton />
                  <PlayAppendButton />
                  <PlayShuffleAppendButton />
                  <EditButton style={{ marginRight: '10px' }} />
                  <Whisper
                    placement="bottomStart"
                    trigger="click"
                    speaker={
                      <Popover style={{ width: '400px' }}>
                        <TagGroup>
                          {artistInfo.similarArtist?.map((artist: any) => (
                            <Tag key={artist.id}>
                              <TagLink
                                onClick={() =>
                                  history.push(`/library/artist/${artist.id}`)
                                }
                              >
                                {artist.name}
                              </TagLink>
                            </Tag>
                          ))}
                        </TagGroup>
                      </Popover>
                    }
                  >
                    <Button>Related Artists</Button>
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
            }}
            listType="album"
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
            size="150px"
            cacheType="album"
          />
        )}
      </>
    </GenericPage>
  );
};

export default ArtistView;
