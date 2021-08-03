import React, { useState, useEffect } from 'react';
import Sound from 'react-sound';

/* const useAudio = (url) => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    playing ? audio.play() : audio.pause();
  }, [playing]);

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false));
    };
  }, []);

  return [playing, toggle];
}; */

const Player = ({ url }) => {
  return (
    <div>
      <Sound
        url={url}
        playStatus={Sound.status.PLAYING}
        playFromPosition={0}
      ></Sound>
    </div>
  );
};

export default Player;
