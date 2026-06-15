import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import athleteService from "@/services/athlete.services";
import { athleteKey, schoolKey } from "@/keys/coach.key";

import type { IAthlete, ICreateAthlete, IUpdateAthlete } from "@/types/Athlete";

// ─── Query: daftar atlet ────────────────────────────────────────────────────

export function useAthletes(params?: Record<string, any>) {
  return useQuery<IAthlete[]>({
    queryKey: athleteKey.lists(),
    queryFn: async () => {
      const res = await athleteService.list(params);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return data;
    },
  });
}

// ─── Query: detail atlet ────────────────────────────────────────────────────

export function useAthleteDetail(id: string | null) {
  return useQuery<IAthlete | null>({
    queryKey: athleteKey.detail(id!),
    queryFn: async () => {
      const res = await athleteService.get(id!);
      const data = res?.data ?? (Array.isArray(res) ? res[0] : res);
      return data ?? null;
    },
    enabled: !!id,
  });
}

// ─── Mutation: tambah atlet ─────────────────────────────────────────────────

const createAthleteSchema = yup.object().shape({
  name: yup.string().required("Nama atlet wajib diisi"),
  birthdate: yup.date().required("Tanggal lahir wajib diisi"),
  schools: yup
    .array()
    .of(yup.string().required())
    .min(1, "Minimal pilih satu sekolah")
    .default([]),
  belt: yup.string().nullable().default(null),
  imageUrl: yup.string().nullable().default(""),
  user: yup.string().default(""), // will be ignored/replaced by backend if empty
});

export type CreateAthleteFormValues = yup.InferType<typeof createAthleteSchema>;

export function useCreateAthleteForm(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  const form = useForm<CreateAthleteFormValues>({
    resolver: yupResolver(createAthleteSchema),
    defaultValues: {
      name: "",
      birthdate: undefined,
      schools: [],
      belt: "putih",
      imageUrl: "",
      user: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateAthleteFormValues) => {

      const res = await athleteService.create(payload as any);
      

      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: athleteKey.lists() });
      toast.success("Atlet berhasil ditambahkan.");
      form.reset();
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal menambahkan atlet.");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  return { form, onSubmit, isPending: mutation.isPending };
}

// ─── Mutation: update atlet ─────────────────────────────────────────────────

export function useUpdateAthlete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: IUpdateAthlete;
    }) => {
      const res = await athleteService.update(id, payload);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: athleteKey.lists() });
      toast.success("Data atlet berhasil diperbarui.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal memperbarui atlet.");
    },
  });
}

// ─── Mutation: hapus atlet ──────────────────────────────────────────────────

export function useDeleteAthlete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await athleteService.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: athleteKey.lists() });
      toast.success("Atlet berhasil dihapus.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal menghapus atlet.");
    },
  });
}
