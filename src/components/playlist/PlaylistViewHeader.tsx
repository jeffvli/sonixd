import React from 'react';
import styled from 'styled-components';
import '../../styles/PlaylistViewHeader.global.css';

const StyledImg = styled.img`
  border-radius: 85px;
  box-shadow: 0 0 20px #000;
`;

const PlaylistViewHeader = ({ name, comment, image, songCount }: any) => {
  return (
    <div id="playlist__header" className="container__playlist">
      <div className="playlist__column_left">
        <StyledImg src={image} alt="playlist-img" />
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
