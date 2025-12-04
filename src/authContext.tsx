import React, { createContext, useEffect, useState } from 'react';
import { storage } from './storage';

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = storage.getString('token');
    if (token) setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    storage.set('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    storage.remove('token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
