import api from "../../config/axios";
import type { Certificate } from "./type";

export const getCertificatesService = async (): Promise<API.Response<Certificate[]>> => {
  const res = await api.get('certificates');
  return res.data;
};

export const getCertificatesByLanguageService = async ({langCode} : {langCode: string}) => {
  switch (langCode) {
    case 'EN':
      langCode = 'en';
      break;
    case 'JP':
      langCode = 'ja';
      break;
    case 'ZH':
      langCode = 'zh';
      break;
  }
  const res = await api.get<API.Response<Certificate[]>>(`certificates/by-lang?lang=${langCode.toLowerCase()}`);
  return res.data;
};