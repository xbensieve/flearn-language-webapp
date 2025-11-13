// src/app/api/refund/types/refund.types.ts

export interface NotifyStudentRequest {
  studentId: string;
  classId: string;
  className: string;
  classStartDateTime: string; // ISO date string
  reason: string;
}

export interface ProcessRefundRequest {
  RefundRequestId: string;
  Action: 'Approve' | 'Reject';
  AdminNote?: string;
  ProofImage?: File; // will be appended to FormData
}

// src/types/refund.types.ts
export type RefundStatus = 0 | 1 | 2 | 3 | 4 | 5;

export interface RefundRequest {
  refundRequestId: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  classStartDateTime: string;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  adminNote?: string;
  proofImageUrl?: string;
}

export interface RefundListResponse {
  data: RefundRequest[];
  total?: number;
}