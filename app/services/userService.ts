import { api } from "./api";

export interface UserData {
  id?: string;
  name: string;
  email: string;
  role: "OWNER" | "MANAGER" | "EMPLOYEE";
}

export const userService = { 
  getUsers: async (): Promise<UserData[]> => {
    const res = await api.get("/users");
    return res.data;
  },
  createUser: async (data: UserData) => {
    const res = await api.post("/users", data);
    return res.data;
  },
  updateUser: async (id: string, data: UserData) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
}