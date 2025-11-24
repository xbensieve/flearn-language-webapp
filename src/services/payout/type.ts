
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
  payoutStatus: string;
  requestedAt: string;
  approvedAt: string | null;
  transactionRef: string | null;
  note: string | null;
  adminNote: string | null;
}
export interface AdminWallet {
  walletId: string;
  ownerId: string;
  name: string;
  ownerType: string;
  totalBalance: number;
  availableBalance: number;
  holdBalance: number;
  currency: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}
