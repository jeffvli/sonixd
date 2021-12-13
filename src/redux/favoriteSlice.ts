import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sort } from '../types';

export interface FavoritePage {
  active: {
    tab: string;
    album: {
      sort: Sort;
    };
    artist: {
      sort: Sort;
    };
  };
}

const initialState: FavoritePage = {
  active: {
    tab: 'tracks',
    album: {
      sort: {
        column: undefined,
        type: 'asc',
      },
    },
    artist: {
      sort: {
        column: undefined,
        type: 'asc',
      },
    },
  },
};

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setActive: (state, action: PayloadAction<{ tab: string }>) => {
      state.active.tab = action.payload.tab;
    },

    setSort: (state, action: PayloadAction<{ type: 'album' | 'artist'; value: Sort }>) => {
      if (action.payload.type === 'album') {
        state.active.album.sort = action.payload.value;
      }

      if (action.payload.type === 'artist') {
        state.active.artist.sort = action.payload.value;
      }
    },
  },
});

export const { setActive, setSort } = favoriteSlice.actions;
export default favoriteSlice.reducer;
