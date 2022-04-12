import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';
import settings from 'electron-settings';
import { nanoid } from 'nanoid/non-secure';
import {
  filterPlayQueue,
  moveSelectedDown,
  moveSelectedToBottom,
  moveSelectedToTop,
  moveSelectedUp,
} from '../shared/utils';
import { mockSettings } from '../shared/mockSettings';
import { Song } from '../types';

const parsedSettings = process.env.NODE_ENV === 'test' ? mockSettings : settings.getSync();

export interface PlayQueue {
  player1: {
    src: string;
    index: number;
    fadeData: {
      volumeData: number[];
      timeData: string[];
    };
  };
  player2: {
    src: string;
    index: number;
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
  current?: any;
  isFading: boolean;
  playerUpdated: number;
  autoIncremented: boolean;
  volume: number;
  scrobble: boolean;
  isLoading: boolean;
  repeat: string;
  shuffle: boolean;
  sortColumn?: string;
  sortType: 'asc' | 'desc';
  displayQueue: boolean;
  showDebugWindow: boolean;
  entry: Song[];
  shuffledEntry: Song[];
  sortedEntry: Song[];
}

export type PlayQueueSaveState = Pick<
  PlayQueue,
  | 'entry'
  | 'shuffledEntry'
  | 'current'
  | 'currentIndex'
  | 'currentSongId'
  | 'currentSongUniqueId'
  | 'player1'
  | 'player2'
  | 'currentPlayer'
>;

const initialState: PlayQueue = {
  player1: {
    src: './components/player/dummy.mp3',
    index: 0,
    fadeData: {
      volumeData: [],
      timeData: [],
    },
  },
  player2: {
    src: './components/player/dummy.mp3',
    index: 1,
    fadeData: {
      volumeData: [],
      timeData: [],
    },
  },
  scrollWithCurrentSong: Boolean(parsedSettings.scrollWithCurrentSong),
  fadeDuration: Number(parsedSettings.fadeDuration),
  fadeType: String(parsedSettings.fadeType),
  pollingInterval: Number(parsedSettings.pollingInterval),
  volumeFade: Boolean(parsedSettings.volumeFade),
  currentIndex: 0,
  currentSongId: '',
  currentSongUniqueId: '',
  currentPlayer: 1,
  isFading: false,
  playerUpdated: 0,
  autoIncremented: false,
  volume: Number(parsedSettings.volume),
  scrobble: Boolean(parsedSettings.scrobble),
  isLoading: Boolean(false),
  repeat: String(parsedSettings.repeat),
  shuffle: Boolean(parsedSettings.shuffle),
  sortColumn: undefined,
  sortType: 'asc',
  displayQueue: false,
  showDebugWindow: Boolean(parsedSettings.showDebugWindow),
  entry: [],
  shuffledEntry: [],
  sortedEntry: [],
};

const resetPlayerDefaults = (state: PlayQueue) => {
  state.isFading = false;
  state.current = undefined;
  state.currentIndex = 0;
  state.currentSongId = '';
  state.currentPlayer = 1;
  state.player1.src = './components/player/dummy.mp3';
  state.player2.src = './components/player/dummy.mp3';
  state.player1.index = 0;
  state.player2.index = 0;
  state.entry = [];
  state.shuffledEntry = [];
  state.sortedEntry = [];
};

const resetToPlayer1 = (state: PlayQueue) => {
  state.currentPlayer = 1;
  state.isFading = false;
  state.player1.index = state.currentIndex;
};

const insertItem = (array: any, index: any, item: any) => {
  return [...array.slice(0, index), item, ...array.slice(index)];
};

const removeItem = (array: any, index: any) => {
  return [...array.slice(0, index), ...array.slice(index + 1)];
};

const entrySelect = (state: PlayQueue) =>
  state.sortedEntry.length > 0 ? 'sortedEntry' : state.shuffle ? 'shuffledEntry' : 'entry';

export const getNextPlayerIndex = (length: number, repeat: string, currentIndex: number) => {
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

export const getCurrentEntryIndexByUID = (entries: any[], currentSongId: string) => {
  return entries.findIndex((entry: any) => entry.uniqueId === currentSongId);
};

const playQueueSlice = createSlice({
  name: 'nowPlaying',
  initialState,
  reducers: {
    setPlayerSrc: (state, action: PayloadAction<{ player: number; src: string }>) => {
      if (action.payload.player === 1) {
        state.player1.src = action.payload.src;
      } else {
        state.player2.src = action.payload.src;
      }
    },

    updatePlayerIndices: (state, action: PayloadAction<any[]>) => {
      const newCurrentSongIndex = getCurrentEntryIndexByUID(
        action.payload,
        state.currentSongUniqueId
      );

      if (state.currentPlayer === 1) {
        state.player1.index = newCurrentSongIndex;
      } else {
        state.player2.index = newCurrentSongIndex;
      }

      state.currentIndex = newCurrentSongIndex;
    },

    setSort: (state, action: PayloadAction<{ sortColumn?: string; sortType: 'asc' | 'desc' }>) => {
      state.sortColumn = action.payload.sortColumn;
      state.sortType = action.payload.sortType;
    },

    sortPlayQueue: (
      state,
      action: PayloadAction<{ columnDataKey: string; sortType: 'asc' | 'desc' }>
    ) => {
      if (action.payload.columnDataKey !== '') {
        state.sortedEntry = _.orderBy(
          state.entry,
          [
            (entry: any) =>
              typeof entry[action.payload.columnDataKey] === 'string'
                ? entry[action.payload.columnDataKey].toLowerCase() || ''
                : entry[action.payload.columnDataKey] || '',
          ],
          action.payload.sortType
        );
      } else {
        state.sortedEntry = [];
      }

      const currentEntry = entrySelect(state);
      const checkIndex = getCurrentEntryIndexByUID(
        action.payload.columnDataKey !== '' ? state.sortedEntry : state[currentEntry],
        state.currentSongUniqueId
      );

      // Fix the index being set to -1 when appending entries to an empty list
      let newCurrentSongIndex;
      if (checkIndex === -1) {
        state.current =
          action.payload.columnDataKey !== '' ? state.sortedEntry[0] : state[currentEntry][0];
        state.currentIndex = 0;
        state.currentSongId = state.current?.id;
        state.currentSongUniqueId = state.current?.uniqueId;
        newCurrentSongIndex = 0;
      } else {
        newCurrentSongIndex = checkIndex;
      }

      if (state.currentPlayer === 1) {
        state.player1.index = newCurrentSongIndex;
      } else {
        state.player2.index = newCurrentSongIndex;
      }

      state.currentIndex = newCurrentSongIndex;
    },

    resetPlayQueue: (state) => {
      const currentEntry = entrySelect(state);

      resetPlayerDefaults(state);
      state.current = { ...state[currentEntry][0] };
      state.currentSongId = state[currentEntry][0].id;
      state.currentSongUniqueId = state[currentEntry][0].uniqueId;
    },

    setPlaybackSetting: (state, action: PayloadAction<{ setting: string; value: any }>) => {
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
        case 'scrobble':
          state.scrobble = action.payload.value;
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
            state.player1.fadeData.timeData.push(action.payload.time?.toFixed(2) || '0');
            break;
          case 2:
            state.player2.fadeData.volumeData.push(action.payload.volume || 0);
            state.player2.fadeData.timeData.push(action.payload.time?.toFixed(2) || '0');
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

        const currentEntryIndex = getCurrentEntryIndex(state.entry, state.currentSongId);

        /* Account for the currentPlayer and set the player indexes accordingly. Unfortunately
        since we're updating the indexes here, the transition won't be seamless and the currently
        playing song will reset */
        state.currentIndex = currentEntryIndex;
        state.player1.index =
          state.currentPlayer === 1
            ? currentEntryIndex
            : getNextPlayerIndex(state.entry.length, state.repeat, state.currentIndex);
        state.player2.index =
          state.currentPlayer === 2
            ? currentEntryIndex
            : getNextPlayerIndex(state.entry.length, state.repeat, state.currentIndex);

        // Free up memory by clearing out the shuffled entries
        state.shuffledEntry = [];
      }
    },

    setAutoIncremented: (state, action: PayloadAction<boolean>) => {
      state.autoIncremented = action.payload;
    },

    setStar: (state, action: PayloadAction<{ id: string[]; type: string }>) => {
      //  Since the playqueue can have multiples of the same song, we need to find
      //  all the indices of the starred/unstarred song

      action.payload.id.forEach((id: string) => {
        const findIndices = _.keys(_.pickBy(state.entry, { id }));
        const findShuffledIndices = _.keys(_.pickBy(state.shuffledEntry, { id }));
        const findSortedIndices = _.keys(_.pickBy(state.sortedEntry, { id }));

        if (action.payload.type === 'unstar') {
          findIndices?.forEach((rowIndex: any) => {
            state.entry[rowIndex].starred = undefined;
            return rowIndex;
          });
          findShuffledIndices?.forEach((rowIndex: any) => {
            state.shuffledEntry[rowIndex].starred = undefined;
            return rowIndex;
          });
          findSortedIndices?.forEach((rowIndex: any) => {
            state.sortedEntry[rowIndex].starred = undefined;
            return rowIndex;
          });
        } else {
          findIndices?.forEach((rowIndex: any) => {
            state.entry[rowIndex].starred = String(Date.now());
            return rowIndex;
          });
          findShuffledIndices?.forEach((rowIndex: any) => {
            state.shuffledEntry[rowIndex].starred = String(Date.now());
            return rowIndex;
          });
          findSortedIndices?.forEach((rowIndex: any) => {
            state.sortedEntry[rowIndex].starred = String(Date.now());
            return rowIndex;
          });
        }
      });
    },

    setRate: (state, action: PayloadAction<{ id: string[]; rating?: number }>) => {
      action.payload.id.forEach((id: string) => {
        const findIndices = _.keys(_.pickBy(state.entry, { id }));
        const findShuffledIndices = _.keys(_.pickBy(state.shuffledEntry, { id }));
        const findSortedIndices = _.keys(_.pickBy(state.sortedEntry, { id }));

        if (action.payload.rating) {
          findIndices?.forEach((rowIndex: any) => {
            state.entry[rowIndex].userRating = action.payload.rating;
            return rowIndex;
          });
          findShuffledIndices?.forEach((rowIndex: any) => {
            state.shuffledEntry[rowIndex].userRating = action.payload.rating;
            return rowIndex;
          });
          findSortedIndices?.forEach((rowIndex: any) => {
            state.sortedEntry[rowIndex].userRating = action.payload.rating;
            return rowIndex;
          });
        } else {
          findIndices?.forEach((rowIndex: any) => {
            state.entry[rowIndex].userRating = undefined;
            return rowIndex;
          });
          findShuffledIndices?.forEach((rowIndex: any) => {
            state.shuffledEntry[rowIndex].userRating = undefined;
            return rowIndex;
          });
          findSortedIndices?.forEach((rowIndex: any) => {
            state.sortedEntry[rowIndex].userRating = undefined;
            return rowIndex;
          });
        }
      });
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

          // Use this in conjunction with useEffect to set the audioplayer currentTime back to 0
          state.playerUpdated += 1;
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

      state.current = { ...state[currentEntry][state.currentIndex] };
      state.currentSongId = state[currentEntry][state.currentIndex]?.id;
      state.currentSongUniqueId = state[currentEntry][state.currentIndex]?.uniqueId;
    },

    incrementPlayerIndex: (state, action: PayloadAction<number>) => {
      const currentEntry = entrySelect(state);

      /* If the entry list is greater than two, we don't need to increment,
      just keep swapping playback between the tracks [0 <=> 0] or [0 <=> 1]
      without changing the index of either player */
      if (state[currentEntry].length > 2 && state.repeat !== 'one') {
        if (action.payload === 1) {
          if (state.player1.index + 1 === state[currentEntry].length && state.repeat === 'none') {
            // Reset the player on the end of the playlist if no repeat
            resetPlayerDefaults(state);
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
          if (state.player2.index + 1 === state[currentEntry].length && state.repeat === 'none') {
            // Reset the player on the end of the playlist if no repeat
            resetPlayerDefaults(state);
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

    setPlayerIndex: (state, action: PayloadAction<Song>) => {
      const currentEntry = entrySelect(state);

      const findIndex = getCurrentEntryIndexByUID(state[currentEntry], action.payload.uniqueId);

      state.isFading = false;
      state.player1.index = findIndex;

      // Use in conjunction with fixPlayer2Index reducer - see note
      state.player2.index = 0;

      state.currentPlayer = 1;
      state.currentIndex = findIndex;
      state.current = { ...action.payload };
      state.currentSongId = action.payload.id;
      state.currentSongUniqueId = action.payload.uniqueId;
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

          // Use this in conjunction with useEffect to set the audioplayer currentTime back to 0
          state.playerUpdated += 1;
        }

        state.current = { ...state[currentEntry][state.currentIndex] };
        state.currentSongId = state[currentEntry][state.currentIndex]?.id;
        state.currentSongUniqueId = state[currentEntry][state.currentIndex]?.uniqueId;
      }
    },

    fixPlayer2Index: (state) => {
      // Before decrementing:
      // Player1: 4 | Player2: 3

      // After decrementing:
      // Player1: 2 | Player2: 3

      // When incrementing/decrementing, we will always revert back to Player1 instead of
      // using the current player. In this case you will notice that the Player2 index stays the same.
      // This will cause the react audio player component to not unload the song which makes it so that
      // Player2 will continue playing even after decrementing. This reducer resets the Player2 index and
      // then sets it to its proper index.

      if (state.currentPlayer === 1) {
        state.player2.src = './components/player/dummy.mp3';

        state.player2.index = getNextPlayerIndex(
          state.entry.length,
          state.repeat,
          state.currentIndex
        );
      }
    },

    setCurrentIndex: (state, action: PayloadAction<Song>) => {
      const currentEntry = entrySelect(state);

      const findIndex = getCurrentEntryIndexByUID(state[currentEntry], action.payload.uniqueId);

      state.currentIndex = findIndex;
      state.current = { ...action.payload };
      state.currentSongId = action.payload.id;
      state.currentSongUniqueId = action.payload.uniqueId;
    },

    setPlayQueue: (
      state,
      action: PayloadAction<{
        entries: Song[];
      }>
    ) => {
      // Used with gridview where you just want to set the entry queue directly
      resetPlayerDefaults(state);

      state.player1.src = action.payload.entries[0].streamUrl;

      action.payload.entries.map((entry: any) => state.entry.push(entry));
      if (state.shuffle) {
        // If shuffle is enabled, add all entries randomly
        const shuffledEntries = _.shuffle(action.payload.entries);
        shuffledEntries.map((entry: any) => state.shuffledEntry.push(entry));
        state.current = { ...shuffledEntries[0] };
        state.currentSongId = shuffledEntries[0].id;
        state.currentSongUniqueId = shuffledEntries[0].uniqueId;
      } else {
        // If shuffle is disabled, add all entries in order
        state.current = { ...action.payload.entries[0] };
        state.currentSongId = action.payload.entries[0].id;
        state.currentSongUniqueId = action.payload.entries[0].uniqueId;
      }
    },

    setPlayQueueByRowClick: (
      state,
      action: PayloadAction<{
        entries: Song[];
        currentIndex: number;
        currentSongId: string;
        uniqueSongId: string;
        filters: any;
      }>
    ) => {
      // Used with listview where you want to set the entry queue by double clicking on a row
      // Setting the entry queue by row will add all entries, but set the current index to
      // the row that was double clicked
      resetPlayerDefaults(state);

      state.player1.src = action.payload.entries[action.payload.currentIndex].streamUrl;

      // Apply filters to all entries except the entry that was double clicked
      const filteredFromStartToCurrent = filterPlayQueue(
        action.payload.filters,
        action.payload.entries.slice(0, action.payload.currentIndex)
      ).entries;

      const filteredFromCurrentToEnd = filterPlayQueue(
        action.payload.filters,
        action.payload.entries.slice(action.payload.currentIndex + 1)
      ).entries;

      const entries = _.concat(
        filteredFromStartToCurrent,
        action.payload.entries[action.payload.currentIndex],
        filteredFromCurrentToEnd
      );

      const current = entries.find((entry) => entry.uniqueId === action.payload.uniqueSongId);

      state.entry = entries;

      if (state.shuffle) {
        // If shuffle is enabled, add the selected row to 0 and then shuffle the rest
        const shuffledEntriesWithoutCurrent = _.shuffle(
          removeItem(state.entry, action.payload.currentIndex)
        );

        const shuffledEntries = insertItem(
          filterPlayQueue(action.payload.filters, shuffledEntriesWithoutCurrent).entries,
          0,
          action.payload.entries[action.payload.currentIndex]
        );

        state.shuffledEntry = shuffledEntries;
        state.currentIndex = 0;
        state.player1.index = 0;

        state.current = current;
        state.currentSongId = action.payload.currentSongId;
        state.currentSongUniqueId = action.payload.uniqueSongId;
      } else {
        const currentIndex = entries.findIndex((entry) => {
          return entry.uniqueId === action.payload.uniqueSongId;
        });

        state.current = current;
        state.currentIndex = currentIndex;
        state.player1.index = currentIndex;
        state.currentSongId = action.payload.currentSongId;
        state.currentSongUniqueId = action.payload.uniqueSongId;
      }
    },

    appendPlayQueue: (
      state,
      action: PayloadAction<{ entries: Song[]; type: 'next' | 'later' }>
    ) => {
      const isEmptyQueue = state.entry.length < 1;
      // We'll need to update the uniqueId otherwise selecting a song with duplicates
      // will select them all at once
      const refreshedEntries = action.payload.entries.map((entry: any) => {
        return {
          ...entry,
          uniqueId: nanoid(),
        };
      });

      if (action.payload.type === 'later') {
        refreshedEntries.map((entry: any) => state.entry.push(entry));
      } else {
        const currentSongIndex = getCurrentEntryIndexByUID(state.entry, state.currentSongUniqueId);
        state.entry = [
          ...state.entry.slice(0, currentSongIndex + 1),
          ...refreshedEntries,
          ...state.entry.slice(currentSongIndex + 1),
        ];
      }

      if (state.shuffle) {
        // If shuffle is enabled, add all entries randomly
        const shuffledEntries = _.shuffle(refreshedEntries);

        if (isEmptyQueue) {
          state.current = { ...shuffledEntries[0] };
          state.currentSongId = shuffledEntries[0].id;
          state.currentSongUniqueId = shuffledEntries[0].uniqueId;
        }

        if (action.payload.type === 'later') {
          shuffledEntries.map((entry: any) => state.shuffledEntry.push(entry));
        } else {
          state.shuffledEntry = [
            ...state.shuffledEntry.slice(0, state.currentIndex + 1),
            ...shuffledEntries,
            ...state.shuffledEntry.slice(state.currentIndex + 1),
          ];
        }
      } else if (isEmptyQueue) {
        // If shuffle is disabled, add all entries in order
        state.current = { ...refreshedEntries[0] };
        state.currentSongId = refreshedEntries[0].id;
        state.currentSongUniqueId = refreshedEntries[0].uniqueId;
      }
    },

    removeFromPlayQueue: (state, action: PayloadAction<{ entries: Song[] }>) => {
      const uniqueIds = _.map(action.payload.entries, 'uniqueId');

      state.entry = state.entry.filter((entry) => !uniqueIds.includes(entry.uniqueId));

      state.shuffledEntry = (state.shuffledEntry || []).filter(
        (entry) => !uniqueIds.includes(entry.uniqueId)
      );

      state.sortedEntry = (state.sortedEntry || []).filter(
        (entry) => !uniqueIds.includes(entry.uniqueId)
      );

      // If the current song is removed, then reset to the first entry
      if (uniqueIds.includes(state.currentSongUniqueId)) {
        state.current = state.sortColumn
          ? state.sortedEntry[0]
          : state.shuffle
          ? state.shuffledEntry[0]
          : state.entry[0];

        state.currentSongId = state.sortColumn
          ? state.sortedEntry[0].id
          : state.shuffle
          ? state.shuffledEntry[0].id
          : state.entry[0].id;

        state.currentSongUniqueId = state.sortColumn
          ? state.sortedEntry[0].uniqueId
          : state.shuffle
          ? state.shuffledEntry[0].uniqueId
          : state.entry[0].uniqueId;

        if (state.currentPlayer === 1) {
          state.player1.index = 0;
        } else {
          state.player2.index = 0;
        }

        state.currentIndex = 0;
      } else {
        // We'll recalculate the currentSongIndex just in case the existing index was modified
        // due to removing row entries that are before the current song
        const newCurrentSongIndex = getCurrentEntryIndexByUID(
          state.sortColumn ? state.sortedEntry : state.shuffle ? state.shuffledEntry : state.entry,
          state.currentSongUniqueId
        );

        if (state.currentPlayer === 1) {
          state.player1.index = newCurrentSongIndex;
        } else {
          state.player2.index = newCurrentSongIndex;
        }

        state.currentIndex = newCurrentSongIndex;
      }
    },

    clearPlayQueue: (state) => {
      state.entry = [];
      state.shuffledEntry = [];
      state.current = undefined;
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

    moveToIndex: (state, action: PayloadAction<Song[]>) => {
      const currentEntry = entrySelect(state);

      // Set the modified entries into the redux state
      state[currentEntry] = action.payload;

      // We'll need to fix the current player index after swapping the queue order
      // This will be used in conjunction with fixPlayer2Index
      const newCurrentSongIndex = getCurrentEntryIndexByUID(
        action.payload,
        state.currentSongUniqueId
      );

      if (state.currentPlayer === 1) {
        state.player1.index = newCurrentSongIndex;
      } else {
        state.player2.index = newCurrentSongIndex;
      }

      state.currentIndex = newCurrentSongIndex;
    },

    moveToTop: (state, action: PayloadAction<{ selectedEntries: Song[] }>) => {
      const currentEntry = entrySelect(state);
      const newQueue = moveSelectedToTop(state[currentEntry], action.payload.selectedEntries);
      state[currentEntry] = newQueue;

      // We'll need to fix the current player index after swapping the queue order
      // This will be used in conjunction with fixPlayer2Index
      const newCurrentSongIndex = getCurrentEntryIndexByUID(newQueue, state.currentSongUniqueId);

      if (state.currentPlayer === 1) {
        state.player1.index = newCurrentSongIndex;
      } else {
        state.player2.index = newCurrentSongIndex;
      }

      state.currentIndex = newCurrentSongIndex;
    },

    moveToBottom: (state, action: PayloadAction<{ selectedEntries: Song[] }>) => {
      const currentEntry = entrySelect(state);
      const newQueue = moveSelectedToBottom(state[currentEntry], action.payload.selectedEntries);
      state[currentEntry] = newQueue;

      // We'll need to fix the current player index after swapping the queue order
      // This will be used in conjunction with fixPlayer2Index
      const newCurrentSongIndex = getCurrentEntryIndexByUID(newQueue, state.currentSongUniqueId);

      if (state.currentPlayer === 1) {
        state.player1.index = newCurrentSongIndex;
      } else {
        state.player2.index = newCurrentSongIndex;
      }

      state.currentIndex = newCurrentSongIndex;
    },

    moveUp: (state, action: PayloadAction<{ selectedEntries: Song[] }>) => {
      const currentEntry = entrySelect(state);
      state[currentEntry] = moveSelectedUp(state[currentEntry], action.payload.selectedEntries);

      // We'll need to fix the current player index after swapping the queue order
      // This will be used in conjunction with fixPlayer2Index
      const newCurrentSongIndex = getCurrentEntryIndexByUID(
        state[currentEntry],
        state.currentSongUniqueId
      );

      if (state.currentPlayer === 1) {
        state.player1.index = newCurrentSongIndex;
      } else {
        state.player2.index = newCurrentSongIndex;
      }

      state.currentIndex = newCurrentSongIndex;
    },

    moveDown: (state, action: PayloadAction<{ selectedEntries: Song[] }>) => {
      const currentEntry = entrySelect(state);
      state[currentEntry] = moveSelectedDown(state[currentEntry], action.payload.selectedEntries);

      // We'll need to fix the current player index after swapping the queue order
      // This will be used in conjunction with fixPlayer2Index
      const newCurrentSongIndex = getCurrentEntryIndexByUID(
        state[currentEntry],
        state.currentSongUniqueId
      );

      if (state.currentPlayer === 1) {
        state.player1.index = newCurrentSongIndex;
      } else {
        state.player2.index = newCurrentSongIndex;
      }

      state.currentIndex = newCurrentSongIndex;
    },

    restoreState: (state, action: PayloadAction<PlayQueueSaveState>) => {
      const result = action.payload;

      state.entry = result.entry;
      state.shuffledEntry = result.shuffledEntry;

      state.current = result.current;
      state.currentIndex = result.currentIndex;
      state.currentSongId = result.currentSongId;
      state.currentSongUniqueId = result.currentSongUniqueId;

      state.player1 = result.player1;
      state.player2 = result.player2;
      state.currentPlayer = result.currentPlayer;
    },
  },
});

export const {
  setPlayerSrc,
  updatePlayerIndices,
  setSort,
  sortPlayQueue,
  incrementCurrentIndex,
  decrementCurrentIndex,
  incrementPlayerIndex,
  setPlayerIndex,
  fixPlayer2Index,
  setCurrentIndex,
  setPlayQueue,
  setPlayQueueByRowClick,
  appendPlayQueue,
  removeFromPlayQueue,
  clearPlayQueue,
  setIsLoading,
  setIsLoaded,
  moveToTop,
  moveToBottom,
  moveUp,
  moveDown,
  moveToIndex,
  setCurrentPlayer,
  setVolume,
  setIsFading,
  setAutoIncremented,
  toggleRepeat,
  toggleShuffle,
  toggleDisplayQueue,
  resetPlayQueue,
  setStar,
  setRate,
  shuffleInPlace,
  setFadeData,
  setPlaybackSetting,
  restoreState,
} = playQueueSlice.actions;
export default playQueueSlice.reducer;
