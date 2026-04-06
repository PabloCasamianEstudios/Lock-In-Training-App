import { useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import { AppUser, LoginResponse } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('lockin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lockin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lockin_user');
    }
  }, [user]);

  const login = useCallback(async (credentials: any): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authService.login(credentials);
      setUser(userData as unknown as AppUser);
      return userData;
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: any): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(userData);
      return await login({ email: userData.email, password: userData.password });
    } catch (err: any) {
      const msg = err.message || 'Registration failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  return { user, loading, error, setError, login, register, logout, setUser };
};
