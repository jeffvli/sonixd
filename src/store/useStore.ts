import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import createAuthSlice, { AuthSlice } from './createAuthSlice';

export type StoreState = AuthSlice;

const useStore = create<StoreState>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...createAuthSlice(set, get),
      }))
    )
  )
);

export default useStore;
