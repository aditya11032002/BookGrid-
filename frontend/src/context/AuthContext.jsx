import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import logger from '../utils/logger';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Configure axios default
  axios.defaults.baseURL = 'http://localhost:5000';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      fetchUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/v1/auth/me');
      setUser(res.data.data);
      logger.logAuthAction('fetch_user_success', res.data.data);
    } catch (error) {
      logger.logError(error, { context: 'fetch_user' });
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/v1/auth/login', { email, password });
      setToken(res.data.token);
      logger.logAuthAction('login_success', { email });
      return res.data;
    } catch (error) {
      logger.logError(error, { context: 'login', email });
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/v1/auth/register', { name, email, password });
      setToken(res.data.token);
      logger.logAuthAction('register_success', { email, name });
      return res.data;
    } catch (error) {
      logger.logError(error, { context: 'register', email, name });
      throw error;
    }
  };

  const logout = () => {
    const currentUser = user;
    setToken(null);
    logger.logAuthAction('logout', currentUser ? { email: currentUser.email } : {});
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
