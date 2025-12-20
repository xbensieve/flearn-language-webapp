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

export const RefundStatus = {
  Draft: 0,
  Pending: 1,
  UnderReview: 2,
  Approved: 3,
  Rejected: 4,
  Completed: 5,
  Cancelled: 6,
} as const;

export type RefundStatus = typeof RefundStatus[keyof typeof RefundStatus];

export interface RefundRequestClass {
  refundRequestID: string;
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
  statusText?: string;
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