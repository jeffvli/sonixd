import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { useQueryClient } from 'react-query';
import settings from 'electron-settings';
import { FlexboxGrid, Grid, Row, Col, Whisper, Icon } from 'rsuite';
import { useHistory } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import format from 'format-duration';
import { useTranslation } from 'react-i18next';
import {
  PlayerContainer,
  PlayerColumn,
  PlayerControlIcon,
  DurationSpan,
  VolumeIcon,
  LinkButton,
  CoverArtContainer,
} from './styled';
import { setVolume } from '../../redux/playQueueSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import Player from './Player';
import CustomTooltip from '../shared/CustomTooltip';
import placeholderImg from '../../img/placeholder.png';
import DebugWindow from '../debug/DebugWindow';
import { getCurrentEntryList, writeOBSFiles } from '../../shared/utils';
import { SecondaryTextWrapper, StyledButton, StyledRate } from '../shared/styled';
import { Artist, Play, Server, Song } from '../../types';
import { InfoModal } from '../modal/Modal';
import useGetLyrics from '../../hooks/useGetLyrics';
import usePlayerControls from '../../hooks/usePlayerControls';
import { setSidebar } from '../../redux/configSlice';
import Popup from '../shared/Popup';
import useFavorite from '../../hooks/useFavorite';
import { useRating } from '../../hooks/useRating';
import usePlayQueueHandler from '../../hooks/usePlayQueueHandler';
import { apiController } from '../../api/controller';
import Slider from '../slider/Slider';
import useDiscordRpc from '../../hooks/useDiscordRpc';

