import React from 'react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { Middleware, Dispatch, AnyAction } from 'redux';
import configureMockStore from 'redux-mock-store';
import { render } from '@testing-library/react';
import { PlayQueue } from '../redux/playQueueSlice';
import { Player } from '../redux/playerSlice';
import { General } from '../redux/miscSlice';
import App from '../App';

const middlewares:
  | Middleware<Record<string, unknown>, any, Dispatch<AnyAction>>[]
  | undefined = [];
const mockStore = configureMockStore(middlewares);

const playQueueState: PlayQueue = {
  player1: {
    index: 0,
    volume: 0.5,
    fadeData: {
      volumeData: [],
      timeData: [],
    },
  },
  player2: {
    index: 1,
    volume: 0,
    fadeData: {
      volumeData: [],
      timeData: [],
    },
  },
  scrollWithCurrentSong: false,
  fadeDuration: 0,
  fadeType: 'equalPower',
  pollingInterval: 5,
  volumeFade: false,
  currentIndex: 0,
  currentSongId: '',
  currentSongUniqueId: '',
  currentPlayer: 1,
  isFading: false,
  autoIncremented: false,
  volume: 0.5,
  isLoading: false,
  repeat: 'all',
  shuffle: false,
  displayQueue: false,
  showDebugWindow: false,
  entry: [],
  shuffledEntry: [],
};

const playerState: Player = {
  status: 'PAUSED',
  currentSeek: 0,
  currentSeekable: 0,
};

const miscState: General = {
  theme: 'defaultDark',
  font: 'Poppins',
  modal: {
    currentPageIndex: undefined,
    show: false,
  },
  modalPages: [],
};

const mockInitialState = {
  playQueue: playQueueState,
  player: playerState,
  misc: miscState,
};

describe('App', () => {
  it('Should render with dark theme', () => {
    const store = mockStore(mockInitialState);
    expect(
      render(
        <Provider store={store}>
          <App />
        </Provider>
      )
    ).toBeTruthy();
  });

  it('Should render with light theme', () => {
    const store = mockStore(mockInitialState);
    expect(
      render(
        <Provider store={store}>
          <App />
        </Provider>
      )
    ).toBeTruthy();
  });

  it('Should render with no theme specified', () => {
    const store = mockStore(mockInitialState);
    expect(
      render(
        <Provider store={store}>
          <App />
        </Provider>
      )
    ).toBeTruthy();
  });
});
