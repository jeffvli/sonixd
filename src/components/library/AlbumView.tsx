import React, { useRef } from 'react';
import { nanoid } from 'nanoid/non-secure';
import { clipboard, shell } from 'electron';
import settings from 'electron-settings';
import { ButtonToolbar, Whisper } from 'rsuite';
import { useQuery, useQueryClient } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DownloadButton,
  FavoriteButton,
  PlayAppendButton,
  PlayAppendNextButton,
  PlayButton,
} from '../shared/ToolbarButtons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fixPlayer2Index, setPlayQueueByRowClick } from '../../redux/playQueueSlice';
import useSearchQuery from '../../hooks/useSearchQuery';
import GenericPage from '../layout/GenericPage';
import ListViewType from '../viewtypes/ListViewType';
import GenericPageHeader from '../layout/GenericPageHeader';
import { setStatus } from '../../redux/playerSlice';
import { addModalPage } from '../../redux/miscSlice';
import { notifyToast } from '../shared/toast';
import { formatDate, formatDuration, getAlbumSize, isCached } from '../../shared/utils';
import { LinkWrapper, StyledButton, StyledLink, StyledTagLink } from '../shared/styled';
import {
  BlurredBackground,
  BlurredBackgroundWrapper,
  PageHeaderSubtitleDataLine,
} from '../layout/styled';
import { apiController } from '../../api/controller';
import { Artist, Genre, Item, Play, Server } from '../../types';
import Card from '../card/Card';
import { setFilter, setPagination } from '../../redux/viewSlice';
import CenterLoader from '../loader/CenterLoader';
import useListClickHandler from '../../hooks/useListClickHandler';
import Popup from '../shared/Popup';
import usePlayQueueHandler from '../../hooks/usePlayQueueHandler';
import useFavorite from '../../hooks/useFavorite';
import { useRating } from '../../hooks/useRating';

interface AlbumParams {
  id: string;
}

