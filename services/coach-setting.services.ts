import endpoint from "./endpoint.constant";
import { instance } from "@/lib/axioos";
import type { ICoach } from "@/types/Coach";

export interface ICreateCoachPayload {
	name: string;
	password: string;
	birthdate: string; // ISO date string (e.g. "1980-05-12")
	schoolIds?: string[]; // array of school ids
}

const coachSettingService = {
	create: (payload: ICreateCoachPayload) =>
		instance.post(`${endpoint.COACH}`, payload).then((res) => res.data),

	list: (params?: Record<string, any>) =>
		instance.get(`${endpoint.COACH}`, { params }).then((res) => res.data as { meta?: any; data?: ICoach[]; pagination?: any }),

	get: (id: string) => instance.get(`${endpoint.COACH}/${id}`).then((res) => res.data as { meta?: any; data?: ICoach }),

	remove: (id: string) => instance.delete(`${endpoint.COACH}/${id}`).then((res) => res.data),
};

export default coachSettingService;

