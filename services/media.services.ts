import endpoint from "./endpoint.constant";
import { instance } from "@/lib/axioos";

const mediaService = {
  uploadSingle: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return instance
      .post(`${endpoint.MEDIA}/upload-single`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  },

  listMedia: (params?: Record<string, any>) =>
    instance.get(`${endpoint.MEDIA}`, { params }).then((res) => res.data),

  createMedia: (payload: any) =>
    instance.post(`${endpoint.MEDIA}`, payload).then((res) => res.data),

  updateMedia: (id: string, payload: any) =>
    instance.put(`${endpoint.MEDIA}/${id}`, payload).then((res) => res.data),

  deleteMedia: (id: string) =>
    instance.delete(`${endpoint.MEDIA}/${id}`).then((res) => res.data),
};

export default mediaService;
