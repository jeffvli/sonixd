import React, { useEffect, useState } from 'react';
import { shell } from 'electron';
import _ from 'lodash';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useQuery, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { apiController } from '../../api/controller';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { CoverArtWrapper, PageHeaderSubtitleDataLine } from '../layout/styled';
import { SecondaryTextWrapper, StyledPanel, StyledTag } from '../shared/styled';
import ScrollingMenu from '../scrollingmenu/ScrollingMenu';
import ListViewTable from '../viewtypes/ListViewTable';
import CenterLoader from '../loader/CenterLoader';
import { fixPlayer2Index, setPlayQueueByRowClick } from '../../redux/playQueueSlice';
import { setStatus } from '../../redux/playerSlice';
import useColumnSort from '../../hooks/useColumnSort';
import { GenericItem, Genre, Item } from '../../types';
import {
  ArtistInfoContainer,
  InfoGridContainer,
  InfoViewPanel,
  SongTitle,
  InfoPlayerContainer,
  ArtistTitle,
} from './styled';
import Card from '../card/Card';
import { setFilter, setPagination } from '../../redux/viewSlice';
import useListClickHandler from '../../hooks/useListClickHandler';
import useFavorite from '../../hooks/useFavorite';
import { useRating } from '../../hooks/useRating';

