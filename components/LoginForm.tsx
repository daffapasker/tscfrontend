"use client";

import React from "react";
import { Controller } from "react-hook-form";
import useLogin from "@/hooks/useLogin";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const { control, errors, handlerSignIn, isPendingSignIn } = useLogin();
  const router = useRouter();

  return (
    <form onSubmit={handlerSignIn} className="auth-form">
      <div className="auth-form-header">
        <h2>Selamat Datang Pengurus</h2>
        <p>Masuk ke portal akademik TSC</p>
      </div>

      {errors.root && <div className="auth-error">{errors.root.message}</div>}

      <div className="auth-field">
        <label>Username</label>
        <div className="input-shell">
          <span className="input-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <Controller name="username" control={control} render={({ field }) => <input {...field} type="text" placeholder="Masukkan username" autoComplete="off" />} />
        </div>
        {errors.username && <div className="auth-error">{errors.username.message}</div>}
      </div>

      <div className="auth-field">
        <label>Password</label>
        <div className="input-shell">
          <span className="input-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <rect x="5" y="11" width="14" height="10" rx="2" />
            </svg>
          </span>
          <Controller name="password" control={control} render={({ field }) => <input {...field} type="password" placeholder="Masukkan password" autoComplete="off" />} />
          <button type="button" className="input-action" aria-label="Tampilkan password" />
        </div>
        {errors.password && <div className="auth-error">{errors.password.message}</div>}
      </div>

      <div className="auth-options">
        <label className="remember-me">
          <input type="checkbox" />
          <span>Ingat saya</span>
        </label>
        <a className="forgot-link" href="#">
          Lupa password?
        </a>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <button className="auth-submit" type="submit" disabled={isPendingSignIn}>
          {isPendingSignIn ? "Masuk..." : "Masuk"}
          <span aria-hidden="true">→</span>
        </button>

      </div>


    </form>
  );
}
