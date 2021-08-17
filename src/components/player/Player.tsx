import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
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
} from '../../redux/playQueueSlice';

const Player = ({ children }: any, ref: any) => {
  const player1Ref = useRef<any>();
  const player2Ref = useRef<any>();
  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);

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

  const handleListen = () => {
    const fadeDuration = 10;
    const currentSeek = player1Ref.current?.audioEl.current?.currentTime || 0;
    const seekable =
      player1Ref.current.audioEl.current.seekable.length >= 1
        ? player1Ref.current.audioEl.current.seekable.end(
            player1Ref.current.audioEl.current.seekable.length - 1
          )
        : 0;
    const duration = player1Ref.current?.audioEl.current?.duration;
    const fadeAtTime = duration - fadeDuration;

    console.log(`seekable`, seekable);
    console.log(`currentSeek`, currentSeek);

    if (currentSeek >= fadeAtTime) {
      // Once fading starts, start playing player 2 and set current to 2
      const timeLeft = duration - currentSeek;

      if (player2Ref.current.audioEl.current) {
        const player1Volume =
          playQueue.player1.volume - (playQueue.volume / timeLeft) * 0.25 <= 0
            ? 0
            : playQueue.player1.volume - (playQueue.volume / timeLeft) * 0.25;

        const player2Volume =
          playQueue.player2.volume + (playQueue.volume / timeLeft) * 0.25 >=
          playQueue.volume
            ? playQueue.volume
            : playQueue.player2.volume + (playQueue.volume / timeLeft) * 0.25;

        dispatch(setPlayerVolume({ player: 1, volume: player1Volume }));
        dispatch(setPlayerVolume({ player: 2, volume: player2Volume }));
        player2Ref.current.audioEl.current.play();
        dispatch(setIsFading(true));
      }
    }

    if (playQueue.currentPlayer === 1) {
      dispatch(setCurrentSeek({ seek: currentSeek, seekable }));
    }
  };

  const handleListen2 = () => {
    const fadeDuration = 10;
    const currentSeek = player2Ref.current?.audioEl.current?.currentTime || 0;
    const seekable =
      player2Ref.current.audioEl.current.seekable.length >= 1
        ? player2Ref.current.audioEl.current.seekable.end(
            player2Ref.current.audioEl.current.seekable.length - 1
          )
        : 0;
    const duration = player2Ref.current?.audioEl.current?.duration;
    const fadeAtTime = duration - fadeDuration;

    if (currentSeek >= fadeAtTime) {
      const timeLeft = duration - currentSeek;

      // Once fading starts, start playing player 1 and set current to 1
      if (player1Ref.current.audioEl.current) {
        const player1Volume =
          playQueue.player1.volume + (playQueue.volume / timeLeft) * 0.25 >=
          playQueue.volume
            ? playQueue.volume
            : playQueue.player1.volume + (playQueue.volume / timeLeft) * 0.25;

        const player2Volume =
          playQueue.player2.volume - (playQueue.volume / timeLeft) * 0.25 <= 0
            ? 0
            : playQueue.player2.volume - (playQueue.volume / timeLeft) * 0.25;

        dispatch(setPlayerVolume({ player: 1, volume: player1Volume }));
        dispatch(setPlayerVolume({ player: 2, volume: player2Volume }));
        player1Ref.current.audioEl.current.play();
        dispatch(setIsFading(true));
      }
    }

    if (playQueue.currentPlayer === 2) {
      dispatch(setCurrentSeek({ seek: currentSeek, seekable }));
    }
  };

  const handleOnEnded1 = () => {
    if (!playQueue.autoIncremented) {
      dispatch(incrementCurrentIndex('none'));
      dispatch(setAutoIncremented(true));
    }
    dispatch(setCurrentPlayer(2));
    dispatch(incrementPlayerIndex(1));
    dispatch(setPlayerVolume({ player: 1, volume: 0 }));
    dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
    dispatch(setIsFading(false));
    dispatch(setAutoIncremented(false));
  };

  const handleOnEnded2 = () => {
    if (!playQueue.autoIncremented) {
      dispatch(incrementCurrentIndex('none'));
      dispatch(setAutoIncremented(true));
    }
    dispatch(setCurrentPlayer(1));
    dispatch(incrementPlayerIndex(2));
    dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
    dispatch(setPlayerVolume({ player: 2, volume: 0 }));
    dispatch(setIsFading(false));
    dispatch(setAutoIncremented(false));
  };

  return (
    <>
      <ReactAudioPlayer
        ref={player1Ref}
        src={playQueue.entry[playQueue.player1.index]?.streamUrl}
        listenInterval={250}
        preload="auto"
        onListen={handleListen}
        onEnded={handleOnEnded1}
        volume={playQueue.player1.volume}
        autoPlay={playQueue.player1.index === playQueue.currentIndex}
      />
      <ReactAudioPlayer
        ref={player2Ref}
        src={playQueue.entry[playQueue.player2.index]?.streamUrl}
        listenInterval={250}
        preload="auto"
        onListen={handleListen2}
        onEnded={handleOnEnded2}
        volume={playQueue.player2.volume}
        autoPlay={playQueue.player2.index === playQueue.currentIndex}
      />
      {children}
    </>
  );
};

export default forwardRef(Player);
