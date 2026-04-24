import { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await userApi.post('/api/v1/users/login', { email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await userApi.post('/api/v1/users/register', data);
      const { access_token, user: userData } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await userApi.get('/api/v1/users/profile');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      // Silently fail — profile will use cached data
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
