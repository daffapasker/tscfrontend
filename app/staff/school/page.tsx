"use client";

import React, { useState, useMemo } from "react";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  useSchools,
  useSchoolDetail,
  useCreateSchoolForm,
  useUpdateSchool,
  useDeleteSchool,
} from "@/hooks/useSchool";
import { ISchool, ICreateSchool } from "@/types/School";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Eye, School, ArrowUpDown, Search, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function SchoolAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const hue = ((name.charCodeAt(0) ?? 0) * 41 + (name.charCodeAt(1) ?? 0) * 13) % 360;
  return (
    <span
      className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold text-white"
      style={{ backgroundColor: `hsl(${hue},50%,46%)` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-[13px] text-muted-foreground flex-shrink-0 w-24">{label}</span>
      <span className="text-[13px] font-medium text-foreground text-right">{value ?? "—"}</span>
    </div>
  );
}

function SkeletonRows({ cols = 3 }: { cols?: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}>
              <div
                className="h-4 rounded-md bg-muted animate-pulse"
                style={{ width: j === 0 ? "55%" : j === cols - 1 ? "64px" : "45%" }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const PAGE_SIZE = 10;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SchoolPage() {
  // ── TanStack React Query hooks ──
  const { data: schools = [], isLoading: loading } = useSchools({ limit: 1000 });
  const updateSchool = useUpdateSchool();
  const deleteSchool = useDeleteSchool();

  // ── Local UI states ──
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Delete dialog
  const [showDelete, setShowDelete] = useState(false);
  const [deleteSelected, setDeleteSelected] = useState<ISchool | null>(null);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSchoolId, setDetailSchoolId] = useState<string | null>(null);
  const { data: detailSchool = null, isLoading: detailLoading } = useSchoolDetail(detailSchoolId);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<ISchool | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Create form
  const { form: createForm, fields, append, remove, onSubmit: onCreateSubmit, isPending: isCreatePending } = useCreateSchoolForm(() => {
    setShowForm(false);
  });

  const filteredData = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    let list = Array.isArray(schools) ? [...schools] : [];
    if (q) {
      list = list.filter((s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.address || "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const an = (a.name || "").toLowerCase();
      const bn = (b.name || "").toLowerCase();
      return sortOrder === "asc" ? an.localeCompare(bn) : bn.localeCompare(an);
    });
    return list;
  }, [schools, searchQuery, sortOrder]);

  // Paginated data
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  // Reset page when filters change
  React.useEffect(() => { setCurrentPage(1); }, [searchQuery, sortOrder]);

  const submitting = updateSchool.isPending;

  return (
    <div className="p-6 space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-foreground">
            Data Sekolah
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Kelola data sekolah anggota Trisula Sport Club
          </p>
        </div>

        <Button
          onClick={() => setShowForm(true)}
          className="gap-2 h-9 px-4 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Sekolah
        </Button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/8 px-4 py-3 text-[13px] text-red-600 dark:text-red-400">
          <X className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button className="ml-auto opacity-60 hover:opacity-100" onClick={() => setError(null)}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Table card ── */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">

        {/* Card top bar */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40">
          <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
            <School className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-[14px] font-medium text-foreground">Daftar Sekolah</span>
          {!loading && (
            <span className="ml-auto text-[12px] text-muted-foreground">
              {filteredData.length} sekolah
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3 border-b border-border/40 bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <Input
              placeholder="Cari nama atau alamat..."
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

          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-muted-foreground mr-1">Urut:</span>
            <button
              onClick={() => setSortOrder("asc")}
              className={cn(
                "h-7 px-3 text-[12px] rounded-md border transition-colors",
                sortOrder === "asc"
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              A–Z
            </button>
            <button
              onClick={() => setSortOrder("desc")}
              className={cn(
                "h-7 px-3 text-[12px] rounded-md border transition-colors",
                sortOrder === "desc"
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              Z–A
            </button>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/40">
              <TableHead className="pl-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Nama Sekolah
              </TableHead>
              <TableHead className="py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Alamat
              </TableHead>
              <TableHead className="py-3 pr-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center w-[120px]">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <SkeletonRows cols={3} />
            ) : filteredData.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <School className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <p className="text-[13px] text-muted-foreground">
                      {searchQuery ? "Sekolah tidak ditemukan." : "Belum ada data sekolah."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((school) => (
                <TableRow
                  key={school._id}
                  className="border-b border-border/40 hover:bg-muted/25 transition-colors duration-100"
                >
                  <TableCell className="pl-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <SchoolAvatar name={school.name} />
                      <span className="text-[13.5px] font-medium text-foreground">
                        {school.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-[13px] text-muted-foreground">
                    {school.address || "—"}
                  </TableCell>

                  <TableCell className="py-3 pr-5">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Detail */}
                      <button
                        title="Lihat detail"
                        onClick={() => {
                          setDetailSchoolId(school._id);
                          setDetailOpen(true);
                        }}
                        className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 dark:hover:border-violet-700 dark:hover:text-violet-400 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        title="Ubah data"
                        onClick={() => {
                          setSelectedSchool(school);
                          setEditName(school.name || "");
                          setEditAddress(school.address || "");
                          setEditOpen(true);
                        }}
                        className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        title="Hapus data"
                        onClick={() => {
                          setDeleteSelected(school);
                          setShowDelete(true);
                        }}
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

        {/* Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredData.length}
          pageSize={PAGE_SIZE}
        />
      </div>

      {/* ── Create Modal ── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <Plus className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <DialogTitle className="text-[15px] font-semibold">Tambah Sekolah</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={onCreateSubmit} className="px-6 py-5 space-y-4">
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className={cn(
                    "rounded-xl border border-border/50 p-4 space-y-3",
                    fields.length > 1 && "bg-muted/20"
                  )}
                >
                  {fields.length > 1 && (
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-muted-foreground">
                        Sekolah {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Nama Sekolah">
                      <Input
                        placeholder="Masukkan nama sekolah"
                        {...createForm.register(`schools.${idx}.name`)}
                        className={`h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40 ${
                          createForm.formState.errors.schools?.[idx]?.name ? "border-red-500" : ""
                        }`}
                      />
                      {createForm.formState.errors.schools?.[idx]?.name && (
                        <span className="text-[11px] text-red-500">{createForm.formState.errors.schools?.[idx]?.name?.message}</span>
                      )}
                    </FormField>
                    <FormField label="Alamat">
                      <Input
                        placeholder="Masukkan alamat"
                        {...createForm.register(`schools.${idx}.address`)}
                        className={`h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40 ${
                          createForm.formState.errors.schools?.[idx]?.address ? "border-red-500" : ""
                        }`}
                      />
                      {createForm.formState.errors.schools?.[idx]?.address && (
                        <span className="text-[11px] text-red-500">{createForm.formState.errors.schools?.[idx]?.address?.message}</span>
                      )}
                    </FormField>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => append({ name: "", address: "", phone: "", email: "" })}
              className="flex items-center gap-1.5 text-[13px] text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Baris
            </button>
            {createForm.formState.errors.schools?.root && (
              <p className="text-[11px] text-red-500">{createForm.formState.errors.schools.root.message}</p>
            )}

            <div className="flex gap-2 pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={isCreatePending}
                className="flex-1 h-8 text-[13px] rounded-lg border-border/60"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isCreatePending}
                className="flex-1 h-8 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
              >
                {isCreatePending ? "Menyimpan..." : "Simpan Sekolah"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ── */}
      <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setDetailSchoolId(null); }}>
        <DialogContent className="sm:max-w-sm rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/40">
            {detailLoading ? (
              <>
                <div className="h-5 w-36 rounded-md bg-muted animate-pulse mb-1" />
                <div className="h-3.5 w-24 rounded-md bg-muted animate-pulse" />
              </>
            ) : (
              <div className="flex items-center gap-3">
                {detailSchool && <SchoolAvatar name={detailSchool.name} />}
                <DialogTitle className="text-[15px] font-semibold tracking-tight">
                  {detailSchool?.name ?? "Detail Sekolah"}
                </DialogTitle>
              </div>
            )}
          </DialogHeader>

          <div className="px-5 py-4">
            {detailLoading ? (
              <div className="space-y-1">
                {[1, 2].map((i) => (
                  <div key={i} className="flex justify-between py-2.5 border-b border-border/40">
                    <div className="h-3.5 w-16 rounded bg-muted animate-pulse" />
                    <div className="h-3.5 w-28 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <DetailRow label="Nama" value={detailSchool?.name} />
                <DetailRow label="Alamat" value={detailSchool?.address} />
              </>
            )}
          </div>

          <div className="px-5 pb-5 pt-1">
            <Button
              variant="outline"
              onClick={() => setDetailOpen(false)}
              className="w-full h-8 text-[13px] rounded-lg border-border/60"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Pencil className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <DialogTitle className="text-[15px] font-semibold">Ubah Sekolah</DialogTitle>
            </div>
          </DialogHeader>

          <form
            className="px-5 py-5 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedSchool?._id) return;
              setError(null);
              if (!editAddress || typeof editAddress !== "string") {
                setError("Alamat sekolah wajib diisi");
                return;
              }

              updateSchool.mutate(
                {
                  id: selectedSchool._id,
                  payload: { name: editName, address: editAddress },
                },
                {
                  onSuccess: () => {
                    setEditOpen(false);
                    setSelectedSchool(null);
                    setEditName("");
                    setEditAddress("");
                  },
                  onError: (err: any) => {
                    setError(err?.message || "Gagal memperbarui sekolah");
                  },
                }
              );
            }}
          >
            <FormField label="Nama Sekolah">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
              />
            </FormField>

            <FormField label="Alamat">
              <Input
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
              />
            </FormField>

            <div className="flex gap-2 pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="flex-1 h-8 text-[13px] rounded-lg border-border/60"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={updateSchool.isPending}
                className="flex-1 h-8 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 text-white"
              >
                {updateSchool.isPending ? "Menyimpan..." : "Simpan"}
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
                <DialogTitle className="text-[15px] font-semibold">Hapus Data Sekolah</DialogTitle>
                <DialogDescription className="text-[11.5px] text-muted-foreground">Tindakan ini tidak dapat dibatalkan</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 py-5 text-[13.5px] text-muted-foreground">
            Apakah Anda yakin ingin menghapus <strong className="text-foreground">{deleteSelected?.name}</strong>?
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
              disabled={deleteSchool.isPending}
              onClick={() => {
                if (!deleteSelected?._id) return;
                deleteSchool.mutate(deleteSelected._id, {
                  onSuccess: () => {
                    setShowDelete(false);
                  },
                });
              }}
              className="flex-1 h-8.5 text-[13px] rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm"
            >
              {deleteSchool.isPending ? "Menghapus..." : "Ya, Hapus Permanen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}