import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  isAuthenticated: boolean;
  serverUrl: string;
}

const persistedAuthState = JSON.parse(
  localStorage.getItem('authentication') || '{}'
);

const initialState: AuthState = {
  isAuthenticated: persistedAuthState.isAuthenticated,
  serverUrl: persistedAuthState.serverUrl,
};

export const authSlice = createSlice({
  initialState,
  name: 'player',
  reducers: {
    login: (state: AuthState, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.serverUrl = action.payload;
    },

    logout: (state: AuthState) => {
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
