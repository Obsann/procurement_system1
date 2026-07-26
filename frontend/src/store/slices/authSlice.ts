import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type User } from '../../types';
import {
  clearSession,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
} from '../../lib/authStorage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: getStoredUser(),
  token: getAccessToken(),
  isAuthenticated: !!getAccessToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      setAccessToken(action.payload.token);
      setStoredUser(action.payload.user);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearSession();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
