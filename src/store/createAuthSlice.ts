/* eslint-disable @typescript-eslint/no-unused-vars */
import { GetState, SetState } from 'zustand';

import type { StoreState } from './useStore';

export interface AuthSlice {
  serverUrl: string;
  isAuthenticated: boolean;
  login: (serverUrl: string) => void;
  logout: () => void;
}

const createAuthSlice = (
  set: SetState<StoreState>,
  _get: GetState<StoreState>
) => ({
  serverUrl: 'http://localhost:9321/api',
  isAuthenticated: false,
  login: (serverUrl: string) => set({ serverUrl, isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
});

export default createAuthSlice;
