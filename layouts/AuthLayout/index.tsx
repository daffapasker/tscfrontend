import React from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#0b0f14] bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm bg-white/5 border border-white/10">
          
          {/* Left Section - Branding */}
          <section className="w-full lg:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col items-center text-center lg:text-left lg:items-start bg-white/5">
            <div className="brand-card mb-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-emerald-500/10 backdrop-blur-md flex items-center justify-center p-2 shadow-xl border border-white/10">
                <Image 
                  src="/logo.jpeg" 
                  alt="Trisula Sport Club" 
                  width={120} 
                  height={120} 
                  className="w-full h-full object-contain rounded-full"
                  priority
                />
              </div>
            </div>
            
            <h1 className="brand-title text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
              Trisula <span className="text-emerald-400">Sport Club</span>
            </h1>
            
            <p className="brand-subtitle text-sm sm:text-base text-zinc-400 max-w-md lg:max-w-none">
              Portal Akademik untuk pengelolaan data anggota, dokumen kegiatan, dan informasi kegiatan klub
            </p>
          </section>

          {/* Right Section - Form Panel */}
          <section className="w-full lg:w-1/2 bg-white/5 backdrop-blur-sm p-6 sm:p-8 md:p-10 border-l border-white/10">
            <div className="auth-card w-full max-w-md mx-auto">
              {children}
            </div>
            
            <p className="auth-footer text-center text-xs sm:text-sm text-zinc-500 mt-6 pt-4 border-t border-white/10">
              © 2026 Trisula Sport Club. All rights reserved.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}