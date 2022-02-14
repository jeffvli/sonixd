import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ipcRenderer } from 'electron';
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
  CustomSlider,
  DurationSpan,
  VolumeIcon,
  LinkButton,
  CoverArtContainer,
} from './styled';
import { setVolume, setStar, setRate } from '../../redux/playQueueSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import Player from './Player';
import CustomTooltip from '../shared/CustomTooltip';
import placeholderImg from '../../img/placeholder.png';
import DebugWindow from '../debug/DebugWindow';
import { getCurrentEntryList, writeOBSFiles } from '../../shared/utils';
import { SecondaryTextWrapper, StyledButton, StyledRate } from '../shared/styled';
import { apiController } from '../../api/controller';
import { Artist, Server } from '../../types';
import { notifyToast } from '../shared/toast';
import { InfoModal } from '../modal/Modal';
import { setPlaylistRate } from '../../redux/playlistSlice';
import useGetLyrics from '../../hooks/useGetLyrics';
import usePlayerControls from '../../hooks/usePlayerControls';
import { setSidebar } from '../../redux/configSlice';
import Popup from '../shared/Popup';

const DiscordRPC = require('discord-rpc');

const PlayerBar = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const playQueue = useAppSelector((state) => state.playQueue);
  const player = useAppSelector((state) => state.player);
  const config = useAppSelector((state) => state.config);
  const dispatch = useAppDispatch();
  const [seek, setSeek] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [manualSeek, setManualSeek] = useState(0);
  const [currentEntryList, setCurrentEntryList] = useState('entry');
  const [localVolume, setLocalVolume] = useState(Number(settings.getSync('volume')));
  const [muted, setMuted] = useState(false);
  const [discordRpc, setDiscordRpc] = useState<any>();
  const [showCoverArtModal, setShowCoverArtModal] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);

  const playersRef = useRef<any>();
  const history = useHistory();

  const { data: lyrics } = useGetLyrics(config, {
    artist: playQueue.current?.albumArtist,
    title: playQueue.current?.title,
  });

  useEffect(() => {
    if (player.status === 'PLAYING') {
      const interval = setInterval(() => {
        if (playQueue.currentPlayer === 1) {
          setSeek(playersRef.current?.player1.audioEl.current.currentTime || 0);
        } else {
          setSeek(playersRef.current?.player2.audioEl.current.currentTime || 0);
        }
      }, 200);

      return () => clearInterval(interval);
    }
    return () => clearInterval();
  }, [playQueue.currentPlayer, player.status]);

  useEffect(() => {
    if (config.external.discord.enabled && config.external.discord.clientId.length === 18) {
      const rpc = new DiscordRPC.Client({ transport: 'ipc' });

      if (discordRpc?.client !== config.external.discord.clientId) {
        rpc.login({ clientId: config.external.discord.clientId }).catch((err: any) => {
          notifyToast('error', `${err}`);
        });

        setDiscordRpc(rpc);
      }
    }
  }, [config.external.discord.clientId, config.external.discord.enabled, discordRpc?.client]);

  useEffect(() => {
    if (!config.external.discord.enabled) {
      discordRpc?.destroy();
    }
  }, [config.external.discord.enabled, discordRpc]);

  useEffect(() => {
    if (config.external.discord.enabled) {
      const setActivity = async () => {
        if (!discordRpc) {
          return;
        }

        discordRpc.setActivity({
          details:
            player.status === 'PLAYING'
              ? playQueue.current?.title.padEnd(2, ' ') || 'Unknown'
              : `(Paused) ${playQueue.current?.title.padEnd(2, ' ') || 'Not playing'}`,
          state: playQueue.current?.albumArtist ? `by ${playQueue.current.albumArtist}` : 'Idle',
          largeImageKey: 'icon',
          largeImageText: playQueue.current?.album || 'Unknown',
          instance: false,
        });
      };

      // activity can only be set every 15 seconds
      const interval = setInterval(() => {
        setActivity();
      }, 15e3);

      return () => clearInterval(interval);
    }
    return () => clearInterval();
  }, [
    config.external.discord.enabled,
    discordRpc,
    playQueue,
    playQueue.currentPlayer,
    player.status,
  ]);

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
    handleVolumeKey,
    handleVolumeSlider,
    handleVolumeWheel,
    handleRepeat,
    handleShuffle,
    handleDisplayQueue,
  } = usePlayerControls(
    config,
    player,
    playQueue,
    currentEntryList,
    playersRef,
    setIsDragging,
    setManualSeek,
    isDraggingVolume,
    setIsDraggingVolume,
    setLocalVolume
  );

  useEffect(() => {
    // Handle volume slider dragging
    const debounce = setTimeout(() => {
      if (isDraggingVolume) {
        dispatch(setVolume(localVolume));
        if (playQueue.currentPlayer === 1) {
          playersRef.current.player1.audioEl.current.volume = localVolume;
        } else {
          playersRef.current.player2.audioEl.current.volume = localVolume;
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

  useEffect(() => {
    // Sets the MPRIS seek slider
    ipcRenderer.send('seeked', manualSeek * 1000000);

    const debounce = setTimeout(() => {
      if (isDragging) {
        if (playQueue.currentPlayer === 1) {
          if (config.serverType === Server.Jellyfin) {
            playersRef.current.player1.audioEl.current.pause();
            playersRef.current.player1.audioEl.current.currentTime = manualSeek;
            playersRef.current.player1.audioEl.current.play();
          } else {
            playersRef.current.player1.audioEl.current.currentTime = manualSeek;
          }
        } else if (config.serverType === Server.Jellyfin) {
          playersRef.current.player2.audioEl.current.pause();
          playersRef.current.player2.audioEl.current.currentTime = manualSeek;
          playersRef.current.player2.audioEl.current.play();
        } else {
          playersRef.current.player2.audioEl.current.currentTime = manualSeek;
        }

        // Wait for the seek to catch up, otherwise the bar will bounce back and forth
        setTimeout(() => {
          setIsDragging(false);
        }, 300);
      }
    }, 100);

    return () => clearTimeout(debounce);
  }, [config.serverType, isDragging, manualSeek, playQueue.currentPlayer]);

  const handleFavorite = async () => {
    if (!playQueue[currentEntryList][playQueue.currentIndex].starred) {
      await apiController({
        serverType: config.serverType,
        endpoint: 'star',
        args: { id: playQueue[currentEntryList][playQueue.currentIndex].id, type: 'music' },
      });
      dispatch(
        setStar({
          id: [playQueue[currentEntryList][playQueue.currentIndex].id],
          type: 'star',
        })
      );
    } else {
      await apiController({
        serverType: config.serverType,
        endpoint: 'unstar',
        args: { id: playQueue[currentEntryList][playQueue.currentIndex].id, type: 'music' },
      });
      dispatch(
        setStar({
          id: [playQueue[currentEntryList][playQueue.currentIndex].id],
          type: 'unstar',
        })
      );
    }

    await queryClient.refetchQueries(['album'], {
      active: true,
    });
    await queryClient.refetchQueries(['starred'], {
      active: true,
    });
    await queryClient.refetchQueries(['playlist'], {
      active: true,
    });
  };

  const handleRating = (e: number) => {
    apiController({
      serverType: config.serverType,
      endpoint: 'setRating',
      args: { ids: [playQueue[currentEntryList][playQueue.currentIndex].id], rating: e },
    });
    dispatch(setRate({ id: [playQueue[currentEntryList][playQueue.currentIndex].id], rating: e }));
    dispatch(
      setPlaylistRate({ id: [playQueue[currentEntryList][playQueue.currentIndex].id], rating: e })
    );
  };

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
                          <CustomTooltip
                            enterable
                            placement="top"
                            text={playQueue[currentEntryList][playQueue.currentIndex]?.title}
                          >
                            <LinkButton tabIndex={0} onClick={() => history.push(`/nowplaying`)}>
                              {playQueue[currentEntryList][playQueue.currentIndex]?.title ||
                                t('Unknown Title')}
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
                          }}
                        >
                          {playQueue[currentEntryList][playQueue.currentIndex]?.artist.map(
                            (artist: Artist, i: number) => (
                              <>
                                <CustomTooltip
                                  key={artist.id}
                                  enterable
                                  placement="topStart"
                                  text={artist?.title}
                                >
                                  <span
                                    style={{
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    <SecondaryTextWrapper subtitle="true">
                                      {i > 0 && <>{', '}</>}
                                    </SecondaryTextWrapper>
                                    <LinkButton
                                      tabIndex={0}
                                      subtitle="true"
                                      disabled={false}
                                      onClick={() => {
                                        if (
                                          playQueue[currentEntryList][playQueue.currentIndex]
                                            ?.albumArtistId
                                        ) {
                                          history.push(
                                            `/library/artist/${
                                              playQueue[currentEntryList][playQueue.currentIndex]
                                                ?.albumArtistId
                                            }`
                                          );
                                        }
                                      }}
                                    >
                                      {artist.title}
                                    </LinkButton>
                                  </span>
                                </CustomTooltip>
                              </>
                            )
                          ) || (
                            <SecondaryTextWrapper subtitle="true">
                              {t('Unknown Artist')}
                            </SecondaryTextWrapper>
                          )}
                        </Row>
                        <Row
                          style={{
                            height: '23px',
                            display: 'flex',
                            alignItems: 'flex-start',
                          }}
                        >
                          {(playQueue[currentEntryList][playQueue.currentIndex]?.album && (
                            <CustomTooltip
                              enterable
                              placement="topStart"
                              text={playQueue[currentEntryList][playQueue.currentIndex]?.album}
                            >
                              <LinkButton
                                tabIndex={0}
                                subtitle="true"
                                onClick={() => {
                                  if (
                                    playQueue[currentEntryList][playQueue.currentIndex]?.albumId
                                  ) {
                                    history.push(
                                      `/library/album/${
                                        playQueue[currentEntryList][playQueue.currentIndex]?.albumId
                                      }`
                                    );
                                  }
                                }}
                              >
                                {playQueue[currentEntryList][playQueue.currentIndex]?.album}
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
              {/* Seek Backward Button */}
              <CustomTooltip text={t('Seek backward')} delay={1000}>
                <PlayerControlIcon
                  aria-label={t('Seek backward')}
                  role="button"
                  tabIndex={0}
                  icon="backward"
                  size="lg"
                  fixedWidth
                  onClick={handleSeekBackward}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handleSeekBackward();
                    }
                  }}
                />
              </CustomTooltip>
              {/* Previous Song Button */}
              <CustomTooltip text={t('Previous Track')} delay={1000}>
                <PlayerControlIcon
                  aria-label={t('Previous Track')}
                  role="button"
                  tabIndex={0}
                  icon="step-backward"
                  size="lg"
                  fixedWidth
                  onClick={handlePrevTrack}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handlePrevTrack();
                    }
                  }}
                />
              </CustomTooltip>
              {/* Play/Pause Button */}
              <CustomTooltip text={t('Play/Pause')} delay={1000}>
                <PlayerControlIcon
                  aria-label={t('Play')}
                  aria-pressed={player.status === 'PLAYING'}
                  role="button"
                  tabIndex={0}
                  icon={player.status === 'PLAYING' ? 'pause-circle' : 'play-circle'}
                  size="3x"
                  onClick={handlePlayPause}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handlePlayPause();
                    }
                  }}
                />
              </CustomTooltip>
              {/* Next Song Button */}
              <CustomTooltip text={t('Next Track')} delay={1000}>
                <PlayerControlIcon
                  aria-label={t('Next Track')}
                  role="button"
                  tabIndex={0}
                  icon="step-forward"
                  size="lg"
                  fixedWidth
                  onClick={handleNextTrack}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handleNextTrack();
                    }
                  }}
                />
              </CustomTooltip>
              {/* Seek Forward Button */}
              <CustomTooltip text={t('Seek forward')} delay={1000}>
                <PlayerControlIcon
                  aria-label={t('Seek forward')}
                  role="button"
                  tabIndex={0}
                  icon="forward"
                  size="lg"
                  fixedWidth
                  onClick={handleSeekForward}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handleSeekForward();
                    }
                  }}
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
                  <DurationSpan>{format((isDragging ? manualSeek : seek) * 1000)}</DurationSpan>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={16}>
                  {/* Seek Slider */}
                  <CustomSlider
                    tabIndex={0}
                    progress
                    defaultValue={0}
                    value={isDragging ? manualSeek : seek}
                    $isDragging={isDragging}
                    tooltip={false}
                    max={playQueue[currentEntryList][playQueue.currentIndex]?.duration || 0}
                    onChange={handleSeekSlider}
                    onKeyDown={(e: any) => {
                      if (e.key === 'ArrowLeft') {
                        handleSeekBackward();
                      } else if (e.key === 'ArrowRight') {
                        handleSeekForward();
                      }
                    }}
                    style={{ width: '100%' }}
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
                  <DurationSpan>
                    {format(
                      playQueue[currentEntryList][playQueue.currentIndex]?.duration * 1000 || 0
                    )}
                  </DurationSpan>
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
                    onChange={(e: number) => handleRating(e)}
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
                    onClick={handleFavorite}
                    onKeyDown={(e: any) => {
                      if (e.key === ' ') {
                        handleFavorite();
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
                  display: 'flex',
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
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
                  <CustomSlider
                    tabIndex={0}
                    progress
                    value={Math.floor(localVolume * 100)}
                    $isDragging={isDraggingVolume}
                    tooltip={false}
                    style={{ width: '87px', marginRight: '10px' }}
                    onChange={handleVolumeSlider}
                    onKeyDown={handleVolumeKey}
                    onWheel={handleVolumeWheel}
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
