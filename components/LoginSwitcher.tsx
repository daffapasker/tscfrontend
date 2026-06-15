"use client";

import { useState, Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import LoginFormCoach from "@/components/LoginFormCoach";

export default function LoginSwitcher() {
  const [loginType, setLoginType] = useState<"pengurus" | "coach">("pengurus");

  return (
    <div className="w-full">
      {/* Switch Button - Mobile Responsive */}
      <div className="flex mb-6 rounded-xl bg-white/5 p-1 border border-white/10">
        <button
          type="button"
          onClick={() => setLoginType("pengurus")}
          className={`flex-1 py-2.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            loginType === "pengurus"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Login Pengurus
        </button>

        <button
          type="button"
          onClick={() => setLoginType("coach")}
          className={`flex-1 py-2.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            loginType === "coach"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Login Pelatih
        </button>
      </div>

      {/* Form */}
      <Suspense
        fallback={
          <div className="text-zinc-400 text-center text-sm py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-emerald-400 border-r-transparent"></div>
            <p className="mt-2">Loading...</p>
          </div>
        }
      >
        {loginType === "pengurus" ? (
          <LoginForm />
        ) : (
          <LoginFormCoach />
        )}
      </Suspense>
    </div>
  );
}