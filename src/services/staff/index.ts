import api from '../../config/axios';
import type { ApplicationData } from '../teacherApplication/types';

// Pending list
export const getPendingApplications = async (): Promise<API.Response<ApplicationData[]>> => {
  const res = await api.get('staff/applications', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      Accept: 'application/json',
    },
  });
  return res.data;
};

// Detail
export const getApplicationDetail = async (id: string): Promise<API.Response<ApplicationData>> => {
  const res = await api.get(`/TeacherApplication/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      Accept: 'application/json',
    },
  });
  return res.data;
};

// Review
export const reviewApproveApplication = async (payload: {
  applicationId: string;
}): Promise<API.Response<null>> => {
  const res = await api.put(`staff/applications/${payload.applicationId}/approve`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      Accept: 'application/json',
    },
  });
  return res.data;
};

export const reviewRejectApplication = async (payload: {
  applicationId: string;
  reason?: string;
}): Promise<API.Response<null>> => {
  const res = await api.put(`staff/applications/${payload.applicationId}/reject`, payload, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      Accept: 'application/json',
    },
  });
  return res.data;
};
