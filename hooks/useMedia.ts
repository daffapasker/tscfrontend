import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import mediaService from "@/services/media.services";
import { mediaKey } from "@/keys/coach.key";

import type { IMedia, ICreateMediaPayload } from "@/types/Media";

// ─── Query: daftar media ────────────────────────────────────────────────────

export function useMediaList(params?: Record<string, any>) {
  return useQuery<IMedia[]>({
    queryKey: mediaKey.lists(),
    queryFn: async () => {
      const res = await mediaService.listMedia(params);
      return res?.data ?? res ?? [];
    },
  });
}

// ─── Mutation: upload single file ───────────────────────────────────────────

export function useUploadMedia() {
  return useMutation({
    mutationFn: async (file: File) => {
      const res = await mediaService.uploadSingle(file);
      return res?.data ?? res;
    },
    onSuccess: () => {
      toast.success("File berhasil diunggah.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal mengunggah file.");
    },
  });
}

// ─── Mutation: tambah media record ──────────────────────────────────────────

const createMediaSchema = yup.object().shape({
  title: yup.string().required("Judul wajib diisi"),
  type: yup.mixed<"sertifikat" | "latihan">().oneOf(["sertifikat", "latihan"]).required("Tipe media wajib diisi"),
  url: yup.string().required("URL file wajib diisi"),
  fileId: yup.string().required("File ID wajib diisi"),
  athleteId: yup.string().nullable().default(""),
  schoolId: yup.string().nullable().default(""),
});

export type CreateMediaFormValues = yup.InferType<typeof createMediaSchema>;

export function useCreateMediaForm(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  const form = useForm<CreateMediaFormValues>({
    resolver: yupResolver(createMediaSchema),
    defaultValues: {
      title: "",
      type: "sertifikat",
      url: "",
      fileId: "",
      athleteId: "",
      schoolId: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateMediaFormValues) => {
      // Remove empty strings for optional references
      const data: any = { ...payload };
      if (!data.athleteId) delete data.athleteId;
      if (!data.schoolId) delete data.schoolId;
      
      const res = await mediaService.createMedia(data);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKey.lists() });
      toast.success("Media berhasil ditambahkan.");
      form.reset({
        title: "",
        type: "sertifikat",
        url: "",
        fileId: "",
        athleteId: "",
        schoolId: "",
      });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal menyimpan data media.");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  return { form, onSubmit, isPending: mutation.isPending };
}

// ─── Mutation: update media ─────────────────────────────────────────────────

export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<ICreateMediaPayload>;
    }) => {
      const res = await mediaService.updateMedia(id, payload);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKey.lists() });
      toast.success("Data media berhasil diperbarui.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal memperbarui media.");
    },
  });
}

// ─── Mutation: hapus media ──────────────────────────────────────────────────

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await mediaService.deleteMedia(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKey.lists() });
      toast.success("Media berhasil dihapus.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal menghapus media.");
    },
  });
}
