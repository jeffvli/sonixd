/* eslint-disable import/no-cycle */
import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { nanoid } from 'nanoid/non-secure';
import FastAverageColor from 'fast-average-color';
import { clipboard, shell } from 'electron';
import settings from 'electron-settings';
import { ButtonToolbar, Whisper, ButtonGroup, Icon } from 'rsuite';
import { useQuery, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import {
  DownloadButton,
  FavoriteButton,
  PlayAppendButton,
  PlayAppendNextButton,
  PlayButton,
} from '../shared/ToolbarButtons';
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
import GenericPageHeader from '../layout/GenericPageHeader';
import {
  appendPlayQueue,
  clearPlayQueue,
  fixPlayer2Index,
  setPlayQueue,
  setPlayQueueByRowClick,
  setRate,
} from '../../redux/playQueueSlice';
import { notifyToast } from '../shared/toast';
import {
  filterPlayQueue,
  formatDuration,
  getPlayedSongsNotification,
  isCached,
} from '../../shared/utils';
import {
  LinkWrapper,
  SectionTitle,
  StyledButton,
  StyledLink,
  StyledPanel,
  StyledPopover,
} from '../shared/styled';
import { setStatus } from '../../redux/playerSlice';
import { GradientBackground, PageHeaderSubtitleDataLine } from '../layout/styled';
import { apiController } from '../../api/controller';
import { Album, GenericItem, Genre, Item, Server } from '../../types';
import ListViewTable from '../viewtypes/ListViewTable';
import Card from '../card/Card';
import ScrollingMenu from '../scrollingmenu/ScrollingMenu';
import useColumnSort from '../../hooks/useColumnSort';
import { setPlaylistRate } from '../../redux/playlistSlice';
import CustomTooltip from '../shared/CustomTooltip';
import { setFilter, setPagination } from '../../redux/viewSlice';
import CenterLoader from '../loader/CenterLoader';

const fac = new FastAverageColor();

interface ArtistParams {
  id: string;
}

const ArtistView = ({ ...rest }: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const history = useHistory();
  const location = useLocation();
  const misc = useAppSelector((state) => state.misc);
  const config = useAppSelector((state) => state.config);
  const folder = useAppSelector((state) => state.folder);
  const [viewType, setViewType] = useState(settings.getSync('albumViewType') || 'list');
  const [imageAverageColor, setImageAverageColor] = useState({ color: '', loaded: false });
  const [artistDurationTotal, setArtistDurationTotal] = useState('');
  const [artistSongTotal, setArtistSongTotal] = useState(0);
  const [musicFolder, setMusicFolder] = useState(undefined);
  const [seeFullDescription, setSeeFullDescription] = useState(false);
  const [seeMoreTopSongs, setSeeMoreTopSongs] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [compilationAlbums, setCompilationAlbums] = useState([]);
  const genreLineRef = useRef<any>();

  useEffect(() => {
    if (folder.applied.artists) {
      setMusicFolder(folder.musicFolder);
    }
  }, [folder]);

  const { id } = useParams<ArtistParams>();
  const artistId = rest.id ? rest.id : id;
  const { isLoading, isError, data, error }: any = useQuery(['artist', artistId, musicFolder], () =>
    apiController({
      serverType: config.serverType,
      endpoint: 'getArtist',
      args: { id: artistId, musicFolderId: musicFolder },
    })
  );

  const { isLoading: isLoadingTopSongs, data: topSongs } = useQuery(
    ['artistTopSongs', data?.title],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getTopSongs',
        args: { artist: data?.title, count: 100 },
      }),
    { enabled: Boolean(data?.title) }
  );

  const { data: allSongs } = useQuery(
    ['artistSongs', artistId],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getArtistSongs',
        args: { id: artistId, musicFolderId: musicFolder },
      }),
    { enabled: Boolean(location.pathname.match('/songs')) }
  );

  const { sortedData: albumsByYearDesc } = useColumnSort(albums, Item.Album, {
    column: 'year',
    type: 'desc',
  });

  const { sortedData: compilationAlbumsByYearDesc } = useColumnSort(compilationAlbums, Item.Album, {
    column: 'year',
    type: 'desc',
  });

  const filteredData = useSearchQuery(misc.searchQuery, data?.album, [
    'title',
    'artist',
    'genre',
    'year',
  ]);

  useEffect(() => {
    if (settings.getSync('artistPageLegacy')) {
      history.push(`/library/artist/${artistId}/albums`);
    }
  }, [artistId, history]);

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

  const handleMusicRowDoubleClick = (rowData: any, songs: any[]) => {
    window.clearTimeout(timeout);
    timeout = null;

    dispatch(clearSelected());
    if (rowData.isDir) {
      history.push(`/library/folder?folderId=${rowData.parent}`);
    } else {
      dispatch(
        setPlayQueueByRowClick({
          entries: songs.filter((entry: any) => entry.isDir !== true),
          currentIndex: rowData.rowIndex,
          currentSongId: rowData.id,
          uniqueSongId: rowData.uniqueId,
          filters: config.playback.filters,
        })
      );
      dispatch(setStatus('PLAYING'));
      dispatch(fixPlayer2Index());
    }
  };

  const handleFavorite = async () => {
    if (!data.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: data.id, type: 'artist' },
      });
      queryClient.setQueryData(['artist', artistId, musicFolder], { ...data, starred: Date.now() });
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: data.id, type: 'artist' },
      });
      queryClient.setQueryData(['artist', artistId, musicFolder], { ...data, starred: undefined });
    }
  };

  const handlePlay = async (list: 'topSongs' | 'albums' | 'mix') => {
    const res =
      list === 'topSongs'
        ? topSongs
        : list === 'mix'
        ? await apiController({
            serverType: config.serverType,
            endpoint: 'getSimilarSongs',
            args: { id: data.id, count: 100 },
          })
        : await apiController({
            serverType: config.serverType,
            endpoint: 'getArtistSongs',
            args: { id: data.id, musicFolderId: musicFolder },
          });

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

  const handlePlayAppend = async (type: 'next' | 'later', list: 'topSongs' | 'albums' | 'mix') => {
    const res =
      list === 'topSongs'
        ? topSongs
        : list === 'mix'
        ? await apiController({
            serverType: config.serverType,
            endpoint: 'getSimilarSongs',
            args: { id: data.id, count: 100 },
          })
        : await await apiController({
            serverType: config.serverType,
            endpoint: 'getArtistSongs',
            args: { id: data.id, musicFolderId: musicFolder },
          });

    const songs = filterPlayQueue(config.playback.filters, res);

    if (songs.entries.length > 0) {
      dispatch(appendPlayQueue({ entries: songs.entries, type }));
      dispatch(fixPlayer2Index());
    }

    notifyToast('info', getPlayedSongsNotification({ ...songs.count, type: 'add' }));
  };

  const handleRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'album' },
      });
      queryClient.setQueryData(['artist', artistId, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: rowData.id, type: 'album' },
      });
      queryClient.setQueryData(['artist', artistId, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.album, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.album[index].starred = undefined;
        });

        return oldData;
      });
    }
  };

  const handleSimilarArtistRowFavorite = async (rowData: any) => {
    if (!rowData.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'artist' },
      });
      queryClient.setQueryData(['artist', artistId, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.info?.similarArtist, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.info.similarArtist[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: rowData.id, type: 'artist' },
      });
      queryClient.setQueryData(['artist', artistId, musicFolder], (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData?.info?.similarArtist, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData.info.similarArtist[index].starred = undefined;
        });

        return oldData;
      });
    }
  };

  const handleMusicRowFavorite = async (rowData: any, query: any) => {
    if (!rowData.starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: rowData.id, type: 'music' },
      });
      queryClient.setQueryData(query, (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = Date.now();
        });

        return oldData;
      });
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: rowData.id, type: 'music' },
      });
      queryClient.setQueryData(query, (oldData: any) => {
        const starredIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
        starredIndices.forEach((index) => {
          oldData[index].starred = undefined;
        });

        return oldData;
      });
    }
  };

  const handleRowRating = async (rowData: any, e: number, query: any) => {
    apiController({
      serverType: config.serverType,
      endpoint: 'setRating',
      args: { ids: [rowData.id], rating: e },
    });
    dispatch(setRate({ id: [rowData.id], rating: e }));
    dispatch(setPlaylistRate({ id: [rowData.id], rating: e }));

    queryClient.setQueryData(query, (oldData: any) => {
      const ratedIndices = _.keys(_.pickBy(oldData, { id: rowData.id }));
      ratedIndices.forEach((index) => {
        oldData[index].userRating = e;
      });

      return oldData;
    });
  };

  const handleDownload = async (type: 'copy' | 'download') => {
    if (config.serverType === Server.Jellyfin) {
      const downloadUrls: string[] = [];

      const allArtistSongs = await apiController({
        serverType: config.serverType,
        endpoint: 'getArtistSongs',
        args: { id: data.id, musicFolderId: musicFolder },
      });

      for (let i = 0; i < allArtistSongs.length; i += 1) {
        downloadUrls.push(
          // eslint-disable-next-line no-await-in-loop
          await apiController({
            serverType: config.serverType,
            endpoint: 'getDownloadUrl',
            args: { id: allArtistSongs[i].id },
          })
        );
      }

      if (type === 'download') {
        downloadUrls.forEach((link) => shell.openExternal(link));
      }

      if (type === 'copy') {
        clipboard.writeText(downloadUrls.join('\n'));
        notifyToast('info', t('Download links copied!'));
      }
    } else if (data.album[0]?.parent) {
      if (type === 'download') {
        shell.openExternal(
          await apiController({
            serverType: config.serverType,
            endpoint: 'getDownloadUrl',
            args: { id: data.album[0].parent },
          })
        );
      } else {
        clipboard.writeText(
          await apiController({
            serverType: config.serverType,
            endpoint: 'getDownloadUrl',
            args: { id: data.album[0].parent },
          })
        );
        notifyToast('info', t('Download links copied!'));
      }
    } else {
      const downloadUrls: string[] = [];
      for (let i = 0; i < data.album.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const albumRes = await apiController({
          serverType: config.serverType,
          endpoint: 'getAlbum',
          args: { id: data.album[i].id },
        });

        if (albumRes.song[0]?.parent) {
          downloadUrls.push(
            // eslint-disable-next-line no-await-in-loop
            await apiController({
              serverType: config.serverType,
              endpoint: 'getDownloadUrl',
              args: { id: albumRes.song[0].parent },
            })
          );
        } else {
          notifyToast(
            'warning',
            t('[{{albumTitle}}] No parent album found', { albumTitle: albumRes.title })
          );
        }
      }

      if (type === 'download') {
        downloadUrls.forEach((link) => shell.openExternal(link));
      }

      if (type === 'copy') {
        clipboard.writeText(downloadUrls.join('\n'));
        notifyToast('info', t('Download links copied!'));
      }
    }
  };

  useEffect(() => {
    if (!isLoading) {
      const img = isCached(`${misc.imageCachePath}artist_${data?.id}.jpg`)
        ? `${misc.imageCachePath}artist_${data?.id}.jpg`
        : data?.image?.includes('placeholder')
        ? data?.info?.imageUrl
          ? data?.info?.imageUrl
          : data?.image
        : data?.image;

      const setAvgColor = (imgUrl: string) => {
        if (
          data?.image?.match('placeholder') ||
          (data?.image?.match('placeholder') &&
            data?.info?.imageUrl?.match('2a96cbd8b46e442fc41c2b86b821562f'))
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
  }, [data?.id, data?.image, data?.info, isLoading, misc.imageCachePath]);

  useEffect(() => {
    const allAlbumDurations = _.sum(_.map(data?.album, 'duration'));
    const allSongCount = _.sum(_.map(data?.album, 'songCount'));

    setArtistDurationTotal(formatDuration(allAlbumDurations) || 'N/a');
    setArtistSongTotal(allSongCount);
  }, [data?.album]);

  useEffect(() => {
    setAlbums(data?.album?.filter((entry: Album) => entry.albumArtistId === data.id));
    setCompilationAlbums(data?.album?.filter((entry: Album) => entry.albumArtistId !== data.id));
  }, [data?.album, data?.id]);

  if (isLoading || isLoadingTopSongs || imageAverageColor.loaded === false) {
    return <CenterLoader />;
  }

  if (isError) {
    return <span>Error: {error?.message}</span>;
  }

  return (
    <>
      {!rest.isModal && (
        <GradientBackground
          $expanded={misc.expandSidebar}
          $color={imageAverageColor.color}
          $titleBar={misc.titleBar}
        />
      )}
      <GenericPage
        contentZIndex={1}
        hideDivider
        header={
          <GenericPageHeader
            image={
              <Card
                title={t('None')}
                subtitle=""
                coverArt={
                  isCached(`${misc.imageCachePath}artist_${data?.id}.jpg`)
                    ? `${misc.imageCachePath}artist_${data?.id}.jpg`
                    : data?.image?.includes('placeholder')
                    ? data?.info?.imageUrl
                      ? data?.info?.imageUrl
                      : data?.image
                    : data?.image
                }
                size={
                  location.pathname.match('/songs|/albums|/compilationalbums|/topsongs') ? 180 : 225
                }
                hasHoverButtons
                noInfoPanel
                noModalButton
                details={data}
                playClick={{ type: 'artist', id: data.id }}
                url={`/library/artist/${artistId}`}
                handleFavorite={handleFavorite}
              />
            }
            cacheImages={{
              enabled: settings.getSync('cacheImages'),
              cacheType: 'artist',
              id: data.id,
            }}
            imageHeight={
              location.pathname.match('/songs|/albums|/compilationalbums|/topsongs') ? 180 : 225
            }
            title={data.title}
            showTitleTooltip
            subtitle={
              <>
                <PageHeaderSubtitleDataLine $top $overflow>
                  <StyledLink onClick={() => history.push(`/library/artist`)}>
                    <strong>ARTIST</strong>
                  </StyledLink>{' '}
                  • {data.albumCount} albums • {artistSongTotal} songs, {artistDurationTotal}
                </PageHeaderSubtitleDataLine>
                {!location.pathname.match('/songs|/albums|/compilationalbums|/topsongs') && (
                  <PageHeaderSubtitleDataLine
                    $wrap
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
                    {data.genre?.map((d: Genre, i: number) => {
                      return (
                        <span key={nanoid()}>
                          {i > 0 && ', '}
                          <LinkWrapper maxWidth="13vw">
                            <StyledLink
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
                                      setPagination({
                                        listType: Item.Album,
                                        data: { activePage: 1 },
                                      })
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
                )}

                {!location.pathname.match('/songs|/albums|/compilationalbums|/topsongs') &&
                  data?.info.biography
                    ?.replace(/<[^>]*>/, '')
                    .replace('Read more on Last.fm</a>', '')
                    ?.trim() && (
                    <PageHeaderSubtitleDataLine
                      onClick={() => setSeeFullDescription(!seeFullDescription)}
                      style={{
                        minHeight: '2.5rem',
                        maxHeight: seeFullDescription ? 'none' : '5.0rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'pre-wrap',
                        cursor: 'pointer',
                      }}
                    >
                      <span>
                        {data?.info.biography
                          ?.replace(/<[^>]*>/, '')
                          .replace('Read more on Last.fm</a>', '')
                          ?.trim()
                          ? `${data?.info.biography
                              ?.replace(/<[^>]*>/, '')
                              .replace('Read more on Last.fm</a>', '')}`
                          : ''}
                      </span>
                    </PageHeaderSubtitleDataLine>
                  )}

                <div style={{ marginTop: '10px' }}>
                  <ButtonToolbar>
                    <PlayButton
                      $circle
                      appearance="primary"
                      size="lg"
                      onClick={() => handlePlay('albums')}
                    />
                    <PlayAppendNextButton
                      size="lg"
                      appearance="subtle"
                      onClick={() => handlePlayAppend('next', 'albums')}
                    />
                    <PlayAppendButton
                      size="lg"
                      appearance="subtle"
                      onClick={() => handlePlayAppend('later', 'albums')}
                    />
                    <FavoriteButton
                      size="lg"
                      appearance="subtle"
                      isFavorite={data.starred}
                      onClick={() => handleFavorite()}
                    />
                    <Whisper
                      trigger="hover"
                      placement="bottom"
                      delay={500}
                      enterable
                      preventOverflow
                      speaker={
                        <StyledPopover>
                          <ButtonToolbar>
                            <StyledButton onClick={() => handleDownload('download')}>
                              {t('Download')}
                            </StyledButton>
                            <StyledButton onClick={() => handleDownload('copy')}>
                              {t('Copy to clipboard')}
                            </StyledButton>
                          </ButtonToolbar>
                        </StyledPopover>
                      }
                    >
                      <DownloadButton size="lg" appearance="subtle" />
                    </Whisper>
                    <Whisper
                      trigger="hover"
                      placement="bottom"
                      delay={500}
                      enterable
                      preventOverflow
                      speaker={
                        <StyledPopover>
                          {data.info.externalUrl &&
                            data.info.externalUrl.map((ext: GenericItem) => (
                              <StyledButton key={ext.id} onClick={() => shell.openExternal(ext.id)}>
                                {ext.title}
                              </StyledButton>
                            ))}
                        </StyledPopover>
                      }
                    >
                      <CustomTooltip text={t('Info')}>
                        <StyledButton appearance="subtle" size="lg">
                          <Icon icon="info-circle" />
                        </StyledButton>
                      </CustomTooltip>
                    </Whisper>
                  </ButtonToolbar>
                </div>
              </>
            }
            showViewTypeButtons={location.pathname.match('/albums|/compilationalbums')}
            viewTypeSetting="album"
            handleListClick={() => setViewType('list')}
            handleGridClick={() => setViewType('grid')}
          />
        }
      >
        <>
          {location.pathname.match('/songs') ? (
            <ListViewType
              data={allSongs || []}
              tableColumns={config.lookAndFeel.listView.music.columns}
              handleRowClick={handleRowClick}
              handleRowDoubleClick={(e: any) => handleMusicRowDoubleClick(e, allSongs)}
              virtualized
              rowHeight={config.lookAndFeel.listView.music.rowHeight}
              fontSize={config.lookAndFeel.listView.music.fontSize}
              cacheImages={{
                enabled: settings.getSync('cacheImages'),
                cacheType: 'album',
                cacheIdProperty: 'albumId',
              }}
              listType="music"
              dnd
              disabledContextMenuOptions={['deletePlaylist', 'viewInModal']}
              handleFavorite={(rowData: any) =>
                handleMusicRowFavorite(rowData, ['artistSongs', artistId])
              }
              handleRating={(rowData: any, e: number) =>
                handleRowRating(rowData, e, ['artistSongs', artistId])
              }
            />
          ) : location.pathname.match('/albums|/compilationalbums') ? (
            <>
              {viewType === 'list' && (
                <ListViewType
                  data={
                    misc.searchQuery !== ''
                      ? filteredData
                      : location.pathname.match('/albums')
                      ? data.album.filter((entry: Album) => entry.albumArtistId === data.id)
                      : data.album.filter((entry: Album) => entry.albumArtistId !== data.id)
                  }
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
                  data={
                    misc.searchQuery !== ''
                      ? filteredData
                      : location.pathname.match('/albums')
                      ? data.album.filter((entry: Album) => entry.albumArtistId === data.id)
                      : data.album.filter((entry: Album) => entry.albumArtistId !== data.id)
                  }
                  cardTitle={{
                    prefix: '/library/album',
                    property: 'title',
                    urlProperty: 'albumId',
                  }}
                  cardSubtitle={{
                    property: 'year',
                    unit: '',
                  }}
                  playClick={{ type: 'album', idProperty: 'id' }}
                  size={config.lookAndFeel.gridView.cardSize}
                  cacheType="album"
                  isModal={rest.isModal}
                  handleFavorite={handleRowFavorite}
                />
              )}
            </>
          ) : location.pathname.match('/topsongs') ? (
            <ListViewType
              data={topSongs || []}
              tableColumns={config.lookAndFeel.listView.music.columns}
              handleRowClick={handleRowClick}
              handleRowDoubleClick={(e: any) => handleMusicRowDoubleClick(e, topSongs)}
              virtualized
              rowHeight={config.lookAndFeel.listView.music.rowHeight}
              fontSize={config.lookAndFeel.listView.music.fontSize}
              cacheImages={{
                enabled: settings.getSync('cacheImages'),
                cacheType: 'album',
                cacheIdProperty: 'albumId',
              }}
              listType="music"
              dnd
              disabledContextMenuOptions={['deletePlaylist', 'viewInModal']}
              handleFavorite={(rowData: any) =>
                handleMusicRowFavorite(rowData, ['artistTopSongs', data?.title])
              }
              handleRating={(rowData: any, e: number) =>
                handleRowRating(rowData, e, ['artistTopSongs', data?.title])
              }
            />
          ) : (
            <>
              <ButtonToolbar>
                <StyledButton
                  size="sm"
                  appearance="subtle"
                  onClick={() => history.push(`/library/artist/${artistId}/albums`)}
                >
                  {t('View Discography')}
                </StyledButton>
                <StyledButton
                  size="sm"
                  appearance="subtle"
                  onClick={() => history.push(`/library/artist/${artistId}/songs`)}
                >
                  {t('View All Songs')}
                </StyledButton>
              </ButtonToolbar>
              <br />
              {topSongs?.length > 0 && (
                <StyledPanel
                  header={
                    <>
                      <SectionTitle
                        onClick={() => history.push(`/library/artist/${artistId}/topsongs`)}
                      >
                        {t('Top Songs')}
                      </SectionTitle>{' '}
                      <ButtonGroup>
                        <PlayButton
                          size="sm"
                          appearance="subtle"
                          text={t('Play Top Songs')}
                          onClick={() => handlePlay('topSongs')}
                        />
                        <PlayAppendNextButton
                          size="sm"
                          appearance="subtle"
                          onClick={() => handlePlayAppend('next', 'topSongs')}
                        />
                        <PlayAppendButton
                          size="sm"
                          appearance="subtle"
                          onClick={() => handlePlayAppend('later', 'topSongs')}
                        />
                      </ButtonGroup>
                    </>
                  }
                >
                  <ListViewTable
                    data={(seeMoreTopSongs ? topSongs.slice(0, 15) : topSongs?.slice(0, 5)) || []}
                    autoHeight
                    columns={config.lookAndFeel.listView.music.columns}
                    rowHeight={config.lookAndFeel.listView.music.rowHeight}
                    fontSize={config.lookAndFeel.listView.music.fontSize}
                    listType="music"
                    cacheImages={{ enabled: false }}
                    isModal={false}
                    miniView={false}
                    handleFavorite={(rowData: any) =>
                      handleMusicRowFavorite(rowData, ['artistTopSongs', data.title])
                    }
                    handleRowClick={handleRowClick}
                    handleRowDoubleClick={(e: any) => handleMusicRowDoubleClick(e, topSongs)}
                    handleRating={(rowData: any, e: number) =>
                      handleRowRating(rowData, e, ['artistTopSongs', data?.title])
                    }
                    config={[]} // Prevent column sort
                    disabledContextMenuOptions={[
                      'removeSelected',
                      'moveSelectedTo',
                      'deletePlaylist',
                      'viewInModal',
                    ]}
                  />
                  {topSongs.length > 5 && (
                    <StyledButton
                      appearance="subtle"
                      onClick={() => setSeeMoreTopSongs(!seeMoreTopSongs)}
                    >
                      {seeMoreTopSongs ? t('SHOW LESS') : t('SHOW MORE')}
                    </StyledButton>
                  )}
                </StyledPanel>
              )}

              {albumsByYearDesc.length > 0 && (
                <StyledPanel>
                  <ScrollingMenu
                    title={`${t('Latest Albums')} `}
                    subtitle={
                      <ButtonGroup>
                        <PlayButton
                          size="sm"
                          appearance="subtle"
                          text={t('Play Latest Albums')}
                          onClick={() => handlePlay('albums')}
                        />
                        <PlayAppendNextButton
                          size="sm"
                          appearance="subtle"
                          onClick={() => handlePlayAppend('next', 'albums')}
                        />
                        <PlayAppendButton
                          size="sm"
                          appearance="subtle"
                          onClick={() => handlePlayAppend('later', 'albums')}
                        />
                      </ButtonGroup>
                    }
                    onClickTitle={() => history.push(`/library/artist/${artistId}/albums`)}
                    data={albumsByYearDesc?.slice(0, 15) || []}
                    cardTitle={{
                      prefix: '/library/album',
                      property: 'title',
                      urlProperty: 'id',
                    }}
                    cardSubtitle={{
                      property: 'year',
                    }}
                    cardSize={config.lookAndFeel.gridView.cardSize}
                    type="album"
                    noScrollbar
                    handleFavorite={handleRowFavorite}
                  />
                </StyledPanel>
              )}

              {compilationAlbumsByYearDesc.length > 0 && (
                <StyledPanel>
                  <ScrollingMenu
                    title={`${t('Appears On')} `}
                    subtitle={
                      <ButtonGroup>
                        <PlayButton
                          size="sm"
                          appearance="subtle"
                          text={t('Play Compilation Albums')}
                          onClick={() => handlePlay('albums')}
                        />
                        <PlayAppendNextButton
                          size="sm"
                          appearance="subtle"
                          onClick={() => handlePlayAppend('next', 'albums')}
                        />
                        <PlayAppendButton
                          size="sm"
                          appearance="subtle"
                          onClick={() => handlePlayAppend('later', 'albums')}
                        />
                      </ButtonGroup>
                    }
                    onClickTitle={() =>
                      history.push(`/library/artist/${artistId}/compilationalbums`)
                    }
                    data={compilationAlbumsByYearDesc?.slice(0, 15) || []}
                    cardTitle={{
                      prefix: '/library/album',
                      property: 'title',
                      urlProperty: 'id',
                    }}
                    cardSubtitle={{
                      property: 'year',
                    }}
                    cardSize={config.lookAndFeel.gridView.cardSize}
                    type="album"
                    noScrollbar
                    handleFavorite={handleRowFavorite}
                  />
                </StyledPanel>
              )}

              {data.info?.similarArtist.length > 0 && (
                <StyledPanel>
                  <ScrollingMenu
                    title={`${t('Related Artists')} `}
                    subtitle={
                      <ButtonGroup>
                        <PlayButton
                          size="sm"
                          appearance="subtle"
                          text={t('Play Artist Mix')}
                          onClick={() => handlePlay('mix')}
                        />
                        <PlayAppendNextButton
                          size="sm"
                          appearance="subtle"
                          onClick={() => handlePlayAppend('next', 'mix')}
                        />
                        <PlayAppendButton
                          size="sm"
                          appearance="subtle"
                          onClick={() => handlePlayAppend('later', 'mix')}
                        />
                      </ButtonGroup>
                    }
                    data={data.info.similarArtist}
                    cardTitle={{
                      prefix: '/library/artist',
                      property: 'title',
                      urlProperty: 'id',
                    }}
                    cardSubtitle="Artist"
                    cardSize={config.lookAndFeel.gridView.cardSize}
                    type="artist"
                    noScrollbar
                    handleFavorite={handleSimilarArtistRowFavorite}
                  />
                </StyledPanel>
              )}
            </>
          )}
        </>
      </GenericPage>
    </>
  );
};

export default ArtistView;
