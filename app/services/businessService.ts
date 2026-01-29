import { api } from "./api";


export interface BusinessData {
  id?: string;
  _id?: string;
  name: string;
  location: string;
  numberOfMachines: number;
  machineIds?: string[];
}

export type BusinessUpsert = Omit<BusinessData, "id" | "_id">;

export interface BusinessPage {
  items: BusinessData[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

function normalizeBusinessList(data: unknown) {
  if (!data) return [];
  if (typeof data === "object" && "content" in data) {
    const content = (data as { content?: BusinessData[] }).content;
    if (Array.isArray(content)) return content;
  }
  return Array.isArray(data) ? data : [data];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBusinessPage(data: any): BusinessPage {
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
    items: normalizeBusinessList(data),
    page: 0,
    size: 20,
    totalPages: 1,
    totalElements: normalizeBusinessList(data).length,
  };
}

export const businessService = {
  getBusinesses: async (): Promise<BusinessData[]> => {
    const res = await api.get("/business");
    return normalizeBusinessList(res.data);
  },
  getBusinessesPage: async (
    page: number,
    size: number
  ): Promise<BusinessPage> => {
    const res = await api.get("/business", {
      params: { page, size },
    });
    return normalizeBusinessPage(res.data);
  },
  createBusiness: async (data: BusinessUpsert) => {
    const res = await api.post("/business", data);
    return res.data;
  },
  updateBusiness: async (id: string | null, data: BusinessUpsert) => {
    const url = id ? `/business/${id}` : "/business";
    const res = await api.patch(url, data);
    return res.data;
  },
  
};
