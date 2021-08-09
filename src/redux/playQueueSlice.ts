import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import arrayMove from 'array-move';
import { areConsecutive, consecutiveRanges } from '../shared/utils';

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

      state.currentSongId = state.entry[state.currentIndex].id;
    },

    decrementCurrentIndex: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
      }

      state.currentSongId = state.entry[state.currentIndex].id;
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

    moveUp: (state, action: PayloadAction<number[]>) => {
      // Create a copy of the queue so we can mutate it in place with arrayMove.mutate
      const tempQueue = state.entry.slice();

      // Ascending index is needed to move the indexes in order
      const selectedIndexesAsc = action.payload.sort((a, b) => a - b);
      const cr = consecutiveRanges(selectedIndexesAsc);

      // Handle case when index hits 0
      if (
        !(
          selectedIndexesAsc.includes(0) &&
          areConsecutive(selectedIndexesAsc, selectedIndexesAsc.length)
        )
      ) {
        selectedIndexesAsc.map((index) => {
          if (cr[0]?.includes(0)) {
            if (!cr[0]?.includes(index) && index !== 0) {
              return arrayMove.mutate(tempQueue, index, index - 1);
            }
          } else if (index !== 0) {
            return arrayMove.mutate(tempQueue, index, index - 1);
          }

          return undefined;
        });
      }

      state.entry = tempQueue;
    },

    moveDown: (state, action: PayloadAction<number[]>) => {
      // Create a copy of the queue so we can mutate it in place with arrayMove.mutate
      const tempQueue = state.entry.slice();

      // Descending index is needed to move the indexes in order
      const cr = consecutiveRanges(action.payload.sort((a, b) => a - b));
      const selectedIndexesDesc = action.payload.sort((a, b) => b - a);

      // Handle case when index hits the end
      if (
        !(
          selectedIndexesDesc.includes(tempQueue.length - 1) &&
          areConsecutive(selectedIndexesDesc, selectedIndexesDesc.length)
        )
      ) {
        selectedIndexesDesc.map((index) => {
          if (cr[0]?.includes(tempQueue.length - 1)) {
            if (!cr[0]?.includes(index) && index !== tempQueue.length - 1) {
              return arrayMove.mutate(tempQueue, index, index + 1);
            }
          } else if (index !== tempQueue.length - 1) {
            return arrayMove.mutate(tempQueue, index, index + 1);
          }

          return undefined;
        });
      }

      state.entry = tempQueue;
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
  moveUp,
  moveDown,
} = playQueueSlice.actions;
export default playQueueSlice.reducer;
