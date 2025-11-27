

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



export interface RefundRequest {
 
  refundRequestId: string;
  enrollmentId: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  requestType: number;
  reason: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolderName: string;
  status: string;
  adminNote?: string;
  refundAmount: number;
  requestedAt: string;
  processedAt?: string;
  proofImageUrl?: string;
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