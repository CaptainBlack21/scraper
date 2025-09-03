import { api } from "../http";
import type { IProcessed } from "../types/Processed";

export const getProcessed = async (): Promise<IProcessed[]> => {
  const res = await api.get("/processed");
  return res.data;
};
