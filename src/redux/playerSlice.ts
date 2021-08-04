import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type PlayerType = {
  url?: string;
  playStatus?: string;
  playFromPosition?: number;
  volume?: number;
  isLoading?: boolean;
};

const initialState = {
  url: '',
  playStatus: 'STOPPED',
  playFromPosition: 0,
  volume: 100,
  isLoading: false,
};
const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    togglePlayback: (state, action: PayloadAction<PlayerType>) => {
      if (state.playStatus === 'PAUSED' || state.playStatus === 'STOPPED') {
        state.playStatus = 'PLAYING';
      } else {
        state.playStatus = 'PAUSED';
      }
      state.url = action.payload.url!;
    },
    startPlayback: (state: any, action: PayloadAction<PlayerType>) => {
      state.url = action.payload.url;
      state.playStatus = 'PLAYING';
      state.playFromPosition = 0;
    },
    stopPlayback: (state) => {
      state.playStatus = 'STOPPED';
    },
    pausePlayback: (state) => {
      state.playStatus = 'PAUSED';
    },
    resetPlayback: () => initialState,
    setIsLoading: (state: any, action: PayloadAction<PlayerType>) => {
      state.isLoading = action.payload.isLoading;
    },
    setVolume: (state, action: PayloadAction<PlayerType>) => {
      state.volume = action.payload.volume!;
    },
    setPlayFromPosition: (state, action: PayloadAction<PlayerType>) => {
      state.playFromPosition = action.payload.playFromPosition!;
    },
  },
});

export const {
  togglePlayback,
  startPlayback,
  stopPlayback,
  pausePlayback,
  resetPlayback,
  setIsLoading,
  setVolume,
  setPlayFromPosition,
} = playerSlice.actions;
export default playerSlice.reducer;
