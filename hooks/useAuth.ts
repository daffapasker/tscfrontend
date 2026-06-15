"use client";

import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { authKey } from "@/keys/auth.key";
import authService from "@/services/auth.service";
import { AuthContext } from "@/context/AuthContext";

export const useAuthMe = () => {
  return useQuery({
    queryKey: authKey.me(),
    queryFn: async () => {
      const response = await authService.getProfile();
      return response?.data || response;
    },
    retry: false,
  });
};

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider");
  }
  return context;
}