const NowPlayingInfoView = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const config = useAppSelector((state) => state.config);
  const folder = useAppSelector((state) => state.folder);
  const playQueue = useAppSelector((state) => state.playQueue);
  const [musicFolder, setMusicFolder] = useState(undefined);
  const [currentArtistId, setCurrentArtistId] = useState(undefined);
  const [seeFullDescription, setSeeFullDescription] = useState(false);

  useEffect(() => {
    if (folder.applied.artists) {
      setMusicFolder(folder.musicFolder);
    }
  }, [folder]);

  const { isLoading, data: currentArtist }: any = useQuery(
    ['artist', currentArtistId, musicFolder],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getArtist',
        args: { id: currentArtistId, musicFolderId: musicFolder },
      }),
    { enabled: currentArtistId !== undefined, staleTime: 600000 }
  );

  const { isLoading: isLoadingSimilarToSong, data: similarToSong }: any = useQuery(
    ['similarSongs', currentArtistId, musicFolder, 50],
    () =>
      apiController({
        serverType: config.serverType,
        endpoint: 'getSimilarSongs',
        args: { id: currentArtistId, count: 50 },
      }),
    {
      enabled: currentArtistId !== undefined,
      staleTime: 600000,
    }
  );

  const { sortedData: latestAlbums } = useColumnSort(currentArtist?.album, Item.Music, {
    column: 'year',
    type: 'desc',
  });

  const { handleRowClick, handleRowDoubleClick } = useListClickHandler({
    doubleClick: (rowData: any, songs: any) => {
      dispatch(
        setPlayQueueByRowClick({
          entries: songs.data,
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

  const { handleFavorite } = useFavorite();
  const { handleRating } = useRating();

  useEffect(() => {
    const fetchAlbum = async () => {
      const albumData = await apiController({
        serverType: config.serverType,
        endpoint: 'getAlbum',
        args: { id: playQueue.current.albumId },
      });

      await queryClient.setQueryData(['album', playQueue.current?.albumId], albumData);
      return albumData;
    };

    if (playQueue?.current?.albumArtistId) {
      setCurrentArtistId(playQueue.current.albumArtistId);
    } else if (playQueue?.current?.albumId) {
      fetchAlbum()
        .then((res) => {
          return setCurrentArtistId(res.albumArtistId);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [config.serverType, playQueue, queryClient]);

  if (isLoading) {
    return <CenterLoader />;
  }

  return (
    <div style={{ animation: `${!isLoading ? 'fadeIn 500ms' : 'fadeOut 0s'}` }}>
      {currentArtist && playQueue.entry?.length > 0 && (
        <>
          <InfoGridContainer>
            <InfoPlayerContainer>
              <InfoViewPanel height="100%">
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {currentArtist && (
                    <Card
                      title="None"
                      subtitle={playQueue.current?.year}
                      coverArt={
                        playQueue.current?.image.replace(
                          /&size=\d+|width=\d+&height=\d+&quality=\d+/,
                          ''
                        ) || 'img/placeholder'
                      }
                      size={225}
                      noModalButton
                      noInfoPanel
                      details={playQueue.current}
                      playClick={{ type: 'artist', id: playQueue.current?.id }}
                      url={
                        playQueue.current?.albumId && `/library/album/${playQueue.current?.albumId}`
                      }
                    />
                  )}
                </div>
                <SongTitle>{playQueue.current?.title}</SongTitle>
                <SongTitle>
                  <SecondaryTextWrapper subtitle="true">
                    {playQueue.current?.year}
                  </SecondaryTextWrapper>
                </SongTitle>
              </InfoViewPanel>
            </InfoPlayerContainer>
            <ArtistInfoContainer>
              <InfoViewPanel height="100%">
                <ArtistTitle>
                  {currentArtist?.image && !currentArtist.image.match('placeholder') && (
                    <CoverArtWrapper
                      size={60}
                      style={{ float: 'left', margin: '0 10px 0 0', borderRadius: '100px' }}
                    >
                      <LazyLoadImage
                        src={currentArtist?.image}
                        tabIndex={0}
                        alt="artistImg"
                        height="60"
                      />
                    </CoverArtWrapper>
                  )}
                  {playQueue.current?.albumArtist}
                </ArtistTitle>
                <div style={{ margin: '5px 0 5px 0' }}>
                  {currentArtist?.info?.externalUrl &&
                    currentArtist.info.externalUrl.map((ext: GenericItem) => (
                      <StyledTag
                        key={ext.id}
                        appearance="subtle"
                        onClick={() => shell.openExternal(ext.id)}
                      >
                        {ext.title}
                      </StyledTag>
                    ))}
                  {playQueue.current?.genre &&
                    playQueue.current.genre.map((ext: Genre) => (
                      <StyledTag
                        key={ext.id}
                        appearance="subtle"
                        onClick={() => {
                          dispatch(
                            setFilter({
                              listType: Item.Album,
                              data: ext.title,
                            })
                          );
                          dispatch(
                            setPagination({ listType: Item.Album, data: { activePage: 1 } })
                          );

                          localStorage.setItem('scroll_list_albumList', '0');
                          localStorage.setItem('scroll_grid_albumList', '0');
                          setTimeout(() => {
                            history.push(`/library/album?sortType=${ext.title}`);
                          }, 50);
                        }}
                      >
                        {ext.title}
                      </StyledTag>
                    ))}
                </div>
                <PageHeaderSubtitleDataLine
                  onClick={() => setSeeFullDescription(!seeFullDescription)}
                  style={{
                    maxHeight: seeFullDescription ? 'none' : '10rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'pre-wrap',
                    cursor: 'pointer',
                    textAlign: 'justify',
                  }}
                >
                  <span>
                    {currentArtist?.info?.biography
                      ?.replace(/<[^>]*>/, '')
                      .replace('Read more on Last.fm</a>', '')
                      ?.trim()
                      ? `${currentArtist?.info?.biography
                          ?.replace(/<[^>]*>/, '')
                          .replace('Read more on Last.fm</a>', '')}`
                      : ''}
                  </span>
                </PageHeaderSubtitleDataLine>

                {(isLoadingSimilarToSong || similarToSong?.length > 0) && (
                  <StyledPanel header={t('Similar To')} style={{ margin: '5px 0' }}>
                    <ListViewTable
                      data={similarToSong}
                      height={350}
                      virtualized
                      columns={config.lookAndFeel.listView.music.columns}
                      rowHeight={config.lookAndFeel.listView.music.rowHeight}
                      fontSize={config.lookAndFeel.listView.music.fontSize}
                      listType="music"
                      cacheImages={{ enabled: false }}
                      isModal={false}
                      miniView={false}
                      loading={isLoadingSimilarToSong}
                      handleFavorite={(rowData: any) =>
                        handleFavorite(rowData, {
                          queryKey: ['similarSongs', currentArtistId, musicFolder, 50],
                        })
                      }
                      handleRowClick={handleRowClick}
                      handleRowDoubleClick={(e: any) => handleRowDoubleClick(e)}
                      handleRating={(rowData: any, rating: number) =>
                        handleRating(rowData, {
                          queryKey: ['similarSongs', currentArtistId, musicFolder, 50],
                          rating,
                        })
                      }
                      config={[]} // Prevent column sort
                      disabledContextMenuOptions={[
                        'removeSelected',
                        'moveSelectedTo',
                        'deletePlaylist',
                        'viewInModal',
                      ]}
                    />
                  </StyledPanel>
                )}
              </InfoViewPanel>
            </ArtistInfoContainer>
          </InfoGridContainer>
          {currentArtist?.album.length > 0 && (
            <InfoViewPanel>
              <ScrollingMenu
                title={t('Latest Albums')}
                onClickTitle={() => history.push(`/library/artist/${currentArtistId}/albums`)}
                data={latestAlbums?.slice(0, 10) || []}
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
                handleFavorite={(rowData: any) =>
                  handleFavorite(rowData, { queryKey: ['artist', currentArtistId, musicFolder] })
                }
              />
            </InfoViewPanel>
          )}
          {currentArtist?.info?.similarArtist?.length > 0 && (
            <InfoViewPanel>
              <ScrollingMenu
                title={`${t('Related Artists')} `}
                data={currentArtist?.info?.similarArtist?.slice(0, 10)}
                cardTitle={{
                  prefix: '/library/artist',
                  property: 'title',
                  urlProperty: 'id',
                }}
                cardSubtitle="Artist"
                cardSize={config.lookAndFeel.gridView.cardSize}
                type="artist"
                noScrollbar
                handleFavorite={(rowData: any) =>
                  handleFavorite(rowData, {
                    custom: () => {
                      queryClient.setQueryData(
                        ['artist', currentArtistId, musicFolder],
                        (oldData: any) => {
                          const starredIndices = _.keys(
                            _.pickBy(oldData?.info?.similarArtist, { id: rowData.id })
                          );
                          starredIndices.forEach((index) => {
                            oldData.info.similarArtist[index].starred = rowData.starred
                              ? undefined
                              : Date.now();
                          });

                          return oldData;
                        }
                      );
                    },
                  })
                }
              />
            </InfoViewPanel>
          )}
        </>
      )}
    </div>
  );
};

export default NowPlayingInfoView;
