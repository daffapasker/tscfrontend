import endpoint from "./endpoint.constant";
import { instance } from "@/lib/axioos";
import type { IMonthlyReport } from "@/types/Finance";

const reportService = {
  monthly: (params?: Record<string, any>) =>
    instance.get(`${endpoint.FINANCE}/reports/monthly`, { params }).then((res) => res.data as { meta?: any; data?: IMonthlyReport }),
};

export default reportService;
