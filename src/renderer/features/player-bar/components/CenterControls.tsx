import { useEffect, useMemo, useState } from 'react';

import { Box, createStyles, Grid, Text } from '@mantine/core';
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

import useMainAudioControls from 'renderer/components/audio-player/hooks/useMainAudioControls';
import IconButton from 'renderer/components/icon-button/IconButton';
import Slider from 'renderer/components/slider/Slider';
import { useAppSelector } from 'renderer/hooks/redux';
import { selectCurrentQueue } from 'renderer/store/playerSlice';
import { PlayerStatus } from 'types';

const useStyles = createStyles(() => ({
  slider: {
    width: '100%',
    height: '40%',
    alignContent: 'flex-start',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60%',
  },
  time: {
    userSelect: 'none',
    textAlign: 'center',
    padding: '.5em',
  },
  left: {
    textAlign: 'right',
  },
  right: {
    textAlign: 'left',
  },
}));

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
  const { classes, cx } = useStyles();
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
      <Box className={classes.controls}>
        <IconButton
          size={40}
          variant="transparent"
          tooltip={{ label: `${t('player.stop')}` }}
          icon={<PlayerStop size={15} strokeWidth={1.5} />}
          onClick={handleStop}
        />
        <IconButton
          size={40}
          variant="transparent"
          tooltip={{ label: `${t('player.prev')}` }}
          icon={<PlayerSkipBack size={15} strokeWidth={1.5} />}
          onClick={handlePrevTrack}
        />
        <IconButton
          size={40}
          variant="transparent"
          tooltip={{ label: `${t('player.skipBack')}` }}
          icon={<PlayerTrackPrev size={15} strokeWidth={1.5} />}
          onClick={handleSkipBackward}
        />
        <IconButton
          size={40}
          variant="transparent"
          radius="xl"
          tooltip={{
            label:
              status === PlayerStatus.Paused
                ? `${t('player.play')}`
                : `${t('player.pause')}`,
          }}
          icon={
            status === PlayerStatus.Paused ? (
              <PlayerPlay size={20} strokeWidth={1.5} />
            ) : (
              <PlayerPause size={20} strokeWidth={1.5} />
            )
          }
          onClick={handlePlayPause}
        />
        <IconButton
          size={40}
          variant="transparent"
          tooltip={{ label: `${t('player.skipForward')}` }}
          icon={<PlayerTrackNext size={15} strokeWidth={1.5} />}
          onClick={handleSkipForward}
        />
        <IconButton
          size={40}
          variant="transparent"
          tooltip={{ label: `${t('player.next')}` }}
          icon={<PlayerSkipForward size={15} strokeWidth={1.5} />}
          onClick={handleNextTrack}
        />
      </Box>
      <Grid className={classes.slider} align="center" gutter="xs">
        <Grid.Col className={cx(classes.time, classes.left)} span={1}>
          <Text size="xs">{formattedTime}</Text>
        </Grid.Col>
        <Grid.Col span={10}>
          <Slider
            value={currentTime}
            min={0}
            max={currentPlayerRef?.player.player.duration}
            onAfterChange={(e) => {
              handleSeekSlider(e);
              setIsSeeking(false);
            }}
            toolTipType="time"
          />
        </Grid.Col>
        <Grid.Col className={cx(classes.time, classes.right)} span={1}>
          <Text size="xs">{duration}</Text>
        </Grid.Col>
      </Grid>
    </>
  );
};

export default CenterControls;
