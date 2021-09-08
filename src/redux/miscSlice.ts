import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getSettings } from '../shared/utils';

const parsedSettings = getSettings();
export interface General {
  theme: string;
  font: string;
}

const initialState: General = {
  theme: parsedSettings.theme,
  font: parsedSettings.font,
};

const miscSlice = createSlice({
  name: 'misc',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },

    setFont: (state, action: PayloadAction<string>) => {
      state.font = action.payload;
    },
  },
});

export const { setTheme, setFont } = miscSlice.actions;
export default miscSlice.reducer;
