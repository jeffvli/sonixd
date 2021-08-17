import React, {
  useState,
  createContext,
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
} from '../../redux/playQueueSlice';

export const PlayerContext = createContext<any>({});

const Player = ({ children }: any, ref: any) => {
  const [incremented, setIncremented] = useState(false);
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
    const duration = player1Ref.current?.audioEl.current?.duration;
    const fadeAtTime = duration - fadeDuration;

    if (currentSeek >= fadeAtTime) {
      if (player2Ref.current.audioEl.current) {
        // Once fading starts, start playing player 2 and set current to 2
        const player1Volume =
          playQueue.player1.volume - playQueue.volume / (fadeDuration * 2) <= 0
            ? 0
            : playQueue.player1.volume - playQueue.volume / (fadeDuration * 2);

        const player2Volume =
          playQueue.player2.volume + playQueue.volume / (fadeDuration * 1.5) >=
          playQueue.volume
            ? playQueue.volume
            : playQueue.player2.volume +
              playQueue.volume / (fadeDuration * 1.5);

        dispatch(setPlayerVolume({ player: 1, volume: player1Volume }));
        dispatch(setPlayerVolume({ player: 2, volume: player2Volume }));

        player2Ref.current.audioEl.current.play();
        if (!incremented) {
          dispatch(incrementCurrentIndex('none'));
          setIncremented(true);
        }
        dispatch(setCurrentPlayer(2));
      }
      console.log('fading player1...');
    } else {
      dispatch(setCurrentSeek(currentSeek));
    }
    console.log(`player1: ${currentSeek} / ${fadeAtTime}`);
  };

  const handleListen2 = () => {
    const fadeDuration = 10;
    const currentSeek = player2Ref.current?.audioEl.current?.currentTime || 0;
    const duration = player2Ref.current?.audioEl.current?.duration;
    const fadeAtTime = duration - fadeDuration;

    if (currentSeek >= fadeAtTime) {
      if (player1Ref.current.audioEl.current) {
        // Once fading starts, start playing player 1 and set current to 1
        const player1Volume =
          playQueue.player1.volume + playQueue.volume / (fadeDuration * 1.5) >=
          playQueue.volume
            ? playQueue.volume
            : playQueue.player1.volume +
              playQueue.volume / (fadeDuration * 1.5);

        const player2Volume =
          playQueue.player2.volume - playQueue.volume / (fadeDuration * 2) <= 0
            ? 0
            : playQueue.player2.volume - playQueue.volume / (fadeDuration * 2);

        dispatch(setPlayerVolume({ player: 1, volume: player1Volume }));
        dispatch(setPlayerVolume({ player: 2, volume: player2Volume }));

        player1Ref.current.audioEl.current.play();
        if (!incremented) {
          dispatch(incrementCurrentIndex('none'));
          setIncremented(true);
        }
        dispatch(setCurrentPlayer(1));
      }
      console.log('fading player2...');
    } else {
      dispatch(setCurrentSeek(currentSeek));
    }

    console.log(`player2: ${currentSeek} / ${fadeAtTime}`);
  };

  const handleOnEnded1 = () => {
    dispatch(incrementPlayerIndex(1));
    dispatch(setPlayerVolume({ player: 1, volume: 0 }));
    dispatch(setPlayerVolume({ player: 2, volume: playQueue.volume }));
    setIncremented(false);
  };

  const handleOnEnded2 = () => {
    dispatch(incrementPlayerIndex(2));
    dispatch(setPlayerVolume({ player: 1, volume: playQueue.volume }));
    dispatch(setPlayerVolume({ player: 2, volume: 0 }));
    setIncremented(false);
  };

  return (
    <PlayerContext.Provider
      value={{
        incremented,
        setIncremented,
      }}
    >
      <ReactAudioPlayer
        ref={player1Ref}
        src={playQueue.entry[playQueue.player1.index]?.streamUrl}
        listenInterval={500}
        preload="auto"
        onListen={handleListen}
        onEnded={handleOnEnded1}
        volume={playQueue.player1.volume}
        autoPlay={playQueue.player1.index === playQueue.currentIndex}
      />
      <ReactAudioPlayer
        ref={player2Ref}
        src={playQueue.entry[playQueue.player2.index]?.streamUrl}
        listenInterval={500}
        preload="auto"
        onListen={handleListen2}
        onEnded={handleOnEnded2}
        volume={playQueue.player2.volume}
        autoPlay={playQueue.player2.index === playQueue.currentIndex}
      />
      {children}
    </PlayerContext.Provider>
  );
};

export default forwardRef(Player);
