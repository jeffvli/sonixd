import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { ipcRenderer } from 'electron';
import { useQueryClient } from 'react-query';
import settings from 'electron-settings';
import { FlexboxGrid, Grid, Row, Col, Whisper } from 'rsuite';
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
} from './styled';
import {
  incrementCurrentIndex,
  decrementCurrentIndex,
  setVolume,
  fixPlayer2Index,
  toggleRepeat,
  toggleDisplayQueue,
  setStar,
  toggleShuffle,
} from '../../redux/playQueueSlice';
import { setStatus } from '../../redux/playerSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import Player from './Player';
import CustomTooltip from '../shared/CustomTooltip';
import placeholderImg from '../../img/placeholder.png';
import DebugWindow from '../debug/DebugWindow';
import { CoverArtWrapper } from '../layout/styled';
import {
  decodeBase64Image,
  getCurrentEntryList,
  isCached,
  writeOBSFiles,
} from '../../shared/utils';
import { StyledPopover } from '../shared/styled';
import { apiController } from '../../api/controller';
import { Artist, Server } from '../../types';
import logo from '../../../assets/icon.png';
import { notifyToast } from '../shared/toast';

const DiscordRPC = require('discord-rpc');

const PlayerBar = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const playQueue = useAppSelector((state) => state.playQueue);
  const player = useAppSelector((state) => state.player);
  const misc = useAppSelector((state) => state.misc);
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
  const playersRef = useRef<any>();
  const history = useHistory();

  ipcRenderer.once('current-position-request', (_event, arg) => {
    if (arg.currentPlayer === 1) {
      ipcRenderer.send(
        'seeked',
        Math.floor(playersRef.current.player1.audioEl.current.currentTime * 1000000)
      );
    } else {
      ipcRenderer.send(
        'seeked',
        Math.floor(playersRef.current.player2.audioEl.current.currentTime * 1000000)
      );
    }
    ipcRenderer.removeAllListeners('current-position-request');
  });

  ipcRenderer.once('position-request', (_event, arg) => {
    const newPosition = Math.floor(arg.position / 1000000);

    if (arg.currentPlayer === 1) {
      playersRef.current.player1.audioEl.current.currentTime = newPosition;
    } else {
      playersRef.current.player2.audioEl.current.currentTime = newPosition;
    }

    ipcRenderer.send('seeked', arg.position);
    ipcRenderer.removeAllListeners('position-request');
  });

  ipcRenderer.once('seek-request', (_event, arg) => {
    let newPosition;
    if (arg.currentPlayer === 1) {
      newPosition = playersRef.current.player1.audioEl.current.currentTime + arg.offset / 1000000;
      setManualSeek(newPosition);
      setIsDragging(true);
      ipcRenderer.send('seeked', newPosition * 1000000);
    } else {
      newPosition = playersRef.current.player2.audioEl.current.currentTime + arg.offset / 1000000;
      setManualSeek(newPosition);
      setIsDragging(true);
      ipcRenderer.send('seeked', newPosition * 1000000);
    }
    ipcRenderer.removeAllListeners('seek-request');
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

          if (playQueue.current?.image.match('placeholder')) {
            const imgBuffer = decodeBase64Image(logo);
            fs.writeFile(
              path.join(config.external.obs.path, 'cover.jpg'),
              imgBuffer.data,
              (err) => {
                if (err) {
                  console.log(err);
                }
              }
            );
          }
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

  const handleClickNext = () => {
    if (playQueue[currentEntryList].length > 0) {
      dispatch(incrementCurrentIndex('usingHotkey'));
      dispatch(setStatus('PLAYING'));
    }
  };

  const handleClickPrevious = () => {
    if (playQueue[currentEntryList].length > 0) {
      dispatch(decrementCurrentIndex('usingHotkey'));
      dispatch(fixPlayer2Index());
      dispatch(setStatus('PLAYING'));
    }
  };

  const handleClickPlayPause = () => {
    if (playQueue[currentEntryList].length > 0) {
      if (player.status === 'PAUSED') {
        dispatch(setStatus('PLAYING'));

        ipcRenderer.send('playpause', {
          status: 'PLAYING',
          position:
            playQueue.currentPlayer === 1
              ? Math.floor(playersRef.current.player1.audioEl.current.currentTime * 1000000)
              : Math.floor(playersRef.current.player2.audioEl.current.currentTime * 1000000),
        });
      } else {
        dispatch(setStatus('PAUSED'));
        ipcRenderer.send('playpause', {
          status: 'PAUSED',
          position:
            playQueue.currentPlayer === 1
              ? Math.floor(playersRef.current.player1.audioEl.current.currentTime * 1000000)
              : Math.floor(playersRef.current.player2.audioEl.current.currentTime * 1000000),
        });
      }
    }
  };

  const handleVolumeSlider = (e: number) => {
    if (!isDraggingVolume) {
      setIsDraggingVolume(true);
    }
    const vol = Number((e / 100).toFixed(2));
    setLocalVolume(vol);
  };

  const handleVolumeKey = (e: any) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      const vol = Number((playQueue.volume + 0.05 > 1 ? 1 : playQueue.volume + 0.05).toFixed(2));
      setLocalVolume(vol);
      dispatch(setVolume(vol));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      const vol = Number((playQueue.volume - 0.05 < 0 ? 0 : playQueue.volume - 0.05).toFixed(2));
      setLocalVolume(vol);
      dispatch(setVolume(vol));
    }
  };

  const handleVolumeWheel = (e: any) => {
    if (e.deltaY > 0) {
      if (!isDraggingVolume) {
        setIsDraggingVolume(true);
      }
      let vol = Number((playQueue.volume - 0.01).toFixed(2));
      vol = vol < 0 ? 0 : vol;
      setLocalVolume(vol);
      dispatch(setVolume(vol));
    } else {
      let vol = Number((playQueue.volume + 0.01).toFixed(2));
      vol = vol > 1 ? 1 : vol;
      setLocalVolume(vol);
      dispatch(setVolume(vol));
    }
  };

  const handleClickForward = () => {
    if (playQueue[currentEntryList].length > 0) {
      const seekForwardInterval = Number(settings.getSync('seekForwardInterval'));
      setIsDragging(true);

      if (playQueue.isFading) {
        if (playQueue.currentPlayer === 1) {
          playersRef.current.player2.audioEl.current.pause();
          playersRef.current.player2.audioEl.current.currentTime = 0;
        } else {
          playersRef.current.player1.audioEl.current.pause();
          playersRef.current.player1.audioEl.current.currentTime = 0;
        }
      }

      if (playQueue.currentPlayer === 1) {
        const calculatedTime =
          playersRef.current.player1.audioEl.current.currentTime + seekForwardInterval;
        const songDuration = playersRef.current.player1.audioEl.current.duration;
        setManualSeek(calculatedTime > songDuration ? songDuration - 1 : calculatedTime);
      } else {
        const calculatedTime =
          playersRef.current.player2.audioEl.current.currentTime + seekForwardInterval;
        const songDuration = playersRef.current.player2.audioEl.current.duration;
        setManualSeek(calculatedTime > songDuration ? songDuration - 1 : calculatedTime);
      }
    }
  };

  const handleClickBackward = () => {
    const seekBackwardInterval = Number(settings.getSync('seekBackwardInterval'));
    if (playQueue[currentEntryList].length > 0) {
      setIsDragging(true);

      if (playQueue.isFading) {
        if (playQueue.currentPlayer === 1) {
          playersRef.current.player2.audioEl.current.pause();
          playersRef.current.player2.audioEl.current.currentTime = 0;
        } else {
          playersRef.current.player1.audioEl.current.pause();
          playersRef.current.player1.audioEl.current.currentTime = 0;
        }
      }

      if (playQueue.currentPlayer === 1) {
        const calculatedTime =
          playersRef.current.player1.audioEl.current.currentTime - seekBackwardInterval;
        setManualSeek(calculatedTime < 0 ? 0 : calculatedTime);
      } else {
        const calculatedTime =
          playersRef.current.player2.audioEl.current.currentTime - seekBackwardInterval;
        setManualSeek(calculatedTime < 0 ? 0 : calculatedTime);
      }
    }
  };

  const handleSeekSlider = (e: number) => {
    setIsDragging(true);

    // If trying to seek back while fading to the next track, we need to
    // pause and reset the next track so that they don't begin overlapping
    if (playQueue.isFading) {
      if (playQueue.currentPlayer === 1) {
        playersRef.current.player2.audioEl.current.pause();
        playersRef.current.player2.audioEl.current.currentTime = 0;
      } else {
        playersRef.current.player1.audioEl.current.pause();
        playersRef.current.player1.audioEl.current.currentTime = 0;
      }
    }

    setManualSeek(e);
  };

  const handleRepeat = () => {
    const currentRepeat = settings.getSync('repeat');
    const newRepeat = currentRepeat === 'none' ? 'all' : currentRepeat === 'all' ? 'one' : 'none';
    dispatch(toggleRepeat());
    settings.setSync('repeat', newRepeat);
  };

  const handleShuffle = () => {
    dispatch(toggleShuffle());
    settings.setSync('shuffle', !settings.getSync('shuffle'));
  };

  const handleDisplayQueue = () => {
    dispatch(toggleDisplayQueue());
  };

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

  return (
    <Player ref={playersRef} currentEntryList={currentEntryList} muted={muted}>
      {playQueue.showDebugWindow && <DebugWindow currentEntryList={currentEntryList} />}
      <PlayerContainer>
        <FlexboxGrid align="middle" style={{ height: '100%' }}>
          <FlexboxGrid.Item colspan={6} style={{ textAlign: 'left', paddingLeft: '10px' }}>
            <PlayerColumn left height="80px">
              <Grid>
                <Row
                  style={{
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Col xs={2} style={{ height: '100%', width: '80px' }}>
                    <Whisper
                      trigger="hover"
                      delay={500}
                      placement="topStart"
                      preventOverflow
                      speaker={
                        <StyledPopover>
                          <div style={{ height: '500px' }}>
                            <CoverArtWrapper size={500}>
                              <LazyLoadImage
                                src={
                                  isCached(
                                    `${misc.imageCachePath}album_${
                                      playQueue[currentEntryList][playQueue.currentIndex]?.albumId
                                    }.jpg`
                                  )
                                    ? `${misc.imageCachePath}album_${
                                        playQueue[currentEntryList][playQueue.currentIndex]?.albumId
                                      }.jpg`
                                    : playQueue[currentEntryList][
                                        playQueue.currentIndex
                                      ]?.image.replace(
                                        /&size=\d+|width=\d+&height=\d+&quality=\d+/,
                                        ''
                                      ) || placeholderImg
                                }
                                height={500}
                              />
                            </CoverArtWrapper>
                          </div>
                        </StyledPopover>
                      }
                    >
                      <CoverArtWrapper size={65}>
                        <LazyLoadImage
                          src={
                            isCached(
                              `${misc.imageCachePath}album_${
                                playQueue[currentEntryList][playQueue.currentIndex]?.albumId
                              }.jpg`
                            )
                              ? `${misc.imageCachePath}album_${
                                  playQueue[currentEntryList][playQueue.currentIndex]?.albumId
                                }.jpg`
                              : playQueue[currentEntryList][playQueue.currentIndex]?.image ||
                                placeholderImg
                          }
                          tabIndex={0}
                          onClick={() => history.push(`/nowplaying`)}
                          onKeyDown={(e: any) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              history.push(`/nowplaying`);
                            }
                          }}
                          alt="trackImg"
                          effect="opacity"
                          width="65"
                          height="65"
                          style={{ cursor: 'pointer' }}
                        />
                      </CoverArtWrapper>
                    </Whisper>
                  </Col>
                  <Col xs={2} style={{ minWidth: '140px', width: '40%' }}>
                    <Row
                      style={{
                        height: '35px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'flex-end',
                      }}
                    >
                      <CustomTooltip
                        enterable
                        placement="topStart"
                        text={
                          playQueue[currentEntryList][playQueue.currentIndex]?.title ||
                          t('Unknown Title')
                        }
                      >
                        <LinkButton
                          tabIndex={0}
                          onClick={() => {
                            if (playQueue[currentEntryList][playQueue.currentIndex]?.albumId) {
                              history.push(
                                `/library/album/${
                                  playQueue[currentEntryList][playQueue.currentIndex]?.albumId
                                }`
                              );
                            }
                          }}
                        >
                          {playQueue[currentEntryList][playQueue.currentIndex]?.title ||
                            t('Unknown Title')}
                        </LinkButton>
                      </CustomTooltip>
                    </Row>

                    <Row
                      style={{
                        height: '35px',
                        minWidth: '130px',
                        width: '50%',
                      }}
                    >
                      <CustomTooltip
                        enterable
                        placement="topStart"
                        text={
                          playQueue[currentEntryList][playQueue.currentIndex]?.albumArtist
                            ? playQueue[currentEntryList][playQueue.currentIndex]?.albumArtist
                            : t('Unknown Artist')
                        }
                      >
                        <span
                          style={{
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                          }}
                        >
                          <LinkButton
                            tabIndex={0}
                            subtitle="true"
                            onClick={() => {
                              if (
                                playQueue[currentEntryList][playQueue.currentIndex]?.albumArtist
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
                            {playQueue[currentEntryList][playQueue.currentIndex]?.albumArtist ||
                              t('Unknown Artist')}
                          </LinkButton>
                        </span>
                      </CustomTooltip>
                    </Row>
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
                  tabIndex={0}
                  icon="backward"
                  size="lg"
                  fixedWidth
                  onClick={handleClickBackward}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handleClickBackward();
                    }
                  }}
                />
              </CustomTooltip>
              {/* Previous Song Button */}
              <CustomTooltip text={t('Previous Track')} delay={1000}>
                <PlayerControlIcon
                  tabIndex={0}
                  icon="step-backward"
                  size="lg"
                  fixedWidth
                  onClick={handleClickPrevious}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handleClickPrevious();
                    }
                  }}
                />
              </CustomTooltip>
              {/* Play/Pause Button */}
              <CustomTooltip text={t('Play/Pause')} delay={1000}>
                <PlayerControlIcon
                  tabIndex={0}
                  icon={player.status === 'PLAYING' ? 'pause' : 'play'}
                  size="2x"
                  fixedWidth
                  onClick={handleClickPlayPause}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handleClickPlayPause();
                    }
                  }}
                />
              </CustomTooltip>
              {/* Next Song Button */}
              <CustomTooltip text={t('Next Track')} delay={1000}>
                <PlayerControlIcon
                  tabIndex={0}
                  icon="step-forward"
                  size="lg"
                  fixedWidth
                  onClick={handleClickNext}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handleClickNext();
                    }
                  }}
                />
              </CustomTooltip>
              {/* Seek Forward Button */}
              <CustomTooltip text={t('Seek forward')} delay={1000}>
                <PlayerControlIcon
                  tabIndex={0}
                  icon="forward"
                  size="lg"
                  fixedWidth
                  onClick={handleClickForward}
                  onKeyDown={(e: any) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handleClickForward();
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
                        handleClickBackward();
                      } else if (e.key === 'ArrowRight') {
                        handleClickForward();
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
            <PlayerColumn right height="80px">
              <Grid>
                <Row
                  style={{
                    height: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <>
                    {/* Favorite Button */}
                    <CustomTooltip text={t('Favorite')}>
                      <PlayerControlIcon
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
                          playQueue.repeat === 'all' || playQueue.repeat === 'one'
                            ? 'true'
                            : 'false'
                        }
                        flip={playQueue.repeat === 'one' ? 'horizontal' : undefined}
                      />
                    </CustomTooltip>
                    {/* Shuffle Button */}
                    <CustomTooltip text={t('Shuffle')}>
                      <PlayerControlIcon
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
                  </>
                </Row>
                <Row
                  style={{
                    height: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  {/* Volume Slider */}
                  <VolumeIcon
                    icon={
                      muted ? 'volume-off' : playQueue.volume > 0.7 ? 'volume-up' : 'volume-down'
                    }
                    onClick={() => setMuted(!muted)}
                    size="lg"
                  />
                  <Whisper
                    trigger="hover"
                    placement="top"
                    delay={200}
                    preventOverflow
                    speaker={
                      <StyledPopover>
                        {muted ? t('Muted') : Math.floor(localVolume * 100)}
                      </StyledPopover>
                    }
                  >
                    <CustomSlider
                      tabIndex={0}
                      progress
                      value={Math.floor(localVolume * 100)}
                      $isDragging={isDraggingVolume}
                      tooltip={false}
                      style={{ width: '100px', marginRight: '10px' }}
                      onChange={handleVolumeSlider}
                      onKeyDown={handleVolumeKey}
                      onWheel={handleVolumeWheel}
                    />
                  </Whisper>
                </Row>
              </Grid>
            </PlayerColumn>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </PlayerContainer>
    </Player>
  );
};

export default PlayerBar;
