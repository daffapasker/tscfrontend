import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as yup from "yup";

import authService from "@/services/auth.service";
import { authKey } from "@/keys/auth.key";
import { ILoginCoach } from "@/types/Auth";

// Schema validasi dengan Yup (karena kamu menggunakan yup di package.json)
const loginSchema = yup.object().shape({
  name: yup.string().required("Username atau Nama wajib diisi"),
  password: yup.string().required("Password wajib diisi"),
});

export default function useLoginCoach() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ILoginCoach>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      name: "",
      password: "",
    },
  });

  const { mutate: mutateSignIn, isPending: isPendingSignIn } = useMutation({
    mutationFn: authService.loginCoach, // Memanggil fungsi loginCoach dari authService
    onError(error: any) {
      const message = error?.response?.data?.message || error.message || "Login failed";
      setError("root", {
        message: message,
      });
      toast.error(message);
    },

    onSuccess: (data) => {
      // Invalidate token / resync user state
      queryClient.invalidateQueries({ queryKey: authKey.me() });
      toast.success("Login successful");
      reset();
      router.push("/coach/athlete");

      // Cek callbackUrl dari URL Params
      const callbackUrl = searchParams.get("callbackUrl");

      if (callbackUrl) {
        // Ada callbackUrl -> kembali ke halaman yang di-request sebelumnya
        router.push(callbackUrl);
        

      } 
    },
  });

  // Helper function untuk trigger submit form
  const handlerSignIn = handleSubmit((data) => {
    //@ts-ignore
    mutateSignIn(data);
  });

  return {
    control,
    handleSubmit,
    setError,
    reset,
    errors,
    handlerSignIn,
    isPendingSignIn,
  };
}
