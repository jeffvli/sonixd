import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ConfigPage {
  active: {
    tab: string;
  };
}

const initialState: ConfigPage = {
  active: {
    tab: 'playback',
  },
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setActive: (state, action: PayloadAction<{ tab: string }>) => {
      state.active.tab = action.payload.tab;
    },
  },
});

export const { setActive } = configSlice.actions;
export default configSlice.reducer;
