"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import authService from "../services/auth.service";
import { AuthContext } from "./AuthContext";
import { authKey } from "@/keys/auth.key";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: authKey.me(),
    queryFn: () => authService.getProfile(),
    retry: false,
    staleTime: Infinity,
  });

  const isUnauthorized = isError && (error as { response?: { status?: number } } | null)?.response?.status === 401;

  const value = {
    user: data?.data ?? null,
    isLoading,
    isError,
    isUnauthorized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
