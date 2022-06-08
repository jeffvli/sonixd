import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface AuthState {
  isAuthenticated: boolean;
  key: string;
  serverUrl: string;
}

export interface AuthSlice extends AuthState {
  login: (auth: Partial<AuthState>) => void;
  logout: () => void;
}

const persistedAuthState = JSON.parse(
  localStorage.getItem('authentication') || '{}'
);

export const useAuthStore = create<AuthSlice>()(
  devtools(
    immer((set) => ({
      isAuthenticated: persistedAuthState.isAuthenticated,
      key: persistedAuthState.key,
      login: (auth: Partial<AuthState>) => {
        return set({ isAuthenticated: true, ...auth });
      },
      logout: () => {
        return set({ isAuthenticated: false });
      },
      serverUrl: persistedAuthState.serverUrl,
    }))
  )
);
