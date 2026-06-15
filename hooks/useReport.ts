import { useQuery } from "@tanstack/react-query";

import reportService from "@/services/report.services";
import { reportKey } from "@/keys/coach.key";

import type { IMonthlyReport } from "@/types/Finance";

// ─── Query: laporan bulanan ─────────────────────────────────────────────────

export function useMonthlyReport(year: number, month: number) {
  return useQuery<IMonthlyReport | null>({
    queryKey: reportKey.monthly(year, month),
    queryFn: async () => {
      const res = await reportService.monthly({ year, month });
      return res?.data ?? null;
    },
  });
}
