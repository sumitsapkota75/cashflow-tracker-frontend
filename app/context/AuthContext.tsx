"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AuthState, AuthUser } from "../lib/auth";
import { decodeJwt } from "../lib/jwt";

interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ user: null, token: null, loading: false });
      return;
    }
    const decoded = decodeJwt(token);
    console.log("Decoded JWT:", decoded);
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("auth_token");
      setState({ user: null, token: null, loading: false });
      return;
    }
    const user: AuthUser = {
      userId: decoded.userId ,
      email: decoded.email || decoded.sub,
      role: decoded.role,
    };
    setState({ user, token, loading: false });
  }  , []);

  function login(token: string) {
    const decoded = decodeJwt(token);
    if (!decoded) return;

    const user: AuthUser = {
      userId: decoded.userId || decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    localStorage.setItem("auth_token", token);
    setState({ user, token, loading: false });
  }
  function logout() {
    localStorage.removeItem("auth_token");
    setState({ user: null, token: null, loading: false });
  }
  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );

}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}