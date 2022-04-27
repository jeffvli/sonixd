import { useEffect, useMemo, useState } from 'react';

import { Box, Grid, Text } from '@mantine/core';
import clsx from 'clsx';
import format from 'format-duration';
import { useTranslation } from 'react-i18next';
import {
  PlayerPause,
  PlayerPlay,
  PlayerSkipBack,
  PlayerSkipForward,
  PlayerStop,
  PlayerTrackNext,
  PlayerTrackPrev,
} from 'tabler-icons-react';

import { IconButton } from 'renderer/components';
import { useAppSelector } from 'renderer/hooks/redux';
import { selectCurrentQueue } from 'renderer/store/playerSlice';
import { PlayerStatus } from 'types';

import useMainAudioControls from '../hooks/useMainAudioControls';
import styles from './CenterControls.module.scss';
import Slider from './Slider';

interface CenterControlsProps {
  status: PlayerStatus;
  playersRef: any;
  currentPlayer: 1 | 2;
}

const CenterControls = ({
  status,
  playersRef,
  currentPlayer,
}: CenterControlsProps) => {
  const { t } = useTranslation();
  const queue = useAppSelector(selectCurrentQueue);
  const player1 = playersRef?.current?.player1?.player;
  const player2 = playersRef?.current?.player2?.player;
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const {
    handlePlayPause,
    handleSkipBackward,
    handleSkipForward,
    handleSeekSlider,
    handleNextTrack,
    handlePrevTrack,
    handleStop,
  } = useMainAudioControls({
    playersRef,
    playerStatus: status,
    queue,
    currentPlayer,
    setCurrentTime,
  });

  const currentPlayerRef = currentPlayer === 1 ? player1 : player2;

  const duration = useMemo(
    () => format(currentPlayerRef?.player?.player.duration * 1000 || 0),
    [currentPlayerRef?.player?.player.duration]
  );

  const formattedTime = useMemo(
    () => format(currentTime * 1000 || 0),
    [currentTime]
  );

  useEffect(() => {
    let interval: any;

    if (status === PlayerStatus.Playing && !isSeeking) {
      interval = setInterval(() => {
        setCurrentTime(currentPlayerRef.getCurrentTime());
      }, 500);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  });

  return (
    <>
      <Box className={styles.controls}>
        <IconButton
          icon={<PlayerStop size={15} strokeWidth={1.5} />}
          size={40}
          tooltip={{ label: `${t('player.stop')}` }}
          variant="transparent"
          onClick={handleStop}
        />
        <IconButton
          icon={<PlayerSkipBack size={15} strokeWidth={1.5} />}
          size={40}
          tooltip={{ label: `${t('player.prev')}` }}
          variant="transparent"
          onClick={handlePrevTrack}
        />
        <IconButton
          icon={<PlayerTrackPrev size={15} strokeWidth={1.5} />}
          size={40}
          tooltip={{ label: `${t('player.skipBack')}` }}
          variant="transparent"
          onClick={handleSkipBackward}
        />
        <IconButton
          icon={
            status === PlayerStatus.Paused ? (
              <PlayerPlay size={20} strokeWidth={1.5} />
            ) : (
              <PlayerPause size={20} strokeWidth={1.5} />
            )
          }
          radius="xl"
          size={40}
          tooltip={{
            label:
              status === PlayerStatus.Paused
                ? `${t('player.play')}`
                : `${t('player.pause')}`,
          }}
          variant="transparent"
          onClick={handlePlayPause}
        />
        <IconButton
          icon={<PlayerTrackNext size={15} strokeWidth={1.5} />}
          size={40}
          tooltip={{ label: `${t('player.skipForward')}` }}
          variant="transparent"
          onClick={handleSkipForward}
        />
        <IconButton
          icon={<PlayerSkipForward size={15} strokeWidth={1.5} />}
          size={40}
          tooltip={{ label: `${t('player.next')}` }}
          variant="transparent"
          onClick={handleNextTrack}
        />
      </Box>
      <Grid align="center" className={styles.slider} gutter="xs">
        <Grid.Col className={clsx(styles.time, styles.left)} span={2}>
          <Text size="xs">{formattedTime}</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <Slider
            max={currentPlayerRef?.player.player.duration}
            min={0}
            toolTipType="time"
            value={currentTime}
            onAfterChange={(e) => {
              handleSeekSlider(e);
              setIsSeeking(false);
            }}
          />
        </Grid.Col>
        <Grid.Col className={clsx(styles.time, styles.right)} span={2}>
          <Text size="xs">{duration}</Text>
        </Grid.Col>
      </Grid>
    </>
  );
};

export default CenterControls;
