import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import coachService from "@/services/coach.services";
import schoolService from "@/services/school.services";
import { coachKey, schoolKey } from "@/keys/coach.key";

import type { ICoach } from "@/types/Coach";
import type { ISchool } from "@/types/School";

// ─── Query: daftar pelatih ──────────────────────────────────────────────────

export function useCoaches() {
  return useQuery<ICoach[]>({
    queryKey: coachKey.lists(),
    queryFn: async () => {
      const res = await coachService.list({ limit: 1000 }); // ← tambah ini
      return res?.data ?? res ?? [];
    },
  });
}

// ─── Query: daftar sekolah (untuk dropdown / map) ───────────────────────────

export function useSchools() {
  return useQuery<ISchool[]>({
    queryKey: schoolKey.lists(),
    queryFn: async () => {
      const res = await schoolService.list({ limit: 1000 });
      return res?.data ?? res ?? [];
    },
  });
}

// ─── Query: detail pelatih ──────────────────────────────────────────────────

export function useCoachDetail(id: string | null) {
  return useQuery<ICoach | null>({
    queryKey: coachKey.detail(id!),
    queryFn: async () => {
      const res = await coachService.get(id!);
      const data = res?.data ?? (Array.isArray(res) ? res[0] : res);
      return data ?? null;
    },
    enabled: !!id,
  });
}

// ─── Mutation: tambah pelatih ───────────────────────────────────────────────

const createCoachSchema = yup.object().shape({
  name: yup.string().required("Nama pelatih wajib diisi"),
  password: yup.string().required("Password wajib diisi"),
  birthdate: yup.date().required("Tanggal lahir wajib diisi"),
  schoolIds: yup.array().of(yup.string().required()).default([]),
});

type CreateCoachFormValues = yup.InferType<typeof createCoachSchema>;

export function useCreateCoachForm(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  const form = useForm<CreateCoachFormValues>({
    resolver: yupResolver(createCoachSchema),
    defaultValues: {
      name: "",
      password: "",
      birthdate: undefined,
      schoolIds: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateCoachFormValues) => {
      const res = await coachService.create(payload as any);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachKey.lists() });
      toast.success("Pelatih berhasil ditambahkan.");
      form.reset();
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal menambahkan pelatih.");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  return { form, onSubmit, isPending: mutation.isPending };
}

// ─── Mutation: update pelatih ───────────────────────────────────────────────

export function useUpdateCoach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        name: string;
        password: string;
        birthdate: Date;
        schoolIds: string[];
      };
    }) => {
      const res = await coachService.update(id, payload as any);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachKey.lists() });
      toast.success("Data pelatih berhasil diperbarui.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal memperbarui pelatih.");
    },
  });
}

// ─── Mutation: hapus pelatih ────────────────────────────────────────────────

export function useDeleteCoach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await coachService.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachKey.lists() });
      toast.success("Pelatih berhasil dihapus.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal menghapus data pelatih.");
    },
  });
}

// ─── Helper: map school id → nama sekolah ───────────────────────────────────

export function useSchoolMap() {
  const { data: schools = [] } = useSchools();

  const schoolMap = useMemo(
    () => new Map(schools.map((s) => [s._id, s.name])),
    [schools],
  );

  return { schools, schoolMap };
}
