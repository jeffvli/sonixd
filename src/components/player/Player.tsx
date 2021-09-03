import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react';
import path from 'path';
import settings from 'electron-settings';
import { Notification } from 'rsuite';
import ReactAudioPlayer from 'react-audio-player';
import { Helmet } from 'react-helmet-async';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  incrementCurrentIndex,
  incrementPlayerIndex,
  setCurrentPlayer,
  setPlayerVolume,
  setIsFading,
  setAutoIncremented,
  fixPlayer2Index,
  setCurrentIndex,
  setFadeData,
} from '../../redux/playQueueSlice';
import { setCurrentSeek } from '../../redux/playerSlice';
import cacheSong from '../shared/cacheSong';
import { getSongCachePath, isCached } from '../../shared/utils';

const listenHandler = (
  currentPlayerRef: any,
  nextPlayerRef: any,
  playQueue: any,
  currentEntryList: any,
  dispatch: any,
  player: number,
  fadeDuration: number,
  fadeType: string,
  volumeFade: boolean,
  debug: boolean
) => {
  const currentSeek =
    currentPlayerRef.current?.audioEl.current?.currentTime || 0;
  const seekable =
    currentPlayerRef.current.audioEl.current.seekable.length >= 1
      ? currentPlayerRef.current.audioEl.current.seekable.end(
          currentPlayerRef.current.audioEl.current.seekable.length - 1
        )
      : 0;
  const duration = currentPlayerRef.current?.audioEl.current?.duration;
  const fadeAtTime = duration - fadeDuration;

  // Fade only if repeat is 'all' or if not on the last track
  if (
    playQueue[`player${player}`].index + 1 <
      playQueue[currentEntryList].length ||
    playQueue.repeat === 'all'
  ) {
    // Detect to start fading when seek is greater than the fade time
    if (currentSeek >= fadeAtTime) {
      if (volumeFade) {
        nextPlayerRef.current.audioEl.current.play();
        dispatch(setIsFading(true));

        const timeLeft = duration - currentSeek;
        let currentPlayerVolumeCalculation;
        let nextPlayerVolumeCalculation;
        let percentageOfFadeLeft;
        switch (fadeType) {
          case 'equalPower':
            // https://dsp.stackexchange.com/a/14755
            percentageOfFadeLeft = (timeLeft / fadeDuration) * 2;
            currentPlayerVolumeCalculation =
              Math.sqrt(0.5 * percentageOfFadeLeft) * playQueue.volume;
            nextPlayerVolumeCalculation =
              Math.sqrt(0.5 * (2 - percentageOfFadeLeft)) * playQueue.volume;
            break;
          case 'linear':
            currentPlayerVolumeCalculation =
              (timeLeft / fadeDuration) * playQueue.volume;
            nextPlayerVolumeCalculation =
              ((fadeDuration - timeLeft) / fadeDuration) * playQueue.volume;
            break;
          default:
            currentPlayerVolumeCalculation =
              (timeLeft / fadeDuration) * playQueue.volume;
            nextPlayerVolumeCalculation =
              ((fadeDuration - timeLeft) / fadeDuration) * playQueue.volume;
            break;
        }

        const currentPlayerVolume =
          currentPlayerVolumeCalculation >= 0
            ? currentPlayerVolumeCalculation
            : 0;

        const nextPlayerVolume =
          nextPlayerVolumeCalculation <= playQueue.volume
            ? nextPlayerVolumeCalculation
            : playQueue.volume;

        if (player === 1) {
          dispatch(setPlayerVolume({ player: 1, volume: currentPlayerVolume }));
          dispatch(setPlayerVolume({ player: 2, volume: nextPlayerVolume }));
          if (debug) {
            dispatch(
              setFadeData({
                player: 1,
                time: timeLeft,
                volume: currentPlayerVolume,
              })
            );
            dispatch(
              setFadeData({
                player: 2,
                time: timeLeft,
                volume: nextPlayerVolume,
              })
            );
          }
        } else {
          dispatch(setPlayerVolume({ player: 2, volume: currentPlayerVolume }));
          dispatch(setPlayerVolume({ player: 1, volume: nextPlayerVolume }));
          if (debug) {
            dispatch(
              setFadeData({
                player: 2,
                time: timeLeft,
                volume: currentPlayerVolume,
              })
            );
            dispatch(
              setFadeData({
                player: 1,
                time: timeLeft,
                volume: nextPlayerVolume,
              })
            );
          }
        }
      } else {
        // If fade time is less than 0.5 seconds, don't fade and just start at
        // full volume. Due to the low fade duration and interval polling, the volume
        // blasts from low to full incredibly quickly
        if (player === 1) {
          dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
        } else {
          dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
        }
        nextPlayerRef.current.audioEl.current.play();
        dispatch(setIsFading(true));
      }
    }
  }
  if (playQueue.currentPlayer === player) {
    dispatch(setCurrentSeek({ seek: currentSeek, seekable }));
  }
};

