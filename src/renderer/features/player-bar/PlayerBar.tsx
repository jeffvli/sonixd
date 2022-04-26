import { useRef } from 'react';

import { Container, createStyles, Grid } from '@mantine/core';
import * as Space from 'react-spaces';

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

const useStyles = createStyles((theme) => ({
  wrapper: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.layout[1]
        : theme.colors.layout[1],
    borderTop: '1px #323232 solid',
    height: '100%',
    color: '#d8d8d8',
  },
  grid: {
    margin: '0',
    height: '100%',
  },
}));

const PlayerBar = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const playersRef = useRef<any>();
  const playerStatus = useAppSelector(selectPlayerStatus);
  const player1Song = useAppSelector(selectPlayer1Song);
  const player2Song = useAppSelector(selectPlayer2Song);
  const currentPlayer = useAppSelector(selectCurrentPlayer);
  const { muted, volume, type, crossfadeType, crossfadeDuration } =
    useAppSelector(selectPlayerConfig);

  return (
    <>
      <AudioPlayer
        ref={playersRef}
        status={playerStatus}
        currentPlayer={currentPlayer}
        autoIncrement={() => dispatch(autoIncrement())}
        player1={player1Song}
        player2={player2Song}
        volume={volume}
        muted={muted}
        type={type}
        crossfadeType={crossfadeType}
        crossfadeDuration={crossfadeDuration}
      />
      <Space.Bottom size={100}>
        <Container className={classes.wrapper} px="xs" fluid>
          <Grid className={classes.grid} gutter="xs">
            <Grid.Col span={3}>
              <LeftControls
                song={currentPlayer === 1 ? player1Song : player2Song}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <CenterControls
                playersRef={playersRef}
                currentPlayer={currentPlayer}
                status={playerStatus}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <RightControls />
            </Grid.Col>
          </Grid>
        </Container>
      </Space.Bottom>
    </>
  );
};

export default PlayerBar;
