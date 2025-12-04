import api from "../../config/axios";
import type { NotifyStudentRequest, ProcessRefundRequest, RefundResponse } from "./type";

export const notifyStudent = async (payload: NotifyStudentRequest) => {
  const response = await api.post('/Refund/admin/notify-student', payload);
  return response.data;
};

// Request student to update bank info
export const requestBankUpdate = async (refundRequestId: string, note: string) => {
  const response = await api.post(`/Refund/admin/${refundRequestId}/request-bank-update`, { note });
  return response.data;
};

// New API - Get all refunds with pagination
export const getRefundRequestsAll = async (params: {
  page?: number;
  pageSize?: number;
  status?: number;
} = {}) => {
  const query: Record<string, any> = {
    page: params.page || 1,
    pageSize: params.pageSize || 50,
  };
  if (params.status !== undefined) {
    query.status = params.status;
  }
  const res = await api.get('/Refund/admin/all', { params: query });
  return res.data;
};

export const getRefundRequestsClass = async ({ statusFilter }: { statusFilter: string }) => {
  const params = statusFilter !== '' ? { status: Number(statusFilter) } : {};
  const res = await api.get('/Refund/admin/list', { params });
  return res.data.data || [];
}

export const getRefundRequestsCourse = async (params: {
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  status?: string;
} = {}): Promise<RefundResponse> => {
  const query = new URLSearchParams();

  if (params.fromDate) query.append('FromDate', params.fromDate);
  if (params.toDate) query.append('ToDate', params.toDate);
  if (params.page !== undefined) query.append('Page', params.page.toString());
  if (params.pageSize !== undefined) query.append('PageSize', params.pageSize.toString());
  if (params.searchTerm) query.append('SearchTerm', params.searchTerm);
  if (params.sortBy) query.append('SortBy', params.sortBy);
  if (params.status) query.append('Status', params.status);

  const url = `/purchases/refunds/by-admin${query.toString() ? `?${query.toString()}` : ''}`;

  const response = await api.get(url);

  return response.data;
};

export const processRefundClass = async (payload: ProcessRefundRequest) => {
  const formData = new FormData();

  formData.append('RefundRequestId', payload.RefundRequestId);
  formData.append('Action', payload.Action);

  if (payload.AdminNote) {
    formData.append('AdminNote', payload.AdminNote);
  }

  if (payload.ProofImage) {
    formData.append('ProofImage', payload.ProofImage, payload.ProofImage.name);
  }

  const response = await api.post('/Refund/admin/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const processRefundCourse = async (payload: { refundRequestId: string; isApproved: boolean; note?: string }) => {
  const response = await api.post('/purchases/refunds/process', payload);
  return response.data;
};