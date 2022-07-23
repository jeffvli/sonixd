import React from 'react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { Middleware, Dispatch, AnyAction } from 'redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import configureMockStore from 'redux-mock-store';
import { render } from '@testing-library/react';
import { PlayQueue } from '../redux/playQueueSlice';
import { Player } from '../redux/playerSlice';
import { General } from '../redux/miscSlice';
import { Playlist } from '../redux/playlistSlice';
import { ConfigPage } from '../redux/configSlice';
import { FolderSelection } from '../redux/folderSlice';
import { FavoritePage } from '../redux/favoriteSlice';
import App from '../App';
import { Server } from '../types';
import { ArtistPage } from '../redux/artistSlice';
import { View } from '../redux/viewSlice';

const middlewares: Middleware<Record<string, unknown>, any, Dispatch<AnyAction>>[] | undefined = [];
const mockStore = configureMockStore(middlewares);

const queryClient = new QueryClient();

const playQueueState: PlayQueue = {
  player1: {
    src: './components/player/dummy.mp3',
    index: 0,
    fadeData: {
      volumeData: [],
      timeData: [],
    },
  },
  player2: {
    src: './components/player/dummy.mp3',
    index: 1,
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
  scrobbled: false,
};

const miscState: General = {
  theme: 'defaultDark',
  contextMenu: {
    show: false,
  },
  modal: {
    currentPageIndex: undefined,
    show: false,
  },
  imgModal: {
    src: '',
    show: false,
  },
  modalPages: [],
  isProcessingPlaylist: [],
  dynamicBackground: false,
  highlightOnRowHover: true,
  imageCachePath: '',
  songCachePath: '',
  titleBar: 'windows',
  searchQuery: '',
};

const playlistState: Playlist = {
  active: {
    list: {
      sort: {
        type: 'asc',
      },
    },
    page: {
      sort: {
        type: 'asc',
      },
    },
  },
  entry: [],
  sortedEntry: [],
};

const folderState: FolderSelection = {
  musicFolder: undefined,
  musicFolderName: undefined,
  applied: {
    albums: true,
    artists: true,
    dashboard: false,
    search: false,
    starred: false,
    music: false,
  },
  currentViewedFolder: undefined,
};

const configState: ConfigPage = {
  active: {
    tab: 'playback',
    columnSelectorTab: 'music',
  },
  playback: {
    filters: [],
  },
  sort: {},
  player: {
    systemNotifications: false,
  },
  serverType: Server.Subsonic,
  lookAndFeel: {
    font: 'Poppins',
    listView: {
      music: {
        columns: [
          {
            id: '#',
            dataKey: 'index',
            alignment: 'center',
            resizable: true,
            width: 50,
            label: '# (Drag/Drop)',
          },
          {
            id: 'Title',
            dataKey: 'combinedtitle',
            alignment: 'left',
            flexGrow: 5,
            label: 'Title (Combined)',
          },
          {
            id: 'Album',
            dataKey: 'album',
            alignment: 'left',
            flexGrow: 3,
            label: 'Album',
          },
          {
            id: 'Duration',
            dataKey: 'duration',
            alignment: 'center',
            flexGrow: 2,
            label: 'Duration',
          },
          {
            id: 'Bitrate',
            dataKey: 'bitRate',
            alignment: 'left',
            flexGrow: 1,
            label: 'Bitrate',
          },
          {
            id: 'Fav',
            dataKey: 'starred',
            alignment: 'center',
            flexGrow: 1,
            label: 'Favorite',
          },
        ],
        rowHeight: 40,
        fontSize: 14,
      },
      album: {
        columns: [
          {
            id: '#',
            dataKey: 'index',
            alignment: 'center',
            resizable: true,
            width: 50,
            label: '#',
          },
          {
            id: 'Title',
            dataKey: 'combinedtitle',
            alignment: 'left',
            flexGrow: 5,
            label: 'Title (Combined)',
          },
          {
            id: 'Tracks',
            dataKey: 'songCount',
            alignment: 'center',
            flexGrow: 1,
            label: 'Track Count',
          },
          {
            id: 'Duration',
            dataKey: 'duration',
            alignment: 'center',
            flexGrow: 2,
            label: 'Duration',
          },
          {
            id: 'Fav',
            dataKey: 'starred',
            alignment: 'center',
            flexGrow: 1,
            label: 'Favorite',
          },
        ],
        rowHeight: 40,
        fontSize: 14,
      },
      playlist: {
        columns: [
          {
            id: '#',
            dataKey: 'index',
            alignment: 'center',
            resizable: true,
            width: 50,
            label: '#',
          },
          {
            id: 'Title',
            dataKey: 'title',
            alignment: 'left',
            flexGrow: 5,
            label: 'Title',
          },
          {
            id: 'Description',
            dataKey: 'comment',
            alignment: 'left',
            flexGrow: 3,
            label: 'Description',
          },
          {
            id: 'Tracks',
            dataKey: 'songCount',
            alignment: 'center',
            flexGrow: 1,
            label: 'Track Count',
          },
          {
            id: 'Owner',
            dataKey: 'owner',
            alignment: 'left',
            flexGrow: 2,
            label: 'Owner',
          },
          {
            id: 'Modified',
            dataKey: 'changed',
            alignment: 'left',
            flexGrow: 1,
            label: 'Modified',
          },
        ],
        rowHeight: 40,
        fontSize: 14,
      },
      artist: {
        columns: [
          {
            id: '#',
            dataKey: 'index',
            alignment: 'center',
            resizable: true,
            width: 50,
            label: '#',
          },
          {
            id: 'Art',
            dataKey: 'coverart',
            alignment: 'center',
            resizable: true,
            width: 50,
            label: 'CoverArt',
          },
          {
            id: 'Title',
            dataKey: 'title',
            alignment: 'left',
            flexGrow: 5,
            label: 'Title',
          },
          {
            id: 'Albums',
            dataKey: 'albumCount',
            alignment: 'left',
            flexGrow: 1,
            label: 'Album Count',
          },
          {
            id: 'Fav',
            dataKey: 'starred',
            alignment: 'center',
            flexGrow: 1,
            label: 'Favorite',
          },
        ],
        rowHeight: 40,
        fontSize: 14,
      },
      genre: {
        columns: [
          {
            id: '#',
            dataKey: 'index',
            alignment: 'center',
            resizable: true,
            width: 50,
            label: '#',
          },
          {
            id: 'Title',
            dataKey: 'title',
            alignment: 'left',
            flexGrow: 5,
            label: 'Tame',
          },
          {
            id: 'Albums',
            dataKey: 'albumCount',
            alignment: 'left',
            flexGrow: 3,
            label: 'Album Count',
          },
          {
            id: 'Tracks',
            dataKey: 'songCount',
            alignment: 'left',
            flexGrow: 1,
            label: 'Song Count',
          },
        ],
        rowHeight: 40,
        fontSize: 14,
      },
      mini: {
        columns: [
          {
            id: '#',
            dataKey: 'index',
            alignment: 'center',
            resizable: true,
            width: 50,
            label: '# (Drag/Drop)',
          },
          {
            id: 'Title',
            dataKey: 'combinedtitle',
            alignment: 'left',
            flexGrow: 5,
            label: 'Title (Combined)',
          },
          {
            id: 'Duration',
            dataKey: 'duration',
            alignment: 'center',
            flexGrow: 2,
            label: 'Duration',
          },
        ],
        rowHeight: 40,
        fontSize: 14,
      },
    },
    gridView: {
      cardSize: 160,
      gapSize: 20,
      alignment: 'flex-start',
    },
    sidebar: {
      expand: false,
      coverArt: true,
      width: '225px',
      selected: ['dashboard', 'nowplaying'],
    },
  },
  external: {
    discord: {
      enabled: false,
      clientId: '',
      serverImage: false,
    },
    obs: {
      enabled: false,
      url: '',
      path: '',
      pollingInterval: 2000,
      type: 'local',
    },
  },
  window: {
    minimizeToTray: false,
    exitToTray: false,
  },
};

const favoriteState: FavoritePage = {
  active: {
    tab: 'tracks',
    album: {
      sort: {
        type: 'asc',
      },
    },
    artist: {
      sort: {
        type: 'asc',
      },
    },
  },
};

const artistState: ArtistPage = {
  active: {
    list: {
      sort: {
        type: 'asc',
      },
    },
    page: {
      sort: {
        type: 'asc',
      },
    },
  },
};

const viewState: View = {
  album: {
    filter: 'alphabeticalByName',
    sort: {
      type: 'asc',
    },
    advancedFilters: {
      enabled: false,
      nav: 'filters',
      properties: {
        notStarred: false,
        starred: false,
        genre: {
          list: [],
          type: 'and',
        },
        artist: {
          list: [],
          type: 'and',
        },
        year: {
          from: 0,
          to: 0,
        },
      },
    },
    pagination: {
      serverSide: true,
      recordsPerPage: 19,
      activePage: 147,
      pages: 285,
    },
  },
  music: {
    filter: 'random',
    sort: {
      column: undefined,
      type: 'asc',
    },
    pagination: {
      recordsPerPage: 100,
      activePage: 1,
      pages: 1,
    },
  },
};

const mockInitialState = {
  player: playerState,
  playQueue: playQueueState,
  misc: miscState,
  playlist: playlistState,
  folder: folderState,
  config: configState,
  favorite: favoriteState,
  artist: artistState,
  view: viewState,
};

describe('App', () => {
  it('Should render', () => {
    const store = mockStore(mockInitialState);
    expect(
      render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </Provider>
      )
    ).toBeTruthy();
  });
});
