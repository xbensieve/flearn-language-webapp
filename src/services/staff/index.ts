import api from '../../config/axios';
import type { ApplicationData } from '../teacherApplication/types';

// Pending list
export const getPendingApplications = async (): Promise<API.Response<ApplicationData[]>> => {
  const res = await api.get('/TeacherApplication/pending', {
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
export const reviewApplication = async (payload: {
  applicationId: string;
  isApproved: boolean;
  rejectionReason?: string;
}): Promise<API.Response<null>> => {
  const res = await api.post('/TeacherApplication/review', payload, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      Accept: 'application/json',
    },
  });
  return res.data;
};
