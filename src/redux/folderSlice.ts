import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import settings from 'electron-settings';
import { mockSettings } from '../shared/mockSettings';

const parsedSettings = process.env.NODE_ENV === 'test' ? mockSettings : settings.getSync();

export interface FolderSelection {
  musicFolder: string | number;
  currentViewedFolder?: string;
}

const initialState: FolderSelection = {
  musicFolder: Number(parsedSettings.musicFolder) || 0,
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
  },
});

export const { setMusicFolder, setCurrentViewedFolder } = folderSlice.actions;
export default folderSlice.reducer;
