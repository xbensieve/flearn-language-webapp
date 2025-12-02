import axiosInstance from "@/lib/axiosInstance";

export const TransactionType = {
  Withdrawal: 2,
  Payout: 3,
  Refund: 4,
  Transfer: 7,
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionStatus = {
  Pending: "Pending",
  Processing: "Processing",
  Succeeded: "Succeeded",
  Failed: "Failed",
  Cancelled: "Cancelled",
  Refunded: "Refunded",
  Expired: "Expired",
} as const;

export type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

export type SortOption = "oldest" | "amount_desc" | "amount_asc" | "newest";

export interface WalletTransaction {
  walletTransactionId: string;
  amount: number;
  transactionType: string;
  status: string;
  description: string;
  createdAt: string;
}

export interface TransactionParams {
  TransactionType?: TransactionType;
  FromDate?: string;
  ToDate?: string;
  PageNumber?: number;
  PageSize?: number;
  Sort?: SortOption;
}

export interface MetaData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface WalletResponse {
  meta: MetaData;
  status: string;
  code: number;
  message: string;
  data: WalletTransaction[];
}

export const getWalletTransactions = async (
  params: TransactionParams
): Promise<WalletResponse> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== "")
  );

  const response = await axiosInstance.get<WalletResponse>(
    "/wallet-transactions",
    {
      params: cleanParams,
    }
  );

  return response.data;
};