const Player = (
  {
    currentEntryList,
    fadeDuration,
    fadeType,
    pollingInterval,
    volumeFade,
    debug,
    children,
  }: any,
  ref: any
) => {
  const player1Ref = useRef<any>();
  const player2Ref = useRef<any>();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const player = useAppSelector((state) => state.player);
  const cacheSongs = settings.getSync('cacheSongs');
  const [title, setTitle] = useState('');
  const [cachePath] = useState(path.join(getSongCachePath(), '/'));

  useImperativeHandle(ref, () => ({
    get player1() {
      return player1Ref.current;
    },
    get player2() {
      return player2Ref.current;
    },
  }));

  useEffect(() => {
    if (player.status === 'PLAYING') {
      if (playQueue.currentPlayer === 1) {
        try {
          player1Ref.current.audioEl.current.play();
        } catch (err) {
          console.log(err);
        }
      } else {
        try {
          player2Ref.current.audioEl.current.play();
        } catch (err) {
          console.log(err);
        }
      }
    } else {
      // Hacky way to pause the player because it sometimes doesn't pause if the
      // polling interval is set to a low value
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 10);
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 25);
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 100);
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 200);
    }
  }, [playQueue.currentPlayer, player.status, pollingInterval]);

  const handleListenPlayer1 = () => {
    listenHandler(
      player1Ref,
      player2Ref,
      playQueue,
      currentEntryList,
      dispatch,
      1,
      fadeDuration,
      fadeType,
      volumeFade,
      debug
    );
  };

  const handleListenPlayer2 = () => {
    listenHandler(
      player2Ref,
      player1Ref,
      playQueue,
      currentEntryList,
      dispatch,
      2,
      fadeDuration,
      fadeType,
      volumeFade,
      debug
    );
  };

  const handleOnEndedPlayer1 = () => {
    if (cacheSongs) {
      cacheSong(
        `${playQueue[currentEntryList][playQueue.player1.index].id}.mp3`,
        playQueue[currentEntryList][playQueue.player1.index].streamUrl.replace(
          /stream/,
          'download'
        )
      );
    }
    if (
      playQueue.repeat === 'none' &&
      playQueue.player1.index > playQueue.player2.index
    ) {
      dispatch(fixPlayer2Index());
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 200);
    } else {
      if (!playQueue.autoIncremented) {
        dispatch(incrementCurrentIndex('none'));
        dispatch(
          setCurrentIndex(playQueue[currentEntryList][playQueue.player2.index])
        );
        dispatch(setAutoIncremented(true));
      }
      if (
        playQueue[currentEntryList].length > 1 ||
        playQueue.repeat === 'all'
      ) {
        dispatch(setCurrentPlayer(2));
        dispatch(incrementPlayerIndex(1));
        dispatch(setPlayerVolume({ player: 1, volume: 0 }));
        dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
        dispatch(setIsFading(false));
        dispatch(setAutoIncremented(false));
      }
    }
  };

  const handleOnEndedPlayer2 = () => {
    if (cacheSongs) {
      cacheSong(
        `${playQueue[currentEntryList][playQueue.player2.index].id}.mp3`,
        playQueue[currentEntryList][playQueue.player2.index].streamUrl.replace(
          /stream/,
          'download'
        )
      );
    }
    if (
      playQueue.repeat === 'none' &&
      playQueue.player2.index > playQueue.player1.index
    ) {
      dispatch(fixPlayer2Index());
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 200);
    } else {
      if (!playQueue.autoIncremented) {
        dispatch(incrementCurrentIndex('none'));
        dispatch(
          setCurrentIndex(playQueue[currentEntryList][playQueue.player1.index])
        );
        dispatch(setAutoIncremented(true));
      }
      if (
        playQueue[currentEntryList].length > 1 ||
        playQueue.repeat === 'all'
      ) {
        dispatch(setCurrentPlayer(1));
        dispatch(incrementPlayerIndex(2));
        dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
        dispatch(setPlayerVolume({ player: 2, volume: 0 }));
        dispatch(setIsFading(false));
        dispatch(setAutoIncremented(false));
      }
    }
  };

  const notification = (description: string) => {
    Notification.error({
      title: 'Playback Error',
      description,
    });
  };

  useEffect(() => {
    const playStatus =
      player.status !== 'PLAYING' && playQueue[currentEntryList].length > 0
        ? '(Paused)'
        : '';
    const songTitle = playQueue[currentEntryList][playQueue.currentIndex]?.title
      ? `(${playQueue.currentIndex + 1} / ${
          playQueue[currentEntryList].length
        }) ~ ${playQueue[currentEntryList][playQueue.currentIndex]?.title} ~ ${
          playQueue[currentEntryList][playQueue.currentIndex]?.artist
        } `
      : 'sonixd';

    setTitle(`${playStatus} ${songTitle}`);
  }, [currentEntryList, playQueue, playQueue.currentIndex, player.status]);

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <ReactAudioPlayer
        ref={player1Ref}
        src={
          isCached(
            `${cachePath}/${
              playQueue[currentEntryList][playQueue.player1.index]?.id
            }.mp3`
          )
            ? `${cachePath}/${
                playQueue[currentEntryList][playQueue.player1.index]?.id
              }.mp3`
            : playQueue[currentEntryList][playQueue.player1.index]?.streamUrl
        }
        listenInterval={pollingInterval}
        preload="auto"
        onListen={handleListenPlayer1}
        onEnded={handleOnEndedPlayer1}
        volume={playQueue.player1.volume}
        autoPlay={
          playQueue.player1.index === playQueue.currentIndex &&
          playQueue.currentPlayer === 1
        }
        onError={(e: any) => notification(e.message)}
      />
      <ReactAudioPlayer
        ref={player2Ref}
        src={
          isCached(
            `${cachePath}/${
              playQueue[currentEntryList][playQueue.player2.index]?.id
            }.mp3`
          )
            ? `${cachePath}/${
                playQueue[currentEntryList][playQueue.player2.index]?.id
              }.mp3`
            : playQueue[currentEntryList][playQueue.player2.index]?.streamUrl
        }
        listenInterval={pollingInterval}
        preload="auto"
        onListen={handleListenPlayer2}
        onEnded={handleOnEndedPlayer2}
        volume={playQueue.player2.volume}
        autoPlay={
          playQueue.player2.index === playQueue.currentIndex &&
          playQueue.currentPlayer === 2
        }
        onError={(e: any) => notification(e.message)}
      />
      {children}
    </>
  );
};

export default forwardRef(Player);
