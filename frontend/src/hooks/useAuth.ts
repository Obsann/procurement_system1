import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { setCredentials, logout } from '../store/slices/authSlice';
import { useLoginMutation, useLogoutMutation } from '../store/api/authApi';
import { type LoginRequest } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  const login = async (credentials: LoginRequest) => {
    try {
      const result = await loginMutation(credentials).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      if (authState.isAuthenticated) {
        await logoutMutation().unwrap();
      }
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
