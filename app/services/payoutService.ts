import { api } from "./api";

export type PayoutStatus = "IN_PROGRESS" | "PARTIALLY_PAID" | "PAID" | "VOID";

export interface PayoutData {
  id: string;
  winnerId?: string;
  winnerName?: string;
  businessId?: string;
  amount: number;
  payoutDate: string;
  status: PayoutStatus | string;
  remarks?: string;
  createdByUser?: string;
  reasonType?: string | null;
}

export interface PayoutCreatePayload {
  winnerID?: string;
  winnerName?: string;
  amount: number;
  payoutDate: string;
  status: PayoutStatus | string;
  remarks?: string;
  reasonType?: string;
}

export interface PayoutPage {
  items: PayoutData[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePayoutPage(data: any): PayoutPage {
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
    items: Array.isArray(data) ? data : [data],
    page: 0,
    size: 20,
    totalPages: 1,
    totalElements: Array.isArray(data) ? data.length : 1,
  };
}

export const payoutService = {
  createPayout: async (payload: PayoutCreatePayload) => {
    const res = await api.post("/payouts", payload);
    return res.data as PayoutData;
  },
  getPayoutsByWinner: async (winnerId: string): Promise<PayoutData[]> => {
    const res = await api.get(`/payouts/${winnerId}`);
    const data = res.data;
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  },
  getPayoutsPage: async (page: number, size: number): Promise<PayoutPage> => {
    const res = await api.get("/payouts/all", { params: { page, size } });
    return normalizePayoutPage(res.data);
  },
  getPayoutsByPeriod: async (periodId: string): Promise<PayoutData[]> => {
    const res = await api.get(`/payouts/period/${periodId}`);
    const data = res.data;
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  },
};
