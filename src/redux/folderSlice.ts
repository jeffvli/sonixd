import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import settings from 'electron-settings';
import { mockSettings } from '../shared/mockSettings';

const parsedSettings: any = process.env.NODE_ENV === 'test' ? mockSettings : settings.getSync();

export interface FolderSelection {
  musicFolder?: string | number;
  applied: {
    albums: boolean;
    artists: boolean;
    dashboard: boolean;
    search: boolean;
    starred: boolean;
  };
  currentViewedFolder?: string;
}

const initialState: FolderSelection = {
  musicFolder: Number(parsedSettings.musicFolder.id) || undefined,
  applied: {
    albums: Boolean(parsedSettings.musicFolder.albums),
    artists: Boolean(parsedSettings.musicFolder.artists),
    dashboard: Boolean(parsedSettings.musicFolder.artists),
    search: Boolean(parsedSettings.musicFolder.search),
    starred: Boolean(parsedSettings.musicFolder.starred),
  },
  currentViewedFolder: undefined,
};

const folderSlice = createSlice({
  name: 'folder',
  initialState,
  reducers: {
    setMusicFolder: (state, action: PayloadAction<string | number>) => {
      state.musicFolder = action.payload;
    },

    setCurrentViewedFolder: (state, action: PayloadAction<string>) => {
      state.currentViewedFolder = action.payload;
    },

    setAppliedFolderViews: (state, action: PayloadAction<any>) => {
      state.applied = action.payload;
    },
  },
});

export const {
  setMusicFolder,
  setCurrentViewedFolder,
  setAppliedFolderViews,
} = folderSlice.actions;
export default folderSlice.reducer;
