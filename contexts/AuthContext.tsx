
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { getStoredSession, saveSession, saveUser as saveToStorage } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  loggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ loggedIn: false, user: null });

  useEffect(() => {
    const stored = getStoredSession();
    if (stored) {
      setAuth({ loggedIn: true, user: stored });
    }
  }, []);

  const login = (user: User) => {
    const now = Date.now();
    const updatedUser = { 
        ...user, 
        lastLogin: now,
        loginHistory: [...(user.loginHistory || []), now] 
    };
    saveToStorage(updatedUser);
    saveSession(updatedUser);
    setAuth({ loggedIn: true, user: updatedUser });
  };

  const logout = () => {
    saveSession(null);
    setAuth({ loggedIn: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
