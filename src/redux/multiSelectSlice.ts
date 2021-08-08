import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MultiSelect {
  lastSelected: Record<string, unknown>;
  lastRangeSelected: {
    lastSelected: Record<string, unknown>;
    lastRangeSelected: Record<string, unknown>;
  };
  selected: any[];
}

const initialState: MultiSelect = {
  lastSelected: {},
  lastRangeSelected: {
    lastSelected: {},
    lastRangeSelected: {},
  },
  selected: [],
};

const multiSelectSlice = createSlice({
  name: 'multiSelect',
  initialState,
  reducers: {
    setSelected: (state, action: PayloadAction<any>) => {
      state.lastSelected = {};
      state.lastRangeSelected = {
        lastSelected: {},
        lastRangeSelected: {},
      };

      if (state.selected.find((item) => item.id === action.payload.id)) {
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
      if (state.selected.find((item) => item.id === action.payload.id)) {
        const indexOfItem = state.selected.findIndex(
          (item) => item.id === action.payload.id
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
      if (state.lastSelected.id === state.lastRangeSelected.lastSelected.id) {
        const beginningIndex = action.payload.findIndex(
          (e) => e.id === state.lastSelected.id
        );

        const endingIndex = action.payload.findIndex(
          (e) => e.id === state.lastRangeSelected.lastRangeSelected.id
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
} = multiSelectSlice.actions;
export default multiSelectSlice.reducer;
