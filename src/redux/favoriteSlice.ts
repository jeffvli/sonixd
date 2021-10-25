import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FavoritePage {
  active: {
    tab: string;
  };
}

const initialState: FavoritePage = {
  active: {
    tab: 'tracks',
  },
};

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setActive: (state, action: PayloadAction<{ tab: string }>) => {
      state.active.tab = action.payload.tab;
    },
  },
});

export const { setActive } = favoriteSlice.actions;
export default favoriteSlice.reducer;
