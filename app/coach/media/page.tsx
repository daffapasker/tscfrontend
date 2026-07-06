"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  useMediaList,
  useCreateMediaForm,
  useUpdateMedia,
  useDeleteMedia,
} from "@/hooks/useMedia";
import { useAthletes } from "@/hooks/useAthlete";
import { useSchools } from "@/hooks/useSchool";
import type { IMedia } from "@/types/Media";
import type { IAthlete } from "@/types/Athlete";
import type { ISchool } from "@/types/School";
import { toast } from "react-toastify";
import mediaService from "@/services/media.services";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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
  Trash2,
  Pencil,
  SlidersHorizontal,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  School as SchoolIcon,
  User as UserIcon,
  ExternalLink,
  Calendar,
  Sparkles,
} from "lucide-react";

// Helper to determine file icon/preview
function MediaPreview({ url }: { url: string }) {
  const isPdf = url.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    return (
      <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 flex items-center justify-center flex-shrink-0">
        <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>
    );
  }

  return (
    <div className="h-10 w-10 rounded-lg overflow-hidden border border-border/60 bg-muted flex items-center justify-center flex-shrink-0 shadow-sm">
      <img
        src={url}
        alt="Thumbnail"
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <ImageIcon className="h-4 w-4 text-muted-foreground/60 absolute" />
    </div>
  );
}

// Skeletons
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent border-b border-border/40">
          <TableCell className="pl-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-40 bg-muted rounded-md animate-pulse" />
                <div className="h-3 w-20 bg-muted rounded-md animate-pulse" />
              </div>
            </div>
          </TableCell>
          <TableCell className="py-4"><div className="h-4 w-28 bg-muted rounded-md animate-pulse" /></TableCell>
          <TableCell className="py-4"><div className="h-4 w-32 bg-muted rounded-md animate-pulse" /></TableCell>
          <TableCell className="py-4"><div className="h-4 w-24 bg-muted rounded-md animate-pulse" /></TableCell>
          <TableCell className="pr-5 py-4 text-center"><div className="h-7 w-20 bg-muted rounded-md animate-pulse mx-auto" /></TableCell>
        </TableRow>
      ))}
    </>
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

