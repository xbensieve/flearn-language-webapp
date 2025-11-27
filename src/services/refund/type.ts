/* eslint-disable @typescript-eslint/no-explicit-any */


export interface NotifyStudentRequest {
  studentId: string;
  classId: string;
  className: string;
  classStartDateTime: string;
  reason: string;
}

export interface ProcessRefundRequest {
  RefundRequestId: string;
  Action: 'Approve' | 'Reject' | 'Complete' | 'Cancel'; 
  AdminNote?: string;
  ProofImage?: File;
}

export type RefundStatus = 0 | 1 | 2 | 3 | 4 | 5;

export interface RefundRequestClass {
  refundRequestID: number;
  enrollmentID: string;
  studentID: string;
  studentName: string;
  classID: string;
  className: string;
  requestType: number;
  reason: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolderName: string;
  status: RefundStatus;
  adminNote?: string;
  refundAmount: number;
  requestedAt: string;
  processedAt?: string;
  proofImageUrl?: string;
}

export interface RefundRequest {
  refundRequestId: string
  purchaseId: string
  studentId: string
  studentName: string
  studentEmail: string
  studentAvatar: any
  courseName: string
  refundAmount: number
  originalAmount: number
  requestType: string
  reason: string
  bankName: string
  bankAccountNumber: string
  bankAccountHolderName: string
  proofImageUrl: string
  status: string
  requestedAt: string
  processedAt: any
  adminNote: any
  processedByAdminName: any
}

export interface RefundListResponse {
  success: boolean;
  data: RefundRequest[];
}
export interface NotifyStudentPayload {
  studentId: string;
  classId: string;
  className: string;
  classStartDateTime: string; 
  reason: string;
}

export interface Meta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface RefundResponse {
  meta: Meta;
  status: string;
  code: number;
  message: string;
  data: RefundRequest[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any[] | null;
}