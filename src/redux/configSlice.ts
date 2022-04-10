import { nanoid } from 'nanoid/non-secure';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import settings from 'electron-settings';
import { mockSettings } from '../shared/mockSettings';
import { moveSelectedToIndex } from '../shared/utils';
import { Server } from '../types';

const parsedSettings: any = process.env.NODE_ENV === 'test' ? mockSettings : settings.getSync();

export interface ConfigPage {
  active: {
    tab: string;
    columnSelectorTab: string;
  };
  playback: {
    filters: PlaybackFilter[];
    audioDeviceId?: string;
  };
  sort: {
    albumListPage?: SortColumn;
    albumPage?: SortColumn;
    artistListPage?: SortColumn;
    artistPage?: SortColumn;
    favoriteAlbumsPage?: SortColumn;
    favoriteArtistsPage?: SortColumn;
    favoriteTracksPage?: SortColumn;
    folderListPage?: SortColumn;
    genreListPage?: SortColumn;
    playlistListPage?: SortColumn;
  };
  player: {
    systemNotifications: boolean;
  };
  lookAndFeel: {
    font: string;
    listView: {
      music: { columns: any; rowHeight: number; fontSize: number };
      album: { columns: any; rowHeight: number; fontSize: number };
      playlist: { columns: any; rowHeight: number; fontSize: number };
      artist: { columns: any; rowHeight: number; fontSize: number };
      genre: { columns: any; rowHeight: number; fontSize: number };
      mini: { columns: any; rowHeight: number; fontSize: number };
    };
    gridView: {
      cardSize: number;
      gapSize: number;
      alignment: string | 'flex-start' | 'center';
    };
    sidebar: Sidebar;
  };
  external: {
    discord: {
      enabled: boolean;
      clientId: string;
      serverImage: boolean;
    };
    obs: {
      enabled: boolean;
      url: string;
      path: string;
      pollingInterval: number;
      type: 'web' | 'local';
    };
  };
  window: {
    minimizeToTray: boolean;
    exitToTray: boolean;
  };
  serverType: Server;
}

interface SortColumn {
  sortColumn?: string;
  sortType: 'asc' | 'desc';
}

interface PlaybackFilter {
  filter: string;
  enabled: boolean;
}

export interface Sidebar {
  expand: boolean;
  width: string;
  coverArt: boolean;
  selected: SidebarList[];
}

export type SidebarList =
  | 'dashboard'
  | 'nowplaying'
  | 'favorites'
  | 'songs'
  | 'albums'
  | 'artists'
  | 'genres'
  | 'folders'
  | 'config'
  | 'collapse'
  | 'playlists';

export type ColumnList = 'music' | 'album' | 'playlist' | 'artist' | 'genre' | 'mini';

