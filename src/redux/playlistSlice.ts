import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';
import {
  moveSelectedDown,
  moveSelectedToBottom,
  moveSelectedToIndex,
  moveSelectedToTop,
  moveSelectedUp,
} from '../shared/utils';
import { Entry } from './playQueueSlice';

export interface Playlist {
  entry: Entry[];
  sortedEntry: Entry[];
}

const initialState: Playlist = {
  entry: [],
  sortedEntry: [],
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setPlaylistData: (state, action: PayloadAction<Entry[]>) => {
      state.entry = action.payload;
    },

    sortPlaylist: (
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
    },

    removeFromPlaylist: (state, action: PayloadAction<{ selectedEntries: Entry[] }>) => {
      const uniqueIds = _.map(action.payload.selectedEntries, 'uniqueId');
      state.entry = state.entry.filter((entry) => !uniqueIds.includes(entry.uniqueId));
    },

    moveToIndex: (
      state,
      action: PayloadAction<{ selectedEntries: Entry[]; moveBeforeId: string }>
    ) => {
      state.entry = moveSelectedToIndex(
        state.entry,
        action.payload.selectedEntries,
        action.payload.moveBeforeId
      );
    },

    moveUp: (state, action: PayloadAction<{ selectedEntries: Entry[] }>) => {
      state.entry = moveSelectedUp(state.entry, action.payload.selectedEntries);
    },

    moveDown: (state, action: PayloadAction<{ selectedEntries: Entry[] }>) => {
      state.entry = moveSelectedDown(state.entry, action.payload.selectedEntries);
    },

    moveToTop: (state, action: PayloadAction<{ selectedEntries: Entry[] }>) => {
      state.entry = moveSelectedToTop(state.entry, action.payload.selectedEntries);
    },

    moveToBottom: (state, action: PayloadAction<{ selectedEntries: Entry[] }>) => {
      state.entry = moveSelectedToBottom(state.entry, action.payload.selectedEntries);
    },

    setPlaylistStar: (state, action: PayloadAction<{ id: string[]; type: string }>) => {
      // Since the playqueue can have multiples of the same song, we need to find
      // all the indices of the starred/unstarred song.

      action.payload.id.forEach((id: string) => {
        const findIndices = _.keys(_.pickBy(state.entry, { id }));
        if (action.payload.type === 'unstar') {
          findIndices?.map((rowIndex: any) => {
            state.entry[rowIndex].starred = undefined;
            return rowIndex;
          });
        } else {
          findIndices?.map((rowIndex: any) => {
            state.entry[rowIndex].starred = String(Date.now());
            return rowIndex;
          });
        }
      });
    },

    setPlaylistRate: (state, action: PayloadAction<{ id: string[]; rating?: number }>) => {
      action.payload.id.forEach((id: string) => {
        const findIndices = _.keys(_.pickBy(state.entry, { id }));
        if (action.payload.rating) {
          findIndices?.forEach((rowIndex: any) => {
            state.entry[rowIndex].userRating = action.payload.rating;
            return rowIndex;
          });
        } else {
          findIndices?.forEach((rowIndex: any) => {
            state.entry[rowIndex].userRating = undefined;
            return rowIndex;
          });
        }
      });
    },
  },
});

export const {
  setPlaylistData,
  sortPlaylist,
  removeFromPlaylist,
  moveToIndex,
  moveUp,
  moveDown,
  moveToBottom,
  moveToTop,
  setPlaylistStar,
  setPlaylistRate,
} = playlistSlice.actions;
export default playlistSlice.reducer;
