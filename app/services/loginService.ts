import { api } from "./api";

export const authService = {
    login: async (username: string, password: string): Promise<string> => {
        const res = await api.post("/auth/login", { username, password });
        const data = res.data;

        if (typeof data === "string") return data;
        if (data?.token) return data.token;
        if (data?.accessToken) return data.accessToken;
        if (data?.data?.token) return data.data.token;

        throw new Error("Login response missing token");
    }
}
