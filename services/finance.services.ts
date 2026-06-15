import endpoint from "./endpoint.constant";
import { instance } from "@/lib/axioos";
import type { ICreateFinance } from "@/types/Finance";

const financeService = {
	list: (params?: Record<string, any>) =>
		instance.get(`${endpoint.FINANCE}`, { params }).then((res) => res.data),

	get: (id: string) => instance.get(`${endpoint.FINANCE}/${id}`).then((res) => res.data),

	create: (payload: ICreateFinance) =>
		instance.post(`${endpoint.FINANCE}`, payload).then((res) => res.data),

	update: (id: string, payload: ICreateFinance) =>
		instance.put(`${endpoint.FINANCE}/${id}`, payload).then((res) => res.data),

	delete: (id: string) =>
		instance.delete(`${endpoint.FINANCE}/${id}`).then((res) => res.data),

	monthlyReport: (params?: Record<string, any>) =>
		instance.get(`${endpoint.FINANCE}/reports/monthly`, { params }).then((res) => res.data),
};

export default financeService;

