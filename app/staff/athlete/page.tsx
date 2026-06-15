"use client";

import React, { useEffect, useState, useMemo } from "react";
import athleteService from "@/services/athlete.services";
import schoolService from "@/services/school.services";
import mediaService from "@/services/media.services";
import type { IAthlete } from "@/types/Athlete";
import type { ISchool } from "@/types/School";
import { useCreateAthleteForm } from "@/hooks/useAthlete";
import { toast } from "react-toastify";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  X,
  Eye,
  Pencil,
  Trash2,
  SlidersHorizontal,
  User,
  Calendar,
  Award,
  School as SchoolIcon,
} from "lucide-react";

// ── Belt Badge Styles ────────────────────────────────────────────────────────
const beltStyles: Record<string, string> = {
  putih:    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  kuning:   "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50",
  biru:     "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
  coklat:   "bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
  merah:    "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-900/50",
  hitam:    "bg-zinc-900 text-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 border-zinc-900 dark:border-zinc-850",
};

function BeltBadge({ belt }: { belt?: string | null }) {
  if (!belt || belt === "-") return <span className="text-muted-foreground text-sm">—</span>;
  const key = belt.toLowerCase();
  const style = beltStyles[key] ?? "bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 border-violet-200 dark:border-violet-900/50";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border", style)}>
      {belt.toUpperCase()}
    </span>
  );
}

