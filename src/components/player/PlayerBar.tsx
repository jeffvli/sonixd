import React, { useEffect, useState, useRef } from 'react';
import { FlexboxGrid, Icon, Grid, Row, Col } from 'rsuite';
import { useHistory } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import format from 'format-duration';
import {
  PlayerContainer,
  PlayerColumn,
  PlayerControlIcon,
  LinkButton,
  CustomSlider,
} from './styled';
import {
  incrementCurrentIndex,
  decrementCurrentIndex,
  setVolume,
  setPlayerVolume,
  setStatus,
  fixPlayer2Index,
  toggleRepeat,
  toggleShuffle,
} from '../../redux/playQueueSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import Player from './Player';
import CustomTooltip from '../shared/CustomTooltip';

const PlayerBar = () => {
  const playQueue = useAppSelector((state) => state.playQueue);
  const dispatch = useAppDispatch();
  const [seek, setSeek] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [manualSeek, setManualSeek] = useState(0);
  const playersRef = useRef<any>();
  const history = useHistory();

  useEffect(() => {
    setSeek(playQueue.currentSeek);
  }, [playQueue.currentSeek]);

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
      }, 1500);
    }
  }, [isDragging, manualSeek, playQueue.currentPlayer]);

  const handleClickNext = () => {
    dispatch(incrementCurrentIndex('usingHotkey'));
  };

  const handleClickPrevious = () => {
    dispatch(decrementCurrentIndex('usingHotkey'));
    dispatch(fixPlayer2Index());
  };

  const handleClickPlayPause = () => {
    dispatch(setStatus(playQueue.status === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
  };

  const handleVolumeSlider = (e: number) => {
    const vol = Number((e / 100).toFixed(2));
    dispatch(setVolume(vol));
    dispatch(setPlayerVolume({ player: playQueue.currentPlayer, volume: vol }));
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
    dispatch(toggleRepeat());
  };

  const handleShuffle = () => {
    dispatch(toggleShuffle());
  };

  return (
    <Player ref={playersRef}>
      <PlayerContainer>
        <FlexboxGrid align="middle" style={{ height: '100%' }}>
          <FlexboxGrid.Item
            colspan={6}
            style={{ textAlign: 'left', paddingLeft: '10px' }}
          >
            <PlayerColumn left height="80px">
              <Grid>
                <Row
                  style={{
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Col
                    xs={2}
                    onClick={() => history.push(`/nowplaying`)}
                    style={{ height: '100%', width: '80px' }}
                  >
                    {playQueue.entry.length >= 1 && (
                      <LazyLoadImage
                        src={playQueue.entry[playQueue.currentIndex].image}
                        alt="trackImg"
                        effect="opacity"
                        width="65"
                        height="65"
                        style={{ borderRadius: '10px', cursor: 'pointer' }}
                      />
                    )}
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
                      {playQueue.entry.length >= 1 && (
                        <LinkButton>
                          {playQueue.entry[playQueue.currentIndex]?.title ||
                            'Unknown title'}
                        </LinkButton>
                      )}
                    </Row>

                    <Row style={{ height: '35px', width: '100%' }}>
                      {playQueue.entry.length >= 1 && (
                        <LinkButton subtitle="true">
                          {playQueue.entry[playQueue.currentIndex]?.artist ||
                            'Unknown artist'}
                        </LinkButton>
                      )}
                    </Row>
                  </Col>
                </Row>
              </Grid>
            </PlayerColumn>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item
            colspan={12}
            style={{ textAlign: 'center', verticalAlign: 'middle' }}
          >
            <PlayerColumn center height="45px">
              <PlayerControlIcon icon="backward" size="lg" fixedWidth />
              <PlayerControlIcon
                icon="step-backward"
                size="lg"
                fixedWidth
                onClick={handleClickPrevious}
              />
              <PlayerControlIcon
                icon={
                  playQueue.status === 'PLAYING'
                    ? 'pause-circle'
                    : 'play-circle'
                }
                spin={
                  playQueue.currentSeekable <= playQueue.currentSeek &&
                  playQueue.status === 'PLAYING'
                }
                size="3x"
                onClick={handleClickPlayPause}
              />
              <PlayerControlIcon
                icon="step-forward"
                size="lg"
                fixedWidth
                onClick={handleClickNext}
              />
              <PlayerControlIcon icon="forward" size="lg" fixedWidth />
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
                  style={{ textAlign: 'right', paddingRight: '10px' }}
                >
                  {format((isDragging ? manualSeek : seek) * 1000)}
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={16}>
                  <CustomSlider
                    progress
                    defaultValue={0}
                    value={isDragging ? manualSeek : seek}
                    tooltip={false}
                    max={playQueue.entry[playQueue.currentIndex]?.duration || 0}
                    onChange={handleSeekSlider}
                    style={{ width: '100%' }}
                  />
                </FlexboxGrid.Item>
                <FlexboxGrid.Item
                  colspan={4}
                  style={{ textAlign: 'left', paddingLeft: '10px' }}
                >
                  {format(
                    playQueue.entry[playQueue.currentIndex]?.duration * 1000 ||
                      0
                  )}
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </PlayerColumn>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item
            colspan={6}
            style={{ textAlign: 'right', paddingRight: '10px' }}
          >
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
                  {playQueue.entry.length >= 1 && (
                    <>
                      <CustomTooltip text="Star" delay={1000}>
                        <PlayerControlIcon
                          icon={
                            playQueue.entry[playQueue.currentIndex].starred
                              ? 'star'
                              : 'star-o'
                          }
                          size="lg"
                          style={{
                            color: playQueue.entry[playQueue.currentIndex]
                              .starred
                              ? '#1179ac'
                              : undefined,
                          }}
                        />
                      </CustomTooltip>
                      <CustomTooltip text="Shuffle" delay={1000}>
                        <PlayerControlIcon
                          icon="random"
                          size="lg"
                          onClick={handleShuffle}
                          style={{
                            color: playQueue.shuffle ? '#1179ac' : undefined,
                          }}
                        />
                      </CustomTooltip>
                      <CustomTooltip text="Repeat" delay={1000}>
                        <PlayerControlIcon
                          icon="repeat"
                          size="lg"
                          onClick={handleRepeat}
                          inverse={playQueue.repeat === 'all'}
                          style={{
                            color:
                              playQueue.repeat === 'all'
                                ? '#1179ac'
                                : undefined,
                          }}
                        />
                      </CustomTooltip>
                    </>
                  )}
                </Row>
                <Row
                  style={{
                    height: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Icon
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
                    progress
                    value={Math.floor(playQueue.volume * 100)}
                    tooltip={false}
                    style={{ width: '100px', marginRight: '10px' }}
                    onChange={handleVolumeSlider}
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
