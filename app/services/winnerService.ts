import { api } from "./api";

export type WinnerStatus = "PAID" | "PARTIALLY_PAID" | "UNPAID" | "ON_HOLD";

export interface PaymentPlanItem {
  date: string;
  amount: number;
  status?: string;
}

export interface WinnerData {
  id: string;
  businessId?: string;
  playerName: string;
  playerContact?: string;
  winningDate?: string;
  totalWinAmount: number;
  amountPaid: number;
  remainingAmount?: number;
  status: WinnerStatus | string;
  paymentPlan?: PaymentPlanItem[] | null;
  createdAt?: string | null;
  createdByUsername?: string;
}

export interface WinnerCreatePayload {
  playerName: string;
  playerContact?: string;
  winningDate?: string;
  totalWinAmount: number;
  amountPaid: number;
  status: WinnerStatus | string;
  paymentPlan?: PaymentPlanItem[] | null;
}

export const winnerService = {
  createWinner: async (payload: WinnerCreatePayload) => {
    const res = await api.post("/winners", payload);
    return res.data as WinnerData;
  },
  getWinners: async (): Promise<WinnerData[]> => {
    const res = await api.get("/winners");
    const data = res.data;
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  },
  getWinnerById: async (id: string): Promise<WinnerData> => {
    const res = await api.get(`/winners/${id}`);
    return res.data as WinnerData;
  },
  updatePaymentPlan: async (winnerId: string, paymentPlan: PaymentPlanItem[]) => {
    const res = await api.put(`/winners/update-plan/${winnerId}`, {
      paymentPlan,
    });
    return res.data as WinnerData;
  },
};
