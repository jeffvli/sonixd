import React, { useEffect, useState, useRef } from 'react';
import { useQueryClient } from 'react-query';
import settings from 'electron-settings';
import { FlexboxGrid, Grid, Row, Col, Whisper } from 'rsuite';
import { useHistory } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import format from 'format-duration';
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
  setPlayerVolume,
  fixPlayer2Index,
  toggleRepeat,
  toggleDisplayQueue,
  setStar,
  toggleShuffle,
} from '../../redux/playQueueSlice';
import { setStatus, resetPlayer } from '../../redux/playerSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import Player from './Player';
import CustomTooltip from '../shared/CustomTooltip';
import placeholderImg from '../../img/placeholder.jpg';
import DebugWindow from '../debug/DebugWindow';
import { CoverArtWrapper } from '../layout/styled';
import { getCurrentEntryList, isCached } from '../../shared/utils';
import { StyledPopover } from '../shared/styled';
import { apiController } from '../../api/controller';

const PlayerBar = () => {
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
  const playersRef = useRef<any>();
  const history = useHistory();

  useEffect(() => {
    setCurrentEntryList(getCurrentEntryList(playQueue));
  }, [playQueue]);

  useEffect(() => {
    // Handle volume slider dragging
    const debounce = setTimeout(() => {
      if (isDraggingVolume) {
        dispatch(setVolume(localVolume));
        dispatch(
          setPlayerVolume({
            player: playQueue.currentPlayer,
            volume: localVolume,
          })
        );
        if (playQueue.fadeDuration === 0) {
          dispatch(
            setPlayerVolume({
              player: playQueue.currentPlayer === 1 ? 2 : 1,
              volume: localVolume,
            })
          );
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
    setSeek(player.currentSeek);
  }, [player.currentSeek]);

  useEffect(() => {
    if (isDragging) {
      if (playQueue.currentPlayer === 1) {
        playersRef.current.player1.audioEl.current.currentTime = manualSeek;
      } else {
        playersRef.current.player2.audioEl.current.currentTime = manualSeek;
      }

      // Wait for the seek to catch up, otherwise the bar will bounce back and forth
      setTimeout(() => {
        setIsDragging(false);
      }, 300);
    }
  }, [isDragging, manualSeek, playQueue.currentPlayer]);

  const handleClickNext = () => {
    if (playQueue[currentEntryList].length > 0) {
      dispatch(resetPlayer());
      dispatch(incrementCurrentIndex('usingHotkey'));
      dispatch(setStatus('PLAYING'));
    }
  };

  const handleClickPrevious = () => {
    if (playQueue[currentEntryList].length > 0) {
      dispatch(resetPlayer());
      dispatch(decrementCurrentIndex('usingHotkey'));
      dispatch(fixPlayer2Index());
      dispatch(setStatus('PLAYING'));
    }
  };

  const handleClickPlayPause = () => {
    if (playQueue[currentEntryList].length > 0) {
      if (player.status === 'PAUSED') {
        dispatch(setStatus('PLAYING'));
      } else {
        dispatch(setStatus('PAUSED'));
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
      dispatch(
        setPlayerVolume({
          player: playQueue.currentPlayer,
          volume: vol,
        })
      );
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      const vol = Number((playQueue.volume - 0.05 < 0 ? 0 : playQueue.volume - 0.05).toFixed(2));
      setLocalVolume(vol);
      dispatch(setVolume(vol));
      dispatch(
        setPlayerVolume({
          player: playQueue.currentPlayer,
          volume: vol,
        })
      );
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
          dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
          dispatch(setPlayerVolume({ player: 2, volume: 0 }));
        } else {
          playersRef.current.player1.audioEl.current.pause();
          playersRef.current.player1.audioEl.current.currentTime = 0;
          dispatch(setPlayerVolume({ player: 1, volume: 0 }));
          dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
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
          dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
          dispatch(setPlayerVolume({ player: 2, volume: 0 }));
        } else {
          playersRef.current.player1.audioEl.current.pause();
          playersRef.current.player1.audioEl.current.currentTime = 0;
          dispatch(setPlayerVolume({ player: 1, volume: 0 }));
          dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
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
        dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
        dispatch(setPlayerVolume({ player: 2, volume: 0 }));
      } else {
        playersRef.current.player1.audioEl.current.pause();
        playersRef.current.player1.audioEl.current.currentTime = 0;
        dispatch(setPlayerVolume({ player: 1, volume: 0 }));
        dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
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
    <Player ref={playersRef} currentEntryList={currentEntryList}>
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
                    <CoverArtWrapper
                      $link
                      tabIndex={0}
                      onClick={() => history.push(`/nowplaying`)}
                      onKeyDown={(e: any) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          history.push(`/nowplaying`);
                        }
                      }}
                    >
                      <Whisper
                        trigger="hover"
                        delay={500}
                        placement="topStart"
                        preventOverflow
                        speaker={
                          <StyledPopover>
                            <div style={{ height: '500px' }}>
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
                                      ]?.image.replace(/size=\d+/, 'size=500') || placeholderImg
                                }
                                width={500}
                                height={500}
                              />
                            </div>
                          </StyledPopover>
                        }
                      >
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
                          alt="trackImg"
                          effect="opacity"
                          width="65"
                          height="65"
                        />
                      </Whisper>
                    </CoverArtWrapper>
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
                          'Unknown title'
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
                            'Unknown title'}
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
                          playQueue[currentEntryList][playQueue.currentIndex]?.artist
                            ? playQueue[currentEntryList][playQueue.currentIndex]?.artist[0]?.title
                            : 'Unknown artist'
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
                              'Unknown artist'}
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
              <CustomTooltip text="Seek backward" delay={1000}>
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
              <CustomTooltip text="Previous track" delay={1000}>
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
              <CustomTooltip text="Play/Pause" delay={1000}>
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
              <CustomTooltip text="Next track" delay={1000}>
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
              <CustomTooltip text="Seek forward" delay={1000}>
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
                    <CustomTooltip text="Favorite">
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
                          ? 'Repeat all'
                          : playQueue.repeat === 'one'
                          ? 'Repeat one'
                          : 'Repeat'
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
                    <CustomTooltip text="Shuffle">
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
                    <CustomTooltip text="Mini">
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
                      playQueue.volume > 0.7
                        ? 'volume-up'
                        : playQueue.volume === 0
                        ? 'volume-off'
                        : 'volume-down'
                    }
                    size="lg"
                    style={{ marginRight: '15px', padding: '0' }}
                  />
                  <CustomSlider
                    tabIndex={0}
                    progress
                    value={Math.floor(localVolume * 100)}
                    $isDragging={isDraggingVolume}
                    tooltip={false}
                    style={{ width: '100px', marginRight: '10px' }}
                    onChange={handleVolumeSlider}
                    onKeyDown={handleVolumeKey}
                  />
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
