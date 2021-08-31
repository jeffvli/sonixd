import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Player {
  status: string;
  currentSeek: number;
  currentSeekable: number;
}

const initialState: Player = {
  status: 'PAUSED',
  currentSeek: 0,
  currentSeekable: 0,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    resetPlayer: (state) => {
      state.currentSeek = 0;
      state.currentSeekable = 0;
    },

    setStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
    },

    setCurrentSeek: (
      state,
      action: PayloadAction<{ seek: number; seekable: number }>
    ) => {
      state.currentSeek = action.payload.seek;
      state.currentSeekable = action.payload.seekable;
    },
  },
});

export const { setStatus, setCurrentSeek, resetPlayer } = playerSlice.actions;
export default playerSlice.reducer;
