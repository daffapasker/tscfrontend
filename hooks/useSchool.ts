import { useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

import schoolService from "@/services/school.services";
import { schoolKey } from "@/keys/coach.key";

import type { ISchool, ICreateSchool } from "@/types/School";

// ─── Query: daftar sekolah ──────────────────────────────────────────────────

export function useSchools(params?: Record<string, any>) {
  return useQuery<ISchool[]>({
    queryKey: schoolKey.lists(),
    queryFn: async () => {
      const res = await schoolService.list(params);
      return res?.data ?? res ?? [];
    },
  });
}

// ─── Query: detail sekolah ──────────────────────────────────────────────────

export function useSchoolDetail(id: string | null) {
  return useQuery<ISchool | null>({
    queryKey: schoolKey.detail(id!),
    queryFn: async () => {
      const res = await schoolService.get(id!);
      return res?.data ?? res ?? null;
    },
    enabled: !!id,
  });
}

import * as yup from "yup";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

// ─── Mutation: tambah sekolah ───────────────────────────────────────────────

const createSchoolSchema = yup.object().shape({
  schools: yup.array().of(
    yup.object().shape({
      name: yup.string().required("Nama sekolah wajib diisi"),
      address: yup.string().required("Alamat sekolah wajib diisi"),
      phone: yup.string().nullable().default(""),
      email: yup.string().email("Email tidak valid").nullable().default(""),
    })
  ).required("Daftar sekolah wajib diisi").min(1, "Minimal satu sekolah harus ditambahkan"),
});

export type CreateSchoolFormValues = yup.InferType<typeof createSchoolSchema>;

export function useCreateSchoolForm(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  const form = useForm<CreateSchoolFormValues>({
    resolver: yupResolver(createSchoolSchema),
    defaultValues: {
      schools: [{ name: "", address: "", phone: "", email: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schools",
  });

  const mutation = useMutation({
    mutationFn: async (items: CreateSchoolFormValues["schools"]) => {
      const created: ISchool[] = [];
      const validItems = items || [];
      for (const item of validItems) {
        const res = await schoolService.create(item);
        const data = res?.data ?? res;
        if (data) created.push(data);
      }
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKey.lists() });
      toast.success("Sekolah berhasil ditambahkan.");
      form.reset({ schools: [{ name: "", address: "", phone: "", email: "" }] });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal menyimpan sekolah.");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data.schools);
  });

  return { form, fields, append, remove, onSubmit, isPending: mutation.isPending };
}

// ─── Mutation: batch create sekolah ─────────────────────────────────────────

export function useBatchCreateSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: ICreateSchool[]) => {
      const created: ISchool[] = [];
      for (const item of items) {
        if (!item.name || typeof item.name !== "string")
          throw new Error("Nama sekolah wajib diisi untuk setiap baris");
        if (!item.address || typeof item.address !== "string")
          throw new Error("Alamat sekolah wajib diisi untuk setiap baris");
        const res = await schoolService.create(item);
        const data = res?.data ?? res;
        if (data) created.push(data);
      }
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKey.lists() });
      toast.success("Sekolah berhasil ditambahkan.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal menyimpan sekolah.");
    },
  });
}

// ─── Mutation: update sekolah ───────────────────────────────────────────────

export function useUpdateSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ICreateSchool;
    }) => {
      const res = await schoolService.update(id, payload);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKey.lists() });
      toast.success("Data sekolah berhasil diperbarui.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal memperbarui sekolah.");
    },
  });
}

// ─── Mutation: hapus sekolah ────────────────────────────────────────────────

export function useDeleteSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await schoolService.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKey.lists() });
      toast.success("Sekolah berhasil dihapus.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal menghapus sekolah.");
    },
  });
}
