import { useQuery } from "@tanstack/react-query";

import statisticsService from "@/services/statistics.services";
import { statisticsKey } from "@/keys/coach.key";

import type { StatisticsData } from "@/types/Statistics";

export function useStatistics() {
  return useQuery<StatisticsData | null>({
    queryKey: statisticsKey.summary(),
    queryFn: async () => {
      const res = await statisticsService.list();
      return res ?? null;
    },
  });
}