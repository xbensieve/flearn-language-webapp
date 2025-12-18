/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card,
  Typography,
  Spin,
  Space,
  Tag,
  Button,
  Row,
  Col,
  Progress,
  message,
  Alert,
  Modal,
  Input,
} from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getClassByIdService,
  requestCancelClassService,
  deleteClassService,
  updateClassService,
} from '../../services/class';
import EditClassModal from './components/EditClassModal';
import {
  LoadingOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  CloseOutlined,
  BookOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  DeleteOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  StarFilled,
  ThunderboltFilled,
  FireFilled,
  TrophyOutlined,
} from '@ant-design/icons';
import ClassEnrollmentList from './components/ClassEnrollmentList';
import { GraduationCap, Users, Wallet, Video, Calendar } from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

const { TextArea } = Input;

const statusConfig: Record<string, { label: string; color: string; bgGradient: string; icon: React.ReactNode }> = {
  Draft: {
    label: 'Bản nháp',
    color: '#8b5cf6',
    bgGradient: 'from-violet-500 via-purple-500 to-indigo-600',
    icon: <ThunderboltFilled />,
  },
  Published: {
    label: 'Đã xuất bản',
    color: '#10b981',
    bgGradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    icon: <StarFilled />,
  },
  InProgress: {
    label: 'Đang diễn ra',
    color: '#3b82f6',
    bgGradient: 'from-blue-500 via-blue-400 to-blue-300',
    icon: <ThunderboltFilled />,
  },
  Finished: {
    label: 'Đã kết thúc',
    color: '#6366f1',
    bgGradient: 'from-indigo-500 via-indigo-400 to-indigo-300',
    icon: <TrophyOutlined />,
  },
  Completed_PendingPayout: {
    label: 'Chờ thanh toán',
    color: '#f59e42',
    bgGradient: 'from-amber-400 via-amber-300 to-amber-200',
    icon: <ThunderboltFilled />,
  },
  Completed_Paid: {
    label: 'Đã thanh toán GV',
    color: '#22d3ee',
    bgGradient: 'from-cyan-400 via-cyan-300 to-cyan-200',
    icon: <StarFilled />,
  },
  PendingCancel: {
    label: 'Chờ hủy',
    color: '#f59e0b',
    bgGradient: 'from-amber-500 via-orange-500 to-red-500',
    icon: <FireFilled />,
  },
  Cancelled: {
    label: 'Đã hủy',
    color: '#ef4444',
    bgGradient: 'from-red-500 via-rose-500 to-pink-600',
    icon: <CloseOutlined />,
  },
};

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleEditSubmit = (values: Partial<any>) => {
    if (!classData) return Promise.reject(new Error('No class selected'));
    setUpdating(true);

    const updateData: Partial<any> = { ...values };
    const statusVal = (classData.status || '').toString().toLowerCase();
    if (statusVal === 'cancelled' || statusVal === 'canceled') {
      (updateData as any).status = 'Draft';
    }

    return updateClassService(classData.classID, updateData)
      .then((res) => {
        message.success(res.message || 'Cập nhật lớp học thành công');
        setEditModal(false);
        refetch();
        queryClient.invalidateQueries({ queryKey: ['class', id] });
        return res;
      })
      .catch((err: any) => {
        throw err;
      })
      .finally(() => setUpdating(false));
  };

  // Cancel request modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['class', id],
    queryFn: () => getClassByIdService(id!),
    enabled: !!id,
  });

  const classData = data?.data;




  // Handle request cancel class
  const handleRequestCancel = async () => {
    if (!cancelReason.trim()) {
      message.warning('Vui lòng nhập lý do hủy lớp.');
      return;
    }

    setIsSubmittingCancel(true);
    try {
      const res = await requestCancelClassService(id!, cancelReason);
      message.success({
        content: res.message || 'Yêu cầu hủy lớp đã được gửi thành công!',
        duration: 3,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      });
      setIsCancelModalOpen(false);
      setCancelReason('');
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['class', id] });
    } catch (error: any) {
      message.error({
        content: error.response?.data?.message || 'Không thể gửi yêu cầu hủy lớp.',
        duration: 4,
      });
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Handle delete class
  const handleDeleteClass = async () => {
    if (!deleteReason.trim()) {
      message.warning('Vui lòng nhập lý do xóa lớp.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteClassService(id!, deleteReason);
      message.success({
        content: res.message || 'Xóa lớp học thành công!',
        duration: 3,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      });
      setIsDeleteModalOpen(false);
      navigate('/teacher/classes');
    } catch (error: any) {
      message.error({
        content: error.response?.data?.message || 'Không thể xóa lớp học.',
        duration: 4,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate if class is more than 3 days away
  const isMoreThan3DaysAway = () => {
    if (!classData?.startDateTime) return false;
    const startDate = new Date(classData.startDateTime);
    const now = new Date();
    const diffTime = startDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays > 3;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100">
        <div className="relative">
          <div className="absolute inset-0 animate-ping bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full opacity-20 scale-150"></div>
          <div className="relative p-8 bg-white rounded-3xl shadow-2xl">
            <Spin
              size="large"
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 48 }}
                  className="text-violet-600"
                  spin
                />
              }
            />
          </div>
        </div>
        <Text className="mt-8 text-gray-600 text-xl font-medium animate-pulse">
          Đang tải thông tin lớp học...
        </Text>
      </div>
    );
  }

  if (isError || !classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center shadow-2xl rounded-3xl p-12 border-0">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full blur-2xl opacity-20 scale-150"></div>
              <div className="relative w-28 h-28 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center">
                <BookOutlined className="text-5xl text-violet-600" />
              </div>
            </div>
            <Title level={2} className="!text-gray-800 !mb-3">
              Không tìm thấy lớp học
            </Title>
            <Text className="text-gray-500 block mb-8 text-lg">
              Lớp học bạn đang tìm kiếm có thể không tồn tại hoặc đã bị xóa.
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/teacher/classes')}
              className="h-14 px-10 rounded-2xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 border-0 shadow-lg">
              Quay lại danh sách
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[classData.status] || statusConfig.Draft;
  const enrollmentPercentage = Math.round((classData.currentEnrollments / classData.capacity) * 100);

  const statusValue = (classData?.status || '').toString();
  const normalizedStatus = statusValue.toLowerCase();
  const isPublished = normalizedStatus === 'published';
  const isDraft = normalizedStatus === 'draft';
  const isCancelled = normalizedStatus === 'cancelled' || normalizedStatus === 'canceled';
  const isPendingCancel = ['pendingcancel', 'pending_cancel', 'pendingcancel'].includes(normalizedStatus);

  const canDelete = (isDraft || isMoreThan3DaysAway()) && !isCancelled && !isPendingCancel;
  const canRequestCancel = isPublished && !isMoreThan3DaysAway() && !isCancelled && !isPendingCancel;

  const isEditable = (s?: string) => {
    if (!s) return false;
    const n = s.toLowerCase();
    return n === 'draft' || n === 'cancelled' || n === 'canceled';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/teacher/classes')}
            size="large"
            className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0 font-medium h-12 px-6">
            Quay lại
          </Button>

          {/* Action Buttons */}
          <Space wrap>
            {isEditable(classData.status) && (
              <Button
                icon={<EditOutlined />}
                onClick={() => setEditModal(true)}
                size="large"
                className="bg-white text-violet-700 font-bold rounded-xl h-12 px-6 shadow-md">
                Sửa
              </Button>
            )}
                  {/* Edit Class Modal */}
                  <EditClassModal
                    visible={editModal}
                    onClose={() => setEditModal(false)}
                    onSubmit={handleEditSubmit}
                    initialValues={classData || {}}
                    loading={updating}
                  />
            {canRequestCancel && (
              <Button
                icon={<StopOutlined />}
                onClick={() => setIsCancelModalOpen(true)}
                size="large"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-medium h-12 px-6">
                Yêu cầu hủy lớp
              </Button>
            )}
            {canDelete && (
              <Button
                icon={<DeleteOutlined />}
                onClick={() => setIsDeleteModalOpen(true)}
                size="large"
                danger
                className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-medium h-12 px-6">
                Xóa lớp học
              </Button>
            )}
          </Space>
        </div>

        {/* Success Alert */}
        {isPublished && (
          <Alert
            message="🎉 Lớp học đang hoạt động!"
            description="Lớp học của bạn đã được xuất bản thành công và đang hiển thị cho học viên."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            className="mb-6 rounded-2xl shadow-lg border-0"
            closable
          />
        )}

        {/* Hero Header Card */}
        <Card className="shadow-2xl rounded-3xl border-0 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600 p-10 sm:p-12 text-white relative overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-6 rounded-full -mr-24 -mt-24"></div>
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-white/20 rounded-xl"><GraduationCap size={20} className="text-white" /></div>
                  <div className="text-sm text-white/80">Chi tiết lớp học · FLearn</div>
                </div>
                <Title level={1} className="!text-white !mb-4 !text-3xl sm:!text-4xl !font-bold !leading-tight">{classData.title}</Title>
                <Paragraph className="text-white/90 text-lg mb-6 leading-relaxed max-w-3xl">{classData.description}</Paragraph>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm">{classData.languageName}</span>
                  <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm">{classData.currentEnrollments}/{classData.capacity} học viên</span>
                  <Tag className="bg-white/20 text-white border-0">{statusInfo.label}</Tag>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {(isDraft || isCancelled) && (
                  <Button icon={<EditOutlined />} onClick={() => setEditModal(true)} className="bg-white text-violet-700 font-bold rounded-xl h-12 px-6">Sửa</Button>
                )}
                {canRequestCancel && (<Button icon={<StopOutlined />} onClick={() => setIsCancelModalOpen(true)} className="bg-amber-500 text-white rounded-xl h-12 px-6">Yêu cầu hủy</Button>)}
                {canDelete && (<Button danger onClick={() => setIsDeleteModalOpen(true)} className="rounded-xl h-12 px-6">Xóa</Button>)}
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <Row gutter={[24, 24]}>
          {/* Left Column - Class Information */}
          <Col xs={24} lg={14}>
            <Card className="shadow-xl rounded-3xl border-0 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl shadow-lg">
                  <BookOutlined className="text-white text-xl" />
                </div>
                <div>
                  <Title level={4} className="!m-0 !text-gray-900">Thông tin lớp học</Title>
                  <Text className="text-gray-500 text-sm">Chi tiết về lịch học và địa điểm</Text>
                </div>
              </div>

              <div className="space-y-4">
                {/* Language */}
                <div className="flex items-center p-5 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl border border-violet-100">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-md mr-4">
                    <GlobalOutlined className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <Text className="text-gray-500 text-xs block mb-1 uppercase tracking-wide font-medium">Ngôn ngữ giảng dạy</Text>
                    <Text className="text-gray-900 text-lg font-bold">{classData.languageName}</Text>
                  </div>
                </div>

                {/* Schedule */}
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md mr-3">
                      <Calendar size={18} className="text-white" />
                    </div>
                    <Text className="text-gray-900 font-bold text-base">Lịch học</Text>
                  </div>
                  <Row gutter={16}>
                  <Col span={12}>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <div className="text-xs text-gray-400 uppercase mb-2 font-semibold">Bắt đầu</div>
                      <div className="font-bold text-lg">{new Date(classData.startDateTime).toLocaleDateString('vi-VN')}</div>
                      <div className="text-sm text-gray-500 mt-1">{new Date(classData.startDateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <div className="text-xs text-gray-400 uppercase mb-2 font-semibold">Kết thúc</div>
                      <div className="font-bold text-lg">{new Date(classData.endDateTime).toLocaleDateString('vi-VN')}</div>
                      <div className="text-sm text-gray-500 mt-1">{new Date(classData.endDateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </Col>
                </Row>
                </div>

                {/* Google Meet Link */}
                {classData.googleMeetLink && (
                  <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-start">
                      <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md mr-4">
                        <Video size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <Text className="text-gray-500 text-xs block mb-2 uppercase tracking-wide font-medium">Link phòng học</Text>
                        <a
                          href={classData.googleMeetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 font-semibold break-all inline-flex items-center gap-2 text-base">
                          {classData.googleMeetLink}
                          <CheckCircleOutlined />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          {/* Right Column - Statistics */}
          <Col xs={24} lg={10}>
            <div className="space-y-6">
              {/* Enrollment Card */}
              <Card className="shadow-xl rounded-3xl border-0 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <Title level={4} className="!m-0 !text-gray-900">Tình trạng đăng ký</Title>
                    <Text className="text-gray-500 text-sm">Số lượng học viên hiện tại</Text>
                  </div>
                </div>

                <div className="text-center mb-6 p-6 bg-white rounded-2xl shadow-sm">
                  <div className="flex items-baseline justify-center gap-2">
                    <Text className="text-5xl sm:text-6xl font-black text-violet-700">{classData.currentEnrollments}</Text>
                    <Text className="text-3xl text-gray-400 font-medium">/</Text>
                    <Text className="text-3xl font-bold text-gray-600">{classData.capacity}</Text>
                  </div>
                  <Text className="text-gray-500 mt-2 block font-medium">Học viên đã đăng ký</Text>
                </div>

                <Progress
                  percent={enrollmentPercentage}
                  strokeColor={{
                    '0%': '#8b5cf6',
                    '100%': '#a855f7',
                  }}
                  trailColor="#e9d5ff"
                  strokeWidth={14}
                  className="mb-4"
                  format={() => null}
                />

                <div className="flex items-center justify-between gap-3">
                  <Button type="primary" className="rounded-xl px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 border-0 shadow-md">Xem học viên</Button>
                  <Tag className="rounded-full text-sm font-medium border-0">Còn <span className="font-bold">{classData.capacity - classData.currentEnrollments}</span> chỗ trống</Tag>
                </div>
              </Card>

              {/* Price Card */}
              <Card className="shadow-xl rounded-3xl border-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 overflow-hidden">
                <div className="relative p-6">
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-28 h-28 bg-white opacity-10 rounded-full -ml-14 -mb-14"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                        <Wallet size={24} className="text-white" />
                      </div>
                      <div>
                        <Text className="text-white font-bold text-lg block">Học phí</Text>
                        <Text className="text-white/70 text-sm">Giá mỗi học viên</Text>
                      </div>
                    </div>

                    <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                      <div className="flex items-baseline justify-center gap-1">
                        <Text className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                          {classData.pricePerStudent.toLocaleString('vi-VN')}
                        </Text>
                      </div>
                      <Text className="text-2xl text-white/90 font-bold mt-1 block">VNĐ</Text>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 text-white/80">
                      <TrophyOutlined />
                      <Text className="text-white/80 text-sm font-medium">Thanh toán một lần</Text>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Enrolled Students List */}
        <ClassEnrollmentList classId={id!} />
      </div>

      {/* Request Cancel Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 py-2">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <ExclamationCircleOutlined className="text-white text-lg" />
            </div>
            <span className="text-lg font-bold">Yêu cầu hủy lớp học</span>
          </div>
        }
        open={isCancelModalOpen}
        onCancel={() => {
          setIsCancelModalOpen(false);
          setCancelReason('');
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsCancelModalOpen(false);
              setCancelReason('');
            }}
            disabled={isSubmittingCancel}
            size="large"
            className="rounded-xl h-11">
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSubmittingCancel}
            onClick={handleRequestCancel}
            size="large"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 rounded-xl h-11 font-semibold">
            Gửi yêu cầu
          </Button>,
        ]}
        className="rounded-2xl"
        styles={{ body: { padding: '24px' } }}>
        <div className="py-2">
          <Alert
            message="Lớp học sắp bắt đầu"
            description="Do lớp học sẽ bắt đầu trong vòng 3 ngày, yêu cầu hủy của bạn sẽ được admin xem xét trước khi xử lý."
            type="warning"
            showIcon
            className="mb-6 rounded-xl"
          />
          <Text className="block mb-3 font-semibold text-gray-700">Lý do hủy lớp:</Text>
          <TextArea
            rows={4}
            placeholder="Vui lòng mô tả chi tiết lý do bạn muốn hủy lớp học này..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            maxLength={500}
            showCount
            className="rounded-xl"
          />
        </div>
      </Modal>

      {/* Delete Class Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 py-2">
            <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl">
              <DeleteOutlined className="text-white text-lg" />
            </div>
            <span className="text-lg font-bold">Xóa lớp học</span>
          </div>
        }
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteReason('');
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setDeleteReason('');
            }}
            disabled={isDeleting}
            size="large"
            className="rounded-xl h-11">
            Đóng
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={isDeleting}
            onClick={handleDeleteClass}
            size="large"
            className="rounded-xl h-11 font-semibold">
            Xác nhận xóa
          </Button>,
        ]}
        className="rounded-2xl"
        styles={{ body: { padding: '24px' } }}>
        <div className="py-2">
          <Alert
            message="Hành động không thể hoàn tác"
            description="Xóa lớp học sẽ xóa vĩnh viễn khỏi hệ thống. Tất cả học viên đã đăng ký sẽ được thông báo."
            type="error"
            showIcon
            className="mb-6 rounded-xl"
          />
          <Text className="block mb-3 font-semibold text-gray-700">Lý do xóa:</Text>
          <TextArea
            rows={4}
            placeholder="Vui lòng mô tả lý do bạn muốn xóa lớp học này..."
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            maxLength={500}
            showCount
            className="rounded-xl"
          />
        </div>
      </Modal>
    </div>
  );
};

export default ClassDetail;
