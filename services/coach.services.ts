import { ICoach, ICreateCoach, IUpdateCoach } from "@/types/Coach";
import endpoint from "./endpoint.constant";
import { instance } from "@/lib/axioos";

const coachService = {
  list: (params?: Record<string, any>) =>
    instance.get(`${endpoint.COACH}`, { params }).then((res) => res.data),

  get: (id: string) => instance.get(`${endpoint.COACH}/${id}`).then((res) => res.data),

  create: (payload: ICreateCoach) =>
    instance.post(`${endpoint.COACH}`, payload).then((res) => res.data),

  update: (id: string, payload: IUpdateCoach) =>
    instance.put(`${endpoint.COACH}/${id}`, payload).then((res) => res.data),

  remove: (id: string) => instance.delete(`${endpoint.COACH}/${id}`).then((res) => res.data),
};

export default coachService;
