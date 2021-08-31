import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react';
import path from 'path';
import fs from 'fs';
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
  const [title, setTitle] = useState('');

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
      playQueue.player1.index + 1 < playQueue.entry.length ||
      playQueue.repeat === 'all'
    ) {
      if (currentSeek >= fadeAtTime) {
        // If it's not the last track in the queue OR we want to repeat
        // Once fading starts, start playing player 2 and set current to 2

        if (fadeDuration > 1.5) {
          const timeLeft = duration - currentSeek;
          if (player2Ref.current.audioEl.current) {
            const player1Volume =
              playQueue.player1.volume - (playQueue.volume / timeLeft) * 0.11 <=
              0
                ? 0
                : playQueue.player1.volume -
                  (playQueue.volume / timeLeft) * 0.11;

            const player2Volume =
              playQueue.player2.volume + (playQueue.volume / timeLeft) * 0.11 >=
              playQueue.volume
                ? playQueue.volume
                : playQueue.player2.volume +
                  (playQueue.volume / timeLeft) * 0.11;

            dispatch(setPlayerVolume({ player: 1, volume: player1Volume }));
            dispatch(setPlayerVolume({ player: 2, volume: player2Volume }));
            player2Ref.current.audioEl.current.play();
            dispatch(setIsFading(true));
          }
        } else {
          // If fade time is less than 1 second, don't fade and just start at
          // full volume. Due to the low fade duration, it causes the volume to
          // blast from low to full incredibly quickly due to the intervalled polling
          dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
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
      playQueue.player2.index + 1 < playQueue.entry.length ||
      playQueue.repeat === 'all'
    ) {
      if (currentSeek >= fadeAtTime) {
        if (fadeDuration > 1.5) {
          const timeLeft = duration - currentSeek;
          if (player1Ref.current.audioEl.current) {
            const player1Volume =
              playQueue.player1.volume + (playQueue.volume / timeLeft) * 0.11 >=
              playQueue.volume
                ? playQueue.volume
                : playQueue.player1.volume +
                  (playQueue.volume / timeLeft) * 0.11;

            const player2Volume =
              playQueue.player2.volume - (playQueue.volume / timeLeft) * 0.11 <=
              0
                ? 0
                : playQueue.player2.volume -
                  (playQueue.volume / timeLeft) * 0.11;

            dispatch(setPlayerVolume({ player: 1, volume: player1Volume }));
            dispatch(setPlayerVolume({ player: 2, volume: player2Volume }));
            player1Ref.current.audioEl.current.play();
            dispatch(setIsFading(true));
          }
        } else {
          dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
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
    if (cacheSongs) {
      cacheSong(
        `${playQueue.entry[playQueue.player1.index].id}.mp3`,
        playQueue.entry[playQueue.player1.index].streamUrl.replace(
          /stream/,
          'download'
        )
      );
    }
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
    if (cacheSongs) {
      cacheSong(
        `${playQueue.entry[playQueue.player2.index].id}.mp3`,
        playQueue.entry[playQueue.player2.index].streamUrl.replace(
          /stream/,
          'download'
        )
      );
    }
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

  const checkCachedSong = (id: string) => {
    const rootCacheFolder = path.join(
      path.dirname(settings.file()),
      'sonixdCache',
      `${settings.getSync('serverBase64')}`
    );
    const songCacheFolder = path.join(rootCacheFolder, 'song');

    const songCache = fs.readdirSync(songCacheFolder);
    const matchedSong = songCache.filter((song) => song.split('.')[0] === id);

    if (matchedSong.length !== 0) {
      return path.join(songCacheFolder, matchedSong[0]);
    }

    return null;
  };

  useEffect(() => {
    const playStatus =
      playQueue.status !== 'PLAYING' && playQueue.entry.length > 0
        ? '(Paused)'
        : '';
    const songTitle = playQueue.entry[playQueue.currentIndex]?.title
      ? `(${playQueue.currentIndex + 1} / ${playQueue.entry.length}) ~ ${
          playQueue.entry[playQueue.currentIndex]?.title
        } ~ ${playQueue.entry[playQueue.currentIndex]?.artist} `
      : 'sonixd';

    setTitle(`${playStatus} ${songTitle}`);
  }, [playQueue.currentIndex, playQueue.entry, playQueue.status]);

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <ReactAudioPlayer
        ref={player1Ref}
        src={
          checkCachedSong(playQueue.entry[playQueue.player1.index]?.id)
            ? checkCachedSong(playQueue.entry[playQueue.player1.index]?.id)
            : playQueue.entry[playQueue.player1.index]?.streamUrl
        }
        listenInterval={100}
        preload="auto"
        onListen={handleListen1}
        onEnded={handleOnEnded1}
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
          checkCachedSong(playQueue.entry[playQueue.player2.index]?.id)
            ? checkCachedSong(playQueue.entry[playQueue.player2.index]?.id)
            : playQueue.entry[playQueue.player2.index]?.streamUrl
        }
        listenInterval={100}
        preload="auto"
        onListen={handleListen2}
        onEnded={handleOnEnded2}
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
