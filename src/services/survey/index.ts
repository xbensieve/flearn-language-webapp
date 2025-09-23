import api from "../../config/axios";
import type { IMySurvey, SurveyCompleteRequest, SurveyOptionsResponse } from "./types";

export const getMySurvey = async (): Promise<API.Response<IMySurvey>> => {
  const res = await api.get('/Survey/my-survey');
  return res.data;
};

export const getSurveyOptions = async (): Promise<SurveyOptionsResponse> => {
  const res = await api.get('/Survey/options');
  return res.data;
};

// Complete survey
export const completeSurvey = async (
  payload: SurveyCompleteRequest
): Promise<SurveyOptionsResponse> => {
  const res = await api.post('/Survey/complete', payload);
  return res.data;
};

export const regenerateRecommendations = async () => {
  const res = await api.post('/Survey/regenerate-recommendations');
  return res.data;
};