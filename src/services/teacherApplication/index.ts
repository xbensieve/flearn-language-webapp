import api from '../../config/axios';
import type { ApplicationData, Language, TeacherApplicationRequest } from './types';

// Get list of languages
export const getLanguages = async (): Promise<API.Response<Language[]>> => {
  const res = await api.get('/TeacherApplication/languages');
  return res.data;
};

// Submit teacher application
export const submitTeacherApplication = async (
  payload: TeacherApplicationRequest
): Promise<API.Response<null>> => {
  const formData = new FormData();
  formData.append('LanguageID', payload.LanguageID);
  formData.append('Motivation', payload.Motivation);

  payload.CredentialFiles.forEach((file) => formData.append('CredentialFiles', file));

  payload.CredentialNames.forEach((name) => formData.append('CredentialNames', name));

  payload.CredentialTypes.forEach((type) => formData.append('CredentialTypes', type.toString()));

  const res = await api.post('/TeacherApplication', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  console.log(res);
  return res.data;
};

// Fetch logged-in user's teacher application
export const getMyApplication = async (): Promise<API.Response<ApplicationData>> => {
  const res = await api.get('/TeacherApplication/my-application');
  return res.data;
};
