import { nanoid } from 'nanoid/non-secure';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import settings from 'electron-settings';
import { mockSettings } from '../shared/mockSettings';
import { moveSelectedToIndex } from '../shared/utils';

const parsedSettings: any = process.env.NODE_ENV === 'test' ? mockSettings : settings.getSync();

export interface ConfigPage {
  active: {
    tab: string;
    columnSelectorTab: string;
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
  };
}

export type ColumnList = 'music' | 'album' | 'playlist' | 'artist' | 'genre' | 'mini';

const initialState: ConfigPage = {
  active: {
    tab: 'playback',
    columnSelectorTab: 'music',
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
  },
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setActive: (state, action: PayloadAction<any>) => {
      state.active = action.payload;
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
  setColumnList,
  setRowHeight,
  setFontSize,
  moveToIndex,
} = configSlice.actions;
export default configSlice.reducer;
