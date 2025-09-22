import api from "../../config/axios";
import type { IDashboard } from "./types";

export const getDashboard = async () => {
  const res = await api.get<API.Response<IDashboard>>(
    `/Admin/dashboard`
  );
  return res.data;
};