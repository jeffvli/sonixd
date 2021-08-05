import React from 'react';
import '../../styles/Titlebar.global.css';

const Titlebar = () => {
  return (
    <header id="titlebar">
      <div id="drag-region">
        <div id="window-title">
          <span>{document.title}</span>
        </div>
        <div id="window-controls">
          <div className="button" id="min-button">
            <img
              className="icon"
              srcSet="icons/min-w-10.png 1x, icons/min-w-12.png 1.25x, icons/min-w-15.png 1.5x, icons/min-w-15.png 1.75x, icons/min-w-20.png 2x, icons/min-w-20.png 2.25x, icons/min-w-24.png 2.5x, icons/min-w-30.png 3x, icons/min-w-30.png 3.5x"
              draggable="false"
              alt=""
            />
          </div>

          <div className="button" id="max-button">
            <img
              className="icon"
              srcSet="icons/max-w-10.png 1x, icons/max-w-12.png 1.25x, icons/max-w-15.png 1.5x, icons/max-w-15.png 1.75x, icons/max-w-20.png 2x, icons/max-w-20.png 2.25x, icons/max-w-24.png 2.5x, icons/max-w-30.png 3x, icons/max-w-30.png 3.5x"
              draggable="false"
              alt=""
            />
          </div>

          <div className="button" id="restore-button">
            <img
              className="icon"
              srcSet="icons/restore-w-10.png 1x, icons/restore-w-12.png 1.25x, icons/restore-w-15.png 1.5x, icons/restore-w-15.png 1.75x, icons/restore-w-20.png 2x, icons/restore-w-20.png 2.25x, icons/restore-w-24.png 2.5x, icons/restore-w-30.png 3x, icons/restore-w-30.png 3.5x"
              draggable="false"
              alt=""
            />
          </div>

          <div className="button" id="close-button">
            <img
              className="icon"
              srcSet="icons/close-w-10.png 1x, icons/close-w-12.png 1.25x, icons/close-w-15.png 1.5x, icons/close-w-15.png 1.75x, icons/close-w-20.png 2x, icons/close-w-20.png 2.25x, icons/close-w-24.png 2.5x, icons/close-w-30.png 3x, icons/close-w-30.png 3.5x"
              draggable="false"
              alt=""
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Titlebar;
