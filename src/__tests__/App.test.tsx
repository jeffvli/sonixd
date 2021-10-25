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
import { FolderSelection } from '../redux/folderSlice';

const middlewares: Middleware<Record<string, unknown>, any, Dispatch<AnyAction>>[] | undefined = [];
const mockStore = configureMockStore(middlewares);

const playQueueState: PlayQueue = {
  player1: {
    src: './components/player/dummy.mp3',
    index: 0,
    volume: 0.5,
    fadeData: {
      volumeData: [],
      timeData: [],
    },
  },
  player2: {
    src: './components/player/dummy.mp3',
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
  playerUpdated: 0,
  autoIncremented: false,
  volume: 0.5,
  scrobble: false,
  isLoading: false,
  repeat: 'all',
  shuffle: false,
  sortColumn: undefined,
  sortType: 'asc',
  displayQueue: false,
  showDebugWindow: false,
  entry: [],
  shuffledEntry: [],
  sortedEntry: [],
};

const playerState: Player = {
  status: 'PAUSED',
  currentSeek: 0,
  scrobbled: false,
};

const miscState: General = {
  theme: 'defaultDark',
  font: 'Poppins',
  contextMenu: {
    show: false,
  },
  expandSidebar: false,
  modal: {
    currentPageIndex: undefined,
    show: false,
  },
  modalPages: [],
  isProcessingPlaylist: [],
  dynamicBackground: false,
  highlightOnRowHover: true,
  imageCachePath: '',
  songCachePath: '',
  titleBar: 'windows',
};

const folderState: FolderSelection = {
  musicFolder: undefined,
  applied: {
    albums: true,
    artists: true,
    dashboard: false,
    search: false,
    starred: false,
  },
  currentViewedFolder: undefined,
};

const mockInitialState = {
  playQueue: playQueueState,
  player: playerState,
  misc: miscState,
  folder: folderState,
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
