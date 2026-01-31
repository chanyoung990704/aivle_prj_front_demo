"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthState {
  accessToken: string;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (accessToken: string) => void;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth-console.tokens";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: "",
    isAuthenticated: false,
  });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.accessToken) {
          setState({
            accessToken: data.accessToken,
            isAuthenticated: true,
          });
        }
      } catch (e) {
        console.error("Token parsing error", e);
      }
    }
  }, []);

  const login = (accessToken: string) => {
    const newState = { accessToken, isAuthenticated: true };
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const logout = () => {
    setState({ accessToken: "", isAuthenticated: false });
    localStorage.removeItem(STORAGE_KEY);
  };

  const getToken = () => state.accessToken || null;

  return (
    <AuthContext.Provider value={{ ...state, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
