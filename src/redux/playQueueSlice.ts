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
  status: string;
  currentIndex: number;
  currentSongId: string;
  currentPlayer: number;
  currentSeek: number;
  currentSeekable: number;
  isFading: boolean;
  autoIncremented: boolean;
  player1: {
    index: number;
    volume: number;
  };
  player2: {
    index: number;
    volume: number;
  };
  volume: number;
  isLoading: boolean;
  repeat: string;
  shuffle: boolean;
  displayQueue: boolean;
  entry: Entry[];
}

const initialState: PlayQueue = {
  status: 'PAUSED',
  currentIndex: 0,
  currentSongId: '',
  currentPlayer: 1,
  currentSeek: 0,
  currentSeekable: 0,
  isFading: false,
  autoIncremented: false,
  player1: {
    index: 0,
    volume: 0.5,
  },
  player2: {
    index: 1,
    volume: 0,
  },
  volume: 0.5,
  isLoading: false,
  repeat: 'none',
  shuffle: false,
  displayQueue: false,
  entry: [],
};

// TODO: Needs refactoring due to rapid experimental changes to add gapless playback

const resetPlayerDefaults = (state: PlayQueue) => {
  state.currentSeek = 0;
  state.currentSeekable = 0;
  state.isFading = false;
  state.currentIndex = 0;
  state.currentSongId = '';
  state.currentPlayer = 1;
  state.currentSeek = 0;
  state.currentSeekable = 0;
  state.player1.index = 0;
  state.player1.volume = state.volume;
  state.player2.index = 0;
  state.player2.volume = 0;
};

