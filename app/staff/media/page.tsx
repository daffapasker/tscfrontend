"use client";

import React, { useState, useMemo } from "react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useMediaList } from "@/hooks/useMedia";
import { useAthletes } from "@/hooks/useAthlete";
import { useSchools } from "@/hooks/useSchool";
import type { IMedia } from "@/types/Media";
import type { IAthlete } from "@/types/Athlete";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Search,
  X,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  School as SchoolIcon,
  User as UserIcon,
  ExternalLink,
  Calendar,
  SlidersHorizontal,
  Download,
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

// Skeletons for table rows
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

export default function StaffMediaPage() {
  // ── TanStack React Query hooks ──
  const { data: mediaList = [], isLoading: loading } = useMediaList();
  const { data: athletes = [] } = useAthletes({ limit: 1000 });
  const { data: schools = [] } = useSchools({ limit: 1000 });

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeTab, setSelectedTypeTab] = useState<"all" | "sertifikat" | "latihan">("all");
  const [selectedAthleteFilter, setSelectedAthleteFilter] = useState("all");
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

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

  // Paginated data
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  // Reset page when filters change
  React.useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedTypeTab, selectedAthleteFilter, selectedSchoolFilter]);

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Gagal mengambil data file.");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      
      // Determine file extension from URL or fallback to jpeg
      const extension = url.split(".").pop()?.split(/[?#]/)[0] || "jpeg";
      link.download = `${title.replace(/[/\\?%*:|"<>]/g, "-")}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("File berhasil diunduh.");
    } catch (err) {
      console.error("Gagal mendownload file, membuka di tab baru:", err);
      // Fallback: open in new tab
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
      toast.info("Membuka file di tab baru untuk diunduh.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-foreground flex items-center gap-2">
            Lihat Media
            <span className="inline-flex h-5 items-center rounded-full bg-blue-100 dark:bg-blue-950/40 px-2.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
              Pengurus
            </span>
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Daftar, cari, dan tinjau berkas sertifikat atlet atau gambar latihan sekolah yang diunggah oleh Pelatih
          </p>
        </div>
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
          <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
            <FolderOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
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
              className="pl-8 h-8 text-[13px] bg-background border-border/60 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500/40"
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
                className="h-8 rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[12.5px] text-foreground focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500 max-w-[150px] outline-none"
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
                className="h-8 rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[12.5px] text-foreground focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500 max-w-[150px] outline-none"
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
                paginatedData.map((media) => (
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

                     {/* Actions (Only ExternalLink / View File and Download) */}
                    <TableCell className="py-3.5 pr-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={media.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Buka Berkas"
                          className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 dark:hover:border-blue-700 dark:hover:text-blue-400 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => handleDownload(media.url, media.title)}
                          title="Unduh Berkas"
                          className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
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
          totalItems={filteredData.length}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}
