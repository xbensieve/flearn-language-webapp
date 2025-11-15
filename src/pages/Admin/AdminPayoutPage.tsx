/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
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
} from "antd";
import {
  DollarOutlined,
  MailOutlined,
  BankOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { Wallet, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";

import {
  getAdminPayoutsService,
  getAdminPendingPayoutsService,
  processPayoutService,
  type ProcessPayoutPayload,
} from "../../services/payout";
import type { AdminPayout } from "../../services/payout/type";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const statusColors: Record<string, string> = {
  Completed: "green",
  Pending: "gold",
  Rejected: "red",
};

const AdminPayoutsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<AdminPayout | null>(
    null
  );
  const [form] = Form.useForm<ProcessPayoutPayload>();

  // --- Query all payouts ---
  const {
    data: allData,
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
    refetch: refetchAll,
  } = useQuery<AdminPayout[]>({
    queryKey: ["admin-payouts-all"],
    queryFn: getAdminPayoutsService,
  });

  // --- Query pending payouts ---
  const {
    data: pendingData,
    isLoading: isLoadingPending,
    isFetching: isFetchingPending,
    refetch: refetchPending,
  } = useQuery<AdminPayout[]>({
    queryKey: ["admin-payouts-pending"],
    queryFn: getAdminPendingPayoutsService,
  });

  const payoutsAll = allData ?? [];
  const payoutsPending = pendingData ?? [];

  // Filter for ALL tab
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

  // Filter for PENDING tab (chỉ search, status đã là Pending sẵn từ API)
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

  // --- Mutation xử lý payout ---
  const processMutation = useMutation({
    mutationFn: ({
      payoutRequestId,
      payload,
    }: {
      payoutRequestId: string;
      payload: ProcessPayoutPayload;
    }) => processPayoutService(payoutRequestId, payload),
    onSuccess: () => {
      message.success("Payout processed successfully");
      setProcessModalOpen(false);
      form.resetFields();
      // refetch cả 2 list
      refetchAll();
      refetchPending();
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to process payout"
      );
    },
  });

  const openProcessModal = (record: AdminPayout) => {
    setSelectedPayout(record);
    setProcessModalOpen(true);
    form.resetFields();
  };

  const handleProcessSubmit = (values: ProcessPayoutPayload) => {
    if (!selectedPayout) return;

    // Chỉ cho xử lý khi còn Pending
    if (selectedPayout.payoutStatus !== "Pending") {
      message.warning(
        `This payout has already been processed with status: ${selectedPayout.payoutStatus}`
      );
      setProcessModalOpen(false);
      return;
    }

    processMutation.mutate({
      payoutRequestId: selectedPayout.payoutRequestId,
      payload: values,
    });
  };

  // --- Columns dùng chung ---
  const baseColumns = [
    {
      title: "Teacher",
      dataIndex: "teacherName",
      key: "teacherName",
      render: (_: any, record: AdminPayout) => (
        <div>
          <Text strong>{record.teacherName}</Text>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            <MailOutlined style={{ marginRight: 6 }} />
            {record.teacherEmail}
          </div>
        </div>
      ),
      sorter: (a: AdminPayout, b: AdminPayout) =>
        a.teacherName.localeCompare(b.teacherName),
    },
    {
      title: "Bank Info",
      key: "bank",
      render: (_: any, record: AdminPayout) => (
        <div style={{ fontSize: 12 }}>
          <div>
            <BankOutlined style={{ marginRight: 6 }} />
            <Text>
              {record.bankName} – {record.bankBranch}
            </Text>
          </div>
          <div style={{ marginTop: 2, color: "#6b7280" }}>
            <IdcardOutlined style={{ marginRight: 6 }} />
            <Text>
              {record.accountNumber} · {record.accountHolder}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <Text strong style={{ color: "#16a34a" }}>
          {amount.toLocaleString("vi-VN")} ₫
        </Text>
      ),
      sorter: (a: AdminPayout, b: AdminPayout) => a.amount - b.amount,
    },
    {
      title: "Requested / Approved",
      key: "time",
      render: (_: any, record: AdminPayout) => (
        <div style={{ fontSize: 12 }}>
          <div>
            <Text type="secondary">Requested:</Text>{" "}
            {new Date(record.requestedAt).toLocaleString()}
          </div>
          <div>
            <Text type="secondary">Approved:</Text>{" "}
            {record.approvedAt
              ? new Date(record.approvedAt).toLocaleString()
              : "—"}
          </div>
        </div>
      ),
    },
    {
      title: "Transaction",
      key: "transactionRef",
      render: (_: any, record: AdminPayout) => (
        <div style={{ fontSize: 12 }}>
          <div>
            <Text type="secondary">Ref:</Text> {record.transactionRef || "—"}
          </div>
          {record.note && (
            <Tooltip title={record.note}>
              <div
                style={{
                  marginTop: 2,
                  maxWidth: 220,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "#4b5563",
                }}
              >
                <Text type="secondary">Note: </Text>
                {record.note}
              </div>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  // Columns tab PENDING (status luôn Pending)
  const columnsPending = [
    ...baseColumns,
    {
      title: "Status",
      dataIndex: "payoutStatus",
      key: "status",
      render: () => <Tag color="gold">Pending</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: AdminPayout) => (
        <Button
          size="small"
          type="primary"
          onClick={() => openProcessModal(record)}
        >
          Process
        </Button>
      ),
    },
  ];

  // Columns tab ALL (có Status + logic chỉ Process khi Pending)
  const columnsAll = [
    ...baseColumns,
    {
      title: "Status",
      dataIndex: "payoutStatus",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status] || "default"}>{status}</Tag>
      ),
      filters: [
        { text: "Completed", value: "Completed" },
        { text: "Pending", value: "Pending" },
        { text: "Rejected", value: "Rejected" },
      ],
      onFilter: (value: any, record: AdminPayout) =>
        record.payoutStatus === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: AdminPayout) => {
        const isPending = record.payoutStatus === "Pending";

        if (!isPending) {
          return (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.payoutStatus === "Completed"
                ? "Already completed"
                : record.payoutStatus}
            </Text>
          );
        }

        return (
          <Button
            size="small"
            type="primary"
            onClick={() => openProcessModal(record)}
          >
            Process
          </Button>
        );
      },
    },
  ];

  //   const isLoadingCurrent = activeTab === "pending" ? isLoadingPending : isLoadingAll;
  const isFetchingCurrent =
    activeTab === "pending" ? isFetchingPending : isFetchingAll;

  const handleRefresh = () => {
    if (activeTab === "pending") {
      refetchPending();
    } else {
      refetchAll();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5FAF8",
        padding: "24px 16px",
      }}
    >
      <div style={{ maxWidth: 1150, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                padding: 12,
                borderRadius: 16,
                background: "linear-gradient(135deg, #4f46e5, #2563eb)",
                boxShadow: "0 10px 25px rgba(37,99,235,0.25)",
              }}
            >
              <Wallet size={26} color="#fff" />
            </div>
            <div>
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: "#020617",
                  fontWeight: 700,
                }}
              >
                Payout Requests
              </Title>
              <Text type="secondary">
                View and manage withdrawal requests from teachers
              </Text>
            </div>
          </div>

          <Space size="middle">
            <Search
              allowClear
              placeholder="Search teacher, email, transaction ref..."
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />

            {activeTab === "all" && (
              <Select
                value={statusFilter}
                onChange={(v) => setStatusFilter(v)}
                style={{ width: 180 }}
                placeholder="Filter by status"
                allowClear
              >
                <Option value="">All statuses</Option>
                <Option value="Completed">Completed</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Rejected">Rejected</Option>
              </Select>
            )}

            <Tooltip title="Refresh">
              <button
                type="button"
                onClick={handleRefresh}
                style={{
                  borderRadius: 999,
                  border: "1px solid #d4d4d8",
                  padding: "6px 10px",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RefreshCw
                  size={16}
                  className={isFetchingCurrent ? "animate-spin" : ""}
                />
              </button>
            </Tooltip>
          </Space>
        </div>

        {/* Summary cards */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: 18,
                boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
              }}
            >
              <Space>
                <div
                  style={{
                    backgroundColor: "#ecfdf3",
                    borderRadius: "999px",
                    padding: 8,
                  }}
                >
                  <DollarOutlined style={{ color: "#16a34a" }} />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Total Amount (All)
                  </Text>
                  <Statistic
                    value={totalAmountAll}
                    valueStyle={{ fontSize: 18, color: "#16a34a" }}
                    formatter={(v) => `${Number(v).toLocaleString("vi-VN")} ₫`}
                  />
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: 18,
                boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                Pending Requests
              </Text>
              <Title
                level={4}
                style={{ margin: 0, marginTop: 4, color: "#0f172a" }}
              >
                {totalPendingCount}
              </Title>
            </Card>
          </Col>
        </Row>

        {/* Tabs: Pending / All */}
        <Card
          bordered={false}
          style={{
            borderRadius: 18,
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as "pending" | "all")}
            items={[
              {
                key: "pending",
                label: "Pending",
                children: (
                  <Table
                    rowKey="payoutRequestId"
                    loading={isLoadingPending}
                    columns={columnsPending}
                    dataSource={filteredPending}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                  />
                ),
              },
              {
                key: "all",
                label: "All Payouts",
                children: (
                  <Table
                    rowKey="payoutRequestId"
                    loading={isLoadingAll}
                    columns={columnsAll}
                    dataSource={filteredAll}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>

      {/* Modal Process Payout */}
      <Modal
        open={processModalOpen}
        title={
          <span>
            Process payout{" "}
            {selectedPayout ? `- ${selectedPayout.teacherName}` : ""}
          </span>
        }
        onCancel={() => setProcessModalOpen(false)}
        okText="Submit"
        cancelText="Cancel"
        onOk={() => form.submit()}
        confirmLoading={processMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleProcessSubmit}>
          <Form.Item
            label="Action"
            name="action"
            rules={[{ required: true, message: "Action is required" }]}
          >
            <Select placeholder="Select action">
              <Option value="Approve">Approve</Option>
              <Option value="Reject">Reject</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Transaction Reference" name="transactionReference">
            <Input placeholder="e.g. BANK-TRX-20251110-123456" />
          </Form.Item>

          <Form.Item label="Admin Note" name="adminNote">
            <TextArea rows={3} placeholder="Optional note..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPayoutsPage;
