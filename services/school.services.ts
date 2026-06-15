import endpoint from "./endpoint.constant";
import { instance } from "@/lib/axioos";

const schoolService = {
  list: (params?: Record<string, any>) =>
    instance.get(`${endpoint.SCHOOL}`, { params }).then((res) => res.data),

  get: (id: string) =>
    instance.get(`${endpoint.SCHOOL}/${id}`).then((res) => res.data),

  create: (payload: any) =>
    instance.post(`${endpoint.SCHOOL}`, payload).then((res) => res.data),

  update: (id: string, payload: any) =>
    instance.put(`${endpoint.SCHOOL}/${id}`, payload).then((res) => res.data),

  remove: (id: string) =>
    instance.delete(`${endpoint.SCHOOL}/${id}`).then((res) => res.data),
};

export default schoolService;
