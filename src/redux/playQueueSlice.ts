import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';
import arrayMove from 'array-move';
import {
  areConsecutive,
  consecutiveRanges,
  getSettings,
} from '../shared/utils';

const parsedSettings = getSettings();

export interface Entry {
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
  uniqueId: string;
  rowIndex: number;
}

export interface PlayQueue {
  player1: {
    index: number;
    volume: number;
    fadeData: {
      volumeData: number[];
      timeData: string[];
    };
  };
  player2: {
    index: number;
    volume: number;
    fadeData: {
      volumeData: number[];
      timeData: string[];
    };
  };
  scrollWithCurrentSong: boolean;
  fadeDuration: number;
  fadeType: string;
  pollingInterval: number;
  volumeFade: boolean;
  currentIndex: number;
  currentSongId: string;
  currentSongUniqueId: string;
  currentPlayer: number;
  isFading: boolean;
  autoIncremented: boolean;
  volume: number;
  isLoading: boolean;
  repeat: string;
  shuffle: boolean;
  displayQueue: boolean;
  showDebugWindow: boolean;
  entry: Entry[];
  shuffledEntry: Entry[];
}

const initialState: PlayQueue = {
  player1: {
    index: 0,
    volume: 0.5,
    fadeData: {
      volumeData: [],
      timeData: [],
    },
  },
  player2: {
    index: 1,
    volume: 0,
    fadeData: {
      volumeData: [],
      timeData: [],
    },
  },
  scrollWithCurrentSong: parsedSettings.scrollWithCurrentSong,
  fadeDuration: parsedSettings.fadeDuration,
  fadeType: parsedSettings.fadeType,
  pollingInterval: parsedSettings.pollingInterval,
  volumeFade: parsedSettings.volumeFade,
  currentIndex: 0,
  currentSongId: '',
  currentSongUniqueId: '',
  currentPlayer: 1,
  isFading: false,
  autoIncremented: false,
  volume: parsedSettings.volume,
  isLoading: false,
  repeat: parsedSettings.repeat,
  shuffle: parsedSettings.shuffle,
  displayQueue: false,
  showDebugWindow: parsedSettings.showDebugWindow,
  entry: [],
  shuffledEntry: [],
};

const resetPlayerDefaults = (state: PlayQueue) => {
  state.isFading = false;
  state.currentIndex = 0;
  state.currentSongId = '';
  state.currentPlayer = 1;
  state.player1.index = 0;
  state.player1.volume = state.volume;
  state.player2.index = 0;
  state.player2.volume = 0;
  state.entry = [];
  state.shuffledEntry = [];
};

const resetToPlayer1 = (state: PlayQueue) => {
  state.currentPlayer = 1;
  state.isFading = false;
  state.player1.volume = state.volume;
  state.player1.index = state.currentIndex;
  state.player2.volume = 0;
};

const insertItem = (array: any, index: any, item: any) => {
  return [...array.slice(0, index), item, ...array.slice(index)];
};

const removeItem = (array: any, index: any) => {
  return [...array.slice(0, index), ...array.slice(index + 1)];
};

const entrySelect = (state: PlayQueue) =>
  state.shuffle ? 'shuffledEntry' : 'entry';

const getNextPlayerIndex = (
  length: number,
  repeat: string,
  currentIndex: number
) => {
  if (length >= 2 && repeat !== 'one') {
    if (currentIndex + 1 === length) {
      return 0;
    }
    return currentIndex + 1;
  }
  if (repeat === 'one') {
    return currentIndex;
  }
  return 0;
};

export const getCurrentEntryIndex = (entries: any[], currentSongId: string) => {
  return entries.findIndex((entry: any) => entry.id === currentSongId);
};

export const getCurrentEntryIndexByUID = (
  entries: any[],
  currentSongId: string
) => {
  return entries.findIndex((entry: any) => entry.uniqueId === currentSongId);
};

const handleGaplessPlayback = (state: PlayQueue) => {
  if (state.fadeDuration === 0) {
    state.player2.volume = state.volume;
  }
};

