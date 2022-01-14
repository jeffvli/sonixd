import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import settings from 'electron-settings';
import { mockSettings } from '../shared/mockSettings';
import { Item, Sort, Pagination } from '../types';

const parsedSettings: any = process.env.NODE_ENV === 'test' ? mockSettings : settings.getSync();

export interface View {
  music: {
    filter: string;
    sort: Sort;
    pagination: Pagination;
  };
}

const initialState: any = {
  music: {
    filter: String(parsedSettings.musicSortDefault) || 'random',
    sort: {
      column: undefined,
      type: 'asc',
    },
    pagination: {
      recordsPerPage: parsedSettings.pagination.music,
      activePage: 1,
      pages: 1,
    },
  },
};

const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<{ listType: Item; data: any }>) => {
      if (action.payload.listType === Item.Music) {
        state.music.filter = action.payload.data;
      }
    },

    setPagination: (
      state,
      action: PayloadAction<{
        listType: Item;
        data: { enabled?: boolean; activePage?: number; pages?: number; recordsPerPage?: number };
      }>
    ) => {
      if (action.payload.listType === Item.Music) {
        state.music.pagination = {
          ...state.music.pagination,
          ...action.payload.data,
        };
      }
    },
  },
});

export const { setFilter, setPagination } = viewSlice.actions;
export default viewSlice.reducer;
