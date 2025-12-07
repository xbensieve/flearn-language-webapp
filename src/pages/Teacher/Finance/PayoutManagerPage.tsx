/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Wallet,
  History,
  Plus,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  PiggyBank,
  Lock,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Services & Utils
import {
  createPayoutRequest,
  getBankAccounts,
} from "@/services/teacherApplication";
import { getProfileTeacher } from "@/services/auth";
import axios from "@/config/axios";
import type { BankAccountResponse } from "@/services/teacherApplication/types";
import BankAccountDrawer from "@/pages/Teacher/components/BankAccountDrawer";
import { toast } from "sonner";

// --- Types ---
interface WalletData {
  availableBalance: number;
  totalBalance: number;
  holdBalance: number;
  currency: string;
}

// --- Helper Components ---

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("vi-VN");
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Completed:
      "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    Pending: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200",
    Rejected: "bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200",
  };

  const icons: Record<string, any> = {
    Completed: CheckCircle2,
    Pending: Clock,
    Rejected: XCircle,
  };

  const Icon = icons[status] || AlertCircle;
  const className =
    styles[status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <Badge
      variant="outline"
      className={`${className} flex items-center gap-1.5 w-fit px-2.5 py-0.5 font-medium`}
    >
      <Icon className="w-3.5 h-3.5" />
      {status}
    </Badge>
  );
};

// --- Main Component ---

const PayoutManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Data State
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  // Loading States
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal/Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form States
  const [amount, setAmount] = useState<string>("");
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  // --- Data Fetching ---

  const fetchWalletInfo = async () => {
    setIsLoadingWallet(true);
    try {
      const res = await getProfileTeacher();
      if (res.data && res.data.wallet) {
        setWallet(res.data.wallet);
      }
    } catch (error) {
      console.error("Failed to fetch wallet info", error);
      // Không notifyError ở đây để tránh spam toast khi load trang
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const fetchBankAccounts = async () => {
    setIsLoadingBanks(true);
    try {
      const res = await getBankAccounts();
      setBankAccounts(res.data || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load bank accounts");
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const fetchPayoutHistory = async () => {
    setIsLoadingPayouts(true);
    try {
      const response = await axios.get("/payout-requests/mine", {
        params: { page: 1, pageSize: 20 },
      });
      setPayouts(response.data.data || []);
    } catch (error) {
      console.log(error)
      toast.error("Failed to load payout history");
    } finally {
      setIsLoadingPayouts(false);
    }
  };

  useEffect(() => {
    fetchWalletInfo();
    fetchBankAccounts();
    fetchPayoutHistory();
  }, []);

  // --- Handlers ---

  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedBankId) {
      toast.error("Please fill in all fields");
      return;
    }

    const numAmount = parseInt(amount.replace(/[^0-9]/g, ""), 10);

    // Validation Logic
    if (numAmount < 100000) {
      toast.error("Minimum withdrawal is 100,000đ");
      return;
    }

    if (wallet && numAmount > wallet.availableBalance) {
      toast.error("Insufficient available balance");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPayoutRequest({
        amount: numAmount,
        bankAccountId: selectedBankId,
      });
      toast.success("Payout request submitted successfully!");

      // Reset form & Refresh data
      setAmount("");
      setSelectedBankId("");
      fetchWalletInfo(); // Update balance immediately
      fetchPayoutHistory();
      setActiveTab("history");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Payout request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    if (!isNaN(Number(value))) {
      setAmount(value);
    }
  };

  // --- Render ---

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8 animate-in fade-in duration-500">
      {/* 1. Dashboard Header & Wallet Stats */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Financial Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your earnings, payouts, and banking details.
          </p>
        </div>

        {/* Wallet Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Available Balance */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg border-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-blue-100 uppercase tracking-wide">
                  Available Balance
                </span>
              </div>
              {isLoadingWallet ? (
                <Skeleton className="h-10 w-3/4 bg-white/20" />
              ) : (
                <div className="space-y-1">
                  <p className="text-3xl font-bold tracking-tight">
                    {formatCurrency(wallet?.availableBalance || 0)}
                  </p>
                  <p className="text-xs text-blue-200">Ready to withdraw</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* On Hold Balance */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-50 rounded-full text-amber-600">
                  <Lock className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  On Hold
                </span>
              </div>
              {isLoadingWallet ? (
                <Skeleton className="h-10 w-1/2 bg-slate-100" />
              ) : (
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-slate-800">
                    {formatCurrency(wallet?.holdBalance || 0)}
                  </p>
                  <p className="text-xs text-slate-400">Pending clearance</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Income */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                  <PiggyBank className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Total Income
                </span>
              </div>
              {isLoadingWallet ? (
                <Skeleton className="h-10 w-1/2 bg-slate-100" />
              ) : (
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-slate-800">
                    {formatCurrency(wallet?.totalBalance || 0)}
                  </p>
                  <p className="text-xs text-slate-400">Lifetime earnings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-slate-100/80 p-1">
          <TabsTrigger
            value="overview"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <ArrowUpRight className="w-4 h-4" /> Request & Accounts
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <History className="w-4 h-4" /> Transaction History
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW (REQUEST + BANK ACCOUNTS) */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Request Form */}
            <Card className="lg:col-span-1 border-slate-200 shadow-sm h-fit">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Request Payout
                </CardTitle>
                <CardDescription>
                  Withdraw funds to your bank account.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleCreatePayout} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-slate-700">
                      Amount (đ)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">
                        ₫
                      </span>
                      <Input
                        id="amount"
                        placeholder="e.g. 5,000,000"
                        className="pl-7 font-mono"
                        value={amount ? Number(amount).toLocaleString() : ""}
                        onChange={handleAmountChange}
                      />
                    </div>
                    {wallet && Number(amount) > wallet.availableBalance && (
                      <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Exceeds available
                        balance
                      </p>
                    )}
                    <p className="text-xs text-slate-500">Min: 100,000 đ</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank" className="text-slate-700">
                      Receiving Account
                    </Label>
                    <Select
                      value={selectedBankId}
                      onValueChange={setSelectedBankId}
                    >
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Select a bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts.map((acc) => (
                          <SelectItem
                            key={acc.bankAccountId}
                            value={String(acc.bankAccountId)}
                          >
                            <div className="flex flex-col items-start py-1">
                              <span className="font-semibold">
                                {acc.bankName}
                              </span>
                              <span className="text-xs text-slate-500">
                                ••• {acc.accountNumber.slice(-4)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-[0.98]"
                    size="lg"
                    disabled={
                      isSubmitting ||
                      isLoadingBanks ||
                      isLoadingWallet ||
                      !amount ||
                      !selectedBankId ||
                      (wallet
                        ? Number(amount) > wallet.availableBalance
                        : false)
                    }
                  >
                    {isSubmitting ? "Processing..." : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Right Column: Bank Accounts List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">
                  Your Bank Accounts
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDrawerOpen(true)}
                  className="gap-2 border-dashed border-slate-300 hover:border-slate-400"
                >
                  <Plus className="w-4 h-4" /> Add New
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoadingBanks ? (
                  [1, 2].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                  ))
                ) : bankAccounts.length === 0 ? (
                  <Card className="col-span-2 border-dashed bg-slate-50/50 flex flex-col items-center justify-center py-12 text-center">
                    <Building2 className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-slate-500">No bank accounts linked.</p>
                    <Button variant="link" onClick={() => setDrawerOpen(true)}>
                      Add your first account
                    </Button>
                  </Card>
                ) : (
                  bankAccounts.map((acc) => (
                    <Card
                      key={acc.bankAccountId}
                      className="relative overflow-hidden group hover:shadow-md transition-all border-slate-200"
                    >
                      {acc.isDefault && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">
                          DEFAULT
                        </div>
                      )}
                      <CardContent className="p-5 flex flex-col gap-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">
                              {acc.bankName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {acc.bankBranch}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 pt-3 border-t border-slate-100">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                            Account Number
                          </p>
                          <p className="font-mono text-lg text-slate-700 tracking-wide">
                            {acc.accountNumber}
                          </p>
                          <p className="text-sm text-slate-600 mt-1 font-medium">
                            {acc.accountHolderName}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: HISTORY */}
        <TabsContent value="history">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View all your past payout requests and their status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Bank Info</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPayouts ? (
                    [1, 2, 3].map((i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : payouts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-slate-500"
                      >
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payouts.map((payout) => (
                      <TableRow key={payout.payoutRequestId}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {formatDate(payout.requestedAt).split(" ")[1]}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatDate(payout.requestedAt).split(" ")[0]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">
                              {payout.bankName}
                            </span>
                            <span className="text-xs text-slate-500 font-mono tracking-tight">
                              {payout.accountNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-slate-800">
                          {formatCurrency(payout.amount)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={payout.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setIsDetailOpen(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
            <DialogDescription>
              Transaction ID: #{selectedPayout?.payoutRequestId}
            </DialogDescription>
          </DialogHeader>

          {selectedPayout && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-sm text-slate-500">Amount</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCurrency(selectedPayout.amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500">Status</p>
                  <StatusBadge status={selectedPayout.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500">
                    Requested Date
                  </p>
                  <p className="text-sm text-slate-700">
                    {formatDate(selectedPayout.requestedAt)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <h4 className="text-sm font-semibold mb-2 text-slate-900">
                  Beneficiary Details
                </h4>
                <div className="bg-slate-50 p-3 rounded text-sm space-y-2 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank Name:</span>
                    <span className="font-medium">
                      {selectedPayout.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Number:</span>
                    <span className="font-mono font-medium">
                      {selectedPayout.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Teacher Email:</span>
                    <span className="font-medium">
                      {selectedPayout.teacherEmail}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Note Section */}
              {selectedPayout.note && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-1 text-slate-900">
                    Admin Note
                  </h4>
                  <div className="text-sm text-slate-600 bg-amber-50 p-3 rounded border border-amber-100 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{selectedPayout.note}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bank Account Drawer (Wraps your existing drawer) */}
      <BankAccountDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={fetchBankAccounts}
      />
    </div>
  );
};

export default PayoutManagerPage;
