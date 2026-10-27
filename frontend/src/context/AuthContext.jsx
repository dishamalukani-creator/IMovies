import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import movieService from '../services/movie.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('imovies_token') || null);
  const [role, setRole] = useState(localStorage.getItem('imovies_role') || null);
  const [loading, setLoading] = useState(true);

  // Verify stored session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('imovies_token');
      if (storedToken) {
        try {
          const account = await authService.getMe();
          setUser(account);
          setRole(account.role);
          localStorage.setItem('imovies_role', account.role);
        } catch (err) {
          // Token expired or invalid
          console.warn('Session expired or invalid, clearing credentials');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { user: loggedInUser, token: authToken } = res.data;

    setUser(loggedInUser);
    setToken(authToken);
    setRole(loggedInUser.role);

    localStorage.setItem('imovies_token', authToken);
    localStorage.setItem('imovies_role', loggedInUser.role);
    return loggedInUser;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const { user: registeredUser, token: authToken } = res.data;

    setUser(registeredUser);
    setToken(authToken);
    setRole(registeredUser.role);

    localStorage.setItem('imovies_token', authToken);
    localStorage.setItem('imovies_role', registeredUser.role);
    return registeredUser;
  };

  const adminLogin = async (email, password) => {
    const res = await authService.adminLogin({ email, password });
    const { admin: loggedInAdmin, token: authToken } = res.data;

    setUser(loggedInAdmin);
    setToken(authToken);
    setRole('admin');

    localStorage.setItem('imovies_token', authToken);
    localStorage.setItem('imovies_role', 'admin');
    return loggedInAdmin;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_role');
  };

  const isFavorite = (movieId) => {
    if (!user || !user.favorites) return false;
    return user.favorites.some((fav) => {
      const favId = typeof fav === 'string' ? fav : fav._id;
      return favId === movieId;
    });
  };

  const toggleFavorite = async (movieId) => {
    if (!user) throw new Error('Please sign in to save movies to favorites');
    const result = await movieService.toggleFavorite(movieId);
    setUser((prev) => ({
      ...prev,
      favorites: result.favorites,
    }));
    return result.isFavorite;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!user,
        isAdmin: role === 'admin',
        loading,
        login,
        register,
        adminLogin,
        logout,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
