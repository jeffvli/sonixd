import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sort } from '../types';

export interface AlbumPage {
  active: {
    filter: string;
  };
  advancedFilters: AdvancedFilters;
}

export interface AdvancedFilters {
  enabled: boolean;
  nav: 'filters' | 'sort';
  properties: {
    starred: boolean;
    genre: {
      list: any[];
      type: 'and' | 'or';
    };
    artist: {
      list: any[];
      type: 'and' | 'or';
    };
    year: {
      from: number;
      to: number;
    };
    sort: Sort;
  };
}

const initialState: AlbumPage = {
  active: {
    filter: 'random',
  },
  advancedFilters: {
    enabled: false,
    nav: 'filters',
    properties: {
      starred: false,
      genre: {
        list: [],
        type: 'and',
      },
      artist: {
        list: [],
        type: 'and',
      },
      year: {
        from: 0,
        to: 0,
      },
      sort: {
        column: undefined,
        type: 'asc',
      },
    },
  },
};

const albumSlice = createSlice({
  name: 'album',
  initialState,
  reducers: {
    setActive: (state, action: PayloadAction<any>) => {
      state.active = action.payload;
    },

    setAdvancedFilters: (
      state,
      action: PayloadAction<{
        filter: 'enabled' | 'starred' | 'genre' | 'artist' | 'year' | 'sort' | 'nav';
        value: any;
      }>
    ) => {
      if (action.payload.filter === 'enabled') {
        state.advancedFilters.enabled = action.payload.value;
      }

      if (action.payload.filter === 'starred') {
        state.advancedFilters.properties.starred = action.payload.value;
      }

      if (action.payload.filter === 'genre') {
        state.advancedFilters.properties.genre = action.payload.value;
      }

      if (action.payload.filter === 'artist') {
        state.advancedFilters.properties.artist = action.payload.value;
      }

      if (action.payload.filter === 'year') {
        state.advancedFilters.properties.year = action.payload.value;
      }

      if (action.payload.filter === 'sort') {
        state.advancedFilters.properties.sort = action.payload.value;
      }

      if (action.payload.filter === 'nav') {
        state.advancedFilters.nav = action.payload.value;
      }
    },
  },
});

export const { setActive, setAdvancedFilters } = albumSlice.actions;
export default albumSlice.reducer;
