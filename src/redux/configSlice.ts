import { nanoid } from 'nanoid/non-secure';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import settings from 'electron-settings';
import { mockSettings } from '../shared/mockSettings';
import { moveSelectedToIndex } from '../shared/utils';
import { Server } from '../api/types';

const parsedSettings: any = process.env.NODE_ENV === 'test' ? mockSettings : settings.getSync();

export interface ConfigPage {
  active: {
    tab: string;
    columnSelectorTab: string;
  };
  playback: {
    filters: PlaybackFilter[];
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
  lookAndFeel: {
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

export type ColumnList = 'music' | 'album' | 'playlist' | 'artist' | 'genre' | 'mini';

const initialState: ConfigPage = {
  active: {
    tab: 'playback',
    columnSelectorTab: 'music',
  },
  playback: {
    filters: parsedSettings.playbackFilters,
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
    listView: {
      music: {
        columns: parsedSettings.musicListColumns!.map((col: any) => {
          return { ...col, uniqueId: nanoid() };
        }),
        rowHeight: Number(parsedSettings.musicListRowHeight),
        fontSize: Number(parsedSettings.musicListFontSize),
      },
      album: {
        columns: parsedSettings.albumListColumns!.map((col: any) => {
          return { ...col, uniqueId: nanoid() };
        }),
        rowHeight: Number(parsedSettings.albumListRowHeight),
        fontSize: Number(parsedSettings.albumListFontSize),
      },
      playlist: {
        columns: parsedSettings.playlistListColumns!.map((col: any) => {
          return { ...col, uniqueId: nanoid() };
        }),
        rowHeight: Number(parsedSettings.playlistListRowHeight),
        fontSize: Number(parsedSettings.playlistListFontSize),
      },
      artist: {
        columns: parsedSettings.artistListColumns!.map((col: any) => {
          return { ...col, uniqueId: nanoid() };
        }),
        rowHeight: Number(parsedSettings.artistListRowHeight),
        fontSize: Number(parsedSettings.artistListFontSize),
      },
      genre: {
        columns: parsedSettings.genreListColumns!.map((col: any) => {
          return { ...col, uniqueId: nanoid() };
        }),
        rowHeight: Number(parsedSettings.genreListRowHeight),
        fontSize: Number(parsedSettings.genreListFontSize),
      },
      mini: {
        columns: parsedSettings.miniListColumns!.map((col: any) => {
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
  },
});

export const {
  setActive,
  setPageSort,
  appendPlaybackFilter,
  removePlaybackFilter,
  setPlaybackFilter,
  setPlaybackFilters,
  setColumnList,
  setRowHeight,
  setFontSize,
  setGridCardSize,
  setGridGapSize,
  setGridAlignment,
  moveToIndex,
} = configSlice.actions;
export default configSlice.reducer;
