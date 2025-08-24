import axios from "axios";
import type { IProduct } from "../types/Product";

const API_URL = "http://localhost:5000/products";

export const getProducts = async (): Promise<IProduct[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const addProduct = async (url: string): Promise<IProduct> => {
  const res = await axios.post(API_URL, { url });
  return res.data;
};

export const deleteProduct = async (id: string) => {
  await axios.delete(`${API_URL}/${id}`);
};

export const updateAlarm = async (id: string, alarmPrice: number) => {
  const res = await axios.put(`${API_URL}/${id}/alarm`, { alarmPrice });
  return res.data;
};
