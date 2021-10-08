import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Player {
  status: string;
  currentSeek: number;
  scrobbled: boolean;
}

const initialState: Player = {
  status: 'PAUSED',
  currentSeek: 0,
  scrobbled: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    resetPlayer: (state) => {
      state.currentSeek = 0;
    },

    setStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
    },

    setCurrentSeek: (state, action: PayloadAction<{ seek: number }>) => {
      state.currentSeek = action.payload.seek;
    },

    setScrobbled: (state, action: PayloadAction<boolean>) => {
      state.scrobbled = action.payload;
    },
  },
});

export const { setStatus, setCurrentSeek, resetPlayer, setScrobbled } = playerSlice.actions;
export default playerSlice.reducer;
