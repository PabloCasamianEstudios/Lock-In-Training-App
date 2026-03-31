import { useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lockin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lockin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lockin_user');
    }
  }, [user]);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(userData);
      return await login({ email: userData.email, password: userData.password });
    } catch (err) {
      setError(err.message);
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
