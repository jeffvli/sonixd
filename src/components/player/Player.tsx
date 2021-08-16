import React, { useState, createContext } from 'react';

export const PlayerContext = createContext<any>({});

const Player = ({ children }: any) => {
  const [globalVolume, setGlobalVolume] = useState(0.5);
  const [player1Volume, setPlayer1Volume] = useState(0.5);
  const [player2Volume, setPlayer2Volume] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [incremented, setIncremented] = useState(false);

  /*   const handleOnLoadStart = () => {
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
  }; */

  return (
    <PlayerContext.Provider
      value={{
        globalVolume,
        setGlobalVolume,
        player1Volume,
        setPlayer1Volume,
        player2Volume,
        setPlayer2Volume,
        currentPlayer,
        setCurrentPlayer,
        incremented,
        setIncremented,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default Player;
