

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

export interface RefundRequest {
 
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
