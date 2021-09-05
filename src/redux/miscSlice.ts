import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getSettings } from '../shared/utils';

const parsedSettings = getSettings();
interface General {
  theme: string;
}

const initialState: General = {
  theme: parsedSettings.theme,
};

const miscSlice = createSlice({
  name: 'misc',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
  },
});

export const { setTheme } = miscSlice.actions;
export default miscSlice.reducer;
