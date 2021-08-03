import React from 'react';
import '../../styles/PlaylistViewHeader.global.css';

const PlaylistViewHeader = ({ name, comment, image, songCount }: any) => {
  return (
    <div id="playlist__header" className="container__playlist">
      <div className="playlist__column_left">
        <img src={image} alt="playlist-img" />
      </div>
      <div className="playlist__column_middle">
        <h1 className="playlist__title">{name}</h1>
        <h2 className="playlist__comment">{comment}</h2>
        <h3 className="playlist__songcount">{songCount}</h3>
      </div>
    </div>
  );
};

export default PlaylistViewHeader;
