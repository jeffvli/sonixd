import { useEffect, useMemo, useState } from 'react';
import format from 'format-duration';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  PlayerPause,
  PlayerPlay,
  PlayerSkipBack,
  PlayerSkipForward,
  PlayerTrackNext,
  PlayerTrackPrev,
} from 'tabler-icons-react';
import { IconButton, Text } from 'renderer/components';
import { usePlayerStore } from 'renderer/store';
import { PlaybackType, PlayerStatus } from 'types';
import { useCenterControls } from '../hooks/useCenterControls';
import { Slider } from './Slider';

interface CenterControlsProps {
  playersRef: any;
}

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  height: 35px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const SliderContainer = styled.div`
  display: flex;
  height: 20px;
`;

const SliderValueWrapper = styled.div<{ position: 'left' | 'right' }>`
  flex: 1;
  align-self: flex-end;
  text-align: center;
  max-width: 50px;
`;

const SliderWrapper = styled.div`
  flex: 6;
  display: flex;
  align-self: center;
`;

export const CenterControls = ({ playersRef }: CenterControlsProps) => {
  const { t } = useTranslation();
  const [isSeeking, setIsSeeking] = useState(false);
  const playerData = usePlayerStore((state) => state.getPlayerData());
  const player1 = playersRef?.current?.player1?.player;
  const player2 = playersRef?.current?.player2?.player;
  const { status, player } = usePlayerStore((state) => state.current);
  const settings = usePlayerStore((state) => state.settings);
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);

  const {
    handleNextTrack,
    handlePlayPause,
    handlePrevTrack,
    handleSeekSlider,
    handleSkipBackward,
    handleSkipForward,
  } = useCenterControls({ playersRef });

  const currentTime = usePlayerStore((state) => state.current.time);

  const currentPlayerRef = player === 1 ? player1 : player2;

  const duration = useMemo(
    () => format((playerData.queue.current?.duration || 0) * 1000),
    [playerData.queue]
  );

  const formattedTime = useMemo(
    () => format(currentTime * 1000 || 0),
    [currentTime]
  );

  useEffect(() => {
    let interval: any;

    if (status === PlayerStatus.Playing && !isSeeking) {
      if (settings.type === PlaybackType.Web) {
        interval = setInterval(() => {
          console.log('int');
          setCurrentTime(currentPlayerRef.getCurrentTime());
        }, 1000);
      }
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [currentPlayerRef, isSeeking, setCurrentTime, settings.type, status]);

  return (
    <>
      <ControlsContainer>
        <ButtonsContainer>
          <IconButton
            icon={<PlayerSkipBack size={15} strokeWidth={1.5} />}
            size={25}
            tooltip={{ label: `${t('player.prev')}` }}
            variant="transparent"
            onClick={handlePrevTrack}
          />
          <IconButton
            icon={<PlayerTrackPrev size={15} strokeWidth={1.5} />}
            size={25}
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
            size={30}
            tooltip={{
              label:
                status === PlayerStatus.Paused
                  ? `${t('player.play')}`
                  : `${t('player.pause')}`,
            }}
            variant="filled"
            onClick={handlePlayPause}
          />
          <IconButton
            icon={<PlayerTrackNext size={15} strokeWidth={1.5} />}
            size={25}
            tooltip={{ label: `${t('player.skipForward')}` }}
            variant="transparent"
            onClick={handleSkipForward}
          />
          <IconButton
            icon={<PlayerSkipForward size={15} strokeWidth={1.5} />}
            size={25}
            tooltip={{ label: `${t('player.next')}` }}
            variant="transparent"
            onClick={handleNextTrack}
          />
        </ButtonsContainer>
      </ControlsContainer>
      <SliderContainer>
        <SliderValueWrapper position="left">
          <Text noSelect secondary size="xs" weight={800}>
            {formattedTime}
          </Text>
        </SliderValueWrapper>
        <SliderWrapper>
          <Slider
            max={playerData.queue.current?.duration}
            min={0}
            toolTipType="time"
            value={currentTime}
            onAfterChange={(e) => {
              handleSeekSlider(e);
              setIsSeeking(false);
            }}
          />
        </SliderWrapper>
        <SliderValueWrapper position="right">
          <Text noSelect secondary size="xs" weight={800}>
            {duration}
          </Text>
        </SliderValueWrapper>
      </SliderContainer>
    </>
  );
};
