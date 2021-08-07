import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Entry {
  id: string;
  album: string;
  albumId: string;
  artist: string;
  bitRate: number;
  contentType: string;
  coverArt: string;
  created: string;
  duration: string;
  genre: string;
  index: number;
  isDir: boolean;
  isVideo: boolean;
  parent: string;
  path: string;
  playCount: number;
  size: number;
  starred?: string;
  streamUrl: string;
  suffix: string;
  title: string;
  track: number;
  type: string;
  year: number;
}

export interface PlayQueue {
  currentIndex: number;
  currentSongId: string;
  volume: number;
  isLoading: boolean;
  repeatAll: boolean;
  entry: Entry[];
}

const initialState: PlayQueue = {
  currentIndex: 0,
  currentSongId: '',
  volume: 0.5,
  isLoading: false,
  repeatAll: false,
  entry: [],
};

const playQueueSlice = createSlice({
  name: 'nowPlaying',
  initialState,
  reducers: {
    incrementCurrentIndex: (state) => {
      if (state.currentIndex < state.entry.length - 1) {
        state.currentIndex += 1;
      } else if (state.repeatAll) {
        state.currentIndex = 0;
      }
    },
    decrementCurrentIndex: (state) => {
      if (state.currentIndex >= 0) {
        state.currentIndex -= 1;
      }
    },
    setCurrentIndex: (state, action: PayloadAction<Entry>) => {
      const findIndex = state.entry.findIndex(
        (track) => track.id === action.payload.id
      );

      state.currentIndex = findIndex;
      state.currentSongId = action.payload.id;
    },
    setPlayQueue: (state, action: PayloadAction<Entry[]>) => {
      state.currentIndex = 0;
      state.currentSongId = action.payload[0].id;
      action.payload.map((entry: any) => state.entry.push(entry));
    },
    appendPlayQueue: (state, action: PayloadAction<Entry[]>) => {
      action.payload.map((entry: any) => state.entry.push(entry));
    },
    clearPlayQueue: () => initialState,
    setIsLoading: (state) => {
      state.isLoading = true;
    },
    setIsLoaded: (state) => {
      state.isLoading = false;
    },
  },
});

export const {
  incrementCurrentIndex,
  decrementCurrentIndex,
  setCurrentIndex,
  setPlayQueue,
  clearPlayQueue,
  setIsLoading,
  setIsLoaded,
} = playQueueSlice.actions;
export default playQueueSlice.reducer;
