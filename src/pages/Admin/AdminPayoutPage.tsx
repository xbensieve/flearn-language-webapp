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
  Tooltip,
  Statistic,
  Button,
  Modal,
  Form,
  message,
  Tabs,
  Descriptions,
} from 'antd';
import {
  DollarOutlined,
  MailOutlined,
  BankOutlined,
  IdcardOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Wallet, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getAdminPayoutsService,
  getAdminPendingPayoutsService,
  processPayoutService,
  getAdminPayoutDetailService,
  type ProcessPayoutPayload,
} from '../../services/payout';
import type { AdminPayout } from '../../services/payout/type';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const statusColors: Record<string, string> = {
  Completed: 'green',
  Pending: 'gold',
  Rejected: 'red',
};

const AdminPayoutsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  // Modals
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<AdminPayout | null>(null);
  const [form] = Form.useForm<ProcessPayoutPayload>();

  // --- Queries ---
  const {
    data: allData,
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
  } = useQuery<AdminPayout[]>({
    queryKey: ['admin-payouts-all'],
    queryFn: getAdminPayoutsService,
  });

  const {
    data: pendingData,
    isLoading: isLoadingPending,
    isFetching: isFetchingPending,
  } = useQuery<AdminPayout[]>({
    queryKey: ['admin-payouts-pending'],
    queryFn: getAdminPendingPayoutsService,
  });

  // Detail query
  const { data: detailData, isFetching: isFetchingDetail } = useQuery({
    queryKey: ['admin-payout-detail', selectedPayout?.payoutRequestId],
    queryFn: () => getAdminPayoutDetailService(selectedPayout!.payoutRequestId),
    enabled: !!selectedPayout && detailModalOpen,
  });

  const payoutsAll = allData ?? [];
  const payoutsPending = pendingData ?? [];

  // --- Filters ---
  const filteredAll = useMemo(() => {
    return payoutsAll.filter((p) => {
      const matchesStatus = !statusFilter || p.payoutStatus === statusFilter;
      const kw = searchText.toLowerCase();
      const matchesSearch =
        !kw ||
        p.teacherName.toLowerCase().includes(kw) ||
        p.teacherEmail.toLowerCase().includes(kw) ||
        p.transactionRef?.toLowerCase().includes(kw) ||
        p.accountNumber.toLowerCase().includes(kw);
      return matchesStatus && matchesSearch;
    });
  }, [payoutsAll, statusFilter, searchText]);

  const filteredPending = useMemo(() => {
    const kw = searchText.toLowerCase();
    return payoutsPending.filter((p) => {
      return (
        !kw ||
        p.teacherName.toLowerCase().includes(kw) ||
        p.teacherEmail.toLowerCase().includes(kw) ||
        p.accountNumber.toLowerCase().includes(kw)
      );
    });
  }, [payoutsPending, searchText]);

  const totalAmountAll = useMemo(
    () => payoutsAll.reduce((sum, p) => sum + (p.amount || 0), 0),
    [payoutsAll]
  );

  const totalPendingCount = payoutsPending.length;

  // --- Mutation ---
  const processMutation = useMutation({
    mutationFn: ({
      payoutRequestId,
      payload,
    }: {
      payoutRequestId: string;
      payload: ProcessPayoutPayload;
    }) => processPayoutService(payoutRequestId, payload),
    onSuccess: () => {
      message.success('Payout processed successfully');
      setProcessModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || error?.message || 'Failed to process payout');
    },
  });

  // --- Handlers ---
  const openProcessModal = (record: AdminPayout) => {
    setSelectedPayout(record);
    setProcessModalOpen(true);
    form.resetFields();
  };

  const openDetailModal = (record: AdminPayout) => {
    setSelectedPayout(record);
    setDetailModalOpen(true);
  };

  const handleProcessSubmit = (values: ProcessPayoutPayload) => {
    if (!selectedPayout) return;
    if (selectedPayout.payoutStatus !== 'Pending') {
      message.warning(`This payout is already ${selectedPayout.payoutStatus}`);
      setProcessModalOpen(false);
      return;
    }
    processMutation.mutate({
      payoutRequestId: selectedPayout.payoutRequestId,
      payload: values,
    });
  };

  // --- Columns ---
  const baseColumns = [
    {
      title: 'Teacher',
      dataIndex: 'teacherName',
      key: 'teacherName',
      render: (_: any, record: AdminPayout) => (
        <Space>
          <div>
            <Text strong>{record.teacherName}</Text>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              <MailOutlined style={{ marginRight: 6 }} />
              {record.teacherEmail}
            </div>
          </div>
        </Space>
      ),
      sorter: (a: AdminPayout, b: AdminPayout) => a.teacherName.localeCompare(b.teacherName),
    },
    {
      title: 'Bank Info',
      key: 'bank',
      render: (_: any, record: AdminPayout) => (
        <div style={{ fontSize: 12 }}>
          <div>
            <BankOutlined style={{ marginRight: 6 }} />
            <Text>
              {record.bankName} – {record.bankBranch}
            </Text>
          </div>
          <div style={{ marginTop: 2, color: '#6b7280' }}>
            <IdcardOutlined style={{ marginRight: 6 }} />
            <Text>
              {record.accountNumber} · {record.accountHolder}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text
          strong
          style={{ color: '#16a34a' }}>
          {amount.toLocaleString('vi-VN')} ₫
        </Text>
      ),
      sorter: (a: AdminPayout, b: AdminPayout) => a.amount - b.amount,
    },
    {
      title: 'Dates',
      key: 'time',
      render: (_: any, record: AdminPayout) => (
        <div style={{ fontSize: 12 }}>
          <div>
            <Text type="secondary">Req:</Text>{' '}
            {new Date(record.requestedAt).toLocaleDateString('vi-VN')}
          </div>
          {record.approvedAt && (
            <div>
              <Text type="secondary">App:</Text>{' '}
              {new Date(record.approvedAt).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>
      ),
    },
  ];

  const columnsPending = [
    ...baseColumns,
    {
      title: 'Status',
      render: () => <Tag color="gold">Pending</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AdminPayout) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openDetailModal(record)}>
            View
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => openProcessModal(record)}>
            Process
          </Button>
        </Space>
      ),
    },
  ];

  const columnsAll = [
    ...baseColumns,
    {
      title: 'Status',
      dataIndex: 'payoutStatus',
      render: (status: string) => <Tag color={statusColors[status] || 'default'}>{status}</Tag>,
      filters: [
        { text: 'Completed', value: 'Completed' },
        { text: 'Pending', value: 'Pending' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value: any, record: AdminPayout) => record.payoutStatus === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AdminPayout) => {
        const isPending = record.payoutStatus === 'Pending';
        return (
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openDetailModal(record)}>
              View
            </Button>
            {isPending && (
              <Button
                size="small"
                type="primary"
                onClick={() => openProcessModal(record)}>
                Process
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                padding: 12,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #4f46e5, #2563eb)',
                boxShadow: '0 10px 25px rgba(37,99,235,0.25)',
              }}>
              <Wallet
                size={26}
                color="#fff"
              />
            </div>
            <div>
              <Title
                level={3}
                style={{ margin: 0, color: '#020617', fontWeight: 700 }}>
                Payout Requests
              </Title>
              <Text type="secondary">Manage teacher withdrawal requests</Text>
            </div>
          </div>

          <Space size="middle">
            <Search
              allowClear
              placeholder="Search teacher, email, ref..."
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />
            {activeTab === 'all' && (
              <Select
                value={statusFilter}
                onChange={(v) => setStatusFilter(v)}
                style={{ width: 180 }}
                placeholder="Status"
                allowClear>
                <Option value="">All</Option>
                <Option value="Completed">Completed</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Rejected">Rejected</Option>
              </Select>
            )}
            <Tooltip title="Refresh">
              <button
                type="button"
                style={{
                  borderRadius: 999,
                  border: '1px solid #d4d4d8',
                  padding: '6px 10px',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <RefreshCw
                  size={16}
                  className={isFetchingAll || isFetchingPending ? 'animate-spin' : ''}
                />
              </button>
            </Tooltip>
          </Space>
        </div>

        {/* Summary */}
        <Row
          gutter={16}
          style={{ marginBottom: 16 }}>
          <Col
            xs={24}
            sm={12}
            md={8}>
            <Card
              bordered={false}
              style={{ borderRadius: 18, boxShadow: '0 8px 20px rgba(15,23,42,0.06)' }}>
              <Space>
                <div style={{ backgroundColor: '#ecfdf3', borderRadius: '999px', padding: 8 }}>
                  <DollarOutlined style={{ color: '#16a34a' }} />
                </div>
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12 }}>
                    Total Amount
                  </Text>
                  <Statistic
                    value={totalAmountAll}
                    valueStyle={{ fontSize: 18, color: '#16a34a' }}
                    formatter={(v) => `${Number(v).toLocaleString('vi-VN')} ₫`}
                  />
                </div>
              </Space>
            </Card>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={8}>
            <Card
              bordered={false}
              style={{ borderRadius: 18, boxShadow: '0 8px 20px rgba(15,23,42,0.06)' }}>
              <Text
                type="secondary"
                style={{ fontSize: 12 }}>
                Pending Requests
              </Text>
              <Title
                level={4}
                style={{ margin: 0, marginTop: 4, color: '#0f172a' }}>
                {totalPendingCount}
              </Title>
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card
          bordered={false}
          style={{ borderRadius: 18, boxShadow: '0 10px 30px rgba(15,23,42,0.06)' }}>
          <Tabs
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as any)}
            items={[
              {
                key: 'pending',
                label: `Pending (${totalPendingCount})`,
                children: (
                  <Table
                    rowKey="payoutRequestId"
                    loading={isLoadingPending}
                    columns={columnsPending}
                    dataSource={filteredPending}
                    pagination={{ pageSize: 10 }}
                  />
                ),
              },
              {
                key: 'all',
                label: 'All Payouts',
                children: (
                  <Table
                    rowKey="payoutRequestId"
                    loading={isLoadingAll}
                    columns={columnsAll}
                    dataSource={filteredAll}
                    pagination={{ pageSize: 10 }}
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>

      {/* Process Modal */}
      <Modal
        open={processModalOpen}
        title={`Process Payout – ${selectedPayout?.teacherName}`}
        onCancel={() => setProcessModalOpen(false)}
        okText="Submit"
        cancelText="Cancel"
        onOk={() => form.submit()}
        confirmLoading={processMutation.isPending}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleProcessSubmit}>
          <Form.Item
            label="Action"
            name="action"
            rules={[{ required: true }]}>
            <Select placeholder="Select action">
              <Option value="Approve">Approve</Option>
              <Option value="Reject">Reject</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Transaction Reference"
            name="transactionReference">
            <Input placeholder="e.g. BANK-TRX-20251116-001" />
          </Form.Item>
          <Form.Item
            label="Admin Note"
            name="adminNote">
            <TextArea
              rows={3}
              placeholder="Optional..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={800}
        title={
          <Space>
            <EyeOutlined className="text-sky-600" />
            <span>Payout Details</span>
          </Space>
        }>
        {isFetchingDetail ? (
          <div className="py-8 text-center">Loading details...</div>
        ) : detailData ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
              <div>
                <Title
                  level={4}
                  className="m-0">
                  {detailData.teacherName}
                </Title>
                <Text type="secondary">{detailData.teacherEmail}</Text>
              </div>
              <Tag
                color={statusColors[detailData.payoutStatus]}
                className="ml-auto">
                {detailData.payoutStatus}
              </Tag>
            </div>

            <Descriptions
              column={2}
              bordered>
              <Descriptions.Item label="Amount">
                <Text
                  strong
                  style={{ color: '#16a34a' }}>
                  {detailData.amount.toLocaleString('vi-VN')} ₫
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusColors[detailData.payoutStatus]}>{detailData.payoutStatus}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Requested At">
                {new Date(detailData.requestedAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Approved At">
                {detailData.approvedAt
                  ? new Date(detailData.approvedAt).toLocaleString('vi-VN')
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Bank">
                {detailData.bankName} – {detailData.bankBranch}
              </Descriptions.Item>
              <Descriptions.Item label="Account">
                {detailData.accountNumber} · {detailData.accountHolder}
              </Descriptions.Item>
              <Descriptions.Item label="Transaction Ref">
                {detailData.transactionRef || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Admin Note">{detailData.note || '—'}</Descriptions.Item>
            </Descriptions>

            {detailData.payoutStatus === 'Pending' && (
              <div className="text-right">
                <Button
                  type="primary"
                  onClick={() => {
                    setDetailModalOpen(false);
                    openProcessModal(detailData);
                  }}>
                  Process Now
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">No data</div>
        )}
      </Modal>
    </>
  );
};

export default AdminPayoutsPage;
