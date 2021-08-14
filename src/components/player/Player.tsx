import React, {
  useState,
  createRef,
  useEffect,
  createContext,
  useCallback,
} from 'react';

import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import {
  incrementCurrentIndex,
  decrementCurrentIndex,
  setIsLoading,
  setIsLoaded,
} from '../../redux/playQueueSlice';

export const PlayerContext = createContext<{
  currentTrack?: any;
  setCurrentTrack?: any;
  tracks?: any;
  setTracks?: any;
  currentlyPlaying?: any;
  setCurrentlyPlaying?: any;
}>({});

const Player = ({ children }: any) => {
  const playerRef = createRef();
  const playQueue = useAppSelector((state: any) => state.playQueue);
  const dispatch = useAppDispatch();
  const [currentTrack, setCurrentTrack] = useState(0);
  const [tracks, setTracks] = useState<any[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(false);

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

  /* useEffect(() => {
    const trackList = [];
    const howls = playQueue.entry.map((entry) => {
      const howl = new Howl({
        src: [entry.streamUrl],
        html5: true,
        autoplay: true,
        onload: () => {
          console.log('loaded');
        },
      });
      trackList.push(howl);
    });
    setTracks(trackList);
  }, [playQueue.entry]); */

  // TODO: Cancel timeout when switching tracks, otherwise multiple tracks will play

  const setFade = useCallback(
    (index: any) => {
      tracks[index].fade(0, 1, 8000);

      console.log('duration', tracks[index].duration());
      console.log(`tracks[index].seek()`, tracks[index].seek());
      const fadeouttime = 8000;

      console.log(
        'fade at:',
        ((tracks[index].duration() - tracks[index].seek()) * 1000 -
          fadeouttime) /
          1000
      );

      setTimeout(() => {
        // Check that the song is still currently playing.
        // This lets us know whether or not to continue the current playback
        // fade/gapless logic if the user hasn't manually switched the song
        if (tracks[index].playing()) {
          console.log('STARTED FADING', tracks[index].seek(), tracks[index]);
          console.log('Incremented index to:', index + 1);
          dispatch(incrementCurrentIndex());
          tracks[index].fade(1, 0, 8000);
          setCurrentTrack(index + 1); // ! New

          tracks[index + 1]._onplay = [];
          tracks[index + 1].on('play', () => setFade(index + 1));
          tracks[index + 1].play();
        } else {
          console.log(`TRACK INDEX ${index} STOPPED`);
        }
      }, (tracks[index].duration() - tracks[index].seek()) * 1000 - fadeouttime);
    },
    [dispatch, tracks]
  );

  useEffect(() => {
    if (tracks.length >= 1 && !currentlyPlaying) {
      console.log('EFFECT RUNNING', currentTrack);
      setCurrentlyPlaying(true);

      tracks[currentTrack]._onplay = [];
      tracks[currentTrack].on('play', () => setFade(currentTrack));
      tracks[currentTrack].play();
    }
  }, [currentTrack, currentlyPlaying, setFade, tracks]);

  /* setInterval(() => {
    console.log(tracks[playQueue.currentIndex]?.seek());
  }, 5000); */

  return (
    <PlayerContext.Provider
      value={{
        tracks,
        setTracks,
        currentlyPlaying,
        setCurrentlyPlaying,
        currentTrack,
        setCurrentTrack,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default Player;
