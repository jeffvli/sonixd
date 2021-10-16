import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FolderSelection {
  id?: string;
}

const initialState: FolderSelection = {
  id: undefined,
};

const folderSlice = createSlice({
  name: 'folder',
  initialState,
  reducers: {
    setFolder: (state, action: PayloadAction<FolderSelection>) => {
      state.id = action.payload.id;
    },
  },
});

export const { setFolder } = folderSlice.actions;
export default folderSlice.reducer;
