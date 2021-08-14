import React, { useContext } from 'react';
import { Button, Slider } from 'rsuite';
import { PlayerContext } from './Player';
import { useAppSelector } from '../../redux/hooks';

const PlayerBar = () => {
  const { tracks, setTracks, currentTrack, setCurrentTrack } = useContext(
    PlayerContext
  );
  const playQueue = useAppSelector((state) => state.playQueue);

  return (
    <div>
      <div>
        Current Track: {currentTrack + 1} ({currentTrack})
      </div>
      {/* <Slider
        min={0}
        max={Math.floor(playQueue.entry[playQueue.currentIndex]?.duration || 0)}
        defaultValue={Math.floor(tracks[playQueue.currentIndex]?.seek())}
      /> */}
      <Button
        onClick={() => console.log(tracks[playQueue.currentIndex].pause())}
        size="lg"
      >
        pause1
      </Button>
      <Button
        onClick={() => {
          tracks[currentTrack].play();
        }}
        size="lg"
      >
        play
      </Button>
      <Button onClick={() => setCurrentTrack(currentTrack + 1)} size="lg">
        next
      </Button>
      <Button onClick={() => setCurrentTrack(currentTrack - 1)} size="lg">
        prev
      </Button>
      <Button onClick={() => console.log(tracks[currentTrack])} size="lg">
        Info
      </Button>
      <Button
        onClick={() =>
          console.log(tracks[currentTrack]._onplay ? 'true' : 'false')
        }
        size="lg"
      >
        Has onplay?
      </Button>
    </div>
  );
};

export default PlayerBar;
