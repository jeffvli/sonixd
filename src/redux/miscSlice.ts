import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getSettings } from '../shared/utils';

const parsedSettings = getSettings();

export interface ModalPage {
  pageType: string;
  id: number;
}

export interface Modal {
  show: boolean;
  currentPageIndex: number | undefined;
}
export interface General {
  theme: string;
  font: string;
  modal: Modal;
  modalPages: ModalPage[];
}

const initialState: General = {
  theme: parsedSettings.theme,
  font: parsedSettings.font,
  modal: {
    show: false,
    currentPageIndex: undefined,
  },
  modalPages: [],
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

    hideModal: (state) => {
      state.modal.show = false;
      state.modal.currentPageIndex = undefined;
      state.modalPages = [];
    },

    addModalPage: (state, action: PayloadAction<ModalPage>) => {
      state.modal.show = true;

      if (
        state.modalPages[
          state.modal.currentPageIndex === undefined
            ? 0
            : state.modal.currentPageIndex
        ]?.id !== action.payload.id
      ) {
        state.modalPages.push(action.payload);

        if (state.modal.currentPageIndex === undefined) {
          state.modal.currentPageIndex = 0;
        } else {
          state.modal.currentPageIndex = state.modalPages.length - 1;
        }
      }
    },

    incrementModalPage: (state) => {
      if (state.modal.currentPageIndex === undefined) {
        state.modal.currentPageIndex = 0;
      }
      if (state.modal.currentPageIndex + 1 < state.modalPages.length) {
        state.modal.currentPageIndex += 1;
      }
    },

    decrementModalPage: (state) => {
      if (state.modal.currentPageIndex === undefined) {
        state.modal.currentPageIndex = 0;
      }
      if (state.modal.currentPageIndex - 1 >= 0) {
        state.modal.currentPageIndex -= 1;
        state.modalPages.pop();
      }
    },
  },
});

export const {
  setTheme,
  setFont,
  hideModal,
  addModalPage,
  incrementModalPage,
  decrementModalPage,
} = miscSlice.actions;
export default miscSlice.reducer;
