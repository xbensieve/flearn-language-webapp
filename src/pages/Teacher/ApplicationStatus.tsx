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
  ExclamationCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import type {
  ApplicationData,
  GetMyApplicationsParams,
} from "../../services/teacherApplication/types";
import { getMyApplication } from "../../services/teacherApplication";
import { useDebounce } from "../../utils/useDebound";
import NotificationSettings from "../../components/NotificationSettings";

const { Title, Paragraph, Text } = Typography;

// [CẬP NHẬT] Việt hóa các trạng thái hiển thị
const statusMap: Record<
  string,
  { text: string; color: string; icon: React.ReactNode }
> = {
  Pending: {
    text: "Đang chờ xử lý",
    color: "processing",
    icon: <ClockCircleOutlined />,
  },
  Submitted: {
    text: "Đã nộp đơn",
    color: "warning",
    icon: <SyncOutlined />,
  },
  Reviewed: {
    text: "Đã xem xét",
    color: "purple",
    icon: <EyeOutlined />,
  },
  Rejected: {
    text: "Bị từ chối",
    color: "error",
    icon: <ExclamationCircleOutlined />,
  },
  Approved: {
    text: "Đã phê duyệt",
    color: "success",
    icon: <CheckCircleOutlined />, // Đổi icon Trophy sang Check cho chuẩn hơn
  },
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
            Đang tải dữ liệu đơn đăng ký...
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
            message="Đã xảy ra lỗi" // [CẬP NHẬT] Error -> Đã xảy ra lỗi
            description={
              (error as any)?.response?.data?.message ||
              "Không tải được danh sách đơn đăng ký."
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
            Đăng ký giảng dạy ngay
          </Button>
        </Space>
      </div>
    );
  }

  const columns = [
    {
      title: "Họ và Tên",
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
          <Tag color={s.color} className="font-medium" icon={s.icon}>
            {s.text}
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
            Đơn đăng ký làm giáo viên
          </Title>
        </div>

        {/* Notification Settings */}
        <Card className="!mb-4 shadow-md rounded-xl">
          <NotificationSettings />
          <p className="text-gray-500 text-sm mt-2">
            Bật thông báo để nhận kết quả duyệt đơn đăng ký ngay trên thiết bị
            của bạn.
          </p>
        </Card>

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
                { label: "Đang chờ xử lý", value: "Pending" },
                { label: "Đã phê duyệt", value: "Approved" },
                { label: "Bị từ chối", value: "Rejected" },
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
          title={<Title level={4}>Chi tiết đơn đăng ký</Title>} // Thêm title cho modal rõ ràng
        >
          {selectedApp && (
            <div className="space-y-6 pt-4">
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
                  className="text-lg px-4 py-1 flex items-center gap-2"
                >
                  {statusMap[selectedApp.status]?.icon}
                  {statusMap[selectedApp.status]?.text}
                </Tag>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="font-semibold text-gray-600">Email:</span>{" "}
                  <Text copyable>{selectedApp.email}</Text>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">
                    Số điện thoại:
                  </span>{" "}
                  <Text>{selectedApp.phoneNumber}</Text>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Ngôn ngữ:</span>{" "}
                  {selectedApp.language} ({selectedApp.proficiencyCode})
                </div>
                <div>
                  <span className="font-semibold text-gray-600">
                    Ngày sinh:
                  </span>{" "}
                  {selectedApp.dateOfBirth}
                </div>
                <div>
                  <span className="font-semibold text-gray-600">
                    Kinh nghiệm:
                  </span>{" "}
                  {selectedApp.teachingExperience || "Chưa cập nhật"}
                </div>
                {selectedApp.meetingUrl && (
                  <div>
                    <span className="font-semibold text-gray-600">
                      Meeting URL (Google Meet):{" "}
                    </span>
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
                <span className="font-semibold text-gray-600">Tiểu sử: </span>
                {selectedApp.bio ||
                  "Chưa có thông tin giới thiệu bản thân."}{" "}
                {/* [CẬP NHẬT] */}
              </Paragraph>
              {selectedApp.certificates?.length ? (
                <div className="mt-4">
                  <Title level={5} className="flex items-center gap-2">
                    Chứng chỉ chuyên môn ({selectedApp.certificates.length})
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
                            className="h-40 object-contain p-2"
                            preview={{ src: cert.certificateImageUrl }}
                            alt={cert.certificateName}
                          />
                        }
                      >
                        <Card.Meta
                          title={
                            <div
                              className="truncate"
                              title={cert.certificateName}
                            >
                              {cert.certificateName}
                            </div>
                          }
                        />
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert
                  message="Người dùng chưa tải lên chứng chỉ nào"
                  type="info"
                  showIcon
                /> // [CẬP NHẬT]
              )}

              {selectedApp.rejectionReason && (
                <Alert
                  message="Lý do từ chối" // [CẬP NHẬT] Rejected -> Lý do từ chối
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
