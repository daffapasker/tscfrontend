import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import financeService from "@/services/finance.services";
import { financeKey } from "@/keys/coach.key";

import type { IFinance, ICreateFinance } from "@/types/Finance";

// ─── Query: daftar keuangan ─────────────────────────────────────────────────

export function useFinances(params?: Record<string, any>) {
  return useQuery<IFinance[]>({
    queryKey: financeKey.lists(),
    queryFn: async () => {
      const res = await financeService.list(params ?? { limit: 1000 });
      const data = Array.isArray(res) ? res : res?.data ?? [];
      return data;
    },
  });
}

// ─── Query: detail keuangan ─────────────────────────────────────────────────

export function useFinanceDetail(id: string | null) {
  return useQuery<IFinance | null>({
    queryKey: financeKey.detail(id!),
    queryFn: async () => {
      const res = await financeService.get(id!);
      const data = res?.data ?? (Array.isArray(res) ? res[0] : res);
      return data ?? null;
    },
    enabled: !!id,
  });
}

// ─── Mutation: tambah keuangan ──────────────────────────────────────────────

const createFinanceSchema = yup.object().shape({
  type: yup.mixed<"income" | "expense">().oneOf(["income", "expense"]).required("Jenis transaksi wajib diisi"),
  balance: yup.number().typeError("Nominal harus berupa angka").positive("Nominal harus lebih dari 0").required("Nominal wajib diisi"),
  description: yup.string().optional().default(""),
  date: yup.date().required("Tanggal transaksi wajib diisi"),
});

export type CreateFinanceFormValues = yup.InferType<typeof createFinanceSchema>;

export function useCreateFinanceForm(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  const form = useForm<CreateFinanceFormValues>({
    resolver: yupResolver(createFinanceSchema),
    defaultValues: {
      type: "income",
      balance: "" as unknown as number,
      description: "",
      date: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateFinanceFormValues) => {
      const res = await financeService.create(payload as any);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKey.lists() });
      toast.success("Data keuangan berhasil ditambahkan.");
      form.reset({
        type: "income",
        balance: "" as unknown as number,
        description: "",
        date: undefined,
      });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal menyimpan data keuangan.");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  return { form, onSubmit, isPending: mutation.isPending };
}

// ─── Mutation: update keuangan ──────────────────────────────────────────────

export function useUpdateFinance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ICreateFinance;
    }) => {
      const res = await financeService.update(id, payload);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKey.lists() });
      toast.success("Data keuangan berhasil diperbarui.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal memperbarui data keuangan.");
    },
  });
}

// ─── Mutation: hapus keuangan ───────────────────────────────────────────────

export function useDeleteFinance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await financeService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKey.lists() });
      toast.success("Transaksi keuangan berhasil dihapus.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal menghapus transaksi keuangan.");
    },
  });
}
