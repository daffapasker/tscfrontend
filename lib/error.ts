export function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  // Axios error with response
  const anyErr = err as any;
  try {
    if (anyErr.response && anyErr.response.data) {
      const data = anyErr.response.data;
      if (data.meta && data.meta.message) return String(data.meta.message);
      if (data.message) return String(data.message);
      if (data.errors && typeof data.errors === "object") {
        return Object.values(data.errors).join("; ");
      }
    }
  } catch (e) {
    // fallthrough
  }
  if (anyErr.message) return String(anyErr.message);
  return String(anyErr);
}
