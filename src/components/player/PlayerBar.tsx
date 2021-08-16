import React, { useState, useContext, useRef } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { Button } from 'rsuite';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  incrementCurrentIndex,
  incrementPlayerIndex,
} from '../../redux/playQueueSlice';
import { PlayerContext } from './Player';

const PlayerBar = () => {
  const player1Ref = useRef<any>();
  const player2Ref = useRef<any>();
  const {
    player1Volume,
    player2Volume,
    setPlayer1Volume,
    setPlayer2Volume,
    incremented,
    setIncremented,
    globalVolume,
    currentPlayer,
    setCurrentPlayer,
  } = useContext(PlayerContext);

  const dispatch = useAppDispatch();
  const playQueue = useAppSelector((state) => state.playQueue);

  const handleListen = () => {
    const fadeDuration = 10;
    const currentTime = player1Ref.current?.audioEl.current?.currentTime || 0;
    const duration = player1Ref.current?.audioEl.current?.duration;
    const fadeAtTime = duration - fadeDuration;

    if (currentTime >= fadeAtTime) {
      if (player2Ref.current.audioEl.current) {
        // Once fading starts, start playing player 2 and set current to 2
        setPlayer1Volume(
          player1Volume - globalVolume / (fadeDuration * 2) <= 0
            ? 0
            : player1Volume - globalVolume / (fadeDuration * 2)
        );
        setPlayer2Volume(
          player2Volume + globalVolume / (fadeDuration * 1.5) >= globalVolume
            ? globalVolume
            : player2Volume + globalVolume / (fadeDuration * 1.5)
        );
        player2Ref.current.audioEl.current.play();
        if (!incremented) {
          dispatch(incrementCurrentIndex());
          setIncremented(true);
        }
        setCurrentPlayer(2);
      }
      console.log('fading player1...');
    }
    console.log(`player1: ${currentTime} / ${fadeAtTime}`);
  };

  const handleListen2 = () => {
    const fadeDuration = 10;
    const currentTime = player2Ref.current?.audioEl.current?.currentTime || 0;
    const duration = player2Ref.current?.audioEl.current?.duration;
    const fadeAtTime = duration - fadeDuration;

    if (currentTime >= fadeAtTime) {
      if (player1Ref.current.audioEl.current) {
        // Once fading starts, start playing player 1 and set current to 1
        setPlayer1Volume(
          player1Volume + globalVolume / (fadeDuration * 1.5) >= globalVolume
            ? globalVolume
            : player1Volume + globalVolume / (fadeDuration * 1.5)
        );
        setPlayer2Volume(
          player2Volume - globalVolume / (fadeDuration * 2) <= 0
            ? 0
            : player2Volume - globalVolume / (fadeDuration * 2)
        );
        player1Ref.current.audioEl.current.play();
        if (!incremented) {
          dispatch(incrementCurrentIndex());
          setIncremented(true);
        }
        setCurrentPlayer(1);
      }
      console.log('fading player2...');
    }
    console.log(`player2: ${currentTime} / ${fadeAtTime}`);
  };

  const handleOnEnded1 = () => {
    dispatch(incrementPlayerIndex(1));
    setPlayer1Volume(0);
    setPlayer2Volume(globalVolume);
    setIncremented(false);
  };

  const handleOnEnded2 = () => {
    dispatch(incrementPlayerIndex(2));
    setPlayer1Volume(globalVolume);
    setPlayer2Volume(0);
    setIncremented(false);
  };

  return (
    <>
      <ReactAudioPlayer
        ref={player1Ref}
        src={playQueue.entry[playQueue.player1Index]?.streamUrl}
        listenInterval={500}
        preload="auto"
        onListen={handleListen}
        onEnded={handleOnEnded1}
        controls
        volume={player1Volume}
        autoPlay={playQueue.currentIndex === 0}
      />
      <ReactAudioPlayer
        ref={player2Ref}
        src={playQueue.entry[playQueue.player2Index]?.streamUrl}
        listenInterval={500}
        preload="auto"
        onListen={handleListen2}
        onEnded={handleOnEnded2}
        controls
        volume={player2Volume}
      />
      <Button onClick={() => console.log(playQueue.entry)}>Length</Button>
      <div>
        {`Current index: ${playQueue.currentIndex}  |  `}
        {`Player1 index: ${playQueue.player1Index}  | ${
          playQueue.entry[playQueue.player1Index]?.title
        } `}
        {`Player2 index: ${playQueue.player2Index}  |  ${
          playQueue.entry[playQueue.player2Index]?.title
        }`}
      </div>
    </>
  );
};

export default PlayerBar;
