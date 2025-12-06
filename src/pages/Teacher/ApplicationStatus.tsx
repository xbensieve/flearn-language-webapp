/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Button,
  Card,
  Spin,
  Tag,
  Typography,
  Table,
  Modal,
  Image,
  Alert,
  Space,
  Divider,
  Input,
  Select,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ClockCircleOutlined,
  UserOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type {
  ApplicationData,
  GetMyApplicationsParams,
} from "../../services/teacherApplication/types";
import { getMyApplication } from "../../services/teacherApplication";
import { useDebounce } from "../../utils/useDebound";

const { Title, Paragraph, Text } = Typography;

const statusMap: Record<
  string,
  { text: string; color: string; icon: React.ReactNode }
> = {
  Pending: {
    text: "Pending",
    color: "processing",
    icon: <ClockCircleOutlined />,
  },
  Submitted: {
    text: "Submitted",
    color: "warning",
    icon: <ClockCircleOutlined />,
  },
  Reviewed: { text: "Reviewed", color: "success", icon: <TrophyOutlined /> },
  Rejected: {
    text: "Rejected",
    color: "error",
    icon: <ExclamationCircleOutlined />,
  },
  Approved: { text: "Approved", color: "success", icon: <TrophyOutlined /> },
};

const ApplicationStatus: React.FC = () => {
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounced search
  const searchTerm = useDebounce(searchInput, 500);

  const queryParams: GetMyApplicationsParams = {
    page,
    pageSize,
    searchTerm: searchTerm || undefined,
    status: statusFilter as any,
  };

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["myApplications", queryParams],
    queryFn: () => getMyApplication(queryParams),
    retry: 1,
  });

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Space direction="vertical" size="large" className="text-center">
          <Spin size="large" />
          <Title level={4} type="secondary">
            Đang tải đơn đăng ký...
          </Title>
        </Space>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
        <Space
          direction="vertical"
          size="middle"
          className="text-center max-w-md"
        >
          <Alert
            message="Error"
            description={
              (error as any)?.response?.data?.message ||
              "Không tải được đơn đăng ký."
            }
            type="error"
            showIcon
          />
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/learner/application")}
            icon={<UserOutlined />}
          >
            Đăng ký để giảng dạy
          </Button>
        </Space>
      </div>
    );
  }

  const columns = [
    {
      title: "Người xin việc",
      key: "name",
      render: (_: any, record: ApplicationData) => (
        <Space>
          <Image
            src={record.avatar}
            alt={record.fullName}
            width={40}
            height={40}
            className="rounded-full object-cover"
            fallback="https://via.placeholder.com/40"
          />
          <div>
            <Text strong>{record.fullName}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Ngôn ngữ",
      render: (_: any, record: ApplicationData) => (
        <Text strong>
          {record.language}{" "}
          <span className="text-sky-600">({record.proficiencyCode})</span>
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string) => {
        const s = statusMap[status] || statusMap.Pending;
        return (
          <Tag color={s.color} className="font-medium">
            {s.icon} {s.text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày nộp",
      dataIndex: "submittedAt",
      render: (date: string) => <Text>{date}</Text>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: ApplicationData) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedApp(record);
            setModalOpen(true);
          }}
          className="text-sky-600 hover:text-sky-700"
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <Title level={1} className="text-4xl font-bold text-gray-900 mb-3">
            Đơn đăng ký làm giáo viên của bạn
          </Title>
        </div>
        {/* Filters */}
        <Card className="!mb-2 shadow-md rounded-xl">
          <Space wrap className="w-full" size="middle">
            <Input
              placeholder="Tìm kiếm theo tên hoặc ngôn ngữ..."
              prefix={<SearchOutlined />}
              allowClear
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: 280 }}
            />
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: 180 }}
              allowClear
              onChange={(v) => setStatusFilter(v)}
              options={[
                { label: "Đang xử lý", value: "Pending" },
                { label: "Đã duyệt", value: "Approved" },
                { label: "Từ chối", value: "Rejected" },
              ]}
            />
          </Space>
        </Card>
        {/* Table */}
        <Card className="shadow-lg rounded-2xl overflow-hidden">
          <Table
            dataSource={response?.data || []}
            columns={columns}
            rowKey="applicationID"
            pagination={{
              current: page,
              pageSize,
              total: response?.meta.totalItems,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} đơn`,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps || 10);
              },
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Detail Modal */}
        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={900}
          centered
        >
          {selectedApp && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <Space size="large">
                  <Image
                    src={selectedApp.avatar}
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-white shadow-md"
                  />
                  <div>
                    <Title level={4} className="m-0">
                      {selectedApp.fullName}
                    </Title>
                    <Text type="secondary">
                      Ngày nộp: {selectedApp.submittedAt}
                    </Text>
                  </div>
                </Space>
                <Tag
                  color={statusMap[selectedApp.status]?.color}
                  className="text-lg px-4 py-1"
                >
                  {statusMap[selectedApp.status]?.icon}{" "}
                  {statusMap[selectedApp.status]?.text}
                </Tag>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="font-semibold">Email:</span>{" "}
                  {selectedApp.email}
                </div>
                <div>
                  <span className="font-semibold">Số điện thoại:</span>{" "}
                  {selectedApp.phoneNumber}
                </div>
                <div>
                  <span className="font-semibold">Ngôn ngữ:</span>{" "}
                  {selectedApp.language} ({selectedApp.proficiencyCode})
                </div>
                <div>
                  <span className="font-semibold">Ngày sinh:</span>{" "}
                  {selectedApp.dateOfBirth}
                </div>
                <div>
                  <span className="font-semibold">Kinh nghiệm:</span>{" "}
                  {selectedApp.teachingExperience || "—"}
                </div>
                {selectedApp.meetingUrl && (
                  <div>
                    <span className="font-semibold">Google Meet: </span>
                    <a
                      href={selectedApp.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {selectedApp.meetingUrl}
                    </a>
                  </div>
                )}
              </div>
              <Divider />
              <Paragraph className="whitespace-pre-wrap">
                <span className="font-semibold">Tiểu sử: </span>
                {selectedApp.bio || "No bio."}
              </Paragraph>
              {selectedApp.certificates?.length ? (
                <div className="mt-4">
                  <Title level={5} className="flex items-center gap-2">
                    Chứng chỉ: ({selectedApp.certificates.length})
                  </Title>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {selectedApp.certificates.map((cert) => (
                      <Card
                        key={cert.id}
                        hoverable
                        className="rounded-lg"
                        cover={
                          <Image
                            src={cert.certificateImageUrl}
                            className="h-40 object-contain"
                            preview={{ src: cert.certificateImageUrl }}
                          />
                        }
                      >
                        <Card.Meta title={cert.certificateName} />
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert message="No certificates" type="info" showIcon />
              )}

              {selectedApp.rejectionReason && (
                <Alert
                  message="Rejected"
                  description={selectedApp.rejectionReason}
                  type="error"
                  showIcon
                  className="mt-6"
                />
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ApplicationStatus;
