import api from '../../config/axios';
import type { ApplicationData, Language, TeacherApplicationRequest } from './types';

// Get list of languages
export const getLanguages = async (): Promise<API.Response<Language[]>> => {
  const res = await api.get('languages');
  return res.data;
};

// Submit teacher application
export const submitTeacherApplication = async (
  payload: TeacherApplicationRequest
): Promise<API.Response<null>> => {
  const formData = new FormData();

  // Append simple text fields
  formData.append('LangCode', payload.LangCode);
  formData.append('FullName', payload.FullName);
  formData.append('BirthDate', payload.BirthDate);
  formData.append('Bio', payload.Bio);
  formData.append('Email', payload.Email);
  formData.append('PhoneNumber', payload.PhoneNumber);
  formData.append('TeachingExperience', payload.TeachingExperience);
  formData.append('MeetingUrl', payload.MeetingUrl);

  // Optional file (avatar)
  if (payload.Avatar) {
    formData.append('Avatar', payload.Avatar);
  }

  // Multiple certificate images
  if (payload.CertificateImages?.length) {
    payload.CertificateImages.forEach((file) => formData.append('CertificateImages', file));
  }

  console.log('services Payload', payload.CertificateTypeIds);
  formData.append('CertificateTypeIds', payload.CertificateTypeIds.join(','));
  // Make request
  const res = await api.post('applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
};

// Fetch logged-in user's teacher application
export const getMyApplication = async () => {
  const res = await api.get<API.Response<ApplicationData>>('applications/me');
  return res.data;
};
