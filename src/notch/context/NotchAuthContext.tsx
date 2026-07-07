import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { NNUser, getNNUser, clearNNSession, nnLogin, nnRegister } from "@/notch/lib/nn-auth";

interface NotchAuthContextType {
  user: NNUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
}

const NotchAuthContext = createContext<NotchAuthContextType | undefined>(undefined);

export function NotchAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NNUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getNNUser());
    setLoading(false);
    const onExpired = () => setUser(null);
    window.addEventListener("nn:session-expired", onExpired);
    return () => window.removeEventListener("nn:session-expired", onExpired);
  }, []);

  const login = async (email: string, password: string) => {
    const u = await nnLogin(email, password);
    setUser(u);
  };
  const register = async (email: string, password: string, displayName?: string) => {
    const u = await nnRegister(email, password, displayName);
    setUser(u);
  };
  const logout = () => {
    clearNNSession();
    setUser(null);
  };

  return (
    <NotchAuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </NotchAuthContext.Provider>
  );
}

export function useNotchAuth() {
  const ctx = useContext(NotchAuthContext);
  if (!ctx) throw new Error("useNotchAuth must be used within NotchAuthProvider");
  return ctx;
}
