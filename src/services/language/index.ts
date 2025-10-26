import api from "../../config/axios";
import type { Language } from "./type";

export const getLanguagesService = async () => {
  const res = await api.get<API.Response<Language[]>>("/languages");
  return res.data;
};
