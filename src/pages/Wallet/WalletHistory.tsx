import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import {
  getWalletTransactions,
  TransactionType,
  type SortOption,
  type WalletTransaction,
} from "@/services/wallet/walletService";
import {
  Loader2,
  Wallet,
  Filter,
  FileSpreadsheet,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { notifyError } from "@/utils/toastConfig";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Succeeded":
      return "bg-green-100 text-green-700 hover:bg-green-100 border-green-200";
    case "Pending":
    case "Processing":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200";
    case "Failed":
    case "Cancelled":
    case "Expired":
      return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const WalletHistoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [transactionType, setTransactionType] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [isExporting, setIsExporting] = useState(false);

  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "wallet-transactions",
      page,
      transactionType,
      sort,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      getWalletTransactions({
        PageNumber: page,
        PageSize: 10,
        TransactionType:
          transactionType === "all"
            ? undefined
            : (Number(transactionType) as TransactionType),
        Sort: sort === "newest" ? undefined : sort,
        FromDate: fromDate || undefined,
        ToDate: toDate || undefined,
      }),
  });

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const response = await getWalletTransactions({
        PageNumber: 1,
        PageSize: 10000,
        TransactionType:
          transactionType === "all"
            ? undefined
            : (Number(transactionType) as TransactionType),
        Sort: sort === "newest" ? undefined : sort,
        FromDate: fromDate || undefined,
        ToDate: toDate || undefined,
      });

      const transactions = response.data || [];

      if (transactions.length === 0) {
        notifyError("No transactions to export");
        setIsExporting(false);
        return;
      }

      const excelData = transactions.map((item: WalletTransaction) => ({
        "Transaction ID": item.walletTransactionId,
        Date: item.createdAt,
        Type: item.transactionType,
        Description: item.description,
        Status: item.status,
        "Amount (VND)": item.amount,
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const wscols = [
        { wch: 35 }, // ID
        { wch: 20 }, // Date
        { wch: 15 }, // Type
        { wch: 40 }, // Description
        { wch: 15 }, // Status
        { wch: 15 }, // Amount
      ];
      worksheet["!cols"] = wscols;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Wallet History");

      const fileName = `FLearn_Transactions_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Export failed:", error);
      notifyError("Failed to export Excel file.");
    } finally {
      setIsExporting(false);
    }
  };


  const handleNextPage = () => {
    if (data?.meta && page < data.meta.totalPages) setPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Wallet History
          </h1>
          <p className="text-slate-500 mt-1">
            Track your payouts, withdrawals, and refunds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* UPDATED EXPORT BUTTON */}
          <Button
            variant="outline"
            className="hidden md:flex gap-2 cursor-pointer"
            onClick={handleExportExcel}
            disabled={isExporting || isLoading}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
            )}
            {isExporting ? "Exporting..." : "Export Excel"}
          </Button>

          <Button
            onClick={() => navigate("/teacher/payout-request")}
            className="bg-blue-600 hover:bg-blue-700 !text-white gap-2 shadow-md cursor-pointer"
          >
            <Wallet className="w-4 h-4" /> Withdraw Funds
          </Button>
        </div>
      </div>

      <Separator />

      {/* 2. FILTERS & CONTROLS */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" /> Filter & Sort
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-end lg:items-center">
            {/* Left: Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Type Select */}
              <div className="w-full sm:w-[180px]">
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Transaction Type
                </label>
                <Select
                  value={transactionType}
                  onValueChange={(val) => {
                    setTransactionType(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value={TransactionType.Payout.toString()}>
                      Payout
                    </SelectItem>
                    <SelectItem value={TransactionType.Withdrawal.toString()}>
                      Withdrawal
                    </SelectItem>
                    <SelectItem value={TransactionType.Refund.toString()}>
                      Refund
                    </SelectItem>
                    <SelectItem value={TransactionType.Transfer.toString()}>
                      Transfer
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Inputs */}
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    From Date
                  </label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    To Date
                  </label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right: Sort */}
            <div className="w-full sm:w-[180px]">
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Sort By
              </label>
              <Select
                value={sort}
                onValueChange={(val: SortOption) => setSort(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount_desc">Highest Amount</SelectItem>
                  <SelectItem value="amount_asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. DATA TABLE */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="min-w-[150px]">Description</TableHead>
                <TableHead className="hidden md:table-cell">
                  Transaction ID
                </TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading
                      data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-red-500 font-medium"
                  >
                    Failed to load transactions. Please try again.
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-slate-500"
                  >
                    No transactions found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((transaction) => (
                  <TableRow
                    key={transaction.walletTransactionId}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`font-medium border ${getStatusStyles(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-700">
                        {transaction.transactionType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div
                        className="max-w-[200px] truncate text-slate-600"
                        title={transaction.description}
                      >
                        {transaction.description}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs text-slate-400">
                      {transaction.walletTransactionId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-600 text-sm">
                      {transaction.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-bold ${
                          transaction.amount > 0
                            ? "text-emerald-600"
                            : "text-slate-900"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 4. PAGINATION FOOTER */}
        {data?.meta && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30">
            <div className="text-sm text-slate-500">
              Page <span className="font-medium text-slate-900">{page}</span> of{" "}
              <span className="font-medium text-slate-900">
                {data.meta.totalPages}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page <= 1 || isLoading}
                className="h-8"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page >= data.meta.totalPages || isLoading}
                className="h-8"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WalletHistoryPage;
