import { api } from "./api";
import { UserRole } from "../lib/auth";

export interface UserData {
  id?: string;
  _id?: string;
  email: string;
  role: UserRole;
  businessId?: string;
  business?: {
    id?: string;
    _id?: string;
    name?: string;
  };
}

export interface UserCreateData {
  email: string;
  password: string;
  role: UserRole;
  businessId: string;
}

export interface UserUpdateData {
  email?: string;
  password?: string;
  role?: UserRole;
  businessId?: string;
}

export interface UserPage {
  items: UserData[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

function normalizeUserList(data: unknown) {
  if (!data) return [];
  if (typeof data === "object" && "content" in data) {
    const content = (data as { content?: UserData[] }).content;
    if (Array.isArray(content)) return content;
  }
  return Array.isArray(data) ? data : [data];
}

function normalizeUserPage(data: any): UserPage {
  if (!data) {
    return {
      items: [],
      page: 0,
      size: 20,
      totalPages: 0,
      totalElements: 0,
    };
  }
  if (Array.isArray(data)) {
    return {
      items: data,
      page: 0,
      size: data.length,
      totalPages: 1,
      totalElements: data.length,
    };
  }
  if (Array.isArray(data.content)) {
    return {
      items: data.content,
      page: data.number ?? 0,
      size: data.size ?? data.pageable?.pageSize ?? data.content.length ?? 0,
      totalPages: data.totalPages ?? 1,
      totalElements: data.totalElements ?? data.content.length ?? 0,
    };
  }
  return {
    items: normalizeUserList(data),
    page: 0,
    size: 20,
    totalPages: 1,
    totalElements: normalizeUserList(data).length,
  };
}

export const userService = { 
  getUsers: async (): Promise<UserData[]> => {
    const res = await api.get("/users");
    return normalizeUserList(res.data);
  },
  getUsersPage: async (page: number, size: number): Promise<UserPage> => {
    const res = await api.get("/users", { params: { page, size } });
    return normalizeUserPage(res.data);
  },
  createUser: async (data: UserCreateData) => {
    const res = await api.post("/users", data);
    return res.data;
  },
  updateUser: async (id: string, data: UserUpdateData) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
}
