import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import path from 'path';
import fs from 'fs';
import settings from 'electron-settings';
import { Notification } from 'rsuite';
import ReactAudioPlayer from 'react-audio-player';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  incrementCurrentIndex,
  incrementPlayerIndex,
  setCurrentPlayer,
  setPlayerVolume,
  setCurrentSeek,
  setIsFading,
  setAutoIncremented,
  resetPlayer,
  fixPlayer2Index,
  setCurrentIndex,
} from '../../redux/playQueueSlice';
import cacheSong from '../shared/cacheSong';

const Player = ({ children }: any, ref: any) => {
  const player1Ref = useRef<any>();
  const player2Ref = useRef<any>();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);
  const cacheSongs = settings.getSync('cacheSongs');

  useImperativeHandle(ref, () => ({
    get player1() {
      return player1Ref.current;
    },
    get player2() {
      return player2Ref.current;
    },
  }));

  useEffect(() => {
    if (playQueue.status === 'PLAYING') {
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
      player1Ref.current.audioEl.current.pause();
      player2Ref.current.audioEl.current.pause();
    }
  }, [playQueue.currentPlayer, playQueue.status]);

  const handleListen1 = () => {
    const fadeDuration = Number(settings.getSync('fadeDuration')) || 0;
    const currentSeek = player1Ref.current?.audioEl.current?.currentTime || 0;
    const seekable =
      player1Ref.current.audioEl.current.seekable.length >= 1
        ? player1Ref.current.audioEl.current.seekable.end(
            player1Ref.current.audioEl.current.seekable.length - 1
          )
        : 0;
    const duration = player1Ref.current?.audioEl.current?.duration;
    const fadeAtTime = duration - fadeDuration;

    // Don't fade if player2Index <= player1Index unless repeat==='all'

    if (
      (playQueue.repeat === 'none' &&
        playQueue.player2.index > playQueue.player1.index) ||
      playQueue.repeat === 'all'
    ) {
      if (currentSeek >= fadeAtTime) {
        // Once fading starts, start playing player 2 and set current to 2
        const timeLeft = duration - currentSeek;

        if (player2Ref.current.audioEl.current) {
          const player1Volume =
            playQueue.player1.volume - (playQueue.volume / timeLeft) * 0.1 <= 0
              ? 0
              : playQueue.player1.volume - (playQueue.volume / timeLeft) * 0.1;

          const player2Volume =
            playQueue.player2.volume + (playQueue.volume / timeLeft) * 0.1 >=
            playQueue.volume
              ? playQueue.volume
              : playQueue.player2.volume + (playQueue.volume / timeLeft) * 0.1;

          dispatch(setPlayerVolume({ player: 1, volume: player1Volume }));
          dispatch(setPlayerVolume({ player: 2, volume: player2Volume }));
          player2Ref.current.audioEl.current.play();
          dispatch(setIsFading(true));
        }
      }
    }
    if (playQueue.currentPlayer === 1) {
      dispatch(setCurrentSeek({ seek: currentSeek, seekable }));
    }
  };

  const handleListen2 = () => {
    const fadeDuration = Number(settings.getSync('fadeDuration')) || 0;
    const currentSeek = player2Ref.current?.audioEl.current?.currentTime || 0;
    const seekable =
      player2Ref.current.audioEl.current.seekable.length >= 1
        ? player2Ref.current.audioEl.current.seekable.end(
            player2Ref.current.audioEl.current.seekable.length - 1
          )
        : 0;
    const duration = player2Ref.current?.audioEl.current?.duration;
    const fadeAtTime = duration - fadeDuration;

    if (
      (playQueue.repeat === 'none' &&
        playQueue.player1.index > playQueue.player2.index) ||
      playQueue.repeat === 'all'
    ) {
      if (currentSeek >= fadeAtTime) {
        const timeLeft = duration - currentSeek;

        // Once fading starts, start playing player 1 and set current to 1
        if (player1Ref.current.audioEl.current) {
          const player1Volume =
            playQueue.player1.volume + (playQueue.volume / timeLeft) * 0.1 >=
            playQueue.volume
              ? playQueue.volume
              : playQueue.player1.volume + (playQueue.volume / timeLeft) * 0.1;

          const player2Volume =
            playQueue.player2.volume - (playQueue.volume / timeLeft) * 0.1 <= 0
              ? 0
              : playQueue.player2.volume - (playQueue.volume / timeLeft) * 0.1;

          dispatch(setPlayerVolume({ player: 1, volume: player1Volume }));
          dispatch(setPlayerVolume({ player: 2, volume: player2Volume }));
          player1Ref.current.audioEl.current.play();
          dispatch(setIsFading(true));
        }
      }
    }
    if (playQueue.currentPlayer === 2) {
      dispatch(setCurrentSeek({ seek: currentSeek, seekable }));
    }
  };

  const handleOnEnded1 = () => {
    if (
      playQueue.repeat === 'none' &&
      playQueue.player1.index > playQueue.player2.index
    ) {
      dispatch(resetPlayer());
      dispatch(fixPlayer2Index());
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 200);
    } else {
      if (!playQueue.autoIncremented) {
        dispatch(incrementCurrentIndex('none'));
        dispatch(setCurrentIndex(playQueue.entry[playQueue.player2.index]));
        dispatch(setAutoIncremented(true));
      }
      if (playQueue.entry.length > 1 || playQueue.repeat === 'all') {
        dispatch(setCurrentPlayer(2));
        dispatch(incrementPlayerIndex(1));
        dispatch(setPlayerVolume({ player: 1, volume: 0 }));
        dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
        dispatch(setIsFading(false));
        dispatch(setAutoIncremented(false));
      }
    }
  };

  const handleOnEnded2 = () => {
    if (
      playQueue.repeat === 'none' &&
      playQueue.player2.index > playQueue.player1.index
    ) {
      dispatch(resetPlayer());
      dispatch(fixPlayer2Index());
      setTimeout(() => {
        player1Ref.current.audioEl.current.pause();
        player2Ref.current.audioEl.current.pause();
      }, 200);
    } else {
      if (!playQueue.autoIncremented) {
        dispatch(incrementCurrentIndex('none'));
        dispatch(setCurrentIndex(playQueue.entry[playQueue.player1.index]));
        dispatch(setAutoIncremented(true));
      }
      if (playQueue.entry.length > 1 || playQueue.repeat === 'all') {
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

  const checkCachedSong = (id: number) => {
    const rootCacheFolder = path.join(
      path.dirname(settings.file()),
      'sonixdCache',
      `${settings.getSync('serverBase64')}`
    );

    const songCacheFolder = path.join(rootCacheFolder, 'song');
    const songCache = fs.readdirSync(songCacheFolder);

    const matchedSong = songCache.filter(
      (song) => Number(song.split('.')[0]) === id
    );

    if (matchedSong.length !== 0) {
      return path.join(songCacheFolder, matchedSong[0]);
    }

    return null;
  };

  return (
    <>
      <ReactAudioPlayer
        ref={player1Ref}
        src={
          checkCachedSong(playQueue.entry[playQueue.player1.index]?.id)
            ? checkCachedSong(playQueue.entry[playQueue.player1.index]?.id)
            : playQueue.entry[playQueue.player1.index]?.streamUrl
        }
        listenInterval={150}
        preload="auto"
        onListen={handleListen1}
        onEnded={handleOnEnded1}
        volume={playQueue.player1.volume}
        autoPlay={
          playQueue.player1.index === playQueue.currentIndex &&
          playQueue.currentPlayer === 1
        }
        onError={(e: any) => notification(e.message)}
        onPlay={() => {
          if (cacheSongs) {
            cacheSong(
              `${playQueue.entry[playQueue.player1.index].id}.mp3`,
              playQueue.entry[playQueue.player1.index].streamUrl.replace(
                /stream/,
                'download'
              )
            );
          }
        }}
      />
      <ReactAudioPlayer
        ref={player2Ref}
        src={
          checkCachedSong(playQueue.entry[playQueue.player2.index]?.id)
            ? checkCachedSong(playQueue.entry[playQueue.player2.index]?.id)
            : playQueue.entry[playQueue.player2.index]?.streamUrl
        }
        listenInterval={150}
        preload="auto"
        onListen={handleListen2}
        onEnded={handleOnEnded2}
        volume={playQueue.player2.volume}
        autoPlay={
          playQueue.player2.index === playQueue.currentIndex &&
          playQueue.currentPlayer === 2
        }
        onError={(e: any) => notification(e.message)}
        onPlay={() => {
          if (cacheSongs) {
            cacheSong(
              `${playQueue.entry[playQueue.player2.index].id}.mp3`,
              playQueue.entry[playQueue.player2.index].streamUrl.replace(
                /stream/,
                'download'
              )
            );
          }
        }}
      />
      {children}
    </>
  );
};

export default forwardRef(Player);
