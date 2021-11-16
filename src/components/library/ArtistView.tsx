/* eslint-disable import/no-cycle */
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import FastAverageColor from 'fast-average-color';
import { clipboard, shell } from 'electron';
import settings from 'electron-settings';
import { ButtonToolbar, Whisper, TagGroup } from 'rsuite';
import { useQuery, useQueryClient } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import {
  DownloadButton,
  FavoriteButton,
  PlayAppendButton,
  PlayAppendNextButton,
  PlayButton,
} from '../shared/ToolbarButtons';
import {
  getAlbum,
  getAllArtistSongs,
  getArtist,
  getArtistInfo,
  getDownloadUrl,
  star,
  unstar,
} from '../../api/api';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
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
import { addModalPage } from '../../redux/miscSlice';
import {
  appendPlayQueue,
  clearPlayQueue,
  fixPlayer2Index,
  setPlayQueue,
} from '../../redux/playQueueSlice';
import { notifyToast } from '../shared/toast';
import {
  filterPlayQueue,
  formatDuration,
  getPlayedSongsNotification,
  isCached,
} from '../../shared/utils';
import { StyledButton, StyledPopover, StyledTag } from '../shared/styled';
import { setStatus } from '../../redux/playerSlice';
import { GradientBackground, PageHeaderSubtitleDataLine } from '../layout/styled';

const fac = new FastAverageColor();

interface ArtistParams {
  id: string;
}