const AlbumView = ({ ...rest }: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const misc = useAppSelector((state) => state.misc);
  const config = useAppSelector((state) => state.config);
  const history = useHistory();
  const queryClient = useQueryClient();
  const artistLineRef = useRef<any>();
  const genreLineRef = useRef<any>();

  const { id } = useParams<AlbumParams>();
  const albumId = rest.id ? rest.id : id;

  const { isLoading, isError, data, error }: any = useQuery(['album', albumId], () =>
    apiController({
      serverType: config.serverType,
      endpoint: 'getAlbum',
      args: { id: albumId },
    })
  );
  const filteredData = useSearchQuery(misc.searchQuery, data?.song, [
    'title',
    'artist',
    'album',
    'year',
    'genre',
    'path',
  ]);

  const { handleRowClick, handleRowDoubleClick } = useListClickHandler({
    doubleClick: (rowData: any) => {
      dispatch(
        setPlayQueueByRowClick({
          entries: rowData.tableData,
          currentIndex: rowData.rowIndex,
          currentSongId: rowData.id,
          uniqueSongId: rowData.uniqueId,
          filters: config.playback.filters,
        })
      );
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    },
  });

  const { handlePlayQueueAdd } = usePlayQueueHandler();
  const { handleFavorite } = useFavorite();
  const { handleRating } = useRating();

  const handleDownload = async (type: 'copy' | 'download') => {
    if (config.serverType === Server.Jellyfin) {
      const downloadUrls = [];
      for (let i = 0; i < data.song.length; i += 1) {
        downloadUrls.push(
          // eslint-disable-next-line no-await-in-loop
          await apiController({
            serverType: config.serverType,
            endpoint: 'getDownloadUrl',
            args: { id: data.song[i].id },
          })
        );
      }

      if (type === 'download') {
        downloadUrls.forEach((url) => shell.openExternal(url));
      } else {
        clipboard.writeText(downloadUrls.join('\n'));
        notifyToast('info', t('Download links copied!'));
      }

      // If not Navidrome (this assumes Airsonic), then we need to use a song's parent
      // to download. This is because Airsonic does not support downloading via album ids
      // that are provided by /getAlbum or /getAlbumList2
    } else if (data.song[0]?.parent) {
      if (type === 'download') {
        shell.openExternal(
          await apiController({
            serverType: config.serverType,
            endpoint: 'getDownloadUrl',
            args: { id: data.song[0].parent },
          })
        );
      } else {
        clipboard.writeText(
          await apiController({
            serverType: config.serverType,
            endpoint: 'getDownloadUrl',
            args:
              config.serverType === Server.Subsonic ? { id: data.song[0].parent } : { id: data.id },
          })
        );
        notifyToast('info', t('Download links copied!'));
      }
    } else {
      notifyToast('warning', t('No parent album found'));
    }
  };

  if (isLoading) {
    return <CenterLoader />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <>
      {!rest.isModal && (
        <BlurredBackgroundWrapper
          hasImage={!data?.image.match('placeholder')}
          expanded={config.lookAndFeel.sidebar.expand}
          $titleBar={misc.titleBar} // transient prop to determine margin
          sidebarwidth={config.lookAndFeel.sidebar.width}
        >
          <BlurredBackground
            // We have to use an inline style here due to the context menu forcing a component rerender
            // which causes the background-image to flicker
            expanded={config.lookAndFeel.sidebar.expand}
            style={{
              backgroundImage: `url(${
                !data?.image.match('placeholder')
                  ? isCached(`${misc.imageCachePath}album_${albumId}.jpg`)
                    ? `${misc.imageCachePath}album_${albumId}.jpg`.replaceAll('\\', '/')
                    : data.image
                  : 'null'
              })`,
            }}
          />
        </BlurredBackgroundWrapper>
      )}

      <GenericPage
        hideDivider
        header={
          <GenericPageHeader
            isDark={!rest.isModal}
            image={
              <Card
                title="None"
                subtitle=""
                coverArt={
                  isCached(`${misc.imageCachePath}album_${albumId}.jpg`)
                    ? `${misc.imageCachePath}album_${albumId}.jpg`
                    : data.image
                }
                size={200}
                hasHoverButtons
                noInfoPanel
                noModalButton
                details={data}
                playClick={{ type: 'album', id: data.id }}
                url={`/library/album/${data.id}`}
                handleFavorite={() =>
                  handleFavorite(data, {
                    custom: () =>
                      queryClient.setQueryData(['album', id], {
                        ...data,
                        starred: data?.starred ? undefined : Date.now(),
                      }),
                  })
                }
              />
            }
            cacheImages={{
              enabled: settings.getSync('cacheImages'),
              cacheType: 'album',
              id: data.albumId,
            }}
            imageHeight={200}
            title={data.title}
            showTitleTooltip
            subtitle={
              <div>
                <PageHeaderSubtitleDataLine $top $overflow>
                  <StyledLink color="#D8D8D8" onClick={() => history.push('/library/album')}>
                    {t('ALBUM')}
                  </StyledLink>{' '}
                  {data.albumArtist && (
                    <>
                      {t('by')}{' '}
                      <LinkWrapper maxWidth="20vw">
                        <StyledLink
                          color="#D8D8D8"
                          onClick={() => history.push(`/library/artist/${data.albumArtistId}`)}
                        >
                          <strong>{data.albumArtist}</strong>
                        </StyledLink>
                      </LinkWrapper>
                    </>
                  )}{' '}
                  • {data.songCount} songs, {formatDuration(data.duration)}
                  {data.year && (
                    <>
                      {' • '}
                      {data.year}
                    </>
                  )}
                </PageHeaderSubtitleDataLine>
                <PageHeaderSubtitleDataLine
                  ref={genreLineRef}
                  onWheel={(e: any) => {
                    if (!e.shiftKey) {
                      if (e.deltaY === 0) return;
                      const position = genreLineRef.current.scrollLeft;
                      genreLineRef.current.scrollTo({
                        top: 0,
                        left: position + e.deltaY,
                        behavior: 'smooth',
                      });
                    }
                  }}
                >
                  {t('Added {{val, datetime}}', { val: formatDate(data.created) })}
                  {data.genre.map((d: Genre, i: number) => {
                    return (
                      <span key={nanoid()}>
                        {i === 0 && ' • '}
                        {i > 0 && ', '}
                        <LinkWrapper maxWidth="13vw">
                          <StyledLink
                            color="#D8D8D8"
                            tabIndex={0}
                            onClick={() => {
                              if (!rest.isModal) {
                                dispatch(
                                  setFilter({
                                    listType: Item.Album,
                                    data: d.title,
                                  })
                                );
                                dispatch(
                                  setPagination({ listType: Item.Album, data: { activePage: 1 } })
                                );
                                localStorage.setItem('scroll_list_albumList', '0');
                                localStorage.setItem('scroll_grid_albumList', '0');
                                setTimeout(() => {
                                  history.push(`/library/album?sortType=${d.title}`);
                                }, 50);
                              }
                            }}
                            onKeyDown={(e: any) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                if (!rest.isModal) {
                                  dispatch(
                                    setFilter({
                                      listType: Item.Album,
                                      data: d.title,
                                    })
                                  );
                                  dispatch(
                                    setPagination({ listType: Item.Album, data: { activePage: 1 } })
                                  );
                                  localStorage.setItem('scroll_list_albumList', '0');
                                  localStorage.setItem('scroll_grid_albumList', '0');
                                  setTimeout(() => {
                                    history.push(`/library/album?sortType=${d.title}`);
                                  }, 50);
                                }
                              }
                            }}
                          >
                            {d.title}
                          </StyledLink>
                        </LinkWrapper>
                      </span>
                    );
                  })}
                </PageHeaderSubtitleDataLine>
                <PageHeaderSubtitleDataLine
                  ref={artistLineRef}
                  onWheel={(e: any) => {
                    if (!e.shiftKey) {
                      if (e.deltaY === 0) return;
                      const position = artistLineRef.current.scrollLeft;
                      artistLineRef.current.scrollTo({
                        top: 0,
                        left: position + e.deltaY,
                        behavior: 'smooth',
                      });
                    }
                  }}
                >
                  {data.artist ? (
                    data.artist.map((d: Artist) => {
                      return (
                        <StyledTagLink
                          key={nanoid()}
                          tabIndex={0}
                          tooltip={d.title}
                          onClick={() => {
                            if (!rest.isModal) {
                              history.push(`/library/artist/${d.id}`);
                            } else {
                              dispatch(
                                addModalPage({
                                  pageType: 'artist',
                                  id: d.id,
                                })
                              );
                            }
                          }}
                          onKeyDown={(e: any) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              if (!rest.isModal) {
                                history.push(`/library/artist/${d.id}`);
                              } else {
                                dispatch(
                                  addModalPage({
                                    pageType: 'artist',
                                    id: d.id,
                                  })
                                );
                              }
                            }
                          }}
                        >
                          {d.title}
                        </StyledTagLink>
                      );
                    })
                  ) : (
                    <span>&#8203;</span>
                  )}
                </PageHeaderSubtitleDataLine>
                <div style={{ marginTop: '10px' }}>
                  <ButtonToolbar>
                    <PlayButton
                      appearance="primary"
                      size="lg"
                      $circle
                      onClick={() => handlePlayQueueAdd({ byData: data.song, play: Play.Play })}
                    />
                    <PlayAppendNextButton
                      appearance="subtle"
                      size="lg"
                      onClick={() => handlePlayQueueAdd({ byData: data.song, play: Play.Next })}
                    />
                    <PlayAppendButton
                      appearance="subtle"
                      size="lg"
                      onClick={() => handlePlayQueueAdd({ byData: data.song, play: Play.Later })}
                    />
                    <FavoriteButton
                      size="lg"
                      appearance="subtle"
                      isFavorite={data.starred}
                      onClick={() =>
                        handleFavorite(data, {
                          custom: () =>
                            queryClient.setQueryData(['album', id], {
                              ...data,
                              starred: data?.starred ? undefined : Date.now(),
                            }),
                        })
                      }
                    />
                    <Whisper
                      trigger="hover"
                      placement="bottom"
                      delay={250}
                      enterable
                      preventOverflow
                      speaker={
                        <Popup>
                          <ButtonToolbar>
                            <StyledButton onClick={() => handleDownload('download')}>
                              {t('Download')}
                            </StyledButton>
                            <StyledButton onClick={() => handleDownload('copy')}>
                              {t('Copy to clipboard')}
                            </StyledButton>
                          </ButtonToolbar>
                        </Popup>
                      }
                    >
                      <DownloadButton
                        size="lg"
                        appearance="subtle"
                        downloadSize={getAlbumSize(data.song)}
                      />
                    </Whisper>
                  </ButtonToolbar>
                </div>
              </div>
            }
          />
        }
      >
        <ListViewType
          data={misc.searchQuery !== '' ? filteredData : data.song}
          tableColumns={config.lookAndFeel.listView.music.columns}
          handleRowClick={handleRowClick}
          handleRowDoubleClick={handleRowDoubleClick}
          handleRating={(rowData: any, rating: number) =>
            handleRating(rowData, { queryKey: ['album', albumId], rating })
          }
          virtualized
          rowHeight={Number(settings.getSync('musicListRowHeight'))}
          fontSize={Number(settings.getSync('musicListFontSize'))}
          cacheImages={{
            enabled: settings.getSync('cacheImages'),
            cacheType: 'album',
            cacheIdProperty: 'albumId',
          }}
          page="albumPage"
          listType="music"
          isModal={rest.isModal}
          disabledContextMenuOptions={[
            'removeSelected',
            'moveSelectedTo',
            'deletePlaylist',
            'viewInModal',
          ]}
          handleFavorite={(rowData: any) => handleFavorite(rowData, { queryKey: ['album', id] })}
        />
      </GenericPage>
    </>
  );
};

export default AlbumView;
