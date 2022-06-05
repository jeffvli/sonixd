import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import md5 from 'md5';

export interface AuthState {
  isAuthenticated: boolean;
  key: string;
  serverUrl: string;
}

const persistedAuthState = JSON.parse(
  localStorage.getItem('authentication') || '{}'
);

const initialState: AuthState = {
  isAuthenticated: persistedAuthState.isAuthenticated,
  key: persistedAuthState.key,
  serverUrl: persistedAuthState.serverUrl,
};

export const authSlice = createSlice({
  initialState,
  name: 'player',
  reducers: {
    login: (state: AuthState, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.serverUrl = action.payload;
      state.key = md5(action.payload);
    },

    logout: (state: AuthState) => {
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
