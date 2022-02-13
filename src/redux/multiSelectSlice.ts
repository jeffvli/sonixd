import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MultiSelect {
  lastSelected: Record<string, unknown>;
  lastRangeSelected: {
    lastSelected: Record<string, unknown>;
    lastRangeSelected: Record<string, unknown>;
  };
  selected: any[];
  currentMouseOverIndex?: number;
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
  currentMouseOverIndex: undefined,
  isDragging: false,
  isSelectDragging: false,
};

const multiSelectSlice = createSlice({
  name: 'multiSelect',
  initialState,
  reducers: {
    /* updateSelected: (state, action: PayloadAction<any>) => {
      const newSelected: any = [];
      state.selected.map((entry: Entry) => {
        const matchedEntry = action.payload.find(
          (item: Entry) => item.uniqueId === entry.uniqueId
        );
        if (matchedEntry) {
          newSelected.push(matchedEntry);
        }
        return undefined;
      });

      state.selected = newSelected;
    }, */

    setIsDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },

    setIsSelectDragging: (state, action: PayloadAction<boolean>) => {
      state.isSelectDragging = action.payload;
    },

    setCurrentMouseOverId: (
      state,
      action: PayloadAction<{
        uniqueId: string | undefined;
        index: number | undefined;
      }>
    ) => {
      state.currentMouseOverId = action.payload.uniqueId;
      state.currentMouseOverIndex = action.payload.index;
    },

    setSelected: (state, action: PayloadAction<any>) => {
      state.selected = action.payload;
    },

    setSelectedSingle: (state, action: PayloadAction<any>) => {
      state.selected = [];
      state.lastSelected = {};
      state.lastRangeSelected = {
        lastSelected: {},
        lastRangeSelected: {},
      };

      state.lastSelected = action.payload;
      state.selected.push(action.payload);
    },

    appendSelected: (state, action: PayloadAction<any>) => {
      action.payload.forEach((entry: any) => {
        const alreadySelected = state.selected.find((item) => item.uniqueId === entry.uniqueId);

        if (!alreadySelected) {
          state.selected.push(entry);
        }
      });
    },

    setRangeSelected: (state, action: PayloadAction<any>) => {
      state.lastRangeSelected.lastSelected = state.lastSelected;
      state.lastRangeSelected.lastRangeSelected = action.payload;
    },

    toggleSelectedSingle: (state, action: PayloadAction<any>) => {
      if (action.payload.uniqueId === state.selected[0]?.uniqueId) {
        state.selected = [];
      } else {
        state.selected = [];
        state.lastSelected = {};
        state.lastRangeSelected = {
          lastSelected: {},
          lastRangeSelected: {},
        };

        state.lastSelected = action.payload;
        state.selected.push(action.payload);
      }
    },

    toggleSelected: (state, action: PayloadAction<any>) => {
      if (state.selected.find((item) => item.uniqueId === action.payload.uniqueId)) {
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
      if (state.lastSelected.uniqueId === state.lastRangeSelected.lastSelected.uniqueId) {
        const beginningIndex = action.payload.findIndex(
          (e) => e.uniqueId === state.lastSelected.uniqueId
        );

        const endingIndex = action.payload.findIndex(
          (e) => e.uniqueId === state.lastRangeSelected.lastRangeSelected.uniqueId
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
  setSelectedSingle,
  appendSelected,
  setRangeSelected,
  toggleSelected,
  toggleSelectedSingle,
  toggleRangeSelected,
  clearSelected,
  setCurrentMouseOverId,
  setIsDragging,
  setIsSelectDragging,
} = multiSelectSlice.actions;
export default multiSelectSlice.reducer;
