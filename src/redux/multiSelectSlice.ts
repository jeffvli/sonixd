import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MultiSelect {
  lastSelected: Record<string, unknown>;
  lastRangeSelected: {
    lastSelected: Record<string, unknown>;
    lastRangeSelected: Record<string, unknown>;
  };
  selected: any[];
  currentMouseOverId?: string;
  isDragging: boolean;
  isSelectDragging: boolean;
}

const initialState: MultiSelect = {
  lastSelected: {},
  lastRangeSelected: {
    lastSelected: {},
    lastRangeSelected: {},
  },
  selected: [],
  currentMouseOverId: undefined,
  isDragging: false,
  isSelectDragging: false,
};

const multiSelectSlice = createSlice({
  name: 'multiSelect',
  initialState,
  reducers: {
    setIsDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },

    setIsSelectDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },

    setCurrentMouseOverId: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.currentMouseOverId = action.payload;
    },

    setSelected: (state, action: PayloadAction<any>) => {
      state.lastSelected = {};
      state.lastRangeSelected = {
        lastSelected: {},
        lastRangeSelected: {},
      };

      if (
        state.selected.find((item) => item.uniqueId === action.payload.uniqueId)
      ) {
        state.selected = [];
      } else {
        state.selected = [];
        state.lastSelected = action.payload;
        state.selected.push(action.payload);
      }
    },

    setRangeSelected: (state, action: PayloadAction<any>) => {
      state.lastRangeSelected.lastSelected = state.lastSelected;
      state.lastRangeSelected.lastRangeSelected = action.payload;
    },

    toggleSelected: (state, action: PayloadAction<any>) => {
      if (
        state.selected.find((item) => item.uniqueId === action.payload.uniqueId)
      ) {
        const indexOfItem = state.selected.findIndex(
          (item) => item.uniqueId === action.payload.uniqueId
        );

        if (indexOfItem >= 0) {
          state.selected.splice(indexOfItem, 1);
        }
      } else {
        state.selected.push(action.payload);
        state.lastSelected = action.payload;
      }
    },

    toggleRangeSelected: (state, action: PayloadAction<any[]>) => {
      if (
        state.lastSelected.uniqueId ===
        state.lastRangeSelected.lastSelected.uniqueId
      ) {
        const beginningIndex = action.payload.findIndex(
          (e) => e.uniqueId === state.lastSelected.uniqueId
        );

        const endingIndex = action.payload.findIndex(
          (e) =>
            e.uniqueId === state.lastRangeSelected.lastRangeSelected.uniqueId
        );

        // Handle both selection directions
        const newSlice =
          beginningIndex < endingIndex
            ? action.payload.slice(beginningIndex, endingIndex + 1)
            : action.payload.slice(endingIndex, beginningIndex + 1);

        state.selected = newSlice;
      } else {
        action.payload.map((item) => state.selected.push(item));
      }
    },

    clearSelected: () => initialState,
  },
});

export const {
  setSelected,
  setRangeSelected,
  toggleSelected,
  toggleRangeSelected,
  clearSelected,
  setCurrentMouseOverId,
  setIsDragging,
  setIsSelectDragging,
} = multiSelectSlice.actions;
export default multiSelectSlice.reducer;
