import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';
// import { storage } from './storage';

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  login: () => { },
  logout: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      console.log('entry check');
      
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) setIsAuthenticated(true);
      } catch (error) {
        console.error('Error reading token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  const login = async (token: string) => {
    console.log('token',token);
    
    await AsyncStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = async() => {
    await AsyncStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
