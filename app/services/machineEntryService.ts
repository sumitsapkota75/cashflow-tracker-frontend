import { api } from "./api";

export interface MachineEntryData {
  id?: string;
  _id?: string;
  periodId?: string;
  machineId?: string;
  machineName?: string;
  cashIn?: number;
  cashOut?: number;
  net?: number;
  notes?: string;
  createdAt?: string;
}

export const machineEntryService = {
  getByPeriod: async (periodId: string): Promise<MachineEntryData[]> => {
    const res = await api.get(`/machine-entry/${periodId}`);
    const data = res.data;
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  },
};
