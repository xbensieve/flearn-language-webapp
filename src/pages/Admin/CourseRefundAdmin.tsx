/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Button,
  Select,
  Modal,
  Form,
  Input,
  Radio,
  message,
  Table,
  Image,
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  EyeOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  FileImageOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { getRefundRequestsCourse, processRefundCourse } from '../../services/refund';
import type { RefundRequest } from '../../services/refund/type';

const { Title, Text } = Typography;
const { Option } = Select;

const statusMap: Record<string, { label: string; color: string }> = {
  Pending: { label: 'Pending', color: 'blue' },
  'Under Review': { label: 'Under Review', color: 'orange' },
  Approved: { label: 'Approved', color: 'green' },
  Rejected: { label: 'Rejected', color: 'red' },
  Completed: { label: 'Completed', color: 'green' },
  Cancelled: { label: 'Cancelled', color: 'default' },
};

const StatCard = ({ title, value, icon, colorClass, bgClass }: any) => (
  <div
    className={`p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4 h-full transition-transform hover:-translate-y-1 duration-300`}>
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${bgClass} ${colorClass}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-800 leading-none">{value}</div>
      <div className="text-gray-400 text-[11px] font-semibold uppercase tracking-wide mt-1">
        {title}
      </div>
    </div>
  </div>
);

const CourseRefundAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { data: refunds = [] } = useQuery<RefundRequest[]>({
    queryKey: ['course-refunds', statusFilter],
    queryFn: () => getRefundRequestsCourse({ status: statusFilter }).then((res) => res.data),
  });

  const processMutation = useMutation({
    mutationFn: processRefundCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-refunds'] });
      setIsModalVisible(false);
      message.success('Processed successfully');
    },
    onError: () => message.error('Failed to process'),
  });

  useEffect(() => {
    if (selectedRefund && isModalVisible) {
      form.resetFields();
      form.setFieldValue('Action', 'Approve');
    }
  }, [selectedRefund, isModalVisible, form]);

  const pendingCount = refunds.filter((r) => r.status === 'Pending').length;
  const processingCount = refunds.filter((r) => r.status === 'Under Review').length;
  const completedCount = refunds.filter(
    (r) => r.status === 'Approved' || r.status === 'Completed'
  ).length;

  const columns = [
    {
      title: 'Student',
      dataIndex: 'studentName',
      render: (text: string) => (
        <Text
          strong
          className="text-gray-700 text-sm">
          {text}
        </Text>
      ),
    },
    {
      title: 'Course',
      dataIndex: 'courseName',
      ellipsis: true,
      render: (t: string) => <span className="text-xs text-gray-500">{t}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'refundAmount',
      render: (val: number) => (
        <span className="font-semibold text-emerald-600">{val?.toLocaleString()} ₫</span>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      ellipsis: true,
      render: (t: string) => <span className="text-sm text-gray-600">{t}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (s: string) => {
        const info = statusMap[s] || { label: 'Unknown', color: 'default' };
        return (
          <Tag
            color={info.color}
            className="text-[10px] px-2 border-0 font-medium uppercase">
            {info.label}
          </Tag>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'requestedAt',
      width: 110,
      render: (d: string) => {
        const [datePart] = d.split(' ');
        const [day, month, year] = datePart.split('-');
        const parsedDate = new Date(`${year}-${month}-${day}`);
        return <span className="text-xs text-gray-400">{parsedDate.toLocaleDateString()}</span>;
      },
    },
    {
      title: '',
      width: 60,
      render: (_: any, r: RefundRequest) => (
        <Button
          size="small"
          type="text"
          icon={
            r.status === 'Pending' || r.status === 'Under Review' ? (
              <EyeOutlined className="text-blue-500" />
            ) : (
              <EyeOutlined className="text-gray-400" />
            )
          }
          onClick={() => {
            setSelectedRefund(r);
            setIsModalVisible(true);
          }}
        />
      ),
    },
  ];

  const canProcess =
    selectedRefund?.status === 'Pending' || selectedRefund?.status === 'Under Review';

  return (
    <div className="space-y-5">
      <Row gutter={[16, 16]}>
        <Col
          xs={24}
          sm={8}>
          <StatCard
            title="New Requests"
            value={pendingCount}
            icon={<ClockCircleOutlined />}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
          />
        </Col>
        <Col
          xs={24}
          sm={8}>
          <StatCard
            title="Processing"
            value={processingCount}
            icon={<SyncOutlined spin={processingCount > 0} />}
            colorClass="text-orange-500"
            bgClass="bg-orange-50"
          />
        </Col>
        <Col
          xs={24}
          sm={8}>
          <StatCard
            title="Completed"
            value={completedCount}
            icon={<CheckCircleOutlined />}
            colorClass="text-green-600"
            bgClass="bg-green-50"
          />
        </Col>
      </Row>

      <Card
        bordered={false}
        className="rounded-2xl shadow-sm border border-gray-100"
        bodyStyle={{ padding: '16px' }}>
        <div className="flex justify-between items-center mb-4 px-2">
          <Title
            level={5}
            className="!mb-0 !font-semibold text-gray-700">
            Course Refund Requests
          </Title>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            size="middle"
            style={{ width: 160 }}
            placeholder="Filter Status"
            allowClear>
            <Option value="">All Status</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Approved">Approved</Option>
            <Option value="Rejected">Rejected</Option>
          </Select>
        </div>
        <Table
          dataSource={refunds}
          columns={columns}
          rowKey="refundRequestId"
          pagination={{ pageSize: 8, size: 'small' }}
          size="small"
        />
      </Card>

      <Modal
        title={canProcess ? 'Process Refund' : 'Refund Details'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={480}
        centered>
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => {
            const isApproved = v.Action === 'Approve';
            const note = v.AdminNote;
            processMutation.mutate({
              refundRequestId: selectedRefund!.refundRequestId,
              isApproved,
              note,
            });
          }}>
          {selectedRefund && (
            <div className="mb-5 p-4 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-2 border border-gray-100">
              <div className="flex justify-between">
                <span>Student:</span>
                <strong className="text-gray-800">{selectedRefund.studentName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <strong className="text-emerald-600">
                  {selectedRefund.refundAmount?.toLocaleString()} ₫
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Bank:</span>
                <strong className="text-gray-800">
                  {selectedRefund.bankName} - {selectedRefund.bankAccountNumber}
                </strong>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span className="block mb-1">Reason:</span>
                <p className="text-gray-800 italic">{selectedRefund.reason}</p>
              </div>

              {selectedRefund.proofImageUrl && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <span className="block mb-2 font-semibold flex items-center gap-1">
                    <FileImageOutlined /> Proof of Transfer:
                  </span>
                  <div className="rounded-lg overflow-hidden border border-gray-200 inline-block">
                    <Image
                      src={selectedRefund.proofImageUrl}
                      height={150}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {canProcess ? (
            <>
              <Form.Item
                name="Action"
                label="Action"
                className="mb-4">
                <Radio.Group
                  buttonStyle="solid"
                  className="w-full flex text-center">
                  <Radio.Button
                    value="Approve"
                    className="flex-1">
                    Approve
                  </Radio.Button>
                  <Radio.Button
                    value="Reject"
                    className="flex-1">
                    Reject
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="AdminNote"
                label="Admin Note">
                <Input.TextArea
                  rows={2}
                  placeholder="Transaction ID or notes..."
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                loading={processMutation.isPending}
                size="large"
                className="bg-blue-600 shadow-md h-10 font-medium">
                Confirm Action
              </Button>
            </>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col items-center gap-2">
                {selectedRefund?.status === 'Rejected' ? (
                  <CloseCircleOutlined className="text-3xl text-red-500" />
                ) : (
                  <CheckCircleOutlined className="text-3xl text-green-500" />
                )}
                <div>
                  <div className="text-gray-800 font-semibold text-base">
                    Request {statusMap[selectedRefund?.status || 'Pending'].label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    This request has been processed and is closed.
                  </div>
                </div>
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CourseRefundAdmin;
