import api from "../../config/axios";
import type { NotifyStudentRequest, ProcessRefundRequest } from "./type";

export const notifyStudent = async (payload: NotifyStudentRequest) => {
  const response = await api.post('/Refund/admin/notify-student', payload);
  return response.data;
};

export const processRefund = async (payload: ProcessRefundRequest) => {
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