"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { UserSummaryDto } from "@/types/api";

interface AuthState {
  accessToken: string;
  isAuthenticated: boolean;
  user: UserSummaryDto | null;
}

interface AuthContextType extends AuthState {
  login: (accessToken: string, user: UserSummaryDto) => void;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth-console.tokens";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: "",
    isAuthenticated: false,
    user: null,
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
            user: data.user || null,
          });
        }
      } catch (e) {
        console.error("Token parsing error", e);
      }
    }
  }, []);

  const login = (accessToken: string, user: UserSummaryDto) => {
    const newState = { accessToken, isAuthenticated: true, user };
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const logout = () => {
    setState({ accessToken: "", isAuthenticated: false, user: null });
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
