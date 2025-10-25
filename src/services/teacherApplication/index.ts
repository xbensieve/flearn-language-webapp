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
  console.log('services Payload', payload.CertificateTypeIds);
  formData.append('CertificateTypeIds', payload.CertificateTypeIds.join(','));
  formData.append('Bio', payload.Bio);
  formData.append('BirthDate', payload.BirthDate);
  // // Multiple certificate images
  // if (payload.CertificateImages?.length) {
  //   payload.CertificateImages.forEach((file) => formData.append('CertificateImages', file.join));
  // }
  if (Array.isArray(payload.CertificateImages) && payload.CertificateImages.length > 0) {
    payload.CertificateImages.forEach((file: File) => {
      if (file instanceof File) {
        formData.append('CertificateImages', file); // ✅ append binary directly
      }
    });
  }
  formData.append('MeetingUrl', payload.MeetingUrl);
  formData.append('TeachingExperience', payload.TeachingExperience);
  formData.append('PhoneNumber', payload.PhoneNumber);
  // Optional file (avatar)
  if (payload.Avatar) {
    formData.append('Avatar', payload.Avatar);
    console.log('services Payload', payload.Avatar);
  }
  formData.append('FullName', payload.FullName);
  formData.append('LangCode', payload.LangCode.toLowerCase());
  formData.append('Email', payload.Email);

  // Make request
  const res = await api.post('applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
};

export const updateSubmitTeacherApplication = async (
  payload: TeacherApplicationRequest
): Promise<API.Response<null>> => {
  const formData = new FormData();

  // Append simple text fields
  console.log('services Payload', payload.CertificateTypeIds);
  formData.append('CertificateTypeIds', payload.CertificateTypeIds.join(','));
  formData.append('Bio', payload.Bio);
  formData.append('BirthDate', payload.BirthDate);
  // // Multiple certificate images
  // if (payload.CertificateImages?.length) {
  //   payload.CertificateImages.forEach((file) => formData.append('CertificateImages', file.join));
  // }
  if (Array.isArray(payload.CertificateImages) && payload.CertificateImages.length > 0) {
    payload.CertificateImages.forEach((file: File) => {
      if (file instanceof File) {
        formData.append('CertificateImages', file); // ✅ append binary directly
      }
    });
  }
  formData.append('MeetingUrl', payload.MeetingUrl);
  formData.append('TeachingExperience', payload.TeachingExperience);
  formData.append('PhoneNumber', payload.PhoneNumber);
  // Optional file (avatar)
  if (payload.Avatar) {
    formData.append('Avatar', payload.Avatar);
    console.log('services Payload', payload.Avatar);
  }
  formData.append('FullName', payload.FullName);
  formData.append('LangCode', payload.LangCode.toLowerCase());
  formData.append('Email', payload.Email);

  // Make request
  const res = await api.put('applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
};

// Fetch logged-in user's teacher application
export const getMyApplication = async () => {
  const res = await api.get<API.Response<ApplicationData[]>>('applications/me');
  return res.data;
};
