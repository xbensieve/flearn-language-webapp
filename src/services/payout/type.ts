// src/services/payout/type.ts
export interface AdminPayout {
  payoutRequestId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  bankAccountId: string;
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  payoutStatus: string; // "Completed" | "Pending" | "Rejected" | ...
  requestedAt: string;
  approvedAt: string | null;
  transactionRef: string | null;
  note: string | null;
  adminNote: string | null;
}
