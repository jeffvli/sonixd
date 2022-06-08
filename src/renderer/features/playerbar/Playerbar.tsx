import { useRef, useState } from 'react';
import { Grid } from '@mantine/core';
import { AudioPlayer } from 'renderer/components/audio-player/AudioPlayer';
import { usePlayerStore } from 'renderer/store';
import { PlaybackType } from 'types';
import { CenterControls } from './components/CenterControls';
import { LeftControls } from './components/LeftControls';
import { RightControls } from './components/RightControls';
import { useMainAudioControls } from './hooks/useMainAudioControls';
import styles from './Playerbar.module.scss';

export const PlayerBar = () => {
  const playersRef = useRef<any>();
  const settings = usePlayerStore((state) => state.settings);
  const volume = usePlayerStore((state) => state.settings.volume);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [disableNext, setDisableNext] = useState(false);
  const [disablePrev, setDisablePrev] = useState(false);
  const playerData = usePlayerStore((state) => state.getPlayerData());
  const status = usePlayerStore((state) => state.current.status);
  const player = usePlayerStore((state) => state.current.player);
  const autoNext = usePlayerStore((state) => state.autoNext);

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
    currentTime,
    playersRef,
    setCurrentTime,
    setDisableNext,
    setDisablePrev,
  });

  return (
    <div className={styles.playerbar}>
      <Grid className={styles.grid} gutter="xs">
        <Grid.Col px="xs" span={3}>
          <LeftControls song={playerData.queue.current} />
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
            // currentPlayer={currentPlayer}
            playersRef={playersRef}
            // status={playerStatus}
          />
        </Grid.Col>
        <Grid.Col px="xs" span={3}>
          <RightControls controls={{ handleVolumeSlider }} />
        </Grid.Col>
      </Grid>
      {settings.type === PlaybackType.Web && (
        <AudioPlayer
          ref={playersRef}
          autoNext={autoNext}
          crossfadeDuration={settings.crossfadeDuration}
          crossfadeStyle={settings.crossfadeStyle}
          currentPlayer={player}
          muted={settings.muted}
          player1={playerData.player1}
          player2={playerData.player2}
          status={status}
          style={settings.style}
          volume={volume}
        />
      )}
    </div>
  );
};
