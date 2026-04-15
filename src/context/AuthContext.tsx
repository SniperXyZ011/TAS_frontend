import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { validateAdminKey } from "../services/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (key: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_key");
    if (stored) {
      validateAdminKey(stored)
        .then((valid) => {
          setIsAuthenticated(valid);
          if (!valid) sessionStorage.removeItem("admin_key");
        })
        .catch(() => {
          setIsAuthenticated(false);
          sessionStorage.removeItem("admin_key");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (key: string): Promise<boolean> => {
    const valid = await validateAdminKey(key);
    if (valid) {
      sessionStorage.setItem("admin_key", key);
      setIsAuthenticated(true);
    }
    return valid;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("admin_key");
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
