"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  School,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import athleteService from "@/services/athlete.services";
import schoolService from "@/services/school.services";
import useAuth from "@/hooks/useAuth";

export default function CoachDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [athleteCount, setAthleteCount] = useState(0);
  const [schoolCount, setSchoolCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const [athleteRes, schoolRes] = await Promise.all([
          athleteService.list(),
          schoolService.list(),
        ]);

        const athletes = athleteRes?.data ?? athleteRes ?? [];
        const schools = schoolRes?.data ?? schoolRes ?? [];

        setAthleteCount(athletes.length);
        setSchoolCount(schools.length);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const coachName = String(user?.name || user?.username || "Pelatih");

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Selamat Datang, {coachName}!
            </h1>
          </div>
          <p className="text-sm text-violet-100 mt-1 md:text-base max-w-xl">
            Selamat datang di Portal Akademik Trisula Sport Club. Kelola kemajuan atlet dan pantau perkembangan sekolah binaan Anda.
          </p>
        </div>
      </div>

      {/* ── Statistic Cards ── */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Total Atlet */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition duration-200 group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Atlet Binaan
              </p>
              <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
                {loading ? "..." : athleteCount}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Atlet terdaftar di Trisula Sport Club
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total Sekolah */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition duration-200 group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sekolah Binaan
              </p>
              <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
                {loading ? "..." : schoolCount}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Sekolah mitra penugasan latihan
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200">
              <School className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Access ── */}
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
        <h3 className="font-semibold text-[15px] tracking-tight text-foreground mb-4">
          Akses Menu Cepat
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Athlete Management */}
          <a
            href="/coach/athlete"
            className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-4 hover:bg-muted/30 hover:border-violet-300 dark:hover:border-violet-800 transition duration-150 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🥋</span>
              <div>
                <h4 className="font-medium text-[14px] text-foreground">Kelola Atlet</h4>
                <p className="text-xs text-muted-foreground">Cari, tambah, edit data atlet binaan</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </a>

          {/* School List */}
          <a
            href="/coach/school"
            className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-4 hover:bg-muted/30 hover:border-emerald-300 dark:hover:border-emerald-800 transition duration-150 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🏫</span>
              <div>
                <h4 className="font-medium text-[14px] text-foreground">Sekolah Binaan</h4>
                <p className="text-xs text-muted-foreground">Lihat daftar sekolah mitra pelatihan</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}
