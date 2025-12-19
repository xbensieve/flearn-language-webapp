/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  Users,
  Wallet,
  TrendingUp,
  Mail,
  CheckCircle,
  Clock,
  CircleDollarSign,
  User,
  Loader2,
  Crown,
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getClassEnrollmentsService } from '../../../services/class';
import type { ClassEnrollment } from '../../../services/class/type';

interface ClassEnrollmentListProps {
  classId: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  Paid: { label: 'Đã thanh toán', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
  Pending: { label: 'Chờ xử lý', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  Refunded: { label: 'Đã hoàn tiền', variant: 'destructive', icon: <CircleDollarSign className="h-3 w-3" /> },
};


const ClassEnrollmentList: React.FC<ClassEnrollmentListProps> = ({ classId }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['class-enrollments', classId],
    queryFn: () => getClassEnrollmentsService(classId),
    enabled: !!classId,
  });

  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Danh sách học viên</CardTitle>
          <CardDescription>Đang tải danh sách học viên...</CardDescription>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Lỗi</CardTitle>
           <CardDescription>Không thể tải danh sách học viên</CardDescription>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center">
            <p className='text-destructive'>Đã có lỗi xảy ra khi tải dữ liệu.</p>
        </CardContent>
      </Card>
    );
  }

  const enrollments = data?.data || [];
  const statistics = data?.statistics;

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                    <Users size={24} className="text-primary" />
                </div>
                <div>
                    <CardTitle>Danh sách học viên</CardTitle>
                    <CardDescription>Quản lý học viên đăng ký lớp học</CardDescription>
                </div>
            </div>
             {statistics && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="p-2">
                  Tổng: <strong className="ml-1">{statistics.totalEnrollments}</strong>
                </Badge>
                <Badge variant="outline" className="p-2 text-green-600 border-green-200">
                  Đã thanh toán: <strong className="ml-1">{statistics.paidEnrollments}</strong>
                </Badge>
                {statistics.pendingEnrollments > 0 && (
                   <Badge variant="outline" className="p-2 text-amber-600 border-amber-200">
                    Chờ xử lý: <strong className="ml-1">{statistics.pendingEnrollments}</strong>
                  </Badge>
                )}
              </div>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {enrollments.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto bg-secondary text-secondary-foreground/50 p-4 rounded-full w-fit mb-4">
              <Users className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold">Chưa có học viên</h3>
            <p className="text-muted-foreground mt-1">
              Học viên sẽ xuất hiện ở đây khi họ đăng ký lớp học của bạn.
            </p>
          </div>
        ) : (
          <>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Học viên</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead>Ngày đăng ký</TableHead>
                    <TableHead>Mã giao dịch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment: ClassEnrollment) => {
                    const statusInfo = statusConfig[enrollment.status] || statusConfig.Pending;
                    return (
                      <TableRow key={enrollment.enrollmentID}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={undefined} />
                              <AvatarFallback>
                                <User className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{enrollment.userName}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {enrollment.studentEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {new Intl.NumberFormat('vi-VN').format(enrollment.amountPaid)} VNĐ
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={statusInfo.variant} className="flex items-center gap-1.5">
                            {statusInfo.icon}
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {dayjs(enrollment.enrolledAt).format('DD/MM/YYYY')}
                          </div>
                           <div className="text-xs text-muted-foreground">
                            {dayjs(enrollment.enrolledAt).format('HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant="secondary" className="font-mono">
                             {enrollment.paymentTransactionId ? `#${enrollment.paymentTransactionId.slice(-8)}` : '-'}
                           </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Revenue Summary */}
            <div className="mt-8 pt-8 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="text-amber-500 text-xl" />
                  <h3 className="text-lg font-semibold">Tổng quan doanh thu</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-green-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-green-800">Tổng doanh thu</CardTitle>
                      <Wallet className="h-4 w-4 text-green-700" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-800">
                         {new Intl.NumberFormat('vi-VN').format(
                          enrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0)
                        )} VNĐ
                      </p>
                    </CardContent>
                  </Card>
                   <Card className="bg-violet-50 border-violet-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-violet-800">Tổng học viên</CardTitle>
                      <Users className="h-4 w-4 text-violet-700" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-violet-800">{enrollments.length}</p>
                    </CardContent>
                  </Card>
                   <Card className="bg-amber-50 border-amber-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-amber-800">Trung bình/học viên</CardTitle>
                      <TrendingUp className="h-4 w-4 text-amber-700" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-amber-800">
                        {new Intl.NumberFormat('vi-VN').format(
                          Math.round(
                            enrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0) /
                              (enrollments.length || 1)
                          )
                        )} VNĐ
                      </p>
                    </CardContent>
                  </Card>
                </div>
            </div>

          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassEnrollmentList;
