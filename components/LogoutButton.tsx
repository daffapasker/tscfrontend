"use client"

import React, { useState } from "react";
import authService from "@/services/auth.service";
import { authKey } from "@/keys/auth.key";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function LogoutButton({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await authService.logout();
      queryClient.setQueryData(authKey.me(), null);
      router.push("/login");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handle} disabled={loading}>
      {children || (loading ? "Logging out..." : "Logout")}
    </button>
  );
}
