"use client"

import React, { useState, useMemo, useEffect } from "react";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  useFinances,
  useFinanceDetail,
  useCreateFinanceForm,
  useUpdateFinance,
  useDeleteFinance,
} from "@/hooks/useFinance";
import type { IFinance } from "@/types/Finance";

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
import { Plus, TrendingUp, TrendingDown, Wallet, X, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const isIncome = type === "income";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium",
        isIncome
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
      )}
    >
      {isIncome
        ? <TrendingUp className="h-3 w-3" />
        : <TrendingDown className="h-3 w-3" />}
      {isIncome ? "Pemasukan" : "Pengeluaran"}
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          {[80, 110, 160, 80, 64].map((w, j) => (
            <TableCell key={j}>
              <div className="h-4 rounded-md bg-muted animate-pulse" style={{ width: w }} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function formatIDR(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
}

// ── Summary card ─────────────────────────────────────────────────────────────

function SummaryCards({ items }: { items: IFinance[] }) {
  const income = items
    .filter((f) => f.type === "income")
    .reduce((s, f) => s + Number(f.balance), 0);
  const expense = items
    .filter((f) => f.type === "expense")
    .reduce((s, f) => s + Number(f.balance), 0);
  const net = income - expense;

  const cards = [
    {
      label: "Total Pemasukan",
      value: formatIDR(income),
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
    },
    {
      label: "Total Pengeluaran",
      value: formatIDR(expense),
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/40",
    },
    {
      label: "Saldo Bersih",
      value: formatIDR(net),
      icon: Wallet,
      color: net >= 0 ? "text-violet-600 dark:text-violet-400" : "text-red-600 dark:text-red-400",
      bg: "bg-violet-100 dark:bg-violet-900/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-3 shadow-sm"
        >
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0", c.bg)}>
            <c.icon className={cn("h-4 w-4", c.color)} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{c.label}</p>
            <p className={cn("text-[15px] font-semibold truncate", c.color)}>{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const PAGE_SIZE = 10;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FinancePage() {
  // ── TanStack React Query hooks ──
  const { data: items = [], isLoading: loading } = useFinances({ limit: 1000 });
  const { form: createForm, onSubmit: onCreateSubmit, isPending: isCreatePending } = useCreateFinanceForm(() => {
    setShowCreate(false);
  });
  const updateFinance = useUpdateFinance();
  const deleteFinance = useDeleteFinance();
  const [showAll, setShowAll] = useState(false);

  // ── Detail dialog ──
  const [open, setOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const { data: selected = null, isLoading: detailLoading } = useFinanceDetail(detailId);

  // ── Create dialog ──
  const [showCreate, setShowCreate] = useState(false);

  // ── Edit dialog ──
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [editType, setEditType] = useState<"income" | "expense">("income");
  const [editBalance, setEditBalance] = useState<string>("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // ── Delete dialog ──
  const [showDelete, setShowDelete] = useState(false);
  const [deleteSelected, setDeleteSelected] = useState<IFinance | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const [yearStr, monthStr] = selectedPeriod.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const filteredItems = useMemo(() => {
    if (showAll) return items;

    return items.filter((f) => {
      if (!f.date) return false;

      const d = new Date(f.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [items, year, month, showAll]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPeriod, showAll]);

  // Paginated items
  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const submitting = updateFinance.isPending || deleteFinance.isPending;

  const openDetail = (id: string) => {
    setDetailId(id);
    setOpen(true);
  };

  const openEdit = (finance: IFinance) => {
    setEditId(finance._id || "");
    setEditType(finance.type as "income" | "expense");
    setEditBalance(finance.balance.toString());
    setEditDescription(finance.description || "");
    if (finance.date) {
      const d = new Date(finance.date);
      setEditDate(d.toISOString().split("T")[0]);
    } else {
      setEditDate(new Date().toISOString().split("T")[0]);
    }
    setEditFormError(null);
    setShowEdit(true);
  };

  const openDelete = (finance: IFinance) => {
    setDeleteSelected(finance);
    setShowDelete(true);
  };

  const exportToPdf = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();

      const bulan = new Date(year, month - 1).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });

      const income = filteredItems
        .filter((f) => f.type === "income")
        .reduce((s, f) => s + Number(f.balance), 0);

      const expense = filteredItems
        .filter((f) => f.type === "expense")
        .reduce((s, f) => s + Number(f.balance), 0);

      const net = income - expense;

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Trisula Sport Club", 14, 20);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Laporan Keuangan", 14, 28);
      doc.text(`Periode: ${bulan}`, 14, 34);

      // Summary
      doc.text(`Pemasukan: ${income}`, 14, 45);
      doc.text(`Pengeluaran: ${expense}`, 14, 52);
      doc.text(`Saldo: ${net}`, 14, 59);

      // Table
      const tableData = filteredItems.map((f) => [
        f.type === "income" ? "Pemasukan" : "Pengeluaran",
        f.balance,
        f.description || "-",
        f.date
          ? new Date(f.date).toLocaleDateString("id-ID")
          : "-",
      ]);

      autoTable(doc, {
        startY: 70,
        head: [["Tipe", "Jumlah", "Deskripsi", "Tanggal"]],
        body: tableData,
      });

      doc.save(`Laporan_Keuangan_${selectedPeriod}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Gagal export PDF");
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Title */}
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-foreground">Keuangan</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {!loading && `${filteredItems.length} transaksi tercatat`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

          {/* Row 1: Period picker + toggle */}
          <div className="flex items-center gap-2">
            {showAll ? (
              <div className="flex-1 text-[13px] text-muted-foreground px-3 py-2 border rounded-lg sm:flex-none sm:w-auto whitespace-nowrap">
                Menampilkan: Semua Data
              </div>
            ) : (
              <Input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="flex-1 h-9 text-[13px] rounded-lg border-border/60 sm:w-[160px]"
              />
            )}
            <Button
              size="sm"
              variant={showAll ? "default" : "outline"}
              onClick={() => setShowAll(!showAll)}
              className="h-9 px-4 text-[13px] flex-shrink-0"
            >
              {showAll ? "Per Bulan" : "Semua Data"}
            </Button>
          </div>

          {/* Row 2: Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                createForm.reset();
                createForm.setValue("date", new Date());
                setShowCreate(true);
              }}
              className="flex-1 sm:flex-none gap-2 h-9 px-4 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={exportToPdf}
              disabled={showAll}
              className={cn(
                "flex-1 sm:flex-none h-9 px-4 text-[13px] rounded-lg border-border/60 gap-2",
                showAll && "opacity-50 cursor-not-allowed"
              )}
            >
              Export PDF
            </Button>
          </div>

        </div>

      </div>

      {/* ── Summary cards ── */}
      {!loading && filteredItems.length > 0 && <SummaryCards items={filteredItems} />}

      {/* ── Table card ── */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">

        {/* Card top bar */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40">
          <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
            <Wallet className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-[14px] font-medium text-foreground">Riwayat Transaksi</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/40">
              <TableHead className="pl-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Tipe
              </TableHead>
              <TableHead className="py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Jumlah
              </TableHead>
              <TableHead className="py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Deskripsi
              </TableHead>
              <TableHead className="py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Tanggal
              </TableHead>
              <TableHead className="py-3 pr-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center w-[100px]">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <SkeletonRows />
            ) : filteredItems.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <p className="text-[13px] text-muted-foreground">Tidak ada data keuangan.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((f) => (
                <TableRow
                  key={f._id}
                  className="border-b border-border/40 hover:bg-muted/25 transition-colors duration-100"
                >
                  <TableCell className="pl-5 py-3">
                    <TypeBadge type={f.type} />
                  </TableCell>

                  <TableCell className="py-3">
                    <span className={cn(
                      "text-[13.5px] font-semibold tabular-nums",
                      f.type === "income"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    )}>
                      {f.type === "expense" ? "−" : "+"}
                      {formatIDR(Number(f.balance))}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 text-[13px] text-muted-foreground max-w-[220px] truncate">
                    {f.description ?? "—"}
                  </TableCell>

                  <TableCell className="py-3 text-[13px] text-muted-foreground">
                    {f.date
                      ? new Date(f.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      : "—"}
                  </TableCell>

                  <TableCell className="py-3 pr-5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        title="Detail Transaksi"
                        onClick={() => openDetail(f._id!)}
                        className="h-7 px-2.5 rounded-md border border-border/60 bg-background text-[12px] text-muted-foreground hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 dark:hover:border-violet-700 dark:hover:text-violet-400 transition-colors"
                      >
                        Detail
                      </button>
                      <button
                        title="Edit Transaksi"
                        onClick={() => openEdit(f)}
                        className="h-7 w-7 rounded-md border border-border/60 bg-background flex items-center justify-center text-muted-foreground hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 dark:hover:border-amber-700 dark:hover:text-amber-400 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Hapus Transaksi"
                        onClick={() => openDelete(f)}
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
          totalItems={filteredItems.length}
          pageSize={PAGE_SIZE}
        />
      </div>

      {/* ── Detail Dialog ── */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setDetailId(null); }}>
        <DialogContent className="sm:max-w-sm rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/40">
            {detailLoading ? (
              <>
                <div className="h-5 w-32 rounded-md bg-muted animate-pulse mb-1" />
                <div className="h-3.5 w-24 rounded-md bg-muted animate-pulse" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2.5 mb-1">
                  {selected && (
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      selected.type === "income"
                        ? "bg-emerald-100 dark:bg-emerald-900/40"
                        : "bg-red-100 dark:bg-red-900/40"
                    )}>
                      {selected.type === "income"
                        ? <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        : <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
                    </div>
                  )}
                  <DialogTitle className="text-[15px] font-semibold tracking-tight">
                    {selected?.type === "income" ? "Pemasukan" : selected?.type === "expense" ? "Pengeluaran" : "Detail Keuangan"}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-[12px] text-muted-foreground pl-[42px]">
                  {selected ? `ID: ${selected._id}` : "Tidak ada data"}
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          <div className="px-5 py-4">
            {detailLoading ? (
              <div className="space-y-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between py-2.5 border-b border-border/40">
                    <div className="h-3.5 w-16 rounded bg-muted animate-pulse" />
                    <div className="h-3.5 w-28 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : selected ? (
              <>
                <DetailRow label="Tipe" value={<TypeBadge type={selected.type} />} />
                <DetailRow
                  label="Jumlah"
                  value={
                    <span className={cn(
                      "font-semibold tabular-nums",
                      selected.type === "income"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    )}>
                      {formatIDR(Number(selected.balance))}
                    </span>
                  }
                />
                <DetailRow label="Deskripsi" value={selected.description} />
                <DetailRow
                  label="Tanggal"
                  value={
                    selected.date
                      ? new Date(selected.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                      : "—"
                  }
                />
              </>
            ) : (
              <p className="text-[13px] text-muted-foreground text-center py-6">Tidak ada data</p>
            )}
          </div>

          <div className="flex gap-2 px-5 pb-5 pt-1">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 h-8 text-[13px] rounded-lg border-border/60"
            >
              Tutup
            </Button>
            <Button
              type="button"
              onClick={() => {
                setOpen(false);
                if (selected) openEdit(selected);
              }}
              className="flex-1 h-8 text-[13px] rounded-lg bg-amber-600 hover:bg-amber-700 text-white gap-1"
            >
              <Pencil className="h-3 w-3" /> Edit
            </Button>
            <Button
              type="button"
              onClick={() => {
                setOpen(false);
                if (selected) openDelete(selected);
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
        <DialogContent className="sm:max-w-md rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <Plus className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <DialogTitle className="text-[15px] font-semibold">Tambah Keuangan</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={onCreateSubmit} className="px-6 py-5 space-y-4">
            {/* Type toggle */}
            <FormField label="Tipe Transaksi">
              <div className="grid grid-cols-2 gap-2">
                {(["income", "expense"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => createForm.setValue("type", t)}
                    className={cn(
                      "flex items-center justify-center gap-2 h-9 rounded-lg border text-[13px] font-medium transition-colors",
                      createForm.watch("type") === t
                        ? t === "income"
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-red-600 border-red-600 text-white"
                        : "border-border/60 bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t === "income"
                      ? <TrendingUp className="h-3.5 w-3.5" />
                      : <TrendingDown className="h-3.5 w-3.5" />}
                    {t === "income" ? "Pemasukan" : "Pengeluaran"}
                  </button>
                ))}
              </div>
              {createForm.formState.errors.type && (
                <span className="text-[11px] text-red-500 mt-1">{createForm.formState.errors.type.message}</span>
              )}
            </FormField>

            <FormField label="Jumlah">
              <Input
                type="number"
                {...createForm.register("balance")}
                placeholder="0"
                className={`h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40 ${createForm.formState.errors.balance ? "border-red-500" : ""
                  }`}
              />
              {createForm.formState.errors.balance && (
                <span className="text-[11px] text-red-500 mt-1">{createForm.formState.errors.balance.message}</span>
              )}
            </FormField>

            <FormField label="Tanggal Transaksi">
              <Input
                type="date"
                {...createForm.register("date")}
                className={`h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40 ${createForm.formState.errors.date ? "border-red-500" : ""
                  }`}
              />
              {createForm.formState.errors.date && (
                <span className="text-[11px] text-red-500 mt-1">{createForm.formState.errors.date.message}</span>
              )}
            </FormField>

            <FormField label="Deskripsi">
              <Input
                {...createForm.register("description")}
                placeholder="Catatan transaksi (opsional)"
                className="h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
              />
            </FormField>

            <div className="flex gap-2 pt-2 border-t border-border/40">
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
                disabled={isCreatePending}
                className="flex-1 h-8 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
              >
                {isCreatePending ? "Menyimpan..." : "Simpan Transaksi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border/50 shadow-xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <DialogTitle className="text-[15px] font-semibold">Edit Keuangan</DialogTitle>
            </div>
          </DialogHeader>

          <form
            className="px-6 py-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setEditFormError(null);
              if (!editBalance || Number(editBalance) <= 0) {
                setEditFormError("Masukkan jumlah yang valid");
                return;
              }

              updateFinance.mutate(
                {
                  id: editId,
                  payload: {
                    type: editType,
                    balance: Number(editBalance),
                    description: editDescription,
                    date: editDate ? new Date(editDate) : undefined,
                  },
                },
                {
                  onSuccess: () => {
                    setShowEdit(false);
                  },
                  onError: (err: any) => {
                    setEditFormError(err?.message || "Gagal memperbarui data");
                  },
                }
              );
            }}
          >
            {/* Type toggle */}
            <FormField label="Tipe Transaksi">
              <div className="grid grid-cols-2 gap-2">
                {(["income", "expense"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditType(t)}
                    className={cn(
                      "flex items-center justify-center gap-2 h-9 rounded-lg border text-[13px] font-medium transition-colors",
                      editType === t
                        ? t === "income"
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-red-600 border-red-600 text-white"
                        : "border-border/60 bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t === "income"
                      ? <TrendingUp className="h-3.5 w-3.5" />
                      : <TrendingDown className="h-3.5 w-3.5" />}
                    {t === "income" ? "Pemasukan" : "Pengeluaran"}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Jumlah">
              <Input
                type="number"
                value={editBalance}
                onChange={(e) => setEditBalance(e.target.value)}
                required
                placeholder="0"
                className="h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
              />
            </FormField>

            <FormField label="Tanggal Transaksi">
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
                className="h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
              />
            </FormField>

            <FormField label="Deskripsi">
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Catatan transaksi (opsional)"
                className="h-8 text-[13px] rounded-lg border-border/60 focus-visible:ring-1 focus-visible:ring-violet-500/40"
              />
            </FormField>

            {editFormError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/8 px-3 py-2 text-[12px] text-red-600 dark:text-red-400">
                <X className="h-3.5 w-3.5 flex-shrink-0" />
                {editFormError}
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
                disabled={updateFinance.isPending}
                className="flex-1 h-8 text-[13px] rounded-lg bg-violet-600 hover:bg-violet-700 text-white"
              >
                {updateFinance.isPending ? "Menyimpan..." : "Simpan Perubahan"}
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
                <DialogTitle className="text-[15px] font-semibold">Hapus Transaksi Keuangan</DialogTitle>
                <DialogDescription className="text-[11.5px] text-muted-foreground">Tindakan ini tidak dapat dibatalkan</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 py-5 text-[13.5px] text-muted-foreground">
            Apakah Anda yakin ingin menghapus transaksi <strong className="text-foreground">{deleteSelected?.description || "tanpa deskripsi"}</strong> sebesar <strong className="text-foreground">{deleteSelected ? formatIDR(Number(deleteSelected.balance)) : ""}</strong>?
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
              disabled={deleteFinance.isPending}
              onClick={() => {
                if (!deleteSelected?._id) return;
                deleteFinance.mutate(deleteSelected._id, {
                  onSuccess: () => {
                    setShowDelete(false);
                  },
                });
              }}
              className="flex-1 h-8.5 text-[13px] rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm"
            >
              {deleteFinance.isPending ? "Menghapus..." : "Ya, Hapus Permanen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}