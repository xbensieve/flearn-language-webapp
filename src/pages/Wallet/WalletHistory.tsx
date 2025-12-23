/* eslint-disable no-irregular-whitespace */
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import {
  getWalletTransactions,
  TransactionType,
  translateTransactionType,
  type SortOption,
  type WalletTransaction,
} from '@/services/wallet/walletService';
import { Loader2, Wallet, Filter, FileSpreadsheet, RotateCcw, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { notifyError } from '@/utils/toastConfig';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Succeeded':
      return 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200';
    case 'Pending':
    case 'Processing':
      return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200';
    case 'Failed':
    case 'Cancelled':
    case 'Expired':
      return 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const translateProcessStatus = (status: string): string => {
  switch (status) {
    case 'Succeeded':
      return 'Thành công';
    case 'Pending':
      return 'Đang chờ';
    case 'Processing':
      return 'Đang xử lý';
    case 'Failed':
      return 'Thất bại';
    case 'Cancelled':
      return 'Đã hủy';
    case 'Expired':
      return 'Hết hạn';
    default:
      return status;
  }
};

const WalletHistoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [transactionType, setTransactionType] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['wallet-transactions', page, pageSize, transactionType, sort, fromDate, toDate],
    queryFn: () =>
      getWalletTransactions({
        PageNumber: page,
        PageSize: pageSize,
        TransactionType:
          transactionType === 'all' ? undefined : (Number(transactionType) as TransactionType),
        Sort: sort === 'newest' ? undefined : sort,
        FromDate: fromDate || undefined,
        ToDate: toDate || undefined,
      }),
  });

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    if (statusFilter === 'all') return data.data;
    return data.data.filter((item) => item.status === statusFilter);
  }, [data?.data, statusFilter]);

  const handleResetFilters = () => {
    setTransactionType('all');
    setStatusFilter('all');
    setFromDate('');
    setToDate('');
    setSort('newest');
    setPage(1);
  };

  const isFiltering =
    transactionType !== 'all' ||
    statusFilter !== 'all' ||
    fromDate !== '' ||
    toDate !== '' ||
    sort !== 'newest';

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const response = await getWalletTransactions({
        PageNumber: 1,
        PageSize: 10000,
        TransactionType:
          transactionType === 'all' ? undefined : (Number(transactionType) as TransactionType),
        Sort: sort === 'newest' ? undefined : sort,
        FromDate: fromDate || undefined,
        ToDate: toDate || undefined,
      });

      const transactions = response.data || [];
      if (transactions.length === 0) {
        notifyError('No transactions to export');
        setIsExporting(false);
        return;
      }

      const excelData = transactions.map((item: WalletTransaction) => ({
        'Transaction ID': item.walletTransactionId,
        Date: item.createdAt,
        Type: item.transactionType,
        Description: item.description,
        Status: item.status,
        'Amount (VND)': item.amount,
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const wscols = [{ wch: 35 }, { wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 15 }];
      worksheet['!cols'] = wscols;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Wallet History');

      const fileName = `FLearn_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Export failed:', error);
      notifyError('Failed to export Excel file.');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lịch sử ví</h1>
          <p className="text-slate-500 mt-1">
            Theo dõi khoản thanh toán, rút ​​tiền và hoàn tiền của bạn.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden md:flex gap-2 cursor-pointer"
            onClick={handleExportExcel}
            disabled={isExporting || isLoading}>
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
            )}
            {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
          </Button>

          <Button
            onClick={() => navigate('/teacher/payout-request')}
            className="bg-blue-600 hover:bg-blue-700 !text-white gap-2 shadow-md cursor-pointer">
            <Wallet className="w-4 h-4" /> Rút tiền
          </Button>
        </div>
      </div>

      <Separator />

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" /> Lọc & Sắp xếp
            </CardTitle>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              disabled={!isFiltering}
              className={`text-slate-500 hover:text-slate-900 ${!isFiltering ? 'opacity-50' : ''}`}>
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Đặt lại mặc định
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-end lg:items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-wrap">
              <div className="w-full sm:w-[160px]">
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Loại giao dịch
                </label>
                <Select
                  value={transactionType}
                  onValueChange={(val) => {
                    setTransactionType(val);
                    setPage(1);
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value={TransactionType.Payout.toString()}>Thanh toán</SelectItem>
                    <SelectItem value={TransactionType.Withdrawal.toString()}>Rút tiền</SelectItem>
                    <SelectItem value={TransactionType.Refund.toString()}>Đền bù</SelectItem>
                    <SelectItem value={TransactionType.Transfer.toString()}>
                      Chuyển khoản
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-[180px]">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-500 block">Trạng thái</label>
                  {statusFilter !== 'all' && (
                    <span
                      className="text-[10px] text-blue-600 cursor-pointer hover:underline flex items-center"
                      onClick={() => setStatusFilter('all')}>
                      <X className="w-3 h-3 mr-0.5" /> Xóa
                    </span>
                  )}
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}>
                  <SelectTrigger
                    className={`bg-slate-50 ${
                      statusFilter !== 'all' ? 'border-blue-500 ring-1 ring-blue-100' : ''
                    }`}>
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="Succeeded">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" /> Thành công
                      </span>
                    </SelectItem>
                    <SelectItem value="Pending">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" /> Đang chờ
                      </span>
                    </SelectItem>
                    <SelectItem value="Failed">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" /> Thất bại
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 w-full sm:w-auto min-w-[300px]">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Từ ngày</label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => setFromDate(e.target.value)}
                    value={fromDate}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Đến ngày</label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => setToDate(e.target.value)}
                    value={toDate}
                  />
                </div>
              </div>
            </div>

            <div className="w-full sm:w-[180px]">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Sắp xếp theo</label>
              <Select
                value={sort}
                onValueChange={(val: SortOption) => setSort(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất đầu tiên</SelectItem>
                  <SelectItem value="oldest">Cũ nhất đầu tiên</SelectItem>
                  <SelectItem value="amount_desc">Số tiền cao nhất</SelectItem>
                  <SelectItem value="amount_asc">Số tiền thấp nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[120px]">Trạng thái</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="min-w-[150px]">Mô tả</TableHead>
                <TableHead className="hidden md:table-cell">ID giao dịch</TableHead>
                <TableHead className="hidden md:table-cell">Ngày</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang tải dữ liệu...
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-red-500 font-medium">
                    Không tải được giao dịch. Vui lòng thử lại.
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-slate-500">
                    {data?.data && data.data.length > 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <span>
                          Không có giao dịch <b>{statusFilter}</b> nào trong trang này.
                        </span>
                        <Button
                          variant="link"
                          onClick={() => setStatusFilter('all')}>
                          Xem tất cả giao dịch
                        </Button>
                      </div>
                    ) : (
                      'Không tìm thấy giao dịch nào phù hợp.'
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((transaction) => (
                  <TableRow
                    key={transaction.walletTransactionId}
                    className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`font-medium border ${getStatusStyles(transaction.status)}`}>
                        {translateProcessStatus(transaction.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-700">
                        {translateTransactionType(transaction.transactionType)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div
                        className="max-w-[200px] truncate text-slate-600"
                        title={transaction.description}>
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
                          transaction.amount > 0 ? 'text-emerald-600' : 'text-slate-900'
                        }`}>
                        {transaction.amount > 0 ? '+' : ''}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {data?.meta && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Hiển thị</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(1);
                }}>
                <SelectTrigger className="w-[70px] h-8 bg-white">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-500">giao dịch</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500">
                Trang <span className="font-medium text-slate-900">{page}</span> /{' '}
                <span className="font-medium text-slate-900">{data.meta.totalPages}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={page <= 1 || isLoading}
                  className="h-8">
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={page >= data.meta.totalPages || isLoading}
                  className="h-8">
                  Tiếp theo
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WalletHistoryPage;
