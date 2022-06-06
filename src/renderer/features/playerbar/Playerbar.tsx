import { useRef, useState } from 'react';
import { Grid } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { AudioPlayer } from 'renderer/components/audio-player/AudioPlayer';
import { useAppDispatch, useAppSelector } from 'renderer/hooks';
import {
  selectCurrentPlayer,
  selectPlayerStatus,
  autoIncrement,
  selectPlayer2Song,
  selectPlayer1Song,
  selectPlayerConfig,
  selectCurrentQueue,
} from 'renderer/store/playerSlice';
import { WebSettings } from '../settings';
import { CenterControls } from './components/CenterControls';
import { LeftControls } from './components/LeftControls';
import { RightControls } from './components/RightControls';
import { useMainAudioControls } from './hooks/useMainAudioControls';
import styles from './Playerbar.module.scss';

export const PlayerBar = () => {
  const dispatch = useAppDispatch();
  const playersRef = useRef<any>();
  const [settings] = useLocalStorage<WebSettings>({ key: 'settings' });
  const playerStatus = useAppSelector(selectPlayerStatus);
  const player1Song = useAppSelector(selectPlayer1Song);
  const player2Song = useAppSelector(selectPlayer2Song);
  const currentPlayer = useAppSelector(selectCurrentPlayer);
  const { muted, volume, type, crossfadeType, crossfadeDuration } =
    useAppSelector(selectPlayerConfig);
  const queue = useAppSelector(selectCurrentQueue);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [disableNext, setDisableNext] = useState(false);
  const [disablePrev, setDisablePrev] = useState(false);

  const {
    handlePlayPause,
    handleSkipBackward,
    handleSkipForward,
    handleSeekSlider,
    handleNextTrack,
    handlePrevTrack,
    handleStop,
    handleVolumeSlider,
  } = useMainAudioControls({
    currentPlayer,
    currentTime,
    playerStatus,
    playersRef,
    queue,
    setCurrentTime,
    setDisableNext,
    setDisablePrev,
  });

  return (
    <div className={styles.playerbar}>
      <Grid className={styles.grid} gutter="xs">
        <Grid.Col px="xs" span={3}>
          <LeftControls
            song={currentPlayer === 1 ? player1Song : player2Song}
          />
        </Grid.Col>
        <Grid.Col px="xs" span={6}>
          <CenterControls
            controls={{
              currentTime,
              disableNext,
              disablePrev,
              handleNextTrack,
              handlePlayPause,
              handlePrevTrack,
              handleSeekSlider,
              handleSkipBackward,
              handleSkipForward,
              handleStop,
              isSeeking,
              setCurrentTime,
              setIsSeeking,
              settings,
            }}
            currentPlayer={currentPlayer}
            playersRef={playersRef}
            status={playerStatus}
          />
        </Grid.Col>
        <Grid.Col px="xs" span={3}>
          <RightControls controls={{ handleVolumeSlider }} />
        </Grid.Col>
      </Grid>
      {settings.player === 'web' && (
        <AudioPlayer
          ref={playersRef}
          autoIncrement={() => dispatch(autoIncrement())}
          crossfadeDuration={crossfadeDuration}
          crossfadeType={crossfadeType}
          currentPlayer={currentPlayer}
          muted={muted}
          player1={player1Song}
          player2={player2Song}
          status={playerStatus}
          type={type}
          volume={volume}
        />
      )}
    </div>
  );
};
