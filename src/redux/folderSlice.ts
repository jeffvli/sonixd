import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import settings from 'electron-settings';
import { mockSettings } from '../shared/mockSettings';

const parsedSettings: any = process.env.NODE_ENV === 'test' ? mockSettings : settings.getSync();

export interface FolderSelection {
  musicFolder?: string;
  musicFolderName?: string;
  applied: {
    albums: boolean;
    artists: boolean;
    dashboard: boolean;
    search: boolean;
    starred: boolean;
    music: boolean;
  };
  currentViewedFolder?: string;
}

const initialState: FolderSelection = {
  musicFolder:
    String(parsedSettings.musicFolder.id) === 'null'
      ? undefined
      : String(parsedSettings.musicFolder.id),
  musicFolderName: String(parsedSettings.musicFolder.name) || undefined,
  applied: {
    albums: Boolean(parsedSettings.musicFolder.albums),
    artists: Boolean(parsedSettings.musicFolder.artists),
    dashboard: Boolean(parsedSettings.musicFolder.artists),
    search: Boolean(parsedSettings.musicFolder.search),
    starred: Boolean(parsedSettings.musicFolder.starred),
    music: Boolean(parsedSettings.musicFolder.music),
  },
  currentViewedFolder: undefined,
};

const folderSlice = createSlice({
  name: 'folder',
  initialState,
  reducers: {
    setMusicFolder: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.musicFolder = action.payload.id;
      state.musicFolderName = action.payload.name;
    },

    setCurrentViewedFolder: (state, action: PayloadAction<string>) => {
      state.currentViewedFolder = action.payload;
    },

    setAppliedFolderViews: (state, action: PayloadAction<any>) => {
      state.applied = action.payload;
    },
  },
});

export const { setMusicFolder, setCurrentViewedFolder, setAppliedFolderViews } =
  folderSlice.actions;
export default folderSlice.reducer;
