import React, { createRef } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import {
  incrementCurrentIndex,
  decrementCurrentIndex,
  setIsLoading,
  setIsLoaded,
} from '../../redux/playQueueSlice';

const Player = () => {
  const playerRef = createRef<AudioPlayer>();
  const playQueue = useAppSelector((state: any) => state.playQueue);
  const dispatch = useAppDispatch();

  const handleOnLoadStart = () => {
    dispatch(setIsLoading());
  };

  const handleOnLoadedData = () => {
    dispatch(setIsLoaded());
  };

  const handleOnClickNext = () => {
    dispatch(incrementCurrentIndex());
  };

  const handleOnClickPrevious = () => {
    dispatch(decrementCurrentIndex());
  };

  const handleOnEnded = () => {
    dispatch(incrementCurrentIndex());
  };

  return (
    <AudioPlayer
      ref={playerRef}
      src={playQueue.entry[playQueue.currentIndex]?.streamUrl}
      autoPlay
      showSkipControls
      showFilledVolume
      showJumpControls={false}
      onClickNext={handleOnClickNext}
      onClickPrevious={handleOnClickPrevious}
      onEnded={handleOnEnded}
      onLoadStart={handleOnLoadStart}
      onLoadedData={handleOnLoadedData}
    />
  );
};

export default Player;
