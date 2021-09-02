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
  player: number
) => {
  const fadeDuration = Number(settings.getSync('fadeDuration')) || 0;
  const fadeType = String(settings.getSync('fadeType'));
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
    if (currentSeek >= fadeAtTime) {
      // If it's not the last track in the queue OR we want to repeat
      // Once fading starts, start playing player 2 and set current to 2

      if (fadeDuration > 1.5) {
        const timeLeft = duration - currentSeek;
        if (nextPlayerRef.current.audioEl.current) {
          const currentPlayerVolumeCalculation =
            fadeType === 'equalPower'
              ? Math.sqrt(0.5 * ((timeLeft / fadeDuration) * 2)) *
                playQueue.volume
              : fadeType === 'linear'
              ? (timeLeft / fadeDuration) * playQueue.volume
              : 0;

          const currentPlayerVolume =
            currentPlayerVolumeCalculation <= 0
              ? 0
              : currentPlayerVolumeCalculation;

          const nextPlayerVolumeCalculation =
            fadeType === 'equalPower'
              ? Math.sqrt(0.5 * (2 - (timeLeft / fadeDuration) * 2)) *
                playQueue.volume
              : fadeType === 'linear'
              ? ((fadeDuration - timeLeft) / fadeDuration) * playQueue.volume
              : 0;

          const nextPlayerVolume =
            nextPlayerVolumeCalculation >= playQueue.volume
              ? playQueue.volume
              : nextPlayerVolumeCalculation;

          if (player === 1) {
            dispatch(
              setPlayerVolume({ player: 1, volume: currentPlayerVolume })
            );
            dispatch(setPlayerVolume({ player: 2, volume: nextPlayerVolume }));
          } else {
            dispatch(
              setPlayerVolume({ player: 2, volume: currentPlayerVolume })
            );
            dispatch(setPlayerVolume({ player: 1, volume: nextPlayerVolume }));
          }

          nextPlayerRef.current.audioEl.current.play();
          dispatch(setIsFading(true));
        }
      } else {
        // If fade time is less than 1 second, don't fade and just start at
        // full volume. Due to the low fade duration, it causes the volume to
        // blast from low to full incredibly quickly due to the intervalled polling
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

const Player = ({ children }: any, ref: any) => {
  const player1Ref = useRef<any>();
  const player2Ref = useRef<any>();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const player = useAppSelector((state) => state.player);
  const cacheSongs = settings.getSync('cacheSongs');
  const [title, setTitle] = useState('');
  const [cachePath] = useState(path.join(getSongCachePath(), '/'));
  const [currentEntryList, setCurrentEntryList] = useState('entry');

  useEffect(() => {
    if (playQueue.shuffle) {
      setCurrentEntryList('shuffledEntry');
    } else {
      setCurrentEntryList('entry');
    }
  }, [playQueue.shuffle]);

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
      // Add short timeout otherwise sometimes fading-in player doesn't pause
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 100);
    }
  }, [playQueue.currentPlayer, player.status]);

  const handleListenPlayer1 = () => {
    listenHandler(
      player1Ref,
      player2Ref,
      playQueue,
      currentEntryList,
      dispatch,
      1
    );
  };

  const handleListenPlayer2 = () => {
    listenHandler(
      player2Ref,
      player1Ref,
      playQueue,
      currentEntryList,
      dispatch,
      2
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
        listenInterval={50}
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
        listenInterval={50}
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