const ArtistView = ({ ...rest }: any) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const history = useHistory();
  const misc = useAppSelector((state) => state.misc);
  const config = useAppSelector((state) => state.config);
  const [viewType, setViewType] = useState(settings.getSync('albumViewType') || 'list');
  const [imageAverageColor, setImageAverageColor] = useState({ color: '', loaded: false });
  const [artistDurationTotal, setArtistDurationTotal] = useState('');
  const [artistSongTotal, setArtistSongTotal] = useState(0);

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

  const filteredData = useSearchQuery(misc.searchQuery, data?.album, [
    'name',
    'artist',
    'genre',
    'year',
  ]);

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
    dispatch(clearSelected());
    history.push(`/library/album/${rowData.id}`);
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
    const res = await getAllArtistSongs(data.id);
    const songs = filterPlayQueue(config.playback.filters, res);

    if (songs.entries.length > 0) {
      dispatch(setPlayQueue({ entries: songs.entries }));
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    } else {
      dispatch(clearPlayQueue());
      dispatch(setStatus('PAUSED'));
    }

    notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'play' }));
  };

  const handlePlayAppend = async (type: 'next' | 'later') => {
    const res = await getAllArtistSongs(data.id);
    const songs = filterPlayQueue(config.playback.filters, res);

    if (songs.entries.length > 0) {
      dispatch(appendPlayQueue({ entries: songs.entries, type }));
      dispatch(fixPlayer2Index());
    }

    notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'add' }));
  };

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

  const handleDownload = async (type: 'copy' | 'download') => {
    if (data.album[0]?.parent) {
      if (type === 'download') {
        shell.openExternal(getDownloadUrl(data.album[0].parent));
      } else {
        clipboard.writeText(getDownloadUrl(data.album[0].parent));
        notifyToast('info', 'Download links copied!');
      }
    } else {
      const downloadUrls: string[] = [];

      for (let i = 0; i < data.album.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const albumRes = await getAlbum(data.album[i].id);
        if (albumRes.song[0]?.parent) {
          downloadUrls.push(getDownloadUrl(albumRes.song[0].parent));
        } else {
          notifyToast('warning', `[${albumRes.name}] No parent album found`);
        }
      }

      if (type === 'download') {
        downloadUrls.forEach((link) => shell.openExternal(link));
      }

      if (type === 'copy') {
        clipboard.writeText(downloadUrls.join('\n'));
        notifyToast('info', 'Download links copied!');
      }
    }
  };

  useEffect(() => {
    if (!isLoading) {
      const img = isCached(`${misc.imageCachePath}artist_${data?.id}.jpg`)
        ? `${misc.imageCachePath}artist_${data?.id}.jpg`
        : data?.image.includes('placeholder')
        ? artistInfo?.largeImageUrl &&
          !artistInfo?.largeImageUrl?.match('2a96cbd8b46e442fc41c2b86b821562f')
          ? artistInfo?.largeImageUrl
          : data?.image
        : data?.image;

      const setAvgColor = (imgUrl: string) => {
        if (
          data?.image.match('placeholder') ||
          (data?.image.match('placeholder') &&
            artistInfo?.largeImageUrl?.match('2a96cbd8b46e442fc41c2b86b821562f'))
        ) {
          setImageAverageColor({ color: 'rgba(50, 50, 50, .4)', loaded: true });
        } else {
          fac
            .getColorAsync(imgUrl, {
              ignoredColor: [
                [255, 255, 255, 255], // White
                [0, 0, 0, 255], // Black
              ],
              mode: 'precision',
              algorithm: 'dominant',
            })
            .then((color) => {
              return setImageAverageColor({
                color: color.rgba,
                loaded: true,
              });
            })
            .catch(() => setAvgColor(imgUrl));
        }
      };
      setAvgColor(img);
    }
  }, [artistInfo?.largeImageUrl, data?.id, data?.image, isLoading, misc.imageCachePath]);

  useEffect(() => {
    const allAlbumDurations = _.sum(_.map(data?.album, 'duration'));
    const allSongCount = _.sum(_.map(data?.album, 'songCount'));

    setArtistDurationTotal(formatDuration(allAlbumDurations) || 'N/a');
    setArtistSongTotal(allSongCount);
  }, [data?.album]);

  if (isLoading || isLoadingAI || imageAverageColor.loaded === false) {
    return <PageLoader />;
  }

  if (isError || isErrorAI) {
    return (
      <span>
        Error: {error?.message} {errorAI?.message}
      </span>
    );
  }

  return (
    <>
      {!rest.isModal && (
        <GradientBackground $expanded={misc.expandSidebar} $color={imageAverageColor.color} />
      )}
      <GenericPage
        contentZIndex={1}
        hideDivider
        header={
          <GenericPageHeader
            image={
              isCached(`${misc.imageCachePath}artist_${data.id}.jpg`)
                ? `${misc.imageCachePath}artist_${data.id}.jpg`
                : data.image.includes('placeholder')
                ? artistInfo?.largeImageUrl &&
                  !artistInfo?.largeImageUrl?.match('2a96cbd8b46e442fc41c2b86b821562f')
                  ? artistInfo.largeImageUrl
                  : data.image
                : data.image
            }
            cacheImages={{
              enabled: settings.getSync('cacheImages'),
              cacheType: 'artist',
              id: data.id,
            }}
            imageHeight={185}
            title={data.name}
            showTitleTooltip
            subtitle={
              <>
                <PageHeaderSubtitleDataLine $top>
                  <strong>ARTIST</strong> • {data.albumCount} albums • {artistSongTotal} songs •{' '}
                  {artistDurationTotal}
                </PageHeaderSubtitleDataLine>
                <CustomTooltip
                  text={artistInfo?.biography
                    ?.replace(/<[^>]*>/, '')
                    .replace('Read more on Last.fm</a>', '')}
                  placement="bottomStart"
                >
                  <PageHeaderSubtitleDataLine
                    style={{
                      minHeight: '2.5rem',
                      maxHeight: '2.5rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    <span>
                      {artistInfo?.biography
                        ?.replace(/<[^>]*>/, '')
                        .replace('Read more on Last.fm</a>', '')
                        ?.trim()
                        ? `${artistInfo?.biography
                            ?.replace(/<[^>]*>/, '')
                            .replace('Read more on Last.fm</a>', '')}`
                        : 'No artist biography found'}
                    </span>
                  </PageHeaderSubtitleDataLine>
                </CustomTooltip>

                <div style={{ marginTop: '10px' }}>
                  <ButtonToolbar>
                    <PlayButton appearance="primary" size="lg" onClick={handlePlay} />
                    <PlayAppendNextButton
                      appearance="primary"
                      size="lg"
                      onClick={() => handlePlayAppend('next')}
                    />
                    <PlayAppendButton
                      appearance="primary"
                      size="lg"
                      onClick={() => handlePlayAppend('later')}
                    />
                    <Whisper
                      trigger="hover"
                      placement="bottom"
                      delay={250}
                      enterable
                      preventOverflow
                      speaker={
                        <StyledPopover>
                          <ButtonToolbar>
                            <StyledButton onClick={() => handleDownload('download')}>
                              Download
                            </StyledButton>
                            <StyledButton onClick={() => handleDownload('copy')}>
                              Copy to clipboard
                            </StyledButton>
                          </ButtonToolbar>
                        </StyledPopover>
                      }
                    >
                      <DownloadButton size="lg" />
                    </Whisper>
                    <FavoriteButton size="lg" isFavorite={data.starred} onClick={handleFavorite} />
                    <Whisper
                      trigger="hover"
                      placement="bottom"
                      delay={250}
                      enterable
                      preventOverflow
                      speaker={
                        <StyledPopover style={{ width: '400px' }}>
                          <div>
                            <h6>Related artists</h6>
                            <TagGroup>
                              {artistInfo.similarArtist?.map((artist: any) => (
                                <StyledTag
                                  key={artist.id}
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
                                </StyledTag>
                              ))}
                            </TagGroup>
                          </div>
                          <br />
                          <StyledButton
                            appearance="primary"
                            disabled={!artistInfo?.lastFmUrl}
                            onClick={() => shell.openExternal(artistInfo?.lastFmUrl)}
                          >
                            View on Last.FM
                          </StyledButton>
                        </StyledPopover>
                      }
                    >
                      <StyledButton size="lg">Info</StyledButton>
                    </Whisper>
                  </ButtonToolbar>
                </div>
              </>
            }
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
              data={misc.searchQuery !== '' ? filteredData : data.album}
              tableColumns={config.lookAndFeel.listView.album.columns}
              handleRowClick={handleRowClick}
              handleRowDoubleClick={handleRowDoubleClick}
              virtualized
              rowHeight={config.lookAndFeel.listView.album.rowHeight}
              fontSize={config.lookAndFeel.listView.album.fontSize}
              cacheImages={{
                enabled: settings.getSync('cacheImages'),
                cacheType: 'album',
                cacheIdProperty: 'albumId',
              }}
              page="artistPage"
              listType="album"
              isModal={rest.isModal}
              disabledContextMenuOptions={[
                'removeSelected',
                'moveSelectedTo',
                'deletePlaylist',
                'viewInFolder',
              ]}
              handleFavorite={handleRowFavorite}
            />
          )}

          {viewType === 'grid' && (
            <GridViewType
              data={misc.searchQuery !== '' ? filteredData : data.album}
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
              size={config.lookAndFeel.gridView.cardSize}
              cacheType="album"
              isModal={rest.isModal}
              handleFavorite={handleRowFavorite}
            />
          )}
        </>
      </GenericPage>
    </>
  );
};

export default ArtistView;
