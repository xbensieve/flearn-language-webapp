import api from "../../config/axios";
import type { NotifyStudentRequest, RefundResponse } from "./type";

export const notifyStudent = async (payload: NotifyStudentRequest) => {
  const response = await api.post('/Refund/admin/notify-student', payload);
  return response.data;
};

export const getRefundRequests = async (params: {
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

export const processRefund = async (payload: { refundRequestId: string; isApproved: boolean; note?: string }) => {
  const response = await api.post('/purchases/refunds/process', payload);

  return response.data;
};