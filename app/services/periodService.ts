import { api } from "./api";

export interface OpenPeriodPayload {
  businessDate: string;
  totalCashInOpen: number;
  totalCashOutOpen: number;
  cashInAtmOpen?: number;
  safeDropOpen?: number;
}

export interface ClosePeriodPayload {
  periodId: string;
  totalCashInClose: number;
  totalCashOutClose: number;
  cashInAtmClose?: number;
  safeDropClose?: number;
}

export interface PeriodData {
  id: string;
  businessDate: string;
  businessId: string;
  status: "OPEN" | "CLOSED";
  totalCashInOpen: number;
  totalCashOutOpen: number;
  totalCashInClose: number;
  totalCashOutClose: number;
  safeDrop?: number | null;
  netClose?: number | null;
  netOpen?: number | null;
  cashInAtmOpen?: number | null;
  cashInAtmClose?: number | null;
  safeDropOpen?: number | null;
  safeDropClose?: number | null;
  openedAt?: string | null;
  closedAt?: string | null;
  openedByUserId?: string | null;
  closedByUserId?: string | null;
  payout?: number | null;
  physicalCashCollected?: number | null;
  images?: string[];
}

export interface PeriodListResponse {
  content?: PeriodData[];
}

export const periodService = {
  openPeriod: async (payload: OpenPeriodPayload) => {
    const res = await api.post("/periods/open", payload);
    return res.data;
  },
  closePeriod: async (payload: FormData) => {
    const res = await api.post("/periods/close", payload);
    return res.data;
  },
  getActivePeriod: async (businessId: string): Promise<PeriodData | null> => {
    const res = await api.get(`/periods/active/${businessId}`);
    return res.data ?? null;
  },
  getPeriodById: async (periodId: string): Promise<PeriodData> => {
    const res = await api.get(`/periods/${periodId}`);
    return res.data;
  },
  getRecentClosedPeriod: async (): Promise<PeriodData | null> => {
    const res = await api.get("/periods/recent-closed");
    return res.data ?? null;
  },
  getBusinessPeriods: async (businessId: string): Promise<PeriodData[]> => {
    const res = await api.get(`/periods/business/${businessId}`);
    const data = res.data as PeriodListResponse | PeriodData[] | null;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Array.isArray(data.content) ? data.content : [];
  },
};
