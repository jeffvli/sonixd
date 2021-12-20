import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Player {
  status: string;
  scrobbled: boolean;
}

const initialState: Player = {
  status: 'PAUSED',
  scrobbled: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
    },

    setScrobbled: (state, action: PayloadAction<boolean>) => {
      state.scrobbled = action.payload;
    },
  },
});

export const { setStatus, setScrobbled } = playerSlice.actions;
export default playerSlice.reducer;
