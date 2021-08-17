import React, { useEffect, useState, useRef } from 'react';
import { FlexboxGrid, Icon, Slider, Button } from 'rsuite';
import format from 'format-duration';
import styled from 'styled-components';
import {
  incrementCurrentIndex,
  decrementCurrentIndex,
  setVolume,
  setPlayerVolume,
  setStatus,
} from '../../redux/playQueueSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import Player from './Player';
import 'react-rangeslider/lib/index.css';

const PlayerContainer = styled.div`
  background: #000000;
  height: 100%;
  border-top: 1px solid #48545c;
`;

const PlayerColumn = styled.div<{
  left?: boolean;
  center?: boolean;
  right?: boolean;
  height: string;
}>`
  height: ${(props) => props.height};
  display: flex;
  align-items: center;
  justify-content: ${(props) =>
    props.left
      ? 'flex-start'
      : props.center
      ? 'center'
      : props.right
      ? 'flex-end'
      : 'center'};
`;

const PlayerControlIcon = styled(Icon)`
  color: #b3b3b3;
  padding: 0 15px 0 15px;
  &:hover {
    color: #fff;
  }
`;

const PlayerBar = () => {
  const playQueue = useAppSelector((state) => state.playQueue);
  const dispatch = useAppDispatch();
  const [seek, setSeek] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [manualSeek, setManualSeek] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const playersRef = useRef<any>();

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

  /* const handleOnLoadStart = () => {
    dispatch(setIsLoading());
  };

  const handleOnLoadedData = () => {
    dispatch(setIsLoaded());
  }; */

  const handleClickNext = () => {
    dispatch(incrementCurrentIndex('usingHotkey'));
  };

  const handleClickPrevious = () => {
    dispatch(decrementCurrentIndex('usingHotkey'));
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
    setManualSeek(e);
    console.log(e);
  };

  const handleOnWaiting = () => {
    /* console.log(
      (playersRef.current?.player1.audioEl.current.onwaiting = () => {
        console.log('Waiting');
      })
    ); */
  };

  return (
    <PlayerContainer>
      <Player ref={playersRef} isDragging={isDragging} />
      <Button onClick={handleOnWaiting} />

      <FlexboxGrid align="middle" style={{ height: '100%' }}>
        <FlexboxGrid.Item
          colspan={6}
          style={{ textAlign: 'left', paddingLeft: '25px' }}
        >
          <PlayerColumn left height="50px">
            <div>Is seeking: {isDragging ? 'true' : 'false'}</div>
          </PlayerColumn>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item
          colspan={12}
          style={{ textAlign: 'center', verticalAlign: 'middle' }}
        >
          <PlayerColumn center height="45px">
            <PlayerControlIcon icon="random" size="lg" />
            <PlayerControlIcon
              icon="step-backward"
              size="lg"
              onClick={handleClickPrevious}
            />
            <PlayerControlIcon
              icon={
                playQueue.status === 'PLAYING' ? 'pause-circle' : 'play-circle'
              }
              size="3x"
              onClick={handleClickPlayPause}
            />
            <PlayerControlIcon
              icon="step-forward"
              size="lg"
              onClick={handleClickNext}
            />
            <PlayerControlIcon
              icon="repeat"
              size="lg"
              onClick={() => console.log('h')}
            />
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
                <Slider
                  progress
                  defaultValue={0}
                  value={isDragging ? manualSeek : seek}
                  tooltip={false}
                  max={
                    playQueue.entry[playQueue.currentIndex]?.duration -
                      10 * 1.3 || 0
                  }
                  onChange={handleSeekSlider}
                  style={{ width: '100%' }}
                />
              </FlexboxGrid.Item>
              <FlexboxGrid.Item
                colspan={4}
                style={{ textAlign: 'left', paddingLeft: '10px' }}
              >
                {format(
                  playQueue.entry[playQueue.currentIndex]?.duration * 1000 || 0
                )}
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </PlayerColumn>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item
          colspan={6}
          style={{ textAlign: 'right', paddingRight: '25px' }}
        >
          <PlayerColumn right height="45px">
            <Icon
              icon={
                playQueue.volume > 0.7
                  ? 'volume-up'
                  : playQueue.volume < 0.3
                  ? 'volume-off'
                  : 'volume-down'
              }
              size="lg"
              style={{ marginRight: '15px' }}
            />
            <Slider
              progress
              value={Math.floor(playQueue.volume * 100)}
              style={{ width: '80px' }}
              onChange={handleVolumeSlider}
            />
          </PlayerColumn>
        </FlexboxGrid.Item>
      </FlexboxGrid>
      {/* <Button onClick={() => console.log(playQueue.entry)}>Length</Button>
      <div>
        {`Current index: ${playQueue.currentIndex}  |  `}
        {`Player1 index: ${playQueue.player1Index} - ${
          playQueue.entry[playQueue.player1Index]?.title
        } | `}
        {`Player2 index: ${playQueue.player2Index} - ${
          playQueue.entry[playQueue.player2Index]?.title
        } | `}
        {`CurrentPlayer: ${playQueue.currentPlayer}`}
      </div> */}
    </PlayerContainer>
  );
};

export default PlayerBar;
