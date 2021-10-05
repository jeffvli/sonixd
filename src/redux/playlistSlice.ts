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
}

const initialState: Playlist = {
  entry: [],
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setPlaylistData: (state, action: PayloadAction<Entry[]>) => {
      state.entry = action.payload;
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
  },
});

export const {
  setPlaylistData,
  removeFromPlaylist,
  moveToIndex,
  moveUp,
  moveDown,
  moveToBottom,
  moveToTop,
  setPlaylistStar,
} = playlistSlice.actions;
export default playlistSlice.reducer;