export default function CoachMediaPage() {
  // Main lists states
  const { data: mediaList = [], isLoading: loading } = useMediaList();
  const { data: athletes = [] } = useAthletes({ limit: 1000 }, { useCoach: true });
  const { data: schools = [] } = useSchools({ limit: 1000 });

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeTab, setSelectedTypeTab] = useState<"all" | "sertifikat" | "latihan">("all");
  const [selectedAthleteFilter, setSelectedAthleteFilter] = useState("all");
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("all");

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<IMedia | null>(null);
  const [fileUploading, setFileUploading] = useState(false);

  const { form: createForm, onSubmit: onCreateSubmit, isPending: isCreatePending } = useCreateMediaForm(() => {
    setCreateOpen(false);
  });
  const updateMedia = useUpdateMedia();
  const deleteMedia = useDeleteMedia();

  // Form states (Edit)
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<"sertifikat" | "latihan">("sertifikat");
  const [editAthleteId, setEditAthleteId] = useState("");
  const [editSchoolId, setEditSchoolId] = useState("");
  const [editUploadedUrl, setEditUploadedUrl] = useState("");
  const [editUploadedFileId, setEditUploadedFileId] = useState("");



  // Filtered & Sorted Media List
  const filteredData = useMemo(() => {
    let result = [...mediaList];
    const q = searchQuery.trim().toLowerCase();

    // Text search
    if (q) {
      result = result.filter((m) => (m.title || "").toLowerCase().includes(q));
    }

    // Category / Tab filter
    if (selectedTypeTab !== "all") {
      result = result.filter((m) => m.type === selectedTypeTab);
    }

    // Athlete filter
    if (selectedAthleteFilter !== "all") {
      result = result.filter((m) => m.athlete?._id === selectedAthleteFilter);
    }

    // School filter
    if (selectedSchoolFilter !== "all") {
      result = result.filter((m) => m.school?._id === selectedSchoolFilter);
    }

    return result;
  }, [mediaList, searchQuery, selectedTypeTab, selectedAthleteFilter, selectedSchoolFilter]);

  // Handle file upload
  const handleFileUpload = async (file: File, isEdit: boolean = false) => {
    setFileUploading(true);
    try {
      const res = await mediaService.uploadSingle(file);
      const url = res?.data?.url ?? res?.url;
      const fileId = res?.data?.fileId ?? res?.fileId;

      if (url && fileId) {
        if (isEdit) {
          setEditUploadedUrl(url);
          setEditUploadedFileId(fileId);
        } else {
          createForm.setValue("url", url);
          createForm.setValue("fileId", fileId);
        }
        toast.success("Berkas berhasil diunggah!");
      } else {
        toast.error("Format respons pengunggahan tidak valid.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengunggah berkas.");
    } finally {
      setFileUploading(false);
    }
  };

  // Open edit dialog
  const openEdit = (media: IMedia) => {
    setSelectedMedia(media);
    setEditTitle(media.title);
    setEditType(media.type);
    setEditAthleteId(media.athlete?._id || "");
    setEditSchoolId(media.school?._id || "");
    setEditUploadedUrl(media.url || "");
    setEditUploadedFileId(media.fileId || "");
    setEditOpen(true);
  };

  // Submit Edit Media Record
  const handleEditMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia?._id) return;
    if (!editUploadedUrl || !editUploadedFileId) {
      toast.warn("Harap unggah berkas terlebih dahulu.");
      return;
    }
    if (editType === "latihan" && !editSchoolId) {
      toast.warn("Harap pilih sekolah untuk gambar latihan.");
      return;
    }

    updateMedia.mutate(
      {
        id: selectedMedia._id,
        payload: {
          title: editTitle.trim(),
          type: editType,
          url: editUploadedUrl,
          fileId: editUploadedFileId,
          athleteId: editType === "sertifikat" && editAthleteId ? editAthleteId : undefined,
          schoolId: editType === "latihan" ? editSchoolId : undefined,
        },
      },
      {
        onSuccess: () => {
          setEditOpen(false);
        },
      }
    );
  };

  // Trigger delete verification dialog
  const triggerDelete = (media: IMedia) => {
    setSelectedMedia(media);
    setDeleteOpen(true);
  };

  // Handle Delete Media
  const handleDeleteMedia = async () => {
    if (!selectedMedia?._id) return;
    deleteMedia.mutate(selectedMedia._id, {
      onSuccess: () => setDeleteOpen(false),
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-foreground flex items-center gap-2">
            Kelola Media
            <span className="inline-flex h-5 items-center rounded-full bg-violet-100 dark:bg-violet-950/40 px-2.5 text-[10px] font-medium text-violet-600 dark:text-violet-400">
              Pelatih
            </span>
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Daftar, cari, dan unggah berkas sertifikat atlet atau gambar latihan sekolah
          </p>
        </div>

        <Button
          onClick={() => {
            createForm.reset();
            setCreateOpen(true);
          }}
          className="gap-2 h-9 px-4 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Media
        </Button>
      </div>

      {/* ── Tabs Filter ── */}
      <div className="flex items-center gap-1 bg-muted/30 dark:bg-muted/15 border border-border/40 p-1 rounded-xl w-fit">
        <button
          onClick={() => setSelectedTypeTab("all")}
          className={cn(
            "px-4 py-1.5 text-[12.5px] rounded-lg font-medium transition-all duration-150",
            selectedTypeTab === "all"
              ? "bg-background text-foreground border border-border/40 shadow-sm font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Semua Berkas
        </button>
        <button
          onClick={() => setSelectedTypeTab("sertifikat")}
          className={cn(
            "px-4 py-1.5 text-[12.5px] rounded-lg font-medium transition-all duration-150",
            selectedTypeTab === "sertifikat"
              ? "bg-background text-foreground border border-border/40 shadow-sm font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Sertifikat Atlet
        </button>
        <button
          onClick={() => setSelectedTypeTab("latihan")}
          className={cn(
            "px-4 py-1.5 text-[12.5px] rounded-lg font-medium transition-all duration-150",
            selectedTypeTab === "latihan"
              ? "bg-background text-foreground border border-border/40 shadow-sm font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Gambar Latihan
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40">
          <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
            <FolderOpen className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-[14px] font-medium text-foreground">Daftar Berkas</span>
          {!loading && (
            <span className="ml-auto text-[12px] text-muted-foreground">
              {filteredData.length} berkas
            </span>
          )}
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 px-5 py-3.5 border-b border-border/40 bg-muted/20">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <Input
              placeholder="Cari judul media..."
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

          {/* Additional filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">Filter:</span>
            </div>

            {/* School Filter (Visible only when filtering training images or all) */}
            {selectedTypeTab !== "sertifikat" && (
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
            )}

            {/* Athlete Filter (Visible only when filtering certificates or all) */}
            {selectedTypeTab !== "latihan" && (
              <select
                value={selectedAthleteFilter}
                onChange={(e) => setSelectedAthleteFilter(e.target.value)}
                className="h-8 rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[12.5px] text-foreground focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500 max-w-[150px] outline-none"
              >
                <option value="all">Semua Atlet</option>
                {athletes.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/40">
                <TableHead className="pl-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[35%]">
                  Judul Berkas / Media
                </TableHead>
                <TableHead className="py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[15%]">
                  Kategori
                </TableHead>
                <TableHead className="py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[25%]">
                  Terkait (Sekolah / Atlet)
                </TableHead>
                <TableHead className="py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[15%]">
                  Tanggal Unggah
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
                        <FolderOpen className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                      <p className="text-[13px] text-muted-foreground">
                        {searchQuery || selectedTypeTab !== "all" || selectedAthleteFilter !== "all" || selectedSchoolFilter !== "all"
                          ? "Media tidak ditemukan."
                          : "Belum ada berkas media terunggah."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((media) => (
                  <TableRow
                    key={media._id}
                    className="border-b border-border/40 hover:bg-muted/25 transition-colors duration-100"
                  >
                    {/* Media Title + Preview */}
                    <TableCell className="pl-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <MediaPreview url={media.url} />
                        <span className="text-[13.5px] font-medium text-foreground tracking-tight line-clamp-1">
                          {media.title}
                        </span>
                      </div>
                    </TableCell>

                    {/* Kategori Badge */}
                    <TableCell className="py-3.5 text-[13px]">
                      {media.type === "sertifikat" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/50">
                          <FileText className="h-3 w-3" />
                          Sertifikat
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50">
                          <ImageIcon className="h-3 w-3" />
                          Latihan
                        </span>
                      )}
                    </TableCell>

                    {/* Related Entity */}
                    <TableCell className="py-3.5 text-[13px] text-muted-foreground">
                      {media.type === "sertifikat" ? (
                        media.athlete ? (
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <UserIcon className="h-3.5 w-3.5 text-muted-foreground/75 flex-shrink-0" />
                            <span className="truncate max-w-[170px]" title={media.athlete.name}>
                              {media.athlete.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 font-light italic">— (Umum)</span>
                        )
                      ) : media.school ? (
                        <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-medium">
                          <SchoolIcon className="h-3.5 w-3.5 text-muted-foreground/75 flex-shrink-0" />
                          <span className="truncate max-w-[170px]" title={media.school.name}>
                            {media.school.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 font-light italic">—</span>
                      )}
                    </TableCell>

                    {/* Upload Date */}
                    <TableCell className="text-[13px] text-muted-foreground py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
                        {media.createdAt
                          ? new Date(media.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3.5 pr-5">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Open URL */}
                        <a
                          href={media.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Buka Berkas"
                          className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 dark:hover:border-violet-700 dark:hover:text-violet-400 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>

                        {/* Edit Button */}
                        <button
                          title="Ubah Media"
                          onClick={() => openEdit(media)}
                          className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 dark:hover:border-amber-700 dark:hover:text-amber-400 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          title="Hapus Media"
                          onClick={() => triggerDelete(media)}
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

      {/* ── Create Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden bg-background">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                <Plus className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <DialogTitle className="text-[15px] font-semibold">Unggah Berkas Baru</DialogTitle>
                <DialogDescription className="text-[11.5px] text-muted-foreground">
                  Simpan sertifikat atlet atau dokumentasi foto latihan sekolah
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={onCreateSubmit} className="px-6 py-5 space-y-4">
            {/* Title field */}
            <FormField label="Nama / Judul Berkas">
              <Input
                placeholder="Masukkan judul berkas (contoh: Sertifikat Kejurda U-17)"
                {...createForm.register("title")}
                className={`h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40 ${
                  createForm.formState.errors.title ? "border-red-500" : ""
                }`}
              />
              {createForm.formState.errors.title && (
                <span className="text-[11px] text-red-500">{createForm.formState.errors.title.message}</span>
              )}
            </FormField>

            {/* Media Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Kategori Berkas">
                <select
                  {...createForm.register("type")}
                  onChange={(e) => {
                    const val = e.target.value as "sertifikat" | "latihan";
                    createForm.setValue("type", val);
                    createForm.setValue("athleteId", "");
                    createForm.setValue("schoolId", "");
                  }}
                  className={`h-8 w-full rounded-lg border border-border/60 bg-background px-3 text-[13px] text-foreground focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500 outline-none ${
                    createForm.formState.errors.type ? "border-red-500" : ""
                  }`}
                >
                  <option value="sertifikat">Sertifikat Atlet</option>
                  <option value="latihan">Gambar Latihan</option>
                </select>
                {createForm.formState.errors.type && (
                  <span className="text-[11px] text-red-500">{createForm.formState.errors.type.message}</span>
                )}
              </FormField>

              {/* Conditional dropdowns based on media type */}
              {createForm.watch("type") === "sertifikat" ? (
                <FormField label="Untuk Atlet (Opsional)">
                  <select
                    {...createForm.register("athleteId")}
                    className="h-8 w-full rounded-lg border border-border/60 bg-background px-3 text-[13px] text-foreground focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500 outline-none"
                  >
                    <option value="">Pilih Atlet (Bisa dikosongkan)</option>
                    {athletes.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              ) : (
                <FormField label="Untuk Sekolah (Wajib)">
                  <select
                    {...createForm.register("schoolId")}
                    className={`h-8 w-full rounded-lg border border-border/60 bg-background px-3 text-[13px] text-foreground focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500 outline-none ${
                      createForm.formState.errors.schoolId ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Pilih Sekolah</option>
                    {schools.map((sch) => (
                      <option key={sch._id} value={sch._id}>
                        {sch.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}
            </div>

            {/* Premium Upload Container */}
            <FormField label="Pilih & Unggah File">
              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-border/80 hover:border-violet-400 rounded-xl bg-muted/15 hover:bg-muted/20 transition-all duration-150 relative">
                {createForm.watch("url") ? (
                  <div className="flex items-center gap-3 w-full p-2 bg-background border border-border/60 rounded-lg relative group">
                    <MediaPreview url={createForm.watch("url")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-foreground truncate">{createForm.watch("title") || "Berkas Terunggah"}</p>
                      <p className="text-[10px] text-violet-600 dark:text-violet-400 truncate">Unggah berhasil</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        createForm.setValue("url", "");
                        createForm.setValue("fileId", "");
                      }}
                      className="h-6 w-6 rounded-md bg-muted hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-muted-foreground transition-all flex-shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="h-10 w-10 rounded-full bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-2">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <p className="text-[11.5px] font-semibold text-foreground">Satu klik untuk mengunggah</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">JPEG, PNG, WEBP, atau PDF (Maks. 2MB)</p>

                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      disabled={fileUploading}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </>
                )}

                {/* Progress blocker */}
                {fileUploading && (
                  <div className="absolute inset-0 bg-background/80 rounded-xl flex flex-col items-center justify-center gap-2 z-10">
                    <div className="h-5 w-5 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
                    <span className="text-[11px] font-medium text-violet-600 dark:text-violet-400">Mengunggah ke server...</span>
                  </div>
                )}
              </div>
              {createForm.formState.errors.url && (
                <span className="text-[11px] text-red-500">{createForm.formState.errors.url.message}</span>
              )}
            </FormField>

            {/* Action buttons */}
            <div className="flex gap-3 pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={isCreatePending || fileUploading}
                className="flex-1 h-8.5 text-[13px] rounded-lg border-border/60"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isCreatePending || fileUploading}
                className="flex-1 h-8.5 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
              >
                {isCreatePending ? "Menyimpan..." : "Simpan Berkas"}
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
              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <DialogTitle className="text-[15px] font-semibold">Ubah Berkas Media</DialogTitle>
                <DialogDescription className="text-[11.5px] text-muted-foreground">
                  Ubah informasi berkas sertifikat atlet atau dokumentasi latihan sekolah
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleEditMedia} className="px-6 py-5 space-y-4">
            {/* Title field */}
            <FormField label="Nama / Judul Berkas">
              <Input
                placeholder="Masukkan judul berkas (contoh: Sertifikat Kejurda U-17)"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
              />
            </FormField>

            {/* Media Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Kategori Berkas">
                <select
                  value={editType}
                  onChange={(e) => {
                    const val = e.target.value as "sertifikat" | "latihan";
                    setEditType(val);
                    setEditAthleteId("");
                    setEditSchoolId("");
                  }}
                  required
                  className="h-8 w-full rounded-lg border border-border/60 bg-background px-3 text-[13px] text-foreground focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500 outline-none"
                >
                  <option value="sertifikat">Sertifikat Atlet</option>
                  <option value="latihan">Gambar Latihan</option>
                </select>
              </FormField>

              {/* Conditional dropdowns based on media type */}
              {editType === "sertifikat" ? (
                <FormField label="Untuk Atlet (Opsional)">
                  <select
                    value={editAthleteId}
                    onChange={(e) => setEditAthleteId(e.target.value)}
                    className="h-8 w-full rounded-lg border border-border/60 bg-background px-3 text-[13px] text-foreground focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500 outline-none"
                  >
                    <option value="">Pilih Atlet (Bisa dikosongkan)</option>
                    {athletes.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              ) : (
                <FormField label="Untuk Sekolah (Wajib)">
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
              )}
            </div>

            {/* Premium Upload Container */}
            <FormField label="Ganti File (Opsional)">
              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-border/80 hover:border-violet-400 rounded-xl bg-muted/15 hover:bg-muted/20 transition-all duration-150 relative">
                {editUploadedUrl ? (
                  <div className="flex items-center gap-3 w-full p-2 bg-background border border-border/60 rounded-lg relative group">
                    <MediaPreview url={editUploadedUrl} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-foreground truncate">{editTitle || "Berkas Terunggah"}</p>
                      <p className="text-[10px] text-violet-600 dark:text-violet-400 truncate">Unggah berhasil</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditUploadedUrl("");
                        setEditUploadedFileId("");
                      }}
                      className="h-6 w-6 rounded-md bg-muted hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-muted-foreground transition-all flex-shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="h-10 w-10 rounded-full bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-2">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <p className="text-[11.5px] font-semibold text-foreground">Satu klik untuk mengunggah berkas baru</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">JPEG, PNG, WEBP, atau PDF (Maks. 2MB)</p>

                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, true);
                      }}
                      disabled={fileUploading}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </>
                )}

                {/* Progress blocker */}
                {fileUploading && (
                  <div className="absolute inset-0 bg-background/80 rounded-xl flex flex-col items-center justify-center gap-2 z-10">
                    <div className="h-5 w-5 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
                    <span className="text-[11px] font-medium text-violet-600 dark:text-violet-400">Mengunggah ke server...</span>
                  </div>
                )}
              </div>
            </FormField>

            {/* Action buttons */}
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
                disabled={updateMedia.isPending || fileUploading}
                className="flex-1 h-8.5 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 text-white"
              >
                {updateMedia.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
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
                <DialogTitle className="text-[15px] font-semibold">Hapus Berkas Media</DialogTitle>
                <DialogDescription className="text-[11.5px] text-muted-foreground">Tindakan ini tidak dapat dibatalkan</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 py-5 text-[13.5px] text-muted-foreground">
            Apakah Anda yakin ingin menghapus berkas <strong className="text-foreground">{selectedMedia?.title}</strong>? File ini akan dihapus secara permanen dari server penyimpanan awan.
          </div>

          <div className="flex gap-3 px-5 pb-5 pt-2 border-t border-border/40 bg-muted/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="flex-1 h-8.5 text-[13px] rounded-lg border-border/60"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMedia.isPending}
              onClick={handleDeleteMedia}
              className="flex-1 h-8.5 text-[13px] rounded-lg bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMedia.isPending ? "Menghapus..." : "Ya, Hapus Permanen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
