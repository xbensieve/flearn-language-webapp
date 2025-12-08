/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Typography,
  Space,
  Input,
  Select,
  Row,
  Col,
  Button,
  Modal,
  Form,
  message,
  Descriptions,
} from 'antd';
import { DollarOutlined, WalletOutlined } from '@ant-design/icons';
import { RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminPayoutsService,
  getAdminPendingPayoutsService,
  processPayoutService,
  type ProcessPayoutPayload,
} from '../../services/payout';
import type { AdminPayout } from '../../services/payout/type';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const StatCard = ({ title, value, icon, gradient }: any) => (
  <div
    className={`p-4 rounded-2xl ${gradient} text-white shadow-md relative overflow-hidden h-full transition-transform hover:-translate-y-1 duration-300`}>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2 opacity-90">
        <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm text-sm">{icon}</div>
        <span className="font-medium text-xs uppercase tracking-wide">{title}</span>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
  </div>
);

const AdminPayoutsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<AdminPayout | null>(null);
  const [form] = Form.useForm<ProcessPayoutPayload>();

  const { data: payoutsAll = [] } = useQuery({
    queryKey: ['admin-payouts-all'],
    queryFn: getAdminPayoutsService,
  });
  const { data: payoutsPending = [], refetch } = useQuery({
    queryKey: ['admin-payouts-pending'],
    queryFn: getAdminPendingPayoutsService,
  });

  const totalAmount = useMemo(() => payoutsAll.reduce((sum, p) => sum + p.amount, 0), [payoutsAll]);

  const filteredData = useMemo(() => {
    const lower = searchText.toLowerCase();
    return payoutsAll.filter(
      (p) =>
        p.teacherName.toLowerCase().includes(lower) || p.teacherEmail.toLowerCase().includes(lower)
    );
  }, [payoutsAll, searchText]);

  const processMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProcessPayoutPayload }) =>
      processPayoutService(id, payload),
    onSuccess: () => {
      message.success("Đã xử lý thành công!");
      setProcessModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-payouts-all'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payouts-pending'] });
    },
    onError: (err: any) => message.error(err.message),
  });

  const columns = [
    {
      title: "Giáo viên",
      render: (_: any, r: AdminPayout) => (
        <div>
          <Text strong className="block text-gray-700 text-sm">
            {r.teacherName}
          </Text>
          <Text type="secondary" className="text-xs">
            {r.teacherEmail}
          </Text>
        </div>
      ),
    },
    {
      title: "Chi tiết ngân hàng",
      render: (_: any, r: AdminPayout) => (
        <div className="text-xs text-gray-500">
          <div className="font-medium text-gray-700">{r.bankName}</div>
          <div>{r.accountNumber}</div>
        </div>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (val: number) => (
        <Text strong className="text-emerald-600 text-sm">
          {val.toLocaleString()} ₫
        </Text>
      ),
      sorter: (a: any, b: any) => a.amount - b.amount,
    },
    {
      title: "Trạng thái",
      dataIndex: "payoutStatus",
      width: 100,
      render: (status: string) => {
        const color =
          status === "Completed"
            ? "success"
            : status === "Pending"
            ? "warning"
            : "error";
        return (
          <Tag color={color} className="rounded px-2 text-xs border-0">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Ngày",
      dataIndex: "requestedAt",
      width: 120,
      render: (date: string) => (
        <Text type="secondary" className="text-xs">
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: "",
      width: 80,
      render: (_: any, r: AdminPayout) =>
        r.payoutStatus === "Pending" ? (
          <Button
            size="small"
            type="link"
            onClick={() => {
              setSelectedPayout(r);
              setProcessModalOpen(true);
            }}
          >
            Xử lý
          </Button>
        ) : (
          <Button
            size="small"
            type="text"
            onClick={() => {
              setSelectedPayout(r);
              setDetailModalOpen(true);
            }}
          >
            Xem
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <StatCard
            title="Tổng yêu cầu rút tiền"
            value={payoutsAll.length}
            icon={<WalletOutlined />}
            gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Tổng tiền"
            value={`${totalAmount.toLocaleString()} ₫`}
            icon={<DollarOutlined />}
            gradient="bg-gradient-to-br from-teal-400 to-emerald-500"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Đang chờ"
            value={payoutsPending.length}
            icon={<RefreshCw size={16} />}
            gradient="bg-gradient-to-br from-indigo-400 to-blue-600"
          />
        </Col>
      </Row>

      <Card
        bordered={false}
        className="rounded-2xl shadow-sm border border-gray-100"
        bodyStyle={{ padding: "20px" }}
      >
        <div className="flex justify-between items-center mb-4">
          <Title level={5} className="!mb-0 !font-semibold text-gray-800">
            Lịch sử thanh toán
          </Title>
          <Space size="small">
            <Search
              placeholder="Tìm kiếm..."
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-52"
              allowClear
              size="small"
            />
            <Button
              size="small"
              icon={<RefreshCw size={12} />}
              onClick={() => refetch()}
            />
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="payoutRequestId"
          pagination={{ pageSize: 10, size: "small" }}
          size="small"
        />
      </Card>

      <Modal
        open={processModalOpen}
        title="Xử lý thanh toán"
        onCancel={() => setProcessModalOpen(false)}
        footer={null}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) =>
            processMutation.mutate({
              id: selectedPayout!.payoutRequestId,
              payload: v,
            })
          }
        >
          <Form.Item name="action" label="Action" rules={[{ required: true }]}>
            <Select>
              <Option value="Approve">Duyệt</Option>
              <Option value="Reject">Từ chối</Option>
            </Select>
          </Form.Item>
          <Form.Item name="transactionReference" label="Transaction Ref">
            <Input />
          </Form.Item>
          <Form.Item name="adminNote" label="Note">
            <TextArea rows={2} />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={processMutation.isPending}
            className="bg-indigo-600"
          >
            Nộp
          </Button>
        </Form>
      </Modal>

      <Modal
        open={detailModalOpen}
        title="Chi tiết thanh toán"
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
      >
        {selectedPayout && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Giáo viên">
              {selectedPayout.teacherName}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              {selectedPayout.amount.toLocaleString()} ₫
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag>{selectedPayout.payoutStatus}</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminPayoutsPage;