const PlayerBar = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const playQueue = useAppSelector((state) => state.playQueue);
  const player = useAppSelector((state) => state.player);
  const config = useAppSelector((state) => state.config);
  const folder = useAppSelector((state) => state.folder);
  const dispatch = useAppDispatch();
  const [currentTime, setCurrentTime] = useState(0);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [currentEntryList, setCurrentEntryList] = useState('entry');
  const [localVolume, setLocalVolume] = useState(Number(settings.getSync('volume')));
  const [muted, setMuted] = useState(false);
  const [showCoverArtModal, setShowCoverArtModal] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const { handlePlayQueueAdd } = usePlayQueueHandler();
  const songDuration = useMemo(
    () => format(playQueue[currentEntryList][playQueue.currentIndex]?.duration * 1000 || 0),
    [currentEntryList, playQueue]
  );
  const songCurrentTime = useMemo(() => format(currentTime * 1000 || 0), [currentTime]);

  const handlePlayRandom = async () => {
    setIsLoadingRandom(true);
    const res: Song[] = await apiController({
      serverType: config.serverType,
      endpoint: 'getRandomSongs',
      args: {
        size: 200,
        musicFolderId: folder.musicFolder,
      },
    });

    handlePlayQueueAdd({ byData: res, play: Play.Play });
    setIsLoadingRandom(false);
  };

  const playersRef = useRef<any>();
  const history = useHistory();
  useDiscordRpc({ playersRef });

  const { data: lyrics } = useGetLyrics(config, {
    artist: playQueue.current?.albumArtist,
    title: playQueue.current?.title,
  });

  useEffect(() => {
    if (player.status === 'PLAYING') {
      const interval = setInterval(() => {
        if (playQueue.currentPlayer === 1) {
          setCurrentTime(playersRef.current?.player1.audioEl.current.currentTime || 0);
        } else {
          setCurrentTime(playersRef.current?.player2.audioEl.current.currentTime || 0);
        }
      }, 200);

      return () => clearInterval(interval);
    }
    return () => clearInterval();
  }, [playQueue.currentPlayer, player.status]);

  useEffect(() => {
    if (config.external.obs.enabled && config.external.obs.pollingInterval >= 100) {
      const interval = setInterval(() => {
        const currentPlayerRef =
          playQueue.currentPlayer === 1
            ? playersRef.current?.player1.audioEl.current
            : playersRef.current?.player2.audioEl.current;

        if (config.external.obs.type === 'web') {
          try {
            axios.post(
              config.external.obs.url,
              {
                data: {
                  album: playQueue.current?.album,
                  album_url: null,
                  artists: (playQueue.current?.artist || []).map((artist: Artist) => artist.title),
                  cover_url: playQueue.current?.image.match('placeholder')
                    ? undefined
                    : playQueue.current?.image.replaceAll('150', '350'),
                  duration: Math.floor((playQueue.current?.duration || 0) * 1000),
                  progress: Math.floor((currentPlayerRef.currentTime || 0) * 1000),
                  status: player.status === 'PLAYING' ? 'playing' : 'stopped',
                  title: playQueue.current?.title,
                },
                date: Date.now(),
                hostname: 'Sonixd',
              },
              {
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Headers': '*',
                  'Access-Control-Allow-Origin': '*',
                },
              }
            );
          } catch (e) {
            console.log(e);
          }
        } else if (config.external.obs.path) {
          writeOBSFiles(config.external.obs.path, {
            album: playQueue.current?.album,
            album_url: null,
            artists: (playQueue.current?.artist || []).map((artist: Artist) => artist.title),
            cover_url: playQueue.current?.image.match('placeholder')
              ? undefined
              : playQueue.current?.image,
            duration: Math.floor((playQueue.current?.duration || 0) * 1000),
            progress: Math.floor((currentPlayerRef.currentTime || 0) * 1000),
            status: player.status === 'PLAYING' ? 'playing' : 'stopped',
            title: playQueue.current?.title,
          });
        }
      }, config.external.obs.pollingInterval);

      return () => clearInterval(interval);
    }

    return () => clearInterval();
  }, [
    config.external.obs.enabled,
    config.external.obs.path,
    config.external.obs.pollingInterval,
    config.external.obs.type,
    config.external.obs.url,
    playQueue,
    player.status,
  ]);

  useEffect(() => {
    setCurrentEntryList(getCurrentEntryList(playQueue));
  }, [playQueue]);

  const {
    handleNextTrack,
    handlePrevTrack,
    handlePlayPause,
    handleSeekBackward,
    handleSeekForward,
    handleSeekSlider,
    handleVolumeSlider,
    handleVolumeWheel,
    handleRepeat,
    handleShuffle,
    handleDisplayQueue,
    handleStop,
  } = usePlayerControls(
    config,
    player,
    playQueue,
    currentEntryList,
    playersRef,
    isDraggingVolume,
    setIsDraggingVolume,
    setLocalVolume,
    setCurrentTime
  );

  useEffect(() => {
    // Handle volume slider dragging
    const debounce = setTimeout(() => {
      if (isDraggingVolume) {
        dispatch(setVolume(localVolume));
        if (playQueue.currentPlayer === 1) {
          playersRef.current.player1.audioEl.current.volume = localVolume ** 2;
        } else {
          playersRef.current.player2.audioEl.current.volume = localVolume ** 2;
        }

        settings.setSync('volume', localVolume);
      }
      setIsDraggingVolume(false);
    }, 100);

    return () => clearTimeout(debounce);
  }, [dispatch, isDraggingVolume, localVolume, playQueue.currentPlayer, playQueue.fadeDuration]);

  useEffect(() => {
    // Set the seek back to 0 when the player is incremented/decremented, otherwise the
    // slider bar will temporarily stick to the current time of the previous track before resetting to 0
    playersRef.current.player1.audioEl.current.pause();
    playersRef.current.player2.audioEl.current.pause();
    playersRef.current.player1.audioEl.current.currentTime = 0;
    playersRef.current.player2.audioEl.current.currentTime = 0;
  }, [playQueue.playerUpdated]);

  const { handleFavorite } = useFavorite();
  const { handleRating } = useRating();

  return (
    <Player ref={playersRef} currentEntryList={currentEntryList} muted={muted}>
      {playQueue.showDebugWindow && <DebugWindow currentEntryList={currentEntryList} />}
      <PlayerContainer aria-label="playback controls" role="complementary">
        <FlexboxGrid align="middle" style={{ height: '100%' }}>
          <FlexboxGrid.Item colspan={6} style={{ textAlign: 'left', paddingLeft: '10px' }}>
            <PlayerColumn left height="80px">
              <Grid style={{ width: '100%' }}>
                <Row
                  style={{
                    height: '70px',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  {(!config.lookAndFeel.sidebar.coverArt || !config.lookAndFeel.sidebar.expand) && (
                    <Col xs={2} style={{ height: '100%', width: '80px', paddingRight: '10px' }}>
                      <CoverArtContainer expand={config.lookAndFeel.sidebar.expand}>
                        <LazyLoadImage
                          src={
                            playQueue[currentEntryList][playQueue.currentIndex]?.image ||
                            placeholderImg
                          }
                          tabIndex={0}
                          onClick={() => setShowCoverArtModal(true)}
                          onKeyDown={(e: any) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              setShowCoverArtModal(true);
                            }
                          }}
                          alt="trackImg"
                          effect="opacity"
                          width="65"
                          height="65"
                          style={{ cursor: 'pointer' }}
                        />
                        <StyledButton
                          aria-label="show cover art"
                          size="xs"
                          onClick={() => {
                            dispatch(setSidebar({ coverArt: true }));
                            settings.setSync('sidebar.coverArt', true);
                          }}
                        >
                          <Icon icon="up" />
                        </StyledButton>
                      </CoverArtContainer>
                    </Col>
                  )}

                  <Col xs={2} style={{ minWidth: '120px', maxWidth: '450px', width: '100%' }}>
                    {playQueue.entry?.length > 0 && (
                      <>
                        <Row
                          style={{
                            height: '23px',
                            display: 'flex',
                            alignItems: 'flex-end',
                          }}
                        >
                          <CustomTooltip enterable placement="top" text={playQueue?.current?.title}>
                            <LinkButton tabIndex={0} onClick={() => history.push(`/nowplaying`)}>
                              {playQueue?.current?.title || t('Unknown Title')}
                            </LinkButton>
                          </CustomTooltip>
                          {lyrics && (
                            <CustomTooltip
                              enterable
                              placement="top"
                              text={t('Lyrics')}
                              onClick={() => setShowLyricsModal(true)}
                            >
                              <StyledButton size="xs" appearance="subtle">
                                <Icon icon="commenting-o" />
                              </StyledButton>
                            </CustomTooltip>
                          )}
                        </Row>
                        <Row
                          style={{
                            height: '23px',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#888e94',
                          }}
                        >
                          <span
                            style={{
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                            }}
                          >
                            {playQueue.current?.artist.length > 0 ? (
                              playQueue.current?.artist?.map((artist: Artist, i: number) => (
                                <React.Fragment key={artist.id}>
                                  <SecondaryTextWrapper subtitle="true">
                                    {i > 0 && <>{', '}</>}
                                  </SecondaryTextWrapper>
                                  <CustomTooltip
                                    enterable
                                    placement="topStart"
                                    text={artist?.title}
                                  >
                                    <LinkButton
                                      tabIndex={0}
                                      subtitle="true"
                                      onClick={() => {
                                        if (artist?.id) {
                                          history.push(`/library/artist/${artist?.id}`);
                                        }
                                      }}
                                    >
                                      {artist?.title}
                                    </LinkButton>
                                  </CustomTooltip>
                                </React.Fragment>
                              ))
                            ) : (
                              <SecondaryTextWrapper subtitle="true">
                                {t('Unknown Artist')}
                              </SecondaryTextWrapper>
                            )}
                          </span>
                        </Row>
                        <Row
                          style={{
                            height: '23px',
                            display: 'flex',
                            alignItems: 'flex-start',
                          }}
                        >
                          {(playQueue?.current?.album && (
                            <CustomTooltip
                              enterable
                              placement="topStart"
                              text={playQueue?.current?.album}
                            >
                              <LinkButton
                                tabIndex={0}
                                subtitle="true"
                                onClick={() => {
                                  if (playQueue?.current?.albumId) {
                                    history.push(`/library/album/${playQueue?.current?.albumId}`);
                                  }
                                }}
                              >
                                {playQueue?.current?.album}
                              </LinkButton>
                            </CustomTooltip>
                          )) || (
                            <SecondaryTextWrapper subtitle="true">
                              {t('Unknown Album')}
                            </SecondaryTextWrapper>
                          )}
                        </Row>
                      </>
                    )}
                  </Col>
                </Row>
              </Grid>
            </PlayerColumn>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={12} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
            <PlayerColumn center height="45px">
              {/* Stop Button */}
              <CustomTooltip text={t('Stop')}>
                <PlayerControlIcon
                  aria-label={t('Seek forward')}
                  role="button"
                  tabIndex={0}
                  icon="stop"
                  size="lg"
                  fixedWidth
                  disabled={playQueue.entry.length === 0}
                  onClick={handleStop}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handleStop();
                    }
                  }}
                />
              </CustomTooltip>
              {/* Previous Song Button */}
              <CustomTooltip text={t('Previous Track')}>
                <PlayerControlIcon
                  aria-label={t('Previous Track')}
                  role="button"
                  tabIndex={0}
                  icon="step-backward"
                  size="lg"
                  fixedWidth
                  disabled={playQueue.entry.length === 0}
                  onClick={handlePrevTrack}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handlePrevTrack();
                    }
                  }}
                />
              </CustomTooltip>
              {/* Seek Backward Button */}
              <CustomTooltip text={t('Seek backward')}>
                <PlayerControlIcon
                  aria-label={t('Seek backward')}
                  role="button"
                  tabIndex={0}
                  icon="backward"
                  size="lg"
                  fixedWidth
                  disabled={playQueue.entry.length === 0}
                  onClick={handleSeekBackward}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handleSeekBackward();
                    }
                  }}
                />
              </CustomTooltip>
              {/* Play/Pause Button */}
              <CustomTooltip text={t('Play/Pause')}>
                <PlayerControlIcon
                  aria-label={t('Play')}
                  aria-pressed={player.status === 'PLAYING'}
                  role="button"
                  tabIndex={0}
                  icon={player.status === 'PLAYING' ? 'pause-circle' : 'play-circle'}
                  size="3x"
                  disabled={playQueue.entry.length === 0}
                  onClick={handlePlayPause}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handlePlayPause();
                    }
                  }}
                />
              </CustomTooltip>

              {/* Seek Forward Button */}
              <CustomTooltip text={t('Seek forward')}>
                <PlayerControlIcon
                  aria-label={t('Seek forward')}
                  role="button"
                  tabIndex={0}
                  icon="forward"
                  size="lg"
                  fixedWidth
                  disabled={playQueue.entry.length === 0}
                  onClick={handleSeekForward}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handleSeekForward();
                    }
                  }}
                />
              </CustomTooltip>
              {/* Next Song Button */}
              <CustomTooltip text={t('Next Track')}>
                <PlayerControlIcon
                  aria-label={t('Next Track')}
                  role="button"
                  tabIndex={0}
                  icon="step-forward"
                  size="lg"
                  fixedWidth
                  disabled={playQueue.entry.length === 0}
                  onClick={handleNextTrack}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handleNextTrack();
                    }
                  }}
                />
              </CustomTooltip>
              <CustomTooltip text={t('Play Random')}>
                <PlayerControlIcon
                  aria-label={t('Play Random')}
                  role="button"
                  tabIndex={0}
                  icon={isLoadingRandom ? 'spinner' : 'plus-square'}
                  size="lg"
                  fixedWidth
                  onClick={handlePlayRandom}
                  disabled={isLoadingRandom}
                  spin={isLoadingRandom}
                />
              </CustomTooltip>
            </PlayerColumn>
            <PlayerColumn center height="35px">
              <FlexboxGrid
                justify="center"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  height: '35px',
                }}
              >
                <FlexboxGrid.Item
                  colspan={4}
                  style={{
                    textAlign: 'right',
                    paddingRight: '10px',
                    userSelect: 'none',
                  }}
                >
                  <DurationSpan>{songCurrentTime}</DurationSpan>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={16}>
                  {/* Seek Slider */}
                  <Slider
                    value={
                      playQueue.currentPlayer === 1
                        ? playersRef.current?.player1.audioEl.current.currentTime || 0
                        : playersRef.current?.player2.audioEl.current.currentTime || 0
                    }
                    min={0}
                    max={playQueue[currentEntryList][playQueue.currentIndex]?.duration || 0}
                    onAfterChange={handleSeekSlider}
                    toolTipType="time"
                  />
                </FlexboxGrid.Item>
                <FlexboxGrid.Item
                  colspan={4}
                  style={{
                    textAlign: 'left',
                    paddingLeft: '10px',
                    userSelect: 'none',
                  }}
                >
                  <DurationSpan>{songDuration}</DurationSpan>
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </PlayerColumn>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={6} style={{ textAlign: 'right', paddingRight: '10px' }}>
            <PlayerColumn right height="80px" style={{ flexDirection: 'column' }}>
              <div
                style={{
                  height: '30px',
                  display: 'flex',
                  alignSelf: 'flex-end',
                  alignItems: 'flex-start',
                }}
              >
                {config.serverType === Server.Subsonic && (
                  <StyledRate
                    aria-label="rating"
                    size="xs"
                    readOnly={false}
                    value={
                      playQueue[currentEntryList][playQueue.currentIndex]?.userRating
                        ? playQueue[currentEntryList][playQueue.currentIndex].userRating
                        : 0
                    }
                    defaultValue={
                      playQueue[currentEntryList][playQueue.currentIndex]?.userRating
                        ? playQueue[currentEntryList][playQueue.currentIndex].userRating
                        : 0
                    }
                    onChange={(rating: number) =>
                      handleRating(playQueue[currentEntryList][playQueue.currentIndex], { rating })
                    }
                  />
                )}
              </div>
              <div
                style={{
                  height: '25px',
                  display: 'flex',
                  alignSelf: 'flex-end',
                  alignItems: 'baseline',
                }}
              >
                {/* Favorite Button */}
                <CustomTooltip text={t('Favorite')}>
                  <PlayerControlIcon
                    aria-label={t('Favorite')}
                    aria-pressed={!!playQueue[currentEntryList][playQueue.currentIndex]?.starred}
                    role="button"
                    tabIndex={0}
                    icon={
                      playQueue[currentEntryList][playQueue.currentIndex]?.starred
                        ? 'heart'
                        : 'heart-o'
                    }
                    size="lg"
                    fixedWidth
                    active={
                      playQueue[currentEntryList][playQueue.currentIndex]?.starred
                        ? 'true'
                        : 'false'
                    }
                    onClick={() =>
                      handleFavorite(playQueue[currentEntryList][playQueue.currentIndex], {
                        custom: async () => {
                          await queryClient.refetchQueries(['album'], {
                            active: true,
                          });
                          await queryClient.refetchQueries(['starred'], {
                            active: true,
                          });
                          await queryClient.refetchQueries(['playlist'], {
                            active: true,
                          });
                        },
                      })
                    }
                    onKeyDown={(e: any) => {
                      if (e.key === ' ') {
                        handleFavorite(playQueue[currentEntryList][playQueue.currentIndex].id, {
                          custom: async () => {
                            await queryClient.refetchQueries(['album'], {
                              active: true,
                            });
                            await queryClient.refetchQueries(['starred'], {
                              active: true,
                            });
                            await queryClient.refetchQueries(['playlist'], {
                              active: true,
                            });
                          },
                        });
                      }
                    }}
                  />
                </CustomTooltip>

                {/* Repeat Button */}
                <CustomTooltip
                  text={
                    playQueue.repeat === 'all'
                      ? t('Repeat all')
                      : playQueue.repeat === 'one'
                      ? t('Repeat one')
                      : t('Repeat')
                  }
                >
                  <PlayerControlIcon
                    aria-label={
                      playQueue.repeat === 'all'
                        ? t('Repeat all')
                        : playQueue.repeat === 'one'
                        ? t('Repeat one')
                        : t('Repeat')
                    }
                    aria-pressed={
                      playQueue.repeat === 'all' || playQueue.repeat === 'one' ? 'true' : 'false'
                    }
                    role="button"
                    tabIndex={0}
                    icon="refresh"
                    size="lg"
                    fixedWidth
                    onClick={handleRepeat}
                    onKeyDown={(e: any) => {
                      if (e.key === ' ') {
                        handleRepeat();
                      }
                    }}
                    active={
                      playQueue.repeat === 'all' || playQueue.repeat === 'one' ? 'true' : 'false'
                    }
                    flip={playQueue.repeat === 'one' ? 'horizontal' : undefined}
                  />
                </CustomTooltip>
                {/* Shuffle Button */}
                <CustomTooltip text={t('Shuffle')}>
                  <PlayerControlIcon
                    aria-label={t('Shuffle')}
                    aria-pressed={playQueue.shuffle ? 'true' : 'false'}
                    role="button"
                    tabIndex={0}
                    icon="random"
                    size="lg"
                    fixedWidth
                    onClick={handleShuffle}
                    onKeyDown={(e: any) => {
                      if (e.key === ' ') {
                        handleShuffle();
                      }
                    }}
                    active={playQueue.shuffle ? 'true' : 'false'}
                  />
                </CustomTooltip>

                {/* Display Queue Button */}
                <CustomTooltip text={t('Mini')}>
                  <PlayerControlIcon
                    aria-label="show play queue"
                    aria-pressed={playQueue.displayQueue ? 'true' : 'false'}
                    role="button"
                    tabIndex={0}
                    icon="tasks"
                    size="lg"
                    fixedWidth
                    onClick={handleDisplayQueue}
                    onKeyDown={(e: any) => {
                      if (e.key === ' ') {
                        handleDisplayQueue();
                      }
                    }}
                    active={playQueue.displayQueue ? 'true' : 'false'}
                  />
                </CustomTooltip>
              </div>
              <div
                style={{
                  height: '25px',
                  width: '100%',
                  maxWidth: '115px',
                  marginRight: '10px',
                  display: 'flex',
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onWheel={handleVolumeWheel}
              >
                {/* Volume Slider */}
                <VolumeIcon
                  icon={muted ? 'volume-off' : 'volume-down'}
                  onClick={() => setMuted(!muted)}
                  size="lg"
                />
                <Whisper
                  trigger="hover"
                  placement="top"
                  delay={200}
                  preventOverflow
                  speaker={<Popup>{muted ? t('Muted') : Math.floor(localVolume * 100)}</Popup>}
                >
                  <Slider
                    value={Math.floor(localVolume * 100)}
                    min={0}
                    max={100}
                    onChange={handleVolumeSlider}
                    toolTipType="text"
                  />
                </Whisper>
              </div>
            </PlayerColumn>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </PlayerContainer>
      <InfoModal show={showCoverArtModal} handleHide={() => setShowCoverArtModal(false)}>
        <LazyLoadImage
          src={
            playQueue[currentEntryList][playQueue.currentIndex]?.image.replace(
              /&size=\d+|width=\d+&height=\d+&quality=\d+/,
              ''
            ) || placeholderImg
          }
          style={{
            width: 'auto',
            height: 'auto',
            minHeight: '50vh',
            maxHeight: '70vh',
            maxWidth: '95vw',
          }}
        />
      </InfoModal>
      <InfoModal width="90vw" show={showLyricsModal} handleHide={() => setShowLyricsModal(false)}>
        {lyrics}
      </InfoModal>
    </Player>
  );
};

export default PlayerBar;
