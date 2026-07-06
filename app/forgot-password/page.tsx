"use client";

import AuthLayout from "@/layouts/AuthLayout";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const whatsappNumber = "6288216047910";

export default function ForgotPasswordPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !username.trim() || !newPassword.trim()) {
      window.alert("Harap lengkapi semua data sebelum melanjutkan.");
      return;
    }

    const message = [
      "Halo Admin TSC, saya ingin mengajukan permintaan lupa password.",
      "",
      `Nama Lengkap: ${fullName.trim()}`,
      `Username: ${username.trim()}`,
      `Password Baru: ${newPassword.trim()}`,
      "",
      "Mohon bantu reset akun saya dan kirimkan konfirmasi kembali.",
    ].join("\n");

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodedMessage}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white">Lupa Password</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Isi data berikut, lalu kami arahkan ke WhatsApp untuk permintaan reset akun Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none ring-0 placeholder:text-zinc-500 focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none ring-0 placeholder:text-zinc-500 focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200">Password Baru</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Buat password baru"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 pr-10 text-sm text-white outline-none ring-0 placeholder:text-zinc-500 focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-white"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Kirim ke WhatsApp
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
