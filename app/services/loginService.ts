import { api } from "./api";

export const authService = {
    login: async (email: string, password: string): Promise<string> => {
        const res = await api.post("/auth/login", { email, password });
        const data = res.data;

        if (typeof data === "string") return data;
        if (data?.token) return data.token;
        if (data?.accessToken) return data.accessToken;
        if (data?.data?.token) return data.data.token;

        throw new Error("Login response missing token");
    }
}