// ── Initials Avatar ──────────────────────────────────────────────────────────
function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const hue = ((name.charCodeAt(0) ?? 0) * 47 + (name.charCodeAt(1) ?? 0) * 19) % 360;
  return (
    <span
      className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white shadow-inner"
      style={{ backgroundColor: `hsl(${hue},58%,44%)` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

// ── Profile Avatar ───────────────────────────────────────────────────────────
function ProfileAvatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  if (imageUrl && !hasError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full object-cover ring-1 ring-border shadow-inner"
        onError={() => setHasError(true)}
      />
    );
  }
  return <InitialsAvatar name={name} />;
}

// ── Skeletons ────────────────────────────────────────────────────────────────
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent border-b border-border/40">
          <TableCell className="pl-5 py-4"><div className="h-4 w-40 bg-muted rounded-md animate-pulse" /></TableCell>
          <TableCell className="py-4"><div className="h-4 w-28 bg-muted rounded-md animate-pulse" /></TableCell>
          <TableCell className="py-4"><div className="h-4 w-20 bg-muted rounded-md animate-pulse" /></TableCell>
          <TableCell className="py-4"><div className="h-4 w-16 bg-muted rounded-md animate-pulse" /></TableCell>
          <TableCell className="pr-5 py-4 text-center"><div className="h-7 w-24 bg-muted rounded-md animate-pulse mx-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ── UI Helper FormField ───────────────────────────────────────────────────────
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

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-[13px] text-muted-foreground flex-shrink-0 w-24">{label}</span>
      <span className="text-[13px] font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────
const PAGE_SIZE = 10;

export default function StaffAthletePage() {
  // Lists state
  const [athletes, setAthletes] = useState<IAthlete[]>([]);
  const [schools, setSchools] = useState<ISchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBeltFilter, setSelectedBeltFilter] = useState("all");
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<IAthlete | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Form states (Create)
  const { form: createForm, onSubmit: onCreateSubmit, isPending: isCreatePending } = useCreateAthleteForm(() => {
    setCreateOpen(false);
    setNewImagePreview("");
    loadData();
  });
  const [newImagePreview, setNewImagePreview] = useState("");

  // Form states (Edit)
  const [editName, setEditName] = useState("");
  const [editBirthdate, setEditBirthdate] = useState("");
  const [editBelt, setEditBelt] = useState("");
  const [editSchoolId, setEditSchoolId] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImagePreview, setEditImagePreview] = useState("");

  // Create school map for O(1) resolutions
  const schoolMap = useMemo(() => {
    const map = new Map<string, string>();
    schools.forEach((s) => map.set(s._id, s.name));
    return map;
  }, [schools]);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [athleteRes, schoolRes] = await Promise.all([
        athleteService.list({ limit: 1000 }),
        schoolService.list({ limit: 1000 }),
      ]);
      setAthletes(athleteRes?.data ?? athleteRes ?? []);
      setSchools(schoolRes?.data ?? schoolRes ?? []);
    } catch (err: any) {
      setError(err?.message || "Gagal mengambil data atlet atau sekolah.");
      toast.error("Gagal memuat data dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered and Sorted Athletes List
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = [...athletes];

    // Search query matching name, belt, or associated school name
    if (q) {
      result = result.filter((a) => {
        const matchesName = (a.name || "").toLowerCase().includes(q);
        const matchesBelt = (a.belt || "").toLowerCase().includes(q);
        const matchesSchools = (a.schools || []).some((schId) => {
          const schName = schoolMap.get(schId) || "";
          return schName.toLowerCase().includes(q);
        });
        return matchesName || matchesBelt || matchesSchools;
      });
    }

    // Filter by Belt
    if (selectedBeltFilter !== "all") {
      result = result.filter((a) => (a.belt || "").toLowerCase() === selectedBeltFilter.toLowerCase());
    }

    // Filter by School
    if (selectedSchoolFilter !== "all") {
      result = result.filter((a) => (a.schools || []).includes(selectedSchoolFilter));
    }

    // Sort A-Z/Z-A by Name
    result.sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    return result;
  }, [athletes, searchQuery, selectedBeltFilter, selectedSchoolFilter, sortOrder, schoolMap]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBeltFilter, selectedSchoolFilter, sortOrder]);

  // Paginated Data
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  // Open detail dialog
  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelectedAthlete(null);
    setDetailOpen(true);
    try {
      const res = await athleteService.get(id);
      const data = res?.data ?? res;
      setSelectedAthlete(data);
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengambil detail atlet");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Open edit dialog
  const openEdit = (athlete: IAthlete) => {
    setSelectedAthlete(athlete);
    setEditName(athlete.name);
    setEditBirthdate(athlete.birthdate ? athlete.birthdate.split("T")[0] : "");
    setEditBelt((athlete.belt || "putih").toLowerCase());
    setEditSchoolId(athlete.schools?.[0] || "");
    setEditImageUrl(athlete.imageUrl || "");
    setEditImagePreview(athlete.imageUrl || "");
    setEditOpen(true);
  };

  // Open delete confirmation dialog
  const triggerDelete = (athlete: IAthlete) => {
    setSelectedAthlete(athlete);
    setDeleteOpen(true);
  };

  // Handle Image Upload
  const handleImageUpload = async (file: File, isEdit: boolean) => {
    setImageUploading(true);
    try {
      const res = await mediaService.uploadSingle(file);
      const uploadedUrl = res?.data?.url ?? res?.url;
      if (uploadedUrl) {
        if (isEdit) {
          setEditImageUrl(uploadedUrl);
        } else {
          createForm.setValue("imageUrl", uploadedUrl);
        }
        toast.success("Foto berhasil diunggah!");
      } else {
        toast.error("Gagal mengunggah foto.");
        if (isEdit) {
          setEditImagePreview(editImageUrl || "");
        } else {
          setNewImagePreview("");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengunggah foto.");
      if (isEdit) {
        setEditImagePreview(editImageUrl || "");
      } else {
        setNewImagePreview("");
      }
    } finally {
      setImageUploading(false);
    }
  };

  // Handle Submit Update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete?._id) return;
    if (!editSchoolId) {
      toast.warn("Harap pilih sekolah.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: editName.trim(),
        birthdate: new Date(editBirthdate).toISOString(),
        belt: editBelt.toLowerCase(),
        schoolIds: [editSchoolId],
        imageUrl: editImageUrl || undefined,
      };

      const res = await athleteService.update(selectedAthlete._id, payload);
      const updated = res?.data ?? res;

      if (updated) {
        setAthletes((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
        toast.success("Data atlet berhasil diperbarui.");
        setEditOpen(false);
      }
    } catch (err: any) {
      setError(err?.message || "Gagal memperbarui atlet");
      toast.error(err?.message || "Gagal memperbarui atlet.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Athlete
  const handleDelete = async () => {
    if (!selectedAthlete?._id) return;
    setSubmitting(true);
    try {
      await athleteService.remove(selectedAthlete._id);
      setAthletes((prev) => prev.filter((a) => a._id !== selectedAthlete._id));
      toast.success("Atlet berhasil dihapus.");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus atlet.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-foreground">
            Kelola Atlet
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Daftar, cari, dan kelola data atlet Trisula Sport Club
          </p>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 h-9 px-4 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Atlet
        </Button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/8 px-4 py-3 text-[13px] text-red-600 dark:text-red-400">
          <span className="flex-1">{error}</span>
          <button className="opacity-60 hover:opacity-100" onClick={() => setError(null)}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Table Card ── */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40">
          <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
            <User className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-[14px] font-medium text-foreground">Daftar Atlet</span>
          {!loading && (
            <span className="ml-auto text-[12px] text-muted-foreground">
              {filteredData.length} atlet
            </span>
          )}
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 px-5 py-3.5 border-b border-border/40 bg-muted/20">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <Input
              placeholder="Cari nama, sabuk, atau sekolah..."
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

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">Filter:</span>
            </div>

            {/* School Filter */}
            <select
              value={selectedSchoolFilter}
              onChange={(e) => setSelectedSchoolFilter(e.target.value)}
              className="h-8 rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[12.5px] text-foreground focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500 max-w-[150px] outline-none"
            >
              <option value="all">Semua Sekolah</option>
              {schools.map((sch) => (
                <option key={sch._id} value={sch._id}>
                  {sch.name}
                </option>
              ))}
            </select>

            {/* Belt Filter */}
            <select
              value={selectedBeltFilter}
              onChange={(e) => setSelectedBeltFilter(e.target.value)}
              className="h-8 rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[12.5px] text-foreground focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500 outline-none"
            >
              <option value="all">Semua Sabuk</option>
              <option value="putih">Putih</option>
              <option value="kuning">Kuning</option>
              <option value="biru">Biru</option>
              <option value="coklat">Coklat</option>
              <option value="merah">Merah</option>
              <option value="hitam">Hitam</option>
            </select>

            {/* Sort Toggle */}
            <div className="flex items-center gap-1 border border-border/60 rounded-lg p-0.5 bg-background">
              <button
                onClick={() => setSortOrder("asc")}
                className={cn(
                  "h-[26px] px-2.5 text-[12px] rounded-md transition-colors font-medium",
                  sortOrder === "asc"
                    ? "bg-violet-600 text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                A–Z
              </button>
              <button
                onClick={() => setSortOrder("desc")}
                className={cn(
                  "h-[26px] px-2.5 text-[12px] rounded-md transition-colors font-medium",
                  sortOrder === "desc"
                    ? "bg-violet-600 text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Z–A
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/40">
                <TableHead className="pl-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[35%]">
                  Nama Atlet
                </TableHead>
                <TableHead className="py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[20%]">
                  Tanggal Lahir
                </TableHead>
                <TableHead className="py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[20%]">
                  Sekolah
                </TableHead>
                <TableHead className="py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[15%]">
                  Sabuk
                </TableHead>
                <TableHead className="pr-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center w-[10%]">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <SkeletonRows />
              ) : filteredData.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                      <p className="text-[13px] text-muted-foreground">
                        {searchQuery || selectedBeltFilter !== "all" || selectedSchoolFilter !== "all"
                          ? "Atlet tidak ditemukan."
                          : "Belum ada data atlet."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((athlete) => (
                  <TableRow
                    key={athlete._id}
                    className="border-b border-border/40 hover:bg-muted/25 transition-colors duration-100"
                  >
                    {/* Avatar + Name */}
                    <TableCell className="pl-5 py-3">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar name={athlete.name} imageUrl={athlete.imageUrl} />
                        <span className="text-[13.5px] font-medium text-foreground">
                          {athlete.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Birthdate */}
                    <TableCell className="text-[13px] text-muted-foreground py-3">
                      {athlete.birthdate
                        ? new Date(athlete.birthdate).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>

                    {/* School Name */}
                    <TableCell className="py-3 text-[13px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <SchoolIcon className="h-3.5 w-3.5 text-muted-foreground/75 flex-shrink-0" />
                        <span className="font-medium truncate max-w-[170px]" title={schoolMap.get(athlete.schools?.[0]) || athlete.schools?.[0] || "—"}>
                          {schoolMap.get(athlete.schools?.[0]) || athlete.schools?.[0] || "—"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Belt badge */}
                    <TableCell className="py-3">
                      <BeltBadge belt={athlete.belt} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3 pr-5">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Detail */}
                        <button
                          title="Lihat Detail"
                          onClick={() => openDetail(athlete._id)}
                          className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 dark:hover:border-violet-700 dark:hover:text-violet-400 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit */}
                        {/* <button
                          title="Ubah Data"
                          onClick={() => openEdit(athlete)}
                          className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button> */}

                        {/* Delete */}
                        {/* <button
                          title="Hapus Atlet"
                          onClick={() => triggerDelete(athlete)}
                          className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 dark:hover:bg-destructive/10 dark:hover:border-destructive/90 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredData.length}
          pageSize={PAGE_SIZE}
        />
      </div>

      {/* ── Create Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden bg-background">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                <Plus className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <DialogTitle className="text-[15px] font-semibold">Tambah Atlet Baru</DialogTitle>
                <DialogDescription className="text-[11.5px] text-muted-foreground">Masukkan profil dan data kepelatihan atlet</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={onCreateSubmit} className="px-6 py-5 space-y-4">
            <FormField label="Nama Lengkap">
              <Input
                placeholder="Masukkan nama lengkap atlet"
                {...createForm.register("name")}
                className={`h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40 ${
                  createForm.formState.errors.name ? "border-red-500" : ""
                }`}
              />
              {createForm.formState.errors.name && (
                <span className="text-[11px] text-red-500">{createForm.formState.errors.name.message}</span>
              )}
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tanggal Lahir">
                <Input
                  type="date"
                  {...createForm.register("birthdate")}
                  max={new Date().toISOString().split("T")[0]}
                  className={`h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40 ${
                    createForm.formState.errors.birthdate ? "border-red-500" : ""
                  }`}
                />
                {createForm.formState.errors.birthdate && (
                  <span className="text-[11px] text-red-500">{createForm.formState.errors.birthdate.message}</span>
                )}
              </FormField>

              <FormField label="Warna Sabuk">
                <select
                  {...createForm.register("belt")}
                  className={`h-8 w-full rounded-lg border border-border/60 bg-background px-3 text-[13px] text-foreground focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500 outline-none ${
                    createForm.formState.errors.belt ? "border-red-500" : ""
                  }`}
                >
                  <option value="putih">Putih</option>
                  <option value="kuning">Kuning</option>
                  <option value="hijau">Hijau</option>
                  <option value="biru">Biru</option>
                  <option value="coklat">Coklat</option>
                  <option value="hitam">Hitam</option>
                </select>
              </FormField>
            </div>

            {/* School Dropdown Select */}
            <FormField label="Sekolah">
              <select
                className={`h-8 w-full rounded-lg border border-border/60 bg-background px-3 text-[13px] text-foreground focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500 outline-none ${
                  createForm.formState.errors.schools ? "border-red-500" : ""
                }`}
                onChange={(e) => {
                  createForm.setValue("schools", e.target.value ? [e.target.value] : []);
                }}
                value={(createForm.watch("schools") || [])[0] || ""}
              >
                <option value="">Pilih Sekolah</option>
                {schools.map((sch) => (
                  <option key={sch._id} value={sch._id}>
                    {sch.name}
                  </option>
                ))}
              </select>
              {createForm.formState.errors.schools && (
                <span className="text-[11px] text-red-500">{createForm.formState.errors.schools.message}</span>
              )}
            </FormField>

            {/* Interactive Image Upload */}
            <FormField label="Foto Profil (JPG, PNG, WEBP)">
              <div className="flex items-center gap-4 p-3 border border-border/60 rounded-lg bg-background shadow-inner">
                {newImagePreview || createForm.watch("imageUrl") ? (
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden ring-1 ring-border group flex-shrink-0">
                    <img src={newImagePreview || createForm.watch("imageUrl") || ""} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        createForm.setValue("imageUrl", "");
                        setNewImagePreview("");
                      }}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                        handleImageUpload(file, false);
                      }
                    }}
                    disabled={imageUploading}
                    className="hidden"
                    id="create-image-upload"
                  />
                  <label
                    htmlFor="create-image-upload"
                    className={cn(
                      "inline-flex h-7 px-3 items-center justify-center rounded-md border border-border/60 text-[11.5px] font-medium bg-background hover:bg-muted cursor-pointer transition-colors w-full sm:w-auto text-center justify-center",
                      imageUploading && "opacity-50 pointer-events-none"
                    )}
                  >
                    {imageUploading ? "Mengunggah..." : "Pilih File"}
                  </label>
                  <p className="text-[10px] text-muted-foreground mt-1">Maks. 2MB (JPEG, PNG, WEBP)</p>
                </div>
              </div>
            </FormField>

            <div className="flex gap-3 pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="flex-1 h-8.5 text-[13px] rounded-lg border-border/60"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isCreatePending || imageUploading}
                className="flex-1 h-8.5 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 text-white"
              >
                {isCreatePending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden bg-background">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                <Pencil className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-[15px] font-semibold">Ubah Profil Atlet</DialogTitle>
                <DialogDescription className="text-[11.5px] text-muted-foreground">Perbarui informasi atlet</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="px-6 py-5 space-y-4">
            <FormField label="Nama Lengkap">
              <Input
                placeholder="Masukkan nama lengkap atlet"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tanggal Lahir">
                <Input
                  type="date"
                  value={editBirthdate}
                  onChange={(e) => setEditBirthdate(e.target.value)}
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className="h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
                />
              </FormField>

              <FormField label="Warna Sabuk">
                <select
                  value={editBelt}
                  onChange={(e) => setEditBelt(e.target.value)}
                  required
                  className="h-8 w-full rounded-lg border border-border/60 bg-background px-3 text-[13px] text-foreground focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500 outline-none"
                >
                  <option value="putih">Putih</option>
                  <option value="kuning">Kuning</option>
                  <option value="biru">Biru</option>
                  <option value="coklat">Coklat</option>
                  <option value="merah">Merah</option>
                  <option value="hitam">Hitam</option>
                </select>
              </FormField>
            </div>

            {/* School Dropdown Select */}
            <FormField label="Sekolah">
              <select
                value={editSchoolId}
                onChange={(e) => setEditSchoolId(e.target.value)}
                required
                className="h-8 w-full rounded-lg border border-border/60 bg-background px-3 text-[13px] text-foreground focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500 outline-none"
              >
                <option value="">Pilih Sekolah</option>
                {schools.map((sch) => (
                  <option key={sch._id} value={sch._id}>
                    {sch.name}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Interactive Image Upload */}
            <FormField label="Foto Profil (JPG, PNG, WEBP)">
              <div className="flex items-center gap-4 p-3 border border-border/60 rounded-lg bg-background shadow-inner">
                {editImagePreview || editImageUrl ? (
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden ring-1 ring-border group flex-shrink-0">
                    <img src={editImagePreview || editImageUrl} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setEditImageUrl("");
                        setEditImagePreview("");
                      }}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                        handleImageUpload(file, true);
                      }
                    }}
                    disabled={imageUploading}
                    className="hidden"
                    id="edit-image-upload"
                  />
                  <label
                    htmlFor="edit-image-upload"
                    className={cn(
                      "inline-flex h-7 px-3 items-center justify-center rounded-md border border-border/60 text-[11.5px] font-medium bg-background hover:bg-muted cursor-pointer transition-colors w-full sm:w-auto text-center justify-center",
                      imageUploading && "opacity-50 pointer-events-none"
                    )}
                  >
                    {imageUploading ? "Mengunggah..." : "Pilih File"}
                  </label>
                  <p className="text-[10px] text-muted-foreground mt-1">Maks. 2MB (JPEG, PNG, WEBP)</p>
                </div>
              </div>
            </FormField>

            <div className="flex gap-3 pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="flex-1 h-8.5 text-[13px] rounded-lg border-border/60"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting || imageUploading}
                className="flex-1 h-8.5 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 text-white"
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden bg-background">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/40">
            {detailLoading ? (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-40 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ) : selectedAthlete ? (
              <div className="flex items-center gap-3">
                <ProfileAvatar name={selectedAthlete.name} imageUrl={selectedAthlete.imageUrl} />
                <div>
                  <DialogTitle className="text-[15px] font-semibold tracking-tight">
                    {selectedAthlete.name}
                  </DialogTitle>
                  <DialogDescription className="text-[11.5px] text-muted-foreground">
                    ID: {selectedAthlete._id}
                  </DialogDescription>
                </div>
              </div>
            ) : (
              <DialogTitle className="text-[15px] font-semibold">Detail Atlet</DialogTitle>
            )}
          </DialogHeader>

          <div className="px-5 py-4">
            {detailLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-2.5 border-b border-border/40">
                    <div className="h-3.5 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-3.5 w-28 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : selectedAthlete ? (
              <div className="space-y-0.5">
                <DetailRow label="Nama Lengkap" value={selectedAthlete.name} />
                <DetailRow
                  label="Tanggal Lahir"
                  value={
                    selectedAthlete.birthdate
                      ? new Date(selectedAthlete.birthdate).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"
                  }
                />
                <DetailRow
                  label="Sabuk"
                  value={<BeltBadge belt={selectedAthlete.belt} />}
                />
                <DetailRow
                  label="Sekolah Terdaftar"
                  value={
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-violet-600 dark:text-violet-400">
                      <SchoolIcon className="h-3 w-3" />
                      {schoolMap.get(selectedAthlete.schools?.[0]) || selectedAthlete.schools?.[0] || "—"}
                    </span>
                  }
                />
                {selectedAthlete.imageUrl && (
                  <div className="pt-3 pb-1 flex justify-center">
                    <img
                      src={selectedAthlete.imageUrl}
                      alt={selectedAthlete.name}
                      className="h-24 w-24 rounded-lg object-cover ring-2 ring-violet-500/20 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground text-center py-6">
                Tidak ada data
              </p>
            )}
          </div>

          <div className="px-5 pb-5 pt-1">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-full h-8 text-[13px] rounded-lg border-border/60"
              >
                Tutup
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden bg-background">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-[15px] font-semibold">Konfirmasi Hapus Atlet</DialogTitle>
                <DialogDescription className="text-[11.5px] text-muted-foreground">Tindakan ini tidak dapat dibatalkan</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 py-5 text-[13.5px] text-muted-foreground">
            Apakah Anda yakin ingin menghapus atlet <strong className="text-foreground">{selectedAthlete?.name}</strong>? Data profil dan kepelatihan atlet ini akan dihapus dari sistem.
          </div>

          <div className="flex gap-3 px-5 pb-5 pt-2 border-t border-border/40 bg-muted/10">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="flex-1 h-8.5 text-[13px] rounded-lg border-border/60"
            >
              Batal
            </Button>
            <Button
              disabled={submitting}
              onClick={handleDelete}
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
