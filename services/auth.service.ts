import { ILogin } from "@/types/Auth";
import endpoint from "./endpoint.constant";
import { instance } from "@/lib/axioos";

const authService = {
    login: (payload: ILogin) => instance.post(`${endpoint.AUTH}/login`, payload).then((res) => res.data),
    loginCoach: (payload: ILogin) => instance.post(`${endpoint.AUTH}/coach/login`, payload).then((res) => res.data),
    logout: () => instance.post(`${endpoint.AUTH}/logout`).then((res) => res.data),
    getProfile: () => instance.get(`${endpoint.AUTH}/profile`).then((res) => res.data),
};

export default authService;