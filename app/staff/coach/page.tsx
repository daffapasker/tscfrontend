"use client";

import React, { useState, useMemo } from "react";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  useCoaches,
  useCoachDetail,
  useCreateCoachForm,
  useUpdateCoach,
  useDeleteCoach,
  useSchoolMap,
} from "@/hooks/useCoach";
import type { ICoach } from "@/types/Coach";
import type { ISchool } from "@/types/School";

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
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  X,
  Eye,
  Trash2,
  Pencil,
  Calendar,
  School as SchoolIcon,
  User as UserIcon,
  Lock,
  EyeOff,
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
          <TableCell className="py-4"><div className="h-4 w-28 bg-muted rounded-md animate-pulse" /></TableCell>
          <TableCell className="py-4"><div className="h-4 w-36 bg-muted rounded-md animate-pulse" /></TableCell>
          <TableCell className="pr-5 py-4 text-center"><div className="h-7 w-24 bg-muted rounded-md animate-pulse mx-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

const PAGE_SIZE = 10;

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CoachPage() {
  // ── TanStack React Query hooks ──
  const { data: coaches = [], isLoading: loading } = useCoaches();
  const { schools, schoolMap } = useSchoolMap();
  const updateCoach = useUpdateCoach();
  const deleteCoach = useDeleteCoach();

  // ── Local UI states ──
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals visibility states
  const [showDetail, setShowDetail] = useState(false);
  const [detailCoachId, setDetailCoachId] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Selected for Edit/Delete
  const [coachToEdit, setCoachToEdit] = useState<ICoach | null>(null);
  const [coachToDelete, setCoachToDelete] = useState<ICoach | null>(null);

  // Form states (for Edit)
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { form: createForm, onSubmit: onCreateSubmit, isPending: isCreatePending } = useCreateCoachForm(() => setShowCreate(false));

  // ── Detail query (enabled only when detailCoachId is set) ──
  const { data: selectedCoach = null, isLoading: detailLoading } = useCoachDetail(detailCoachId);

  // Filtered coaches
  const filteredCoaches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return coaches;
    return coaches.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [coaches, searchQuery]);

  // Paginated coaches
  const totalPages = Math.max(1, Math.ceil(filteredCoaches.length / PAGE_SIZE));
  const paginatedCoaches = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCoaches.slice(start, start + PAGE_SIZE);
  }, [filteredCoaches, currentPage]);

  // Reset page when search changes
  React.useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  // Toggle school selection helper
  const handleSchoolToggle = (schoolId: string) => {
    setSelectedSchoolIds((prev) =>
      prev.includes(schoolId) ? prev.filter((id) => id !== schoolId) : [...prev, schoolId]
    );
  };

  // Submitting state derived from mutations
  const submitting = updateCoach.isPending || deleteCoach.isPending;

  // Open Detail modal
  const openDetail = (id: string) => {
    setDetailCoachId(id);
    setShowDetail(true);
  };

  // Open Create Modal
  const openCreate = () => {
    createForm.reset();
    // createForm.setValue("password", "pelatih123");
    setShowCreate(true);
  };

  // Open Edit Modal
  const openEdit = (coach: ICoach) => {
    setCoachToEdit(coach);
    setName(coach.name);
    setPassword(""); // password not sent from API, user must enter password to confirm/update
    // format date for date input (YYYY-MM-DD)
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

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!coachToEdit?._id) return;

    if (selectedSchoolIds.length === 0) {
      setFormError("Pilih minimal satu sekolah binaan");
      return;
    }

    if (password && password.length < 6) {
      setFormError("Kata sandi minimal harus 6 karakter");
      return;
    }

    const payload: any = {
      name: name.trim(),
      birthdate: new Date(birthdate),
      schoolIds: selectedSchoolIds,
    };

    if (password.trim()) {
      payload.password = password;
    }

    updateCoach.mutate(
      {
        id: coachToEdit._id,
        payload,
      },
      {
        onSuccess: () => {
          setShowEdit(false);
        },
        onError: (err: any) => {
          setFormError(err?.message || "Gagal menyimpan perubahan.");
        },
      }
    );
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!coachToDelete?._id) return;

    deleteCoach.mutate(coachToDelete._id, {
      onSuccess: () => {
        setShowDelete(false);
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-foreground flex items-center gap-2">
            Kelola Pelatih
            <span className="inline-flex h-5 items-center rounded-full bg-violet-100 dark:bg-violet-950/40 px-2.5 text-[10px] font-medium text-violet-600 dark:text-violet-400">
              Pengurus
            </span>
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Daftar, cari, tambah, edit, dan kelola data pelatih Trisula Sport Club
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
          <span className="text-[14px] font-medium text-foreground">Daftar Pelatih Aktif</span>
          {!loading && (
            <span className="ml-auto text-[12px] text-muted-foreground">
              {filteredCoaches.length} pelatih
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
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
                <TableHead className="pl-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[35%]">
                  Nama Pelatih
                </TableHead>
                <TableHead className="py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[20%]">
                  Tanggal Lahir
                </TableHead>
                <TableHead className="py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[30%]">
                  Sekolah Binaan
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
                  <TableCell colSpan={4} className="py-16 text-center">
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
                paginatedCoaches.map((c) => (
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

                    {/* Birthdate */}
                    <TableCell className="py-3 text-[13px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
                        {c.birthdate
                          ? new Date(c.birthdate).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          : "—"}
                      </div>
                    </TableCell>

                    {/* Schools Binaan badged */}
                    <TableCell className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {(c.schools || []).map((id) => (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium border bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 border-violet-200 dark:border-violet-900/50"
                          >
                            <SchoolIcon className="h-2.5 w-2.5" />
                            {schoolMap.get(id) || "Sekolah"}
                          </span>
                        ))}
                        {(c.schools || []).length === 0 && (
                          <span className="text-muted-foreground/60 text-xs italic">—</span>
                        )}
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

        {/* Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredCoaches.length}
          pageSize={PAGE_SIZE}
        />
      </div>

      {/* ── Detail Dialog ── */}
      <Dialog open={showDetail} onOpenChange={(open) => { setShowDetail(open); if (!open) setDetailCoachId(null); }}>
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
                <DetailRow
                  label="Tanggal Lahir"
                  value={
                    selectedCoach.birthdate
                      ? new Date(selectedCoach.birthdate).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                      : "—"
                  }
                />
                <DetailRow
                  label="Sekolah Binaan"
                  value={
                    <div className="flex flex-col items-end gap-1.5">
                      {(selectedCoach.schools || []).map((id) => (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 border-violet-200 dark:border-violet-900/50"
                        >
                          {schoolMap.get(id) || "Sekolah"}
                        </span>
                      ))}
                      {(selectedCoach.schools || []).length === 0 && (
                        <span className="text-muted-foreground/60 text-xs italic">—</span>
                      )}
                    </div>
                  }
                />
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

          <form onSubmit={onCreateSubmit} className="px-6 py-5 space-y-4">
            <FormField label="Nama Pelatih">
              <Input
                placeholder="Masukkan nama lengkap pelatih"
                {...createForm.register("name")}
                className={`h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40 ${createForm.formState.errors.name ? "border-red-500" : ""
                  }`}
              />
              {createForm.formState.errors.name && (
                <span className="text-[11px] text-red-500">{createForm.formState.errors.name.message}</span>
              )}
            </FormField>

            <FormField label="Kata Sandi">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  {...createForm.register("password")}
                  className={`h-8 text-[13px] rounded-lg border-border/60 pr-8 focus-visible:ring-1 focus-visible:ring-violet-500/40 ${createForm.formState.errors.password ? "border-red-500" : ""
                    }`}
                />
                <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />

                {/* Icon mata */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {createForm.formState.errors.password && (
                <span className="text-[11px] text-red-500">{createForm.formState.errors.password.message}</span>
              )}
            </FormField>

            <FormField label="Tanggal Lahir">
              <Input
                type="date"
                {...createForm.register("birthdate")}
                className={`h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40 ${createForm.formState.errors.birthdate ? "border-red-500" : ""
                  }`}
              />
              {createForm.formState.errors.birthdate && (
                <span className="text-[11px] text-red-500">{createForm.formState.errors.birthdate.message}</span>
              )}
            </FormField>

            {/* School selection */}
            <FormField label="Sekolah Binaan (Pilih Sekolah)">
              <div className="border border-border/60 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-muted/5">
                {schools.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Tidak ada sekolah terdaftar</p>
                ) : (
                  schools.map((sch) => {
                    const selectedIds = createForm.watch("schoolIds") || [];
                    const isChecked = selectedIds.includes(sch._id!);

                    return (
                      <label
                        key={sch._id}
                        className="flex items-center gap-2.5 text-[13px] text-foreground cursor-pointer hover:bg-muted/10 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              createForm.setValue("schoolIds", [...selectedIds, sch._id!]);
                            } else {
                              createForm.setValue("schoolIds", selectedIds.filter((id: string) => id !== sch._id!));
                            }
                          }}
                          className="rounded border-border/60 text-violet-600 focus:ring-violet-500/40"
                        />
                        <span>{sch.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
              {createForm.formState.errors.schoolIds && (
                <span className="text-[11px] text-red-500">{createForm.formState.errors.schoolIds.message}</span>
              )}
            </FormField>

            <div className="flex items-center gap-2 pt-3 mt-4 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
                disabled={isCreatePending}
                className="flex-1 h-8 text-[13px] rounded-lg border-border/60"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isCreatePending || (createForm.watch("schoolIds")?.length || 0) === 0}
                className="flex-1 h-8 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-all"
              >
                {isCreatePending ? "Menyimpan..." : "Simpan Pelatih"}
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

                  className="h-8 pl-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
                />
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              </div>
            </FormField>

            <FormField label="Tanggal Lahir">
              <Input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                required
                className="h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
              />
            </FormField>

            {/* School selection */}
            <FormField label="Sekolah Binaan (Pilih Sekolah)">
              <div className="border border-border/60 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-muted/5">
                {schools.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Tidak ada sekolah terdaftar</p>
                ) : (
                  schools.map((sch) => (
                    <label
                      key={sch._id}
                      className="flex items-center gap-2.5 text-[13px] text-foreground cursor-pointer hover:bg-muted/10 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSchoolIds.includes(sch._id!)}
                        onChange={() => handleSchoolToggle(sch._id!)}
                        className="rounded border-border/60 text-violet-600 focus:ring-violet-500/40"
                      />
                      <span>{sch.name}</span>
                    </label>
                  ))
                )}
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
