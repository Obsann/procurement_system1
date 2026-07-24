import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setCredentials, logout } from '../store/slices/authSlice';
import { useLoginMutation } from '../store/api/authApi';
import { LoginRequest } from '../types';
import api from '../lib/api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();

  const login = async (credentials: LoginRequest) => {
    try {
      const result = await loginMutation(credentials).unwrap();
      localStorage.setItem('token', result.access);
      localStorage.setItem('refreshToken', result.refresh);
      const { data: user } = await api.get('/auth/profile/');
      dispatch(setCredentials({ user, token: result.access }));
      return user;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      // JWT logout is local: the refresh token is removed below.
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      dispatch(logout());
    }
  };

  return {
    ...authState,
    login,
    logout: handleLogout,
    isLoggingIn,
  };
};
