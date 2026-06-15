import environtment from "@/config/environment";
import axios from "axios";

const headers = {
  "Content-Type": "application/json",
};

export const instance = axios.create({
  baseURL: environtment.API_URL,
  headers,
  timeout: 60 * 1000,
  withCredentials: true,
});

// Attach Authorization header from `token` cookie when available (client-side)
instance.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined") {
      const match = document.cookie.match(new RegExp('(^|;)\\s*token\\s*=\\s*([^;]+)'));
      const token = match ? decodeURIComponent(match[2]) : null;
      if (token) {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          config.headers = {
            Authorization: `Bearer ${token}`,
          } as any;
        }
      }
    }
  } catch (e) {
    // ignore cookie parsing errors
  }

  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

