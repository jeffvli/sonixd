import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Player {
  status: string;
  currentSeek: number;
}

const initialState: Player = {
  status: 'PAUSED',
  currentSeek: 0,
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
  },
});

export const { setStatus, setCurrentSeek, resetPlayer } = playerSlice.actions;
export default playerSlice.reducer;
