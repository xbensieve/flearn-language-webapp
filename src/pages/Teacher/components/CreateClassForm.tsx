import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, TimePicker, Select, Row, Col, Card, Tooltip, Typography, message } from 'antd';
import { RocketOutlined, DollarOutlined, InfoCircleOutlined, CalendarOutlined, ClockCircleOutlined, FileTextOutlined, UserOutlined, TeamOutlined, BookOutlined, StarFilled } from '@ant-design/icons';
import { GraduationCap, Sparkles, Wallet, Clock, Calendar, Users } from 'lucide-react';
import dayjs from 'dayjs';
import { createClassService, getClassAssignmentsService } from '../../../services/class';
import type { ProgramAssignment } from '@/types/createCourse';

const { Text } = Typography;

interface CreateClassFormProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const CreateClassForm: React.FC<CreateClassFormProps> = ({ visible, onClose, onCreated }) => {
  const [form] = Form.useForm();
  const [isCreating, setIsCreating] = useState(false);
  const [programsRes, setProgramsRes] = useState<ProgramAssignment[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState<boolean>(true);
  const { TextArea } = Input;

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoadingPrograms(true);
        const res = await getClassAssignmentsService();
        if (!mounted) return;
        setProgramsRes(res.data || []);
      } catch (err) {
        console.error('Failed to load programs', err);
      } finally {
        if (mounted) setIsLoadingPrograms(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Lấy giá trị realtime cho preview
  const formValues = Form.useWatch([], form) || {};
  const minStudents = Number(formValues.minStudents) || 1;
  const capacity = Number(formValues.capacity) || 30;
  const pricePerStudent = Number(formValues.pricePerStudent) || 100000;

  const onFinish = async (values: any) => {
    setIsCreating(true);
    try {
      const payload = {
        title: values.title,
        description: values.description,
        classDate: values.classDate ? values.classDate.format('YYYY-MM-DD') : undefined,
        startTime: values.startTime ? values.startTime.format('HH:mm') : undefined,
        durationMinutes: values.durationMinutes,
        pricePerStudent: values.pricePerStudent,
        minStudents: values.minStudents,
        capacity: values.capacity,
        programAssignmentId: values.programAssignmentId,
      };
      const res = await createClassService(payload);
      message.success({ content: res.message || 'Tạo lớp học thành công!', duration: 3 });
      form.resetFields();
      onClose();
      if (onCreated) onCreated();
    } catch (error: any) {
      message.error({ content: error?.response?.data?.message || 'Tạo lớp thất bại', duration: 4 });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-4 py-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl blur-lg opacity-40"></div>
            <div className="relative p-4 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl shadow-xl">
              <GraduationCap size={28} className="text-white" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Tạo lớp học mới
              <Sparkles size={20} className="text-amber-500" />
            </div>
            <Text className="text-gray-500 text-sm">Khởi tạo lớp học trực tuyến của bạn</Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      confirmLoading={isCreating}
      width={1200}
      okText="Tạo lớp học"
      cancelText="Hủy bỏ"
      okButtonProps={{
        className:
          'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 border-0 shadow-lg shadow-violet-200 h-12 px-10 font-bold rounded-xl',
        icon: <RocketOutlined />,
      }}
      cancelButtonProps={{
        className: 'h-12 px-8 rounded-xl hover:border-gray-400 font-medium',
      }}
      styles={{
        header: {
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '20px',
          background: 'linear-gradient(to right, #faf5ff, #eef2ff)',
          borderRadius: '24px 24px 0 0',
        },
        body: {
          paddingTop: '24px',
          background: '#fafbfc',
        },
        content: {
          borderRadius: '24px',
          overflow: 'hidden',
        },
      }}
      className="create-class-modal">
      <div className="flex flex-col md:flex-row gap-8">
        {/* FORM CỘT TRÁI */}
        <div className="flex-1 min-w-0">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              pricePerStudent: 100000,
              minStudents: 5,
              capacity: 30,
              durationMinutes: 60,
            }}>
            {/* Basic Information Section */}
            <Card
              className="mb-6 shadow-lg border-0 rounded-2xl overflow-hidden"
              styles={{
                header: {
                  background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                  borderBottom: 'none',
                  padding: '20px 24px',
                },
                body: {
                  padding: '24px',
                },
              }}
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-md">
                    <BookOutlined className="text-white text-lg" />
                  </div>
                  <div>
                    <Text className="text-lg font-bold text-gray-900 block">Thông tin cơ bản</Text>
                    <Text className="text-gray-500 text-xs">Điền thông tin chính của lớp học</Text>
                  </div>
                </div>
              }>
              <Form.Item
                name="title"
                label={
                  <span className="text-gray-700 font-semibold flex items-center gap-2">
                    <FileTextOutlined className="text-violet-600" />
                    Tên lớp học
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập tên lớp học' },
                  { min: 5, message: 'Tên lớp học phải có ít nhất 5 ký tự' },
                ]}>
                <Input
                  placeholder="VD: Tiếng Anh giao tiếp nâng cao - Chủ đề kinh doanh"
                  size="large"
                  className="rounded-xl border-gray-200 hover:border-violet-400 focus:border-violet-500 h-12"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <span className="text-gray-700 font-semibold flex items-center gap-2">
                    <FileTextOutlined className="text-violet-600" />
                    Mô tả lớp học
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả' },
                  { min: 20, message: 'Mô tả phải có ít nhất 20 ký tự' },
                ]}>
                <TextArea
                  rows={4}
                  placeholder="Mô tả chi tiết nội dung học, đối tượng phù hợp, yêu cầu tiên quyết và những gì học viên sẽ đạt được sau khóa học..."
                  className="rounded-xl border-gray-200 hover:border-violet-400 focus:border-violet-500"
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item
                name="programAssignmentId"
                label={
                  <span className="text-gray-700 font-semibold flex items-center gap-2">
                    <BookOutlined className="text-violet-600" />
                    Chương trình giảng dạy
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn chương trình giảng dạy' }]}
              >
                <Select
                  showSearch
                  loading={isLoadingPrograms}
                  placeholder="Tìm và chọn chương trình giảng dạy"
                  size="large"
                  className="rounded-xl"
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                  options={programsRes?.map((program) => ({
                    value: program.programAssignmentId,
                    label: `${program.programName} - ${program.levelName}`,
                  }))}
                />
              </Form.Item>
            </Card>

            {/* Schedule Section */}
            <Card
              className="mb-6 shadow-lg border-0 rounded-2xl overflow-hidden"
              styles={{
                header: {
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderBottom: 'none',
                  padding: '20px 24px',
                },
                body: {
                  padding: '24px',
                },
              }}
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md">
                    <Calendar size={18} className="text-white" />
                  </div>
                  <div>
                    <Text className="text-lg font-bold text-gray-900 block">Lịch học & Thời lượng</Text>
                    <Text className="text-gray-500 text-xs">Thiết lập thời gian tổ chức lớp học</Text>
                  </div>
                </div>
              }>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="classDate"
                    label={
                      <span className="text-gray-700 font-semibold flex items-center gap-2">
                        <CalendarOutlined className="text-amber-600" />
                        Ngày học
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Vui lòng chọn ngày' },
                      {
                        validator: (_, value) => {
                          if (value && value.isBefore(dayjs().add(7, 'day'))) {
                            return Promise.reject('Ngày học phải cách ít nhất 7 ngày kể từ hôm nay');
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <DatePicker
                      className="w-full rounded-xl border-gray-200 hover:border-amber-400 h-12"
                      size="large"
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày học"
                      disabledDate={(current) => current && current < dayjs().add(6, 'day')}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="startTime"
                    label={
                      <span className="text-gray-700 font-semibold flex items-center gap-2">
                        <Clock size={16} className="text-amber-600" />
                        Giờ bắt đầu
                      </span>
                    }
                    rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      className="w-full rounded-xl border-gray-200 hover:border-amber-400 h-12"
                      size="large"
                      placeholder="Chọn giờ"
                      minuteStep={15}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="durationMinutes"
                label={
                  <span className="text-gray-700 font-semibold flex items-center gap-2">
                    <ClockCircleOutlined className="text-amber-600" />
                    Thời lượng buổi học
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn thời lượng' }]}
              >
                <Select
                  placeholder="Chọn thời lượng"
                  size="large"
                  className="rounded-xl">
                  <Select.Option value={30}>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-semibold">30 phút</span>
                      <Text type="secondary" className="text-xs bg-gray-100 px-3 py-1 rounded-full font-medium">
                        Nhanh
                      </Text>
                    </div>
                  </Select.Option>
                  <Select.Option value={45}>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-semibold">45 phút</span>
                      <Text type="secondary" className="text-xs bg-gray-100 px-3 py-1 rounded-full font-medium">
                        Ngắn
                      </Text>
                    </div>
                  </Select.Option>
                  <Select.Option value={60}>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-semibold">60 phút</span>
                      <span className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                        <StarFilled className="text-amber-500" /> Đề xuất
                      </span>
                    </div>
                  </Select.Option>
                  <Select.Option value={90}>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-semibold">90 phút</span>
                      <Text type="secondary" className="text-xs bg-gray-100 px-3 py-1 rounded-full font-medium">
                        Mở rộng
                      </Text>
                    </div>
                  </Select.Option>
                  <Select.Option value={120}>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-semibold">120 phút</span>
                      <Text type="secondary" className="text-xs bg-gray-100 px-3 py-1 rounded-full font-medium">
                        Chuyên sâu
                      </Text>
                    </div>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Card>

            {/* Capacity & Pricing Section */}
            <Card
              className="mb-6 shadow-lg border-0 rounded-2xl overflow-hidden"
              styles={{
                header: {
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  borderBottom: 'none',
                  padding: '20px 24px',
                },
                body: {
                  padding: '24px',
                },
              }}
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md">
                    <Users size={18} className="text-white" />
                  </div>
                  <div>
                    <Text className="text-lg font-bold text-gray-900 block">Sức chứa & Học phí</Text>
                    <Text className="text-gray-500 text-xs">Cấu hình số lượng học viên và giá</Text>
                  </div>
                </div>
              }>
              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="minStudents"
                    label={
                      <span className="text-gray-700 font-semibold flex items-center gap-2">
                        <UserOutlined className="text-emerald-600" />
                        Tối thiểu
                        <Tooltip title="Lớp học chỉ được mở khi đạt số học viên tối thiểu">
                          <InfoCircleOutlined className="text-gray-400 cursor-help" />
                        </Tooltip>
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Bắt buộc' },
                      { type: 'number', min: 1, message: 'Tối thiểu 1' },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      className="w-full rounded-xl"
                      size="large"
                      placeholder="VD: 5"
                      addonAfter="người"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="capacity"
                    label={
                      <span className="text-gray-700 font-semibold flex items-center gap-2">
                        <TeamOutlined className="text-emerald-600" />
                        Tối đa
                        <Tooltip title="Số học viên tối đa có thể đăng ký">
                          <InfoCircleOutlined className="text-gray-400 cursor-help" />
                        </Tooltip>
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Bắt buộc' },
                      {
                        type: 'number',
                        min: minStudents || 1,
                        message: `Phải ≥ ${minStudents || 1}`,
                      },
                      { type: 'number', max: 100, message: 'Tối đa 100' },
                    ]}
                  >
                    <InputNumber
                      min={minStudents || 1}
                      max={100}
                      className="w-full rounded-xl"
                      size="large"
                      placeholder="VD: 30"
                      addonAfter="người"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="pricePerStudent"
                    label={
                      <span className="text-gray-700 font-semibold flex items-center gap-2">
                        <Wallet size={16} className="text-emerald-600" />
                        Học phí
                      </span>
                    }
                    rules={[
                      { required: true, message: 'Bắt buộc' },
                      { type: 'number', min: 10000, message: 'Tối thiểu 10.000đ' },
                    ]}
                  >
                    <InputNumber<number>
                      min={10000}
                      step={10000}
                      className="w-full rounded-xl"
                      size="large"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => Number(value?.replace(/[.,]/g, '') || 0)}
                      placeholder="Nhập học phí"
                      addonAfter="VNĐ"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Revenue Preview */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-5 mt-4 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <DollarOutlined className="text-emerald-600 text-lg" />
                    </div>
                    <div>
                      <Text className="text-gray-600 font-medium block">Doanh thu tiềm năng</Text>
                      <Text className="text-gray-400 text-xs">Khi đầy lớp</Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {new Intl.NumberFormat('vi-VN').format(
                        (pricePerStudent || 100000) * (capacity || 30)
                      )}
                    </Text>
                    <Text className="text-emerald-600 font-bold text-sm ml-1">VNĐ</Text>
                  </div>
                </div>
              </div>
            </Card>

            {/* Info Note */}
            <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border border-violet-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-violet-100 rounded-xl">
                  <InfoCircleOutlined className="text-violet-600 text-lg" />
                </div>
                <div>
                  <Text className="text-violet-900 font-bold block mb-2 text-base">Lưu ý quan trọng</Text>
                  <Text className="text-violet-700 text-sm leading-relaxed">
                    Lớp học sẽ được tạo ở trạng thái <strong>Bản nháp</strong>. Bạn có thể xem lại và <strong>Xuất bản</strong>{' '}
                    từ trang chi tiết lớp học. Học viên chỉ có thể đăng ký sau khi lớp được xuất bản. 
                    Lớp học chỉ diễn ra khi đạt số học viên tối thiểu trước ngày khai giảng.
                  </Text>
                </div>
              </div>
            </div>
          </Form>
        </div>
        {/* PREVIEW CỘT PHẢI */}
        <div className="w-full md:w-[400px] flex-shrink-0">
          <div className="sticky top-4">
            <Card className="rounded-2xl shadow-xl border-0 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap size={28} className="text-violet-600" />
                <span className="font-bold text-lg text-gray-900">Preview lớp học</span>
              </div>
              <div className="mb-2">
                <span className="block text-xs text-gray-400 mb-1">Tên lớp học</span>
                <span className="font-bold text-xl text-violet-700">{formValues.title || 'Tên lớp học...'}</span>
              </div>
              <div className="mb-2">
                <span className="block text-xs text-gray-400 mb-1">Mô tả</span>
                <span className="text-gray-700 text-sm line-clamp-3">{formValues.description || 'Mô tả lớp học hấp dẫn của bạn sẽ xuất hiện ở đây.'}</span>
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-400">Chương trình</div>
                <div className="font-medium text-sm text-gray-700">{(programsRes.find(p => p.programAssignmentId === formValues.programAssignmentId) ? `${programsRes.find(p => p.programAssignmentId === formValues.programAssignmentId)?.programName} - ${programsRes.find(p => p.programAssignmentId === formValues.programAssignmentId)?.levelName}` : (formValues.programName ? `${formValues.programName}${formValues.levelName ? ' - ' + formValues.levelName : ''}` : 'Chưa chọn'))}</div>
              </div>

              <div className="mb-2">
                <span className="block text-xs text-gray-400 mb-1">Ngày học</span>
                <span className="font-medium text-gray-800">{formValues.classDate ? formValues.classDate.format('DD/MM/YYYY') : '--/--/----'}</span>
              </div>
              <div className="mb-2">
                <span className="block text-xs text-gray-400 mb-1">Giờ bắt đầu</span>
                <span className="font-medium text-gray-800">{formValues.startTime ? formValues.startTime.format('HH:mm') : '--:--'}</span>
              </div>
              <div className="mb-2">
                <span className="block text-xs text-gray-400 mb-1">Thời lượng</span>
                <span className="font-medium text-gray-800">{formValues.durationMinutes ? `${formValues.durationMinutes} phút` : '-- phút'}</span>
              </div>
              <div className="mb-2">
                <span className="block text-xs text-gray-400 mb-1">Số lượng</span>
                <span className="font-medium text-gray-800">{formValues.minStudents || 0} - {formValues.capacity || 0} học viên</span>
              </div>
              <div className="mb-2">
                <span className="block text-xs text-gray-400 mb-1">Học phí</span>
                <span className="font-bold text-emerald-600 text-lg">{formValues.pricePerStudent ? `${Number(formValues.pricePerStudent).toLocaleString('vi-VN')} VNĐ` : '-- VNĐ'}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Modal>
  );
  };

export default CreateClassForm;
