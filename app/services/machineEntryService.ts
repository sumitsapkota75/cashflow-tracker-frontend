import { api } from "./api";

export interface MachineEntryData {
  id?: string;
  _id?: string;
  entryId?: string;
  periodId?: string;
  machineId?: string;
  machineName?: string;
  reportCashIn?: number;
  reportCashOut?: number;
  physicalCash?: number;
  netFromReport?: number;
  safeDroppedAmount?: number;
  reason?: string;
  difference?: number;
  openedAt?: string;
  username?: string;
  hasPreviousEntry?: boolean;
  images?: string[];
}

export interface MachineEntryPayload {
  machineId: string;
  reportCashIn: string;
  reportCashOut: string;
  physicalCash: number;
  netFromReport: string;
  remarks: string;
  safeDroppedAmount: number;
  reason: "MID_DAY" | "END_DAY" | "SHIFT_OPEN" | "SHIFT_CLOSE";
}

export const machineEntryService = {
  getByPeriod: async (periodId: string): Promise<MachineEntryData[]> => {
    const res = await api.get(`/machine-entry/${periodId}`);
    const data = res.data;
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  },
  getRecentEntry: async (
    machineId: string,
    periodId: string
  ): Promise<MachineEntryData | null> => {
    const res = await api.get("/machine-entry/recent", {
      params: { machineId, periodId },
    });
    return res.data ?? null;
  },
  createEntry: async (payload: FormData) => {
    const res = await api.post("/machine-entry", payload);
    return res.data;
  },
};
