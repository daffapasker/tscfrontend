import { createContext } from "react";

export type AuthUser = Record<string, unknown>;

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isError: boolean;
  isUnauthorized: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
