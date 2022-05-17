import {
  useImperativeHandle,
  forwardRef,
  useRef,
  useState,
  useCallback,
} from 'react';

import ReactPlayer, { ReactPlayerProps } from 'react-player';

import { Crossfade, PlayerStatus, Song } from '../../../types';
import { crossfadeHandler, gaplessHandler } from './utils/listenHandlers';

interface AudioPlayerProps extends ReactPlayerProps {
  status: PlayerStatus;
  currentPlayer: 1 | 2;
  player1: Song;
  player2: Song;
  volume: number;
  type: 'gapless' | 'crossfade';
  crossfadeType: Crossfade;
  crossfadeDuration: number;
}

export type AudioPlayerProgress = {
  loaded: number;
  loadedSeconds: number;
  played: number;
  playedSeconds: number;
};

const getDuration = (ref: any) => {
  return ref.current?.player?.player?.player?.duration;
};

const AudioPlayer = (
  {
    status,
    type,
    crossfadeType,
    crossfadeDuration,
    currentPlayer,
    autoIncrement,
    player1,
    player2,
    muted,
    volume,
  }: AudioPlayerProps,
  ref: any
) => {
  const player1Ref = useRef<any>(null);
  const player2Ref = useRef<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useImperativeHandle(ref, () => ({
    get player1() {
      return player1Ref?.current;
    },
    get player2() {
      return player2Ref?.current;
    },
  }));

  const handleOnEnded = () => {
    autoIncrement();
    setIsTransitioning(false);
  };

  const handleCrossfade1 = useCallback(
    (e: AudioPlayerProgress) => {
      return crossfadeHandler({
        currentTime: e.playedSeconds,
        currentPlayerRef: player1Ref,
        nextPlayerRef: player2Ref,
        player: 1,
        currentPlayer,
        duration: getDuration(player1Ref),
        fadeDuration: crossfadeDuration,
        fadeType: crossfadeType,
        volume,
        isTransitioning,
        setIsTransitioning,
      });
    },
    [crossfadeDuration, crossfadeType, currentPlayer, isTransitioning, volume]
  );

  const handleCrossfade2 = useCallback(
    (e: AudioPlayerProgress) => {
      return crossfadeHandler({
        currentTime: e.playedSeconds,
        currentPlayerRef: player2Ref,
        nextPlayerRef: player1Ref,
        player: 2,
        currentPlayer,
        duration: getDuration(player2Ref),
        fadeDuration: crossfadeDuration,
        fadeType: crossfadeType,
        volume,
        isTransitioning,
        setIsTransitioning,
      });
    },
    [crossfadeDuration, crossfadeType, currentPlayer, isTransitioning, volume]
  );

  const handleGapless1 = useCallback(
    (e: AudioPlayerProgress) => {
      return gaplessHandler({
        currentTime: e.playedSeconds,
        nextPlayerRef: player2Ref,
        duration: getDuration(player1Ref),
        isTransitioning,
        setIsTransitioning,
        isFlac: player1.suffix === 'flac',
      });
    },
    [isTransitioning, player1.suffix]
  );

  const handleGapless2 = useCallback(
    (e: AudioPlayerProgress) => {
      return gaplessHandler({
        currentTime: e.playedSeconds,
        nextPlayerRef: player1Ref,
        duration: getDuration(player2Ref),
        isTransitioning,
        setIsTransitioning,
        isFlac: player2.suffix === 'flac',
      });
    },
    [isTransitioning, player2.suffix]
  );

  return (
    <>
      <ReactPlayer
        ref={player1Ref}
        height={0}
        muted={muted}
        playing={currentPlayer === 1 && status === PlayerStatus.Playing}
        progressInterval={isTransitioning ? 10 : 250}
        url={player1?.streamUrl}
        volume={volume}
        width={0}
        onEnded={handleOnEnded}
        onProgress={type === 'gapless' ? handleGapless1 : handleCrossfade1}
      />
      <ReactPlayer
        ref={player2Ref}
        height={0}
        muted={muted}
        playing={currentPlayer === 2 && status === PlayerStatus.Playing}
        progressInterval={isTransitioning ? 10 : 250}
        url={player2?.streamUrl}
        volume={volume}
        width={0}
        onEnded={handleOnEnded}
        onProgress={type === 'gapless' ? handleGapless2 : handleCrossfade2}
      />
    </>
  );
};

export default forwardRef(AudioPlayer);
