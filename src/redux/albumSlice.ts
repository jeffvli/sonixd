import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AlbumPage {
  active: {
    filter: string;
  };
  advancedFilters: AdvancedFilters;
}

export interface AdvancedFilters {
  enabled: boolean;
  properties: {
    starred: boolean;
    genre: {
      list: any[];
      type: 'and' | 'or';
    };
  };
}

const initialState: AlbumPage = {
  active: {
    filter: 'random',
  },
  advancedFilters: {
    enabled: false,
    properties: {
      starred: false,
      genre: {
        list: [],
        type: 'and',
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
      action: PayloadAction<{ filter: 'enabled' | 'starred' | 'genre' | 'artist'; value: any }>
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
    },
  },
});

export const { setActive, setAdvancedFilters } = albumSlice.actions;
export default albumSlice.reducer;
