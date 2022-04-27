import { useRef } from 'react';

import { Grid } from '@mantine/core';

import AudioPlayer from 'renderer/components/audio-player/AudioPlayer';
import { useAppDispatch, useAppSelector } from 'renderer/hooks/redux';
import {
  selectCurrentPlayer,
  selectPlayerStatus,
  autoIncrement,
  selectPlayer2Song,
  selectPlayer1Song,
  selectPlayerConfig,
} from 'renderer/store/playerSlice';

import CenterControls from './components/CenterControls';
import LeftControls from './components/LeftControls';
import RightControls from './components/RightControls';
import styles from './Playerbar.module.scss';

const PlayerBar = () => {
  const dispatch = useAppDispatch();
  const playersRef = useRef<any>();
  const playerStatus = useAppSelector(selectPlayerStatus);
  const player1Song = useAppSelector(selectPlayer1Song);
  const player2Song = useAppSelector(selectPlayer2Song);
  const currentPlayer = useAppSelector(selectCurrentPlayer);
  const { muted, volume, type, crossfadeType, crossfadeDuration } =
    useAppSelector(selectPlayerConfig);

  return (
    <div className={styles.playerbar}>
      <Grid className={styles.grid}>
        <Grid.Col span={3}>
          <LeftControls
            song={currentPlayer === 1 ? player1Song : player2Song}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <CenterControls
            currentPlayer={currentPlayer}
            playersRef={playersRef}
            status={playerStatus}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <RightControls />
        </Grid.Col>
      </Grid>
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
    </div>
  );
};

export default PlayerBar;
