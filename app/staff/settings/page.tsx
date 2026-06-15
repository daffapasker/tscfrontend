"use client";

import React, { useEffect, useState, useMemo } from "react";
import coachService from "@/services/coach.services";
import schoolService from "@/services/school.services";
import type { ICoach } from "@/types/Coach";
import type { ISchool } from "@/types/School";
import { toast } from "react-toastify";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  X,
  Trash2,
  Pencil,
  Calendar,
  School as SchoolIcon,
  User as UserIcon,
  Lock,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-[13px] text-muted-foreground flex-shrink-0 w-28">{label}</span>
      <span className="text-[13px] font-medium text-foreground text-right">{value ?? "—"}</span>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const hue = (name.charCodeAt(0) * 37 + (name.charCodeAt(1) || 0) * 17) % 360;
  return (
    <span
      className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white shadow-sm"
      style={{ backgroundColor: `hsl(${hue}, 55%, 43%)` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent border-b border-border/40">
          <TableCell className="pl-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded-md animate-pulse" />
            </div>
          </TableCell>
          <TableCell className="pr-5 py-4 text-center"><div className="h-7 w-24 bg-muted rounded-md animate-pulse mx-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Main states
  const [coaches, setCoaches] = useState<ICoach[]>([]);
  const [schools, setSchools] = useState<ISchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals visibility states
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<ICoach | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Selected for Edit/Delete
  const [coachToEdit, setCoachToEdit] = useState<ICoach | null>(null);
  const [coachToDelete, setCoachToDelete] = useState<ICoach | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Load coaches & schools
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coachRes, schoolRes] = await Promise.all([
        coachService.list(),
        schoolService.list({ limit: 1000 }),
      ]);
      setCoaches(coachRes?.data ?? coachRes ?? []);
      setSchools(schoolRes?.data ?? schoolRes ?? []);
    } catch (err: any) {
      setError(err?.message || "Gagal mengambil data pelatih atau sekolah.");
      toast.error("Gagal memuat data dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map school ID to name helper
  const schoolMap = useMemo(() => {
    return new Map(schools.map((s) => [s._id, s.name]));
  }, [schools]);

  // Filtered coaches
  const filteredCoaches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return coaches;
    return coaches.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [coaches, searchQuery]);

  // Toggle school selection helper
  const handleSchoolToggle = (schoolId: string) => {
    setSelectedSchoolIds((prev) =>
      prev.includes(schoolId) ? prev.filter((id) => id !== schoolId) : [...prev, schoolId]
    );
  };

  // Open Detail modal
  const openDetail = (id: string) => {
    setSelectedCoach(null);
    setShowDetail(true);
    setDetailLoading(true);
    coachService
      .get(id)
      .then((res: any) => {
        const data = res?.data ?? (Array.isArray(res) ? res[0] : res);
        setSelectedCoach(data);
      })
      .catch(() => {
        toast.error("Gagal memuat detail pelatih.");
        setShowDetail(false);
      })
      .finally(() => setDetailLoading(false));
  };

  // Open Create Modal
  const openCreate = () => {
    setName("");
    setPassword("");
    setBirthdate("");
    setSelectedSchoolIds([]);
    setFormError(null);
    setShowCreate(true);
  };

  // Open Edit Modal
  const openEdit = (coach: ICoach) => {
    setCoachToEdit(coach);
    setName(coach.name);
    setPassword("");
    if (coach.birthdate) {
      const d = new Date(coach.birthdate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      setBirthdate(`${year}-${month}-${day}`);
    } else {
      setBirthdate("");
    }
    setSelectedSchoolIds(coach.schools || []);
    setFormError(null);
    setShowEdit(true);
  };

  // Open Delete Modal
  const openDelete = (coach: ICoach) => {
    setCoachToDelete(coach);
    setShowDelete(true);
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 6) {
      setFormError("Kata sandi minimal harus 6 karakter");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        password,
        birthdate: new Date("2000-01-01"),
        schoolIds: [schools[0]?._id].filter(Boolean),
      };
      const res = await coachService.create(payload);
      const created = res?.data ?? res;
      if (created) {
        setCoaches((prev) => [created, ...prev]);
        toast.success("Pelatih berhasil ditambahkan.");
        setShowCreate(false);
      }
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan data pelatih.");
      toast.error("Gagal menambahkan pelatih.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!coachToEdit?._id) return;
    if (password.length < 6) {
      setFormError("Kata sandi wajib diisi & minimal harus 6 karakter");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        password,
        birthdate: coachToEdit.birthdate ? new Date(coachToEdit.birthdate) : new Date("2000-01-01"),
        schoolIds: coachToEdit.schools && coachToEdit.schools.length > 0 ? coachToEdit.schools : [schools[0]?._id].filter(Boolean),
      };
      const res = await coachService.update(coachToEdit._id, payload);
      const updated = res?.data ?? res;
      if (updated) {
        setCoaches((prev) =>
          prev.map((c) => (c._id === coachToEdit._id ? updated : c))
        );
        toast.success("Data pelatih berhasil diperbarui.");
        setShowEdit(false);
      }
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan perubahan.");
      toast.error("Gagal memperbarui pelatih.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!coachToDelete?._id) return;
    setSubmitting(true);
    try {
      await coachService.remove(coachToDelete._id);
      setCoaches((prev) => prev.filter((c) => c._id !== coachToDelete._id));
      toast.success("Pelatih berhasil dihapus.");
      setShowDelete(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus data pelatih.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-foreground flex items-center gap-2">
            Pengaturan Pelatih
            <span className="inline-flex h-5 items-center rounded-full bg-violet-100 dark:bg-violet-950/40 px-2.5 text-[10px] font-medium text-violet-600 dark:text-violet-400">
              Sistem
            </span>
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Konfigurasi akun pelatih, penugasan sekolah binaan, dan kredensial sistem
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="gap-2 h-9 px-4 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Pelatih
        </Button>
      </div>

      {/* ── Table Card ── */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40">
          <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
            <UserIcon className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-[14px] font-medium text-foreground">Daftar Akun Pelatih</span>
          {!loading && (
            <span className="ml-auto text-[12px] text-muted-foreground">
              {filteredCoaches.length} pelatih terdaftar
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 px-5 py-3.5 border-b border-border/40 bg-muted/20">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <Input
              placeholder="Cari nama pelatih..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-[13px] bg-background border-border/60 rounded-lg focus-visible:ring-1 focus-visible:ring-violet-500/40"
            />
            {searchQuery && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/40">
                <TableHead className="pl-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[85%]">
                  Nama Pelatih
                </TableHead>
                <TableHead className="pr-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center w-[15%]">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <SkeletonRows />
              ) : filteredCoaches.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={2} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                      <p className="text-[13px] text-muted-foreground">
                        {searchQuery ? "Pelatih tidak ditemukan." : "Belum ada data pelatih."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoaches.map((c) => (
                  <TableRow
                    key={c._id}
                    className="border-b border-border/40 hover:bg-muted/25 transition-colors duration-100"
                  >
                    {/* Coach Name + Initials */}
                    <TableCell className="pl-5 py-3">
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={c.name} />
                        <span className="text-[13.5px] font-medium text-foreground tracking-tight line-clamp-1">
                          {c.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3 pr-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          title="Lihat Detail"
                          onClick={() => openDetail(c._id!)}
                          className="h-7 px-2.5 rounded-md border border-border/60 bg-background text-[12px] text-muted-foreground hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 dark:hover:border-violet-700 dark:hover:text-violet-400 transition-colors"
                        >
                          Lihat
                        </button>
                        <button
                          title="Edit Pelatih"
                          onClick={() => openEdit(c)}
                          className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 dark:hover:border-amber-700 dark:hover:text-amber-400 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Hapus Pelatih"
                          onClick={() => openDelete(c)}
                          className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 dark:hover:bg-destructive/10 dark:hover:border-destructive/90 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Detail Dialog ── */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-sm rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden bg-background">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/40">
            {detailLoading ? (
              <>
                <div className="h-5 w-36 rounded-md bg-muted animate-pulse mb-1" />
                <div className="h-3.5 w-24 rounded-md bg-muted animate-pulse" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  {selectedCoach && <InitialsAvatar name={selectedCoach.name} />}
                  <DialogTitle className="text-[15px] font-semibold tracking-tight">
                    {selectedCoach?.name ?? "Detail Pelatih"}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-[12px] text-muted-foreground pl-11">
                  {selectedCoach ? `ID: ${selectedCoach._id}` : "Tidak ada data"}
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          <div className="px-5 py-4">
            {detailLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-2.5 border-b border-border/40">
                    <div className="h-3.5 w-20 rounded bg-muted animate-pulse" />
                    <div className="h-3.5 w-28 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : selectedCoach ? (
              <div>
                <DetailRow label="Nama Lengkap" value={selectedCoach.name} />
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground text-center py-6">Tidak ada data</p>
            )}
          </div>

          <div className="flex gap-2 px-5 pb-5 pt-1">
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowDetail(false)}
              className="flex-1 h-8 text-[13px] rounded-lg border-border/60"
            >
              Tutup
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowDetail(false);
                if (selectedCoach) openEdit(selectedCoach);
              }}
              className="flex-1 h-8 text-[13px] rounded-lg bg-amber-600 hover:bg-amber-700 text-white gap-1"
            >
              <Pencil className="h-3 w-3" /> Edit
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowDetail(false);
                if (selectedCoach) openDelete(selectedCoach);
              }}
              className="flex-1 h-8 text-[13px] rounded-lg bg-red-600 hover:bg-red-700 text-white gap-1"
            >
              <Trash2 className="h-3 w-3" /> Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Create Dialog ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden bg-background">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <Plus className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <DialogTitle className="text-[15px] font-semibold">Tambah Pelatih Baru</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="px-6 py-5 space-y-4">
            <FormField label="Nama Pelatih">
              <Input
                placeholder="Masukkan nama lengkap pelatih"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
              />
            </FormField>

            <FormField label="Kata Sandi Akun">
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Min. 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-8 pl-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
                />
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              </div>
            </FormField>

            {formError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/8 px-3 py-2 text-[12px] text-red-600 dark:text-red-400">
                <X className="h-3.5 w-3.5 flex-shrink-0" />
                {formError}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
                className="flex-1 h-8 text-[13px] rounded-lg border-border/60"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 h-8 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 text-white"
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden bg-background">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <DialogTitle className="text-[15px] font-semibold">Edit Data Pelatih</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
            <FormField label="Nama Pelatih">
              <Input
                placeholder="Masukkan nama lengkap pelatih"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
              />
            </FormField>

            <FormField label="Kata Sandi Baru (Konfirmasi)">
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Ketik kata sandi (Wajib karena validasi backend)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-8 pl-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
                />
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              </div>
            </FormField>

            {formError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/8 px-3 py-2 text-[12px] text-red-600 dark:text-red-400">
                <X className="h-3.5 w-3.5 flex-shrink-0" />
                {formError}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEdit(false)}
                className="flex-1 h-8 text-[13px] rounded-lg border-border/60"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 h-8 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 text-white"
              >
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-sm rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden bg-background">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-[15px] font-semibold">Hapus Data Pelatih</DialogTitle>
                <DialogDescription className="text-[11.5px] text-muted-foreground">Tindakan ini tidak dapat dibatalkan</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 py-5 text-[13.5px] text-muted-foreground">
            Apakah Anda yakin ingin menghapus data pelatih <strong className="text-foreground">{coachToDelete?.name}</strong>? Akun ini akan dinonaktifkan dari sistem Trisula Sport Club.
          </div>

          <div className="flex gap-3 px-5 pb-5 pt-2 border-t border-border/40 bg-muted/10">
            <Button
              variant="outline"
              onClick={() => setShowDelete(false)}
              className="flex-1 h-8.5 text-[13px] rounded-lg border-border/60"
            >
              Batal
            </Button>
            <Button
              disabled={submitting}
              onClick={handleDeleteConfirm}
              className="flex-1 h-8.5 text-[13px] rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm"
            >
              {submitting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}