const playQueueSlice = createSlice({
  name: 'nowPlaying',
  initialState,
  reducers: {
    resetPlayer: (state) => {
      resetPlayerDefaults(state);
      state.currentSongId = state.entry[0].id;
      state.status = 'PAUSED';
    },

    setStatus: (state, action: PayloadAction<string>) => {
      if (state.entry.length >= 1) {
        state.status = action.payload;
      }
    },

    setAutoIncremented: (state, action: PayloadAction<boolean>) => {
      state.autoIncremented = action.payload;
    },

    setStar: (state, action: PayloadAction<string>) => {
      if (action.payload === 'unstar') {
        state.entry[state.currentIndex].starred = undefined;
      } else {
        state.entry[state.currentIndex].starred = String(Date.now());
      }
    },

    toggleRepeat: (state) => {
      if (state.repeat === 'none') {
        state.repeat = 'all';
      } else if (state.repeat === 'all') {
        state.repeat = 'none';
      }

      if (state.player1.index > state.entry.length - 1) state.player1.index = 0;

      if (state.player2.index > state.entry.length - 1) state.player2.index = 0;
    },

    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },

    toggleDisplayQueue: (state) => {
      state.displayQueue = !state.displayQueue;
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },

    setCurrentSeek: (
      state,
      action: PayloadAction<{ seek: number; seekable: number }>
    ) => {
      state.currentSeek = action.payload.seek;
      state.currentSeekable = action.payload.seekable;
    },

    setCurrentPlayer: (state, action: PayloadAction<number>) => {
      if (action.payload === 1) {
        state.currentPlayer = 1;
      } else {
        state.currentPlayer = 2;
      }
    },

    incrementCurrentIndex: (state, action: PayloadAction<string>) => {
      if (state.entry.length >= 1) {
        state.currentSeek = 0;
        state.currentSeekable = 0;
        if (state.currentIndex < state.entry.length - 1) {
          state.currentIndex += 1;
          if (action.payload === 'usingHotkey') {
            state.currentPlayer = 1;
            state.isFading = false;
            state.player1.volume = state.volume;
            state.player1.index = state.currentIndex;
            if (state.currentIndex + 1 >= state.entry.length) {
              state.player2.index = 0;
            } else {
              state.player2.index = state.currentIndex + 1;
            }
          }
        }

        state.currentSongId = state.entry[state.currentIndex].id;
      }
    },

    incrementPlayerIndex: (state, action: PayloadAction<number>) => {
      // If the entry list is greater than two, we don't need to increment,
      // just keep swapping playback between the tracks [0 <=> 0] or [0 <=> 1]
      // without changing the index of either player
      if (state.entry.length > 2) {
        if (action.payload === 1) {
          if (
            state.player1.index + 1 === state.entry.length &&
            state.repeat === 'none'
          ) {
            // Reset the player on the end of the playlist if no repeat
            resetPlayerDefaults(state);
          } else if (state.player1.index + 2 >= state.entry.length) {
            // If incrementing would be greater than the total number of entries,
            // reset it back to 0. Also check if player1 is already set to 0.
            if (state.player2.index === 0) {
              state.player1.index = state.player2.index + 1;
            } else {
              state.player1.index = 0;
            }
          } else {
            state.player1.index += 2;
          }
          state.currentPlayer = 2;
        } else {
          if (
            state.player2.index + 1 === state.entry.length &&
            state.repeat === 'none'
          ) {
            // Reset the player on the end of the playlist if no repeat
            resetPlayerDefaults(state);
          } else if (state.player2.index + 2 >= state.entry.length) {
            // If incrementing would be greater than the total number of entries,
            // reset it back to 0. Also check if player1 is already set to 0.
            if (state.player1.index === 0) {
              state.player2.index = 1;
            } else {
              state.player2.index = 0;
            }
          } else {
            state.player2.index += 2;
          }
          state.currentPlayer = 1;
        }
      }
    },

    setPlayerIndex: (state, action: PayloadAction<Entry>) => {
      const findIndex = state.entry.findIndex(
        (track) => track.id === action.payload.id
      );

      state.currentSeek = 0;
      state.currentSeekable = 0;
      state.isFading = false;
      state.player1.index = findIndex;
      state.player1.volume = state.volume;

      // We use fixPlayer2Index in conjunction with this reducer
      // See note in decrementCurrentIndex reducer
      state.player2.index = 0;

      state.player2.volume = 0;
      state.currentPlayer = 1;
      state.currentIndex = findIndex;
      state.currentSongId = action.payload.id;
    },

    setPlayerVolume: (
      state,
      action: PayloadAction<{ player: number; volume: number }>
    ) => {
      if (action.payload.player === 1) {
        state.player1.volume = action.payload.volume;
      } else {
        state.player2.volume = action.payload.volume;
      }
    },

    decrementCurrentIndex: (state, action: PayloadAction<string>) => {
      if (state.entry.length >= 1) {
        state.currentSeek = 0;
        state.currentSeekable = 0;
        if (state.currentIndex > 0) {
          state.currentIndex -= 1;
          if (action.payload === 'usingHotkey') {
            state.currentPlayer = 1;
            state.isFading = false;
            state.player1.volume = state.volume;
            state.player1.index = state.currentIndex;

            // Set the index back to 0 here, while performing the index set on fixPlayer2Index
            // when dispatching this reducer. We need to do this because when decrementing while
            // the current player is player2, the current index of player2 will not change,
            // which means that player2 will continue playing even after decrementing the song
            state.player2.index = 0;
            state.player2.volume = 0;
          }
        }

        state.currentSongId = state.entry[state.currentIndex].id;
      }
    },

    fixPlayer2Index: (state) => {
      if (state.entry.length >= 2) {
        state.player2.index = state.currentIndex + 1;
      } else {
        state.player1.index = 0;
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
      // Reset player defaults
      state.entry = [];
      resetPlayerDefaults(state);

      if (state.status !== 'PLAYING') {
        state.status = 'PLAYING';
      }
      state.currentSongId = action.payload[0].id;
      action.payload.map((entry: any) => state.entry.push(entry));
    },

    appendPlayQueue: (state, action: PayloadAction<Entry[]>) => {
      action.payload.map((entry: any) => state.entry.push(entry));
    },

    clearPlayQueue: (state) => {
      state.entry = [];
      state.status = 'PAUSED';
      resetPlayerDefaults(state);
    },

    setIsLoading: (state) => {
      state.isLoading = true;
    },

    setIsLoaded: (state) => {
      state.isLoading = false;
    },

    setIsFading: (state, action: PayloadAction<boolean>) => {
      state.isFading = action.payload;
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
  incrementPlayerIndex,
  setPlayerIndex,
  fixPlayer2Index,
  setCurrentIndex,
  setPlayQueue,
  clearPlayQueue,
  setIsLoading,
  setIsLoaded,
  moveUp,
  moveDown,
  setCurrentPlayer,
  setStatus,
  setPlayerVolume,
  setVolume,
  setCurrentSeek,
  setIsFading,
  setAutoIncremented,
  toggleRepeat,
  toggleShuffle,
  toggleDisplayQueue,
  resetPlayer,
  setStar,
} = playQueueSlice.actions;
export default playQueueSlice.reducer;
