import { api } from "./api";


export interface BusinessData {
  id?: string;
  name: string;
  address: string;
}



export const businessService = {
  getBusiness: async (): Promise<BusinessData> => {
    const res = await api.get("/business");
    return res.data;
  },
  updateBusiness: async (data: BusinessData) => {
    const res = await api.put("/business", data);
    return res.data;
  },
  
};
