import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as yup from "yup";

import authService from "@/services/auth.service";
import { authKey } from "@/keys/auth.key";
import { ILogin } from "@/types/Auth";

// Schema validasi dengan Yup (karena kamu menggunakan yup di package.json)
const loginSchema = yup.object().shape({
  username: yup.string().required("Username atau Nama wajib diisi"),
  password: yup.string().required("Password wajib diisi"),
});

export default function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ILogin>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { mutate: mutateSignIn, isPending: isPendingSignIn } = useMutation({
    mutationFn: authService.login, // Memanggil fungsi login dari authService
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

      // Cek callbackUrl dari URL Params
      const callbackUrl = searchParams.get("callbackUrl");

      if (callbackUrl) {
        // Ada callbackUrl -> kembali ke halaman yang di-request sebelumnya
        router.push(callbackUrl);
      } else {
        // Redirect berdasarkan role dari backend
        const role = data?.data?.user.role;

        if (role === "pengurus") {
          router.push("/staff/dashboard");
        } else if (role === "pelatih") {
          router.push("/coach/dashboard");
        } else {
          router.push("/");
        }
      }
    },
  });

  // Helper function untuk trigger submit form
  const handlerSignIn = handleSubmit((data) => {
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