const playQueueSlice = createSlice({
  name: 'nowPlaying',
  initialState,
  reducers: {
    resetPlayQueue: (state) => {
      const currentEntry = entrySelect(state);

      resetPlayerDefaults(state);
      handleGaplessPlayback(state);
      state.currentSongId = state[currentEntry][0].id;
      state.currentSongUniqueId = state[currentEntry][0].uniqueId;
    },

    setPlaybackSetting: (
      state,
      action: PayloadAction<{ setting: string; value: any }>
    ) => {
      switch (action.payload.setting) {
        case 'fadeDuration':
          state.fadeDuration = action.payload.value;
          break;
        case 'pollingInterval':
          state.pollingInterval = action.payload.value;
          break;
        case 'fadeType':
          state.fadeType = action.payload.value;
          break;
        case 'volumeFade':
          state.volumeFade = action.payload.value;
          break;
        case 'showDebugWindow':
          state.showDebugWindow = action.payload.value;
          break;
        case 'scrollWithCurrentSong':
          state.scrollWithCurrentSong = action.payload.value;
          break;
        default:
          break;
      }
    },

    setFadeData: (
      state,
      action: PayloadAction<{
        player?: number;
        volume?: number;
        time?: number;
        clear?: boolean;
      }>
    ) => {
      if (!action.payload.clear) {
        switch (action.payload.player) {
          case 1:
            state.player1.fadeData.volumeData.push(action.payload.volume || 0);
            state.player1.fadeData.timeData.push(
              action.payload.time?.toFixed(2) || '0'
            );
            break;
          case 2:
            state.player2.fadeData.volumeData.push(action.payload.volume || 0);
            state.player2.fadeData.timeData.push(
              action.payload.time?.toFixed(2) || '0'
            );
            break;
          default:
            break;
        }
      } else {
        state.player1.fadeData = { volumeData: [], timeData: [] };
        state.player2.fadeData = { volumeData: [], timeData: [] };
      }
    },

    shuffleInPlace: (state) => {
      /* Used on the NowPlayingView to shuffle the current shuffledEntry queue.
      Uses the same logic as the toggleShuffle reducer to keep the currentIndex
      in-place so that the song doesn't change when shuffling */
      if (state.shuffledEntry.length > 1) {
        state.shuffle = true;

        const shuffledEntriesWithoutCurrent = _.shuffle(
          removeItem(state.shuffledEntry, state.currentIndex)
        );

        const shuffledEntries = insertItem(
          shuffledEntriesWithoutCurrent,
          state.currentIndex,
          state.shuffledEntry[state.currentIndex]
        );

        state.shuffledEntry = shuffledEntries;
      }
    },

    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;

      if (state.shuffle && state.entry.length > 1) {
        /* When shuffling, we want to keep the currently playing track in the
        same index so that the song doesn't change when enabling the shuffle. */
        const shuffledEntriesWithoutCurrent = _.shuffle(
          removeItem(state.entry, state.currentIndex)
        );

        // Readd the current song back into its original index
        const shuffledEntries = insertItem(
          shuffledEntriesWithoutCurrent,
          state.currentIndex,
          state.entry[state.currentIndex]
        );

        // currentIndex and currentSongId stays the same since we're keeping it in place
        state.shuffledEntry = shuffledEntries;
      } else if (state.entry.length > 1) {
        /* If toggled to false, the NowPlayingView will reset back to using the regular entry[].
        We want to swap the currentIndex over to the currently playing track since its row index
        will change */

        const currentEntryIndex = getCurrentEntryIndex(
          state.entry,
          state.currentSongId
        );

        /* Account for the currentPlayer and set the player indexes accordingly. Unfortunately
        since we're updating the indexes here, the transition won't be seamless and the currently
        playing song will reset */
        state.currentIndex = currentEntryIndex;
        state.player1.index =
          state.currentPlayer === 1
            ? currentEntryIndex
            : getNextPlayerIndex(
                state.entry.length,
                state.repeat,
                state.currentIndex
              );
        state.player2.index =
          state.currentPlayer === 2
            ? currentEntryIndex
            : getNextPlayerIndex(
                state.entry.length,
                state.repeat,
                state.currentIndex
              );

        // Free up memory by clearing out the shuffled entries
        state.shuffledEntry = [];
      }
    },

    setAutoIncremented: (state, action: PayloadAction<boolean>) => {
      state.autoIncremented = action.payload;
    },

    setStar: (state, action: PayloadAction<{ id: string; type: string }>) => {
      /* Since the playqueue can have multiples of the same song, we need to find
       all the indices of the starred/unstarred song. */

      const findIndices = state.entry
        .map((entry, index) => (entry.id === action.payload.id ? index : ''))
        .filter(String);

      const findShuffledIndices = state.shuffledEntry
        .map((entry, index) => (entry.id === action.payload.id ? index : ''))
        .filter(String);

      if (action.payload.type === 'unstar') {
        findIndices?.map((rowIndex: any) => {
          state.entry[rowIndex].starred = undefined;
          return rowIndex;
        });

        findShuffledIndices?.map((rowIndex: any) => {
          state.shuffledEntry[rowIndex].starred = undefined;
          return rowIndex;
        });
      } else {
        findIndices?.map((rowIndex: any) => {
          state.entry[rowIndex].starred = String(Date.now());
          return rowIndex;
        });

        findShuffledIndices?.map((rowIndex: any) => {
          state.shuffledEntry[rowIndex].starred = String(Date.now());
          return rowIndex;
        });
      }
    },

    toggleRepeat: (state) => {
      const currentEntry = entrySelect(state);

      if (state.repeat === 'none') {
        state.repeat = 'all';
      } else if (state.repeat === 'all') {
        state.repeat = 'one';
        if (state.currentPlayer === 1) {
          state.player2.index = state.player1.index;
        } else {
          state.player1.index = state.player2.index;
        }
      } else if (state.repeat === 'one') {
        state.repeat = 'none';
        if (state.currentPlayer === 1) {
          state.player2.index = state.player1.index + 1;
        } else {
          state.player1.index = state.player2.index + 1;
        }
      }

      if (state.player1.index > state[currentEntry].length - 1) {
        state.player1.index = 0;
      }

      if (state.player2.index > state[currentEntry].length - 1) {
        state.player2.index = 0;
      }
    },

    toggleDisplayQueue: (state) => {
      state.displayQueue = !state.displayQueue;
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },

    setCurrentPlayer: (state, action: PayloadAction<number>) => {
      if (action.payload === 1) {
        state.currentPlayer = 1;
      } else {
        state.currentPlayer = 2;
      }
    },

    incrementCurrentIndex: (state, action: PayloadAction<string>) => {
      const currentEntry = entrySelect(state);

      if (state[currentEntry].length >= 1 && state.repeat !== 'one') {
        if (state.currentIndex < state[currentEntry].length - 1) {
          // Check that current index isn't on the last track of the queue
          state.currentIndex += 1;
        } else if (state.repeat === 'all') {
          // But if it is the last track, and repeat is all, then we can go back to 0
          state.currentIndex = 0;
        }
        if (action.payload === 'usingHotkey') {
          /* If incrementing manually (usingHotkey), we'll reset to player 1. Otherwise,
          if incrementing automatically (on fade/end) it will swap between player1/player2 */
          resetToPlayer1(state);
          if (state.currentIndex + 1 >= state[currentEntry].length) {
            state.player2.index = 0;
          } else {
            state.player2.index = state.currentIndex + 1;
          }
        }
      } else if (state[currentEntry].length >= 1 && state.repeat === 'one') {
        // If repeating one, then we can just increment to the next track
        if (state.currentIndex + 1 < state[currentEntry].length) {
          // Only increment if not on the last entry in the queue
          state.currentIndex += 1;
          if (action.payload === 'usingHotkey') {
            resetToPlayer1(state);
            state.player2.index = state.currentIndex;
          }
        }
      }

      handleGaplessPlayback(state);
      state.currentSongId = state[currentEntry][state.currentIndex].id;
      state.currentSongUniqueId =
        state[currentEntry][state.currentIndex].uniqueId;
    },

    incrementPlayerIndex: (state, action: PayloadAction<number>) => {
      const currentEntry = entrySelect(state);

      /* If the entry list is greater than two, we don't need to increment,
      just keep swapping playback between the tracks [0 <=> 0] or [0 <=> 1]
      without changing the index of either player */
      if (state[currentEntry].length > 2 && state.repeat !== 'one') {
        if (action.payload === 1) {
          if (
            state.player1.index + 1 === state[currentEntry].length &&
            state.repeat === 'none'
          ) {
            // Reset the player on the end of the playlist if no repeat
            resetPlayerDefaults(state);
            handleGaplessPlayback(state);
          } else if (state.player1.index + 2 >= state[currentEntry].length) {
            /* If incrementing would be greater than the total number of entries,
            reset it back to 0. Also check if player1 is already set to 0. */
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
            state.player2.index + 1 === state[currentEntry].length &&
            state.repeat === 'none'
          ) {
            // Reset the player on the end of the playlist if no repeat
            resetPlayerDefaults(state);
            handleGaplessPlayback(state);
          } else if (state.player2.index + 2 >= state[currentEntry].length) {
            /* If incrementing would be greater than the total number of entries,
            reset it back to 0. Also check if player1 is already set to 0. */
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
      const currentEntry = entrySelect(state);

      const findIndex = getCurrentEntryIndexByUID(
        state[currentEntry],
        action.payload.uniqueId
      );

      state.isFading = false;
      state.player1.index = findIndex;
      state.player1.volume = state.volume;

      // Use in conjunction with fixPlayer2Index reducer - see note
      state.player2.index = 0;
      state.player2.volume = 0;

      state.currentPlayer = 1;
      state.currentIndex = findIndex;
      state.currentSongId = action.payload.id;
      state.currentSongUniqueId = action.payload.uniqueId;
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
      if (action.payload === 'usingHotkey') {
        const currentEntry = entrySelect(state);

        if (state[currentEntry].length >= 1) {
          if (state.currentIndex > 0) {
            state.currentIndex -= 1;
          } else if (state.repeat === 'all') {
            // If repeating all and currentIndex is 0, then decrement to end of entry queue
            state.currentIndex = state[currentEntry].length - 1;
          }

          resetToPlayer1(state);

          // Use in conjunction with fixPlayer2Index reducer - see note
          state.player2.index = 0;
          state.player2.volume = 0;
        }

        handleGaplessPlayback(state);
        state.currentSongId = state[currentEntry][state.currentIndex].id;
        state.currentSongUniqueId =
          state[currentEntry][state.currentIndex].uniqueId;
      }
    },

    fixPlayer2Index: (state) => {
      /* Before decrementing:
      Player1: 4 | Player2: 3

      After decrementing:
      Player1: 2 | Player2: 3

      When incrementing/decrementing, we will always revert back to Player1 instead of
      using the current player. In this case you will notice that the Player2 index stays the same.
      This will cause the react audio player component to not unload the song which makes it so that
      Player2 will continue playing even after decrementing. This reducer resets the Player2 index and
      then sets it to its proper index. */

      state.player2.index = getNextPlayerIndex(
        state.entry.length,
        state.repeat,
        state.currentIndex
      );
      handleGaplessPlayback(state);
    },

    setCurrentIndex: (state, action: PayloadAction<Entry>) => {
      const currentEntry = entrySelect(state);

      const findIndex = getCurrentEntryIndexByUID(
        state[currentEntry],
        action.payload.uniqueId
      );

      state.currentIndex = findIndex;
      state.currentSongId = action.payload.id;
      state.currentSongUniqueId = action.payload.uniqueId;
    },

    setPlayQueue: (
      state,
      action: PayloadAction<{
        entries: Entry[];
      }>
    ) => {
      // Used with gridview where you just want to set the entry queue directly
      resetPlayerDefaults(state);
      handleGaplessPlayback(state);

      action.payload.entries.map((entry: any) => state.entry.push(entry));
      if (state.shuffle) {
        // If shuffle is enabled, add all entries randomly
        const shuffledEntries = _.shuffle(action.payload.entries);
        shuffledEntries.map((entry: any) => state.shuffledEntry.push(entry));
        state.currentSongId = shuffledEntries[0].id;
        state.currentSongUniqueId = shuffledEntries[0].uniqueId;
      } else {
        // If shuffle is disabled, add all entries in order
        state.currentSongId = action.payload.entries[0].id;
        state.currentSongUniqueId = action.payload.entries[0].uniqueId;
      }
    },

    setPlayQueueByRowClick: (
      state,
      action: PayloadAction<{
        entries: Entry[];
        currentIndex: number;
        currentSongId: string;
        uniqueSongId: string;
      }>
    ) => {
      /* Used with listview where you want to set the entry queue by double clicking on a row
      Setting the entry queue by row will add all entries, but set the current index to
      the row that was double clicked */
      resetPlayerDefaults(state);
      handleGaplessPlayback(state);
      action.payload.entries.map((entry: any) => state.entry.push(entry));

      if (state.shuffle) {
        // If shuffle is enabled, add the selected row to 0 and then shuffle the rest
        const shuffledEntriesWithoutCurrent = _.shuffle(
          removeItem(state.entry, action.payload.currentIndex)
        );

        const shuffledEntries = insertItem(
          shuffledEntriesWithoutCurrent,
          0,
          action.payload.entries[action.payload.currentIndex]
        );

        state.shuffledEntry = shuffledEntries;
        state.currentIndex = 0;
        state.player1.index = 0;
        state.currentSongId = action.payload.currentSongId;
        state.currentSongUniqueId = action.payload.uniqueSongId;
      } else {
        // Add all songs in order and set the current index to the selected row
        state.currentIndex = action.payload.currentIndex;
        state.player1.index = action.payload.currentIndex;
        state.currentSongId = action.payload.currentSongId;
        state.currentSongUniqueId = action.payload.uniqueSongId;
      }
    },

    appendPlayQueue: (state, action: PayloadAction<{ entries: Entry[] }>) => {
      action.payload.entries.map((entry: any) => state.entry.push(entry));
      if (state.shuffle) {
        const shuffledEntries = _.shuffle(action.payload.entries);
        shuffledEntries.map((entry: any) => state.shuffledEntry.push(entry));
      }
    },

    clearPlayQueue: (state) => {
      state.entry = [];
      state.shuffledEntry = [];
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

    moveToIndex: (
      state,
      action: PayloadAction<{ entries: Entry[]; moveBeforeId: string }>
    ) => {
      const currentEntry = entrySelect(state);
      const tempQueue = state[currentEntry].slice();

      const uniqueIds: any[] = [];
      action.payload.entries.map((entry: Entry) =>
        uniqueIds.push(entry.uniqueId)
      );

      // Remove the selected entries from the queue
      const newQueue = tempQueue.filter((entry: Entry) => {
        return !uniqueIds.includes(entry.uniqueId);
      });

      // Used if dragging onto a selected row
      const spliceIndexPre = getCurrentEntryIndexByUID(
        tempQueue,
        action.payload.moveBeforeId
      );

      const queueAbovePre = tempQueue.slice(0, spliceIndexPre);
      const selectedAbovePre = queueAbovePre.filter((entry: Entry) => {
        return uniqueIds.includes(entry.uniqueId);
      });

      console.log(`selectedAbovePre.length()`, selectedAbovePre.length);

      // Used if dragging onto a non-selected row
      const spliceIndexPost = getCurrentEntryIndexByUID(
        newQueue,
        action.payload.moveBeforeId
      );

      // If the moveBeforeId index is selected, then we find the first consecutive selected index to move to
      let firstConsecutiveSelectedDragIndex = -1;
      for (let i = spliceIndexPre - 1; i > 0; i -= 1) {
        if (uniqueIds.includes(tempQueue[i].uniqueId)) {
          firstConsecutiveSelectedDragIndex = i;
        } else {
          break;
        }
      }

      /* If we get a negative index, don't move the entry.
      This can happen if you try to drag and drop too fast */
      if (spliceIndexPre < 0 && spliceIndexPre < 0) {
        return;
      }

      // Find the slice index to add the selected entries to
      const spliceIndex =
        spliceIndexPost >= 0
          ? spliceIndexPost
          : firstConsecutiveSelectedDragIndex >= 0
          ? firstConsecutiveSelectedDragIndex
          : spliceIndexPre - selectedAbovePre.length;

      // Get the updated entry rowIndexes since dragging an entry multiple times will change the existing selected rowIndex
      const updatedEntries = action.payload.entries.map((entry: Entry) => {
        const findIndex = state[currentEntry].findIndex(
          (item: Entry) => item.uniqueId === entry.uniqueId
        );
        return { ...entry, rowIndex: findIndex };
      });

      // Sort the entries by their rowIndex so that we can re-add them in the proper order
      const sortedEntries = updatedEntries.sort(
        (a, b) => a.rowIndex - b.rowIndex
      );

      // Splice the entries into the new queue array
      newQueue.splice(spliceIndex, 0, ...sortedEntries);

      // Finally, set the modified entries into the redux state
      state[currentEntry] = newQueue;

      // We'll need to fix the current player index after swapping the queue order
      // This will be used in conjunction with fixPlayer2Index
      const newCurrentSongIndex = getCurrentEntryIndexByUID(
        newQueue,
        state.currentSongUniqueId
      );

      if (state.currentPlayer === 1) {
        state.player1.index = newCurrentSongIndex;
      } else {
        state.player2.index = newCurrentSongIndex;
      }

      state.currentIndex = newCurrentSongIndex;
    },

    moveUp: (state, action: PayloadAction<number[]>) => {
      const currentEntry = entrySelect(state);

      // Create a copy of the queue so we can mutate it in place with arrayMove.mutate
      const tempQueue = state[currentEntry].slice();

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

      state[currentEntry] = tempQueue;

      // We'll need to fix the current player index after swapping the queue order
      // This will be used in conjunction with fixPlayer2Index
      const newCurrentSongIndex = getCurrentEntryIndexByUID(
        tempQueue,
        state.currentSongUniqueId
      );

      if (state.currentPlayer === 1) {
        state.player1.index = newCurrentSongIndex;
      } else {
        state.player2.index = newCurrentSongIndex;
      }

      state.currentIndex = newCurrentSongIndex;
    },

    moveDown: (state, action: PayloadAction<number[]>) => {
      const currentEntry = entrySelect(state);

      // Create a copy of the queue so we can mutate it in place with arrayMove.mutate
      const tempQueue = state[currentEntry].slice();

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

      state[currentEntry] = tempQueue;

      // We'll need to fix the current player index after swapping the queue order
      // This will be used in conjunction with fixPlayer2Index
      const newCurrentSongIndex = getCurrentEntryIndexByUID(
        tempQueue,
        state.currentSongUniqueId
      );

      if (state.currentPlayer === 1) {
        state.player1.index = newCurrentSongIndex;
      } else {
        state.player2.index = newCurrentSongIndex;
      }

      state.currentIndex = newCurrentSongIndex;
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
  setPlayQueueByRowClick,
  appendPlayQueue,
  clearPlayQueue,
  setIsLoading,
  setIsLoaded,
  moveUp,
  moveDown,
  moveToIndex,
  setCurrentPlayer,
  setPlayerVolume,
  setVolume,
  setIsFading,
  setAutoIncremented,
  toggleRepeat,
  toggleShuffle,
  toggleDisplayQueue,
  resetPlayQueue,
  setStar,
  shuffleInPlace,
  setFadeData,
  setPlaybackSetting,
} = playQueueSlice.actions;
export default playQueueSlice.reducer;