const initialState: ConfigPage = {
  active: {
    tab: 'playback',
    columnSelectorTab: 'music',
  },
  playback: {
    filters: parsedSettings.playbackFilters,
    audioDeviceId: parsedSettings.audioDeviceId || undefined,
  },
  player: {
    systemNotifications: parsedSettings.systemNotifications,
  },
  sort: {
    albumListPage: undefined,
    albumPage: undefined,
    artistListPage: undefined,
    artistPage: undefined,
    favoriteAlbumsPage: undefined,
    favoriteArtistsPage: undefined,
    favoriteTracksPage: undefined,
    folderListPage: undefined,
    genreListPage: undefined,
    playlistListPage: undefined,
  },
  lookAndFeel: {
    font: String(parsedSettings.font),
    listView: {
      music: {
        columns: parsedSettings.musicListColumns?.map((col: any) => {
          return { ...col, uniqueId: nanoid() };
        }),
        rowHeight: Number(parsedSettings.musicListRowHeight),
        fontSize: Number(parsedSettings.musicListFontSize),
      },
      album: {
        columns: parsedSettings.albumListColumns?.map((col: any) => {
          return { ...col, uniqueId: nanoid() };
        }),
        rowHeight: Number(parsedSettings.albumListRowHeight),
        fontSize: Number(parsedSettings.albumListFontSize),
      },
      playlist: {
        columns: parsedSettings.playlistListColumns?.map((col: any) => {
          return { ...col, uniqueId: nanoid() };
        }),
        rowHeight: Number(parsedSettings.playlistListRowHeight),
        fontSize: Number(parsedSettings.playlistListFontSize),
      },
      artist: {
        columns: parsedSettings.artistListColumns?.map((col: any) => {
          return { ...col, uniqueId: nanoid() };
        }),
        rowHeight: Number(parsedSettings.artistListRowHeight),
        fontSize: Number(parsedSettings.artistListFontSize),
      },
      genre: {
        columns: parsedSettings.genreListColumns?.map((col: any) => {
          return { ...col, uniqueId: nanoid() };
        }),
        rowHeight: Number(parsedSettings.genreListRowHeight),
        fontSize: Number(parsedSettings.genreListFontSize),
      },
      mini: {
        columns: parsedSettings.miniListColumns?.map((col: any) => {
          return { ...col, uniqueId: nanoid() };
        }),
        rowHeight: Number(parsedSettings.miniListRowHeight),
        fontSize: Number(parsedSettings.miniListFontSize),
      },
    },
    gridView: {
      cardSize: Number(parsedSettings.gridCardSize),
      gapSize: Number(parsedSettings.gridGapSize),
      alignment: String(parsedSettings.gridAlignment),
    },
    sidebar: {
      expand: Boolean(parsedSettings.sidebar?.expand),
      width: String(parsedSettings.sidebar?.width),
      coverArt: Boolean(parsedSettings.sidebar?.coverArt),
      selected: parsedSettings.sidebar?.selected || [
        'dashboard',
        'nowplaying',
        'favorites',
        'songs',
        'albums',
        'artists',
        'genres',
        'folders',
        'config',
        'collapse',
        'playlists',
      ],
    },
  },
  external: {
    discord: {
      enabled: parsedSettings.discord?.enabled || false,
      clientId: parsedSettings.discord?.clientId || '',
      serverImage: parsedSettings.discord?.serverImage || false,
    },
    obs: {
      enabled: parsedSettings.obs?.enabled || false,
      url: parsedSettings.obs?.url || '',
      path: parsedSettings.obs?.path || '',
      pollingInterval: parsedSettings.obs?.pollingInterval || 1000,
      type: parsedSettings.obs?.type || 'local',
    },
  },
  window: {
    minimizeToTray: parsedSettings.minimizeToTray,
    exitToTray: parsedSettings.exitToTray,
  },
  serverType: parsedSettings.serverType,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setActive: (state, action: PayloadAction<any>) => {
      state.active = action.payload;
    },

    setSidebar: (state, action: PayloadAction<any>) => {
      state.lookAndFeel.sidebar = {
        ...state.lookAndFeel.sidebar,
        ...action.payload,
      };
    },

    setPlayer: (state, action: PayloadAction<any>) => {
      state.player = {
        ...state.player,
        ...action.payload,
      };
    },

    setWindow: (state, action: PayloadAction<any>) => {
      state.window = { ...state.window, ...action.payload };
    },

    setPageSort: (
      state,
      action: PayloadAction<{
        page:
          | 'albumListPage'
          | 'albumPage'
          | 'artistListPage'
          | 'artistPage'
          | 'favoriteAlbumsPage'
          | 'favoriteArtistsPage'
          | 'favoriteTracksPage'
          | 'folderListPage'
          | 'genreListPage'
          | 'playlistListPage';
        sort: SortColumn;
      }>
    ) => {
      state.sort[action.payload.page] = action.payload.sort;
    },

    appendPlaybackFilter: (state, action: PayloadAction<PlaybackFilter>) => {
      if (!state.playback.filters.find((f: PlaybackFilter) => f.filter === action.payload.filter)) {
        state.playback.filters.push(action.payload);
      }
    },

    setPlaybackFilter: (
      state,
      action: PayloadAction<{ filterName: string; newFilter: PlaybackFilter }>
    ) => {
      const selectedFilterIndex = state.playback.filters.findIndex(
        (f: PlaybackFilter) => f.filter === action.payload.filterName
      );

      state.playback.filters[selectedFilterIndex] = action.payload.newFilter;
    },

    setFont: (state, action: PayloadAction<string>) => {
      state.lookAndFeel.font = action.payload;
    },

    setAudioDeviceId: (state, action: PayloadAction<string>) => {
      state.playback.audioDeviceId = action.payload;
    },

    removePlaybackFilter: (state, action: PayloadAction<{ filterName: string }>) => {
      state.playback.filters = state.playback.filters.filter(
        (f: PlaybackFilter) => f.filter !== action.payload.filterName
      );
    },

    setPlaybackFilters: (state, action: PayloadAction<any>) => {
      state.playback.filters = action.payload;
    },

    setColumnList: (state, action: PayloadAction<{ listType: ColumnList; entries: any }>) => {
      state.lookAndFeel.listView[action.payload.listType].columns = action.payload.entries;
    },

    setRowHeight: (state, action: PayloadAction<{ listType: ColumnList; height: number }>) => {
      state.lookAndFeel.listView[action.payload.listType].rowHeight = action.payload.height;
    },

    setFontSize: (state, action: PayloadAction<{ listType: ColumnList; size: number }>) => {
      state.lookAndFeel.listView[action.payload.listType].fontSize = action.payload.size;
    },

    setGridCardSize: (state, action: PayloadAction<{ size: number }>) => {
      state.lookAndFeel.gridView.cardSize = action.payload.size;
    },

    setGridGapSize: (state, action: PayloadAction<{ size: number }>) => {
      state.lookAndFeel.gridView.gapSize = action.payload.size;
    },

    setGridAlignment: (
      state,
      action: PayloadAction<{ alignment: string | 'flex-start' | 'center' }>
    ) => {
      state.lookAndFeel.gridView.alignment = action.payload.alignment;
    },

    moveToIndex: (
      state,
      action: PayloadAction<{
        entries: any;
        moveBeforeId: string;
        listType: 'music' | 'album' | 'playlist' | 'artist' | 'genre' | 'mini';
      }>
    ) => {
      state.lookAndFeel.listView[action.payload.listType].columns = moveSelectedToIndex(
        state.lookAndFeel.listView[action.payload.listType].columns,
        action.payload.entries,
        action.payload.moveBeforeId
      );
    },

    setDiscord: (state, action: PayloadAction<any>) => {
      state.external.discord = action.payload;
    },

    setOBS: (state, action: PayloadAction<any>) => {
      state.external.obs = action.payload;
    },
  },
});

export const {
  setActive,
  setPageSort,
  appendPlaybackFilter,
  removePlaybackFilter,
  setPlaybackFilter,
  setPlaybackFilters,
  setAudioDeviceId,
  setColumnList,
  setRowHeight,
  setFont,
  setFontSize,
  setGridCardSize,
  setGridGapSize,
  setGridAlignment,
  moveToIndex,
  setDiscord,
  setOBS,
  setSidebar,
  setWindow,
  setPlayer,
} = configSlice.actions;
export default configSlice.reducer;
