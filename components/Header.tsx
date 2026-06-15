"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import useAuth from "@/hooks/useAuth";

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header style={{ width: "100%", padding: 12, display: "flex", justifyContent: "flex-end" }}>
      {/* {user ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>{user.name || user.username}</span>
          <LogoutButton />
        </div>
      ) : (
        pathname !== "/login" && <Link href="/login">Login</Link>
      )} */}
    </header>
  );
}
