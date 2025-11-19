/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/RefundAdminPage.tsx
import React, { useState } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Button,
  Empty,
  Spin,
  Select,
  Space,
  Badge,
  Modal,
  Form,
  Input,
  Upload,
  Radio,
  message,
  Image,
  Drawer,
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  EyeOutlined,
  LoadingOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { notifyStudent, processRefund } from '../../services/refund';
import api from '../../config/axios';
import type { RefundRequest } from '../../services/refund/type';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: '0', label: 'Mới tạo' },
  { value: '1', label: 'Đã nhắc' },
  { value: '2', label: 'Đã nộp đơn' },
  { value: '3', label: 'Đang xử lý' },
  { value: '4', label: 'Đã duyệt' },
  { value: '5', label: 'Từ chối' },
];

const statusColors: Record<string, string> = {
  '0': 'default',
  '1': 'blue',
  '2': 'gold',
  '3': 'orange',
  '4': 'green',
  '5': 'red',
};

const RefundAdminPage: React.FC = () => {
  // const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>('');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();

  // useQuery: Danh sách đơn hoàn tiền
  const { data, isLoading, refetch } = useQuery<RefundRequest[]>({
    queryKey: ['refunds', status],
    queryFn: async () => {
      const params = status ? { status: Number(status) } : {};
      const res = await api.get('/Refund/admin/list', { params });
      return res.data.data || res.data;
    },
    retry: 1,
    retryDelay: 500,
  });

  const refunds = data ?? [];

  // Mutations
  const notifyMutation = useMutation({
    mutationFn: notifyStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      message.success('Đã gửi email nhắc nhở!');
    },
    onError: () => message.error('Gửi nhắc nhở thất bại!'),
  });

  const processMutation = useMutation({
    mutationFn: processRefund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      setIsModalVisible(false);
      setSelectedRefund(null);
      form.resetFields();
      message.success('Xử lý đơn thành công!');
    },
    onError: () => message.error('Xử lý đơn thất bại!'),
  });

  // Mutation: Tạo yêu cầu hoàn tiền (gửi thông báo cho học viên)
  const createRefundMutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        studentId: values.studentId,
        classId: values.classId,
        className: values.className,
        classStartDateTime: values.classStartDateTime,
        reason: values.reason,
      };
      return await api.post('/Refund/admin/notify-student', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      createForm.resetFields();
      setIsDrawerVisible(false);
      message.success('Đã tạo yêu cầu hoàn tiền và gửi email cho học viên!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Tạo yêu cầu thất bại!');
    },
  });

  const handleStatusChange = (value: string) => {
    setStatus(value);
    refetch();
  };

  const handleViewDetail = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setIsModalVisible(true);
  };

  const handleNotify = (refund: RefundRequest) => {
    notifyMutation.mutate({
      studentId: refund.studentId,
      classId: refund.classId,
      className: refund.className,
      classStartDateTime: refund.classStartDateTime,
      reason: refund.reason,
    });
  };

  const handleProcessRefund = (values: any) => {
    if (!selectedRefund) return;

    processMutation.mutate({
      RefundRequestId: selectedRefund.refundRequestId,
      Action: values.action,
      AdminNote: values.adminNote,
      ProofImage: values.proofImage?.[0]?.originFileObj,
    });
  };

  const handleCreateRefund = () => {
    createForm
      .validateFields()
      .then((values) => {
        createRefundMutation.mutate(values);
      })
      .catch(() => {
        message.warning('Vui lòng điền đầy đủ thông tin!');
      });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-indigo-100">
        <Spin
          size="large"
          indicator={
            <LoadingOutlined
              style={{ fontSize: 48 }}
              spin
            />
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header + Create Button */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl shadow-md">
            <CheckCircleOutlined className="text-white text-2xl" />
          </div>
          <Title
            level={2}
            className="!mb-0 bg-gradient-to-r from-red-600 to-pink-700 bg-clip-text text-transparent">
            Quản lý hoàn tiền
          </Title>
          <Badge
            count={refunds.length}
            style={{ backgroundColor: '#52c41a' }}
          />
        </div>

        <Space>
          <Select
            value={status}
            onChange={handleStatusChange}
            style={{ width: 200 }}
            placeholder="Lọc theo trạng thái"
            suffixIcon={<MailOutlined className="text-gray-500" />}>
            {statusOptions.map((s) => (
              <Option
                key={s.value}
                value={s.value}>
                {s.label}
              </Option>
            ))}
          </Select>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsDrawerVisible(true)}
            size="large"
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200">
            Tạo yêu cầu hoàn tiền
          </Button>
        </Space>
      </div>

      {/* List */}
      {refunds.length > 0 ? (
        <Row gutter={[24, 24]}>
          {refunds.map((refund) => {
            const statusColor = statusColors[refund.status.toString()] || 'default';
            const canNotify = refund.status === 0;

            return (
              <Col
                key={refund.refundRequestId}
                xs={24}
                sm={12}
                lg={8}>
                <Card
                  hoverable
                  className="shadow-lg rounded-xl hover:shadow-2xl border-0 bg-white transition-all duration-300"
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetail(refund)}
                      className="text-blue-600 hover:text-blue-800">
                      Xem chi tiết
                    </Button>,
                    canNotify && (
                      <Button
                        key="notify"
                        type="link"
                        icon={<MailOutlined />}
                        onClick={() => handleNotify(refund)}
                        loading={notifyMutation.isPending}
                        className="text-orange-600 hover:text-orange-800">
                        Nhắc nhở
                      </Button>
                    ),
                  ].filter(Boolean)}>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Title
                        level={4}
                        className="text-gray-800 mb-0 line-clamp-1">
                        {refund.studentName}
                      </Title>
                      <Tag
                        color={statusColor}
                        className="ml-2">
                        {statusOptions.find((s) => s.value === refund.status.toString())?.label}
                      </Tag>
                    </div>

                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      className="text-gray-600 mb-3">
                      <strong>Lớp:</strong> {refund.className}
                    </Paragraph>

                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      className="text-gray-600 mb-3">
                      <strong>Lý do:</strong> {refund.reason}
                    </Paragraph>

                    <Text
                      type="secondary"
                      className="block text-xs mb-4">
                      {refund.classStartDateTime}
                    </Text>

                    {refund.proofImageUrl && (
                      <Image
                        src={refund.proofImageUrl}
                        width={100}
                        height={70}
                        preview={false}
                        className="rounded-md shadow-sm"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <div className="flex flex-col justify-center items-center min-h-[60vh] bg-white rounded-xl shadow-lg p-8">
          <Empty
            description={
              <div className="text-center">
                <Text className="text-gray-600 mb-2 block">Chưa có đơn hoàn tiền nào</Text>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsDrawerVisible(true)}
                  className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600">
                  Tạo yêu cầu đầu tiên
                </Button>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{ height: 120 }}
          />
        </div>
      )}

      {/* Drawer: Tạo yêu cầu hoàn tiền */}
      <Drawer
        title="Tạo yêu cầu hoàn tiền"
        width={600}
        open={isDrawerVisible}
        onClose={() => {
          setIsDrawerVisible(false);
          createForm.resetFields();
        }}
        footer={
          <div className="text-right space-x-3">
            <Button onClick={() => setIsDrawerVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleCreateRefund}
              loading={createRefundMutation.isPending}
              className="bg-gradient-to-r from-green-500 to-blue-600">
              {createRefundMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </div>
        }>
        <Form
          form={createForm}
          layout="vertical">
          <Form.Item
            name="studentId"
            label="ID Học viên"
            rules={[{ required: true, message: 'Vui lòng nhập ID học viên' }]}>
            <Input placeholder="VD: 3fa85f64-5717-4562-b3fc-2c963f66afa6" />
          </Form.Item>

          <Form.Item
            name="classId"
            label="ID Lớp học"
            rules={[{ required: true, message: 'Vui lòng nhập ID lớp học' }]}>
            <Input placeholder="VD: class_123" />
          </Form.Item>

          <Form.Item
            name="className"
            label="Tên lớp học"
            rules={[{ required: true, message: 'Vui lòng nhập tên lớp học' }]}>
            <Input placeholder="VD: Yoga Sáng Thứ 7" />
          </Form.Item>

          <Form.Item
            name="classStartDateTime"
            label="Thời gian bắt đầu lớp"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}>
            <Input placeholder="2025-11-07T10:42:49.075Z" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do hoàn tiền"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
            <Input.TextArea
              rows={4}
              placeholder="VD: Học viên bận đột xuất, không tham gia được"
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Modal: Xử lý đơn */}
      <Modal
        title="Xử lý đơn hoàn tiền"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedRefund(null);
          form.resetFields();
        }}
        footer={null}
        width={600}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleProcessRefund}
          initialValues={{ action: 'Approve' }}>
          {selectedRefund && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <Text strong>{selectedRefund.studentName}</Text>
              <Paragraph className="mt-1 text-gray-600">
                <strong>Lớp:</strong> {selectedRefund.className}
              </Paragraph>
              <Paragraph className="text-gray-600">{selectedRefund.reason}</Paragraph>
            </div>
          )}

          <Form.Item
            name="action"
            label="Hành động"
            rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="Approve">
                <CheckCircleOutlined className="mr-2 text-green-600" /> Duyệt
              </Radio>
              <Radio value="Reject">
                <CloseCircleOutlined className="mr-2 text-red-600" /> Từ chối
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="adminNote"
            label="Ghi chú Admin"
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}>
            <Input.TextArea
              rows={4}
              placeholder="VD: Đã chuyển 500k qua Momo lúc 14:30"
            />
          </Form.Item>

          <Form.Item
            name="proofImage"
            label="Ảnh chứng từ (bắt buộc nếu duyệt)"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            rules={[
              {
                validator: (_, value) => {
                  const action = form.getFieldValue('action');
                  if (action === 'Approve' && !value?.length) {
                    return Promise.reject('Vui lòng upload ảnh chứng từ khi duyệt!');
                  }
                  return Promise.resolve();
                },
              },
            ]}>
            <Upload
              accept="image/*"
              maxCount={1}
              listType="picture-card"
              beforeUpload={() => false}>
              <div>
                <UploadOutlined />
                <div className="mt-2 text-xs">Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item className="text-right mb-0">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={processMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-blue-600">
                {processMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RefundAdminPage;
