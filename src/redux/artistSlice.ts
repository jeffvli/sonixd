import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sort } from '../types';

export interface ArtistPage {
  active: {
    list: {
      sort: Sort;
    };
    page: {
      sort: Sort;
    };
  };
}

const initialState: ArtistPage = {
  active: {
    list: {
      sort: {
        column: undefined,
        type: 'asc',
      },
    },
    page: {
      sort: {
        column: undefined,
        type: 'asc',
      },
    },
  },
};

const artistSlice = createSlice({
  name: 'artist',
  initialState,
  reducers: {
    setActive: (state, action: PayloadAction<any>) => {
      state.active = action.payload;
    },

    setSort: (state, action: PayloadAction<{ type: 'list' | 'page'; value: Sort }>) => {
      if (action.payload.type === 'list') {
        state.active.list.sort = action.payload.value;
      }

      if (action.payload.type === 'page') {
        state.active.page.sort = action.payload.value;
      }
    },
  },
});

export const { setActive, setSort } = artistSlice.actions;
export default artistSlice.reducer;
