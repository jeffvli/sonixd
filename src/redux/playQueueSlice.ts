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

interface PlayQueue {
  currentIndex: number;
  volume: number;
  isLoading: boolean;
  entry: Entry[];
}

const initialState: PlayQueue = {
  currentIndex: 0,
  volume: 0.5,
  isLoading: false,
  entry: [],
};

const playQueueSlice = createSlice({
  name: 'nowPlaying',
  initialState,
  reducers: {
    incrementCurrentIndex: (state) => {
      if (state.currentIndex <= state.entry.length) {
        state.currentIndex += 1;
      } else {
        state.currentIndex = 0;
      }
    },
    decrementCurrentIndex: (state) => {
      if (state.currentIndex >= 0) {
        state.currentIndex -= 1;
      }
    },
    setCurrentIndex: (state, action: PayloadAction<PlayQueue>) => {
      state.currentIndex = action.payload.currentIndex;
    },
    setPlayQueue: (state, action: PayloadAction<Entry[]>) => {
      state.currentIndex = 0;
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
