import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import settings from 'electron-settings';
import { mockSettings } from '../shared/mockSettings';
import { getImageCachePath, getSongCachePath } from '../shared/utils';
import { Entry } from './playQueueSlice';

const parsedSettings = process.env.NODE_ENV === 'test' ? mockSettings : settings.getSync();

export interface ModalPage {
  pageType: string;
  id: number;
}

export interface Modal {
  show: boolean;
  currentPageIndex: number | undefined;
}

type ContextMenuOptions =
  | 'play'
  | 'addToQueueNext'
  | 'addToQueueLast'
  | 'removeFromCurrent'
  | 'addToPlaylist'
  | 'deletePlaylist'
  | 'addToFavorites'
  | 'removeFromFavorites'
  | 'viewInModal'
  | 'viewInFolder'
  | 'moveSelectedTo';

export interface ContextMenu {
  show: boolean;
  xPos?: number;
  yPos?: number;
  rowId?: string;
  type?: string;
  details?: Entry;
  disabledOptions?: ContextMenuOptions[];
}
export interface General {
  theme: string;
  font: string;
  modal: Modal;
  modalPages: ModalPage[];
  expandSidebar: boolean;
  isProcessingPlaylist: string[];
  contextMenu: ContextMenu;
  dynamicBackground: boolean;
  highlightOnRowHover: boolean;
  imageCachePath: string;
  songCachePath: string;
  titleBar: 'windows' | 'mac' | string;
}

const initialState: General = {
  theme: String(parsedSettings.theme),
  font: String(parsedSettings.font),
  modal: {
    show: false,
    currentPageIndex: undefined,
  },
  modalPages: [],
  expandSidebar: false,
  isProcessingPlaylist: [],
  contextMenu: {
    show: false,
  },
  dynamicBackground: Boolean(parsedSettings.dynamicBackground),
  highlightOnRowHover: Boolean(parsedSettings.highlightOnRowHover),
  imageCachePath: getImageCachePath(),
  songCachePath: getSongCachePath(),
  titleBar: String(parsedSettings.titleBarStyle),
};

const miscSlice = createSlice({
  name: 'misc',
  initialState,
  reducers: {
    setDynamicBackground: (state, action: PayloadAction<boolean>) => {
      state.dynamicBackground = action.payload;
    },

    setExpandSidebar: (state, action: PayloadAction<boolean>) => {
      state.expandSidebar = action.payload;
    },

    setMiscSetting: (state, action: PayloadAction<{ setting: string; value: any }>) => {
      switch (action.payload.setting) {
        case 'imageCachePath':
          state.imageCachePath = action.payload.value;
          break;
        case 'songCachePath':
          state.songCachePath = action.payload.value;
          break;
        case 'titleBar':
          state.titleBar = action.payload.value;
          break;
        case 'highlightOnRowHover':
          state.highlightOnRowHover = action.payload.value;
          break;
        default:
          break;
      }
    },

    setContextMenu: (state, action: PayloadAction<ContextMenu>) => {
      state.contextMenu.show = action.payload.show;
      state.contextMenu.xPos = action.payload.xPos;
      state.contextMenu.yPos = action.payload.yPos;
      state.contextMenu.type = action.payload.type;
      state.contextMenu.details = action.payload.details;
      state.contextMenu.disabledOptions = action.payload.disabledOptions;
    },

    addProcessingPlaylist: (state, action: PayloadAction<string>) => {
      state.isProcessingPlaylist.push(action.payload);
    },

    removeProcessingPlaylist: (state, action: PayloadAction<string>) => {
      const filtered = state.isProcessingPlaylist.filter((id: string) => id !== action.payload);

      state.isProcessingPlaylist = filtered;
    },

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
          state.modal.currentPageIndex === undefined ? 0 : state.modal.currentPageIndex
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
  addProcessingPlaylist,
  removeProcessingPlaylist,
  setContextMenu,
  setExpandSidebar,
  setDynamicBackground,
  setMiscSetting,
} = miscSlice.actions;
export default miscSlice.reducer;
