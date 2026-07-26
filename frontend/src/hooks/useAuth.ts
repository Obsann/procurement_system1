import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { setCredentials, logout } from '../store/slices/authSlice';
import { useLoginMutation } from '../store/api/authApi';
import { type LoginRequest } from '../types';
import api from '../lib/api';
import { setAccessToken, setRefreshToken } from '../lib/authStorage';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();

  const login = async (credentials: LoginRequest) => {
    const result = await loginMutation(credentials).unwrap();
    // Persist before fetching the profile so the request interceptor can
    // attach the new access token.
    setAccessToken(result.access);
    setRefreshToken(result.refresh);
    const { data: user } = await api.get('/auth/profile/');
    dispatch(setCredentials({ user, token: result.access }));
    return user;
  };

  const handleLogout = async () => {
    dispatch(logout());
  };

  return {
    ...authState,
    login,
    logout: handleLogout,
    isLoggingIn,
  };
};
