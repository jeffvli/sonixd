import { useEffect, useMemo } from 'react';
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
import { useAppSelector } from 'renderer/hooks';
import { selectCurrentSong } from 'renderer/store/playerSlice';
import { PlayerStatus } from 'types';
import styles from './CenterControls.module.scss';
import { Slider } from './Slider';

interface CenterControlsProps {
  controls: any;
  currentPlayer: 1 | 2;
  playersRef: any;
  status: PlayerStatus;
}

export const CenterControls = ({
  status,
  playersRef,
  currentPlayer,
  controls,
}: CenterControlsProps) => {
  const { t } = useTranslation();
  const currentSong = useAppSelector(selectCurrentSong);
  const player1 = playersRef?.current?.player1?.player;
  const player2 = playersRef?.current?.player2?.player;
  const {
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
  } = controls;

  const currentPlayerRef = currentPlayer === 1 ? player1 : player2;

  const duration = useMemo(
    () => format((currentSong?.duration || 0) * 1000),
    [currentSong?.duration]
  );

  const formattedTime = useMemo(
    () => format(currentTime * 1000 || 0),
    [currentTime]
  );

  useEffect(() => {
    let interval: any;

    if (status === PlayerStatus.Playing && !isSeeking) {
      if (settings.player === 'web') {
        interval = setInterval(() => {
          setCurrentTime(currentPlayerRef.getCurrentTime());
        }, 500);
      } else {
        interval = setInterval(() => {
          setCurrentTime((time: number) => time + 1);
        }, 1000);
      }
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [currentPlayerRef, isSeeking, setCurrentTime, settings.player, status]);

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
          disabled={disablePrev}
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
          disabled={disableNext}
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
            max={currentSong?.duration}
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
