import endpoint from "./endpoint.constant";
import { instance } from "@/lib/axioos";

const athleteService = {
  list: (params?: Record<string, any>) =>
    instance.get(`${endpoint.ATHLETE}`, { params }).then((res) => res.data),

  get: (id: string) =>
    instance.get(`${endpoint.ATHLETE}/${id}`).then((res) => res.data),

  create: (payload: any) =>
    instance.post(`${endpoint.ATHLETE}`, payload).then((res) => res.data),

  update: (id: string, payload: any) =>
    instance.put(`${endpoint.ATHLETE}/${id}`, payload).then((res) => res.data),

  remove: (id: string) =>
    instance.delete(`${endpoint.ATHLETE}/${id}`).then((res) => res.data),

  getByCoach: (params?: Record<string, any>) =>
    instance.get(`${endpoint.ATHLETE}/coach`, { params }).then((res) => res.data),
};

export default athleteService;
