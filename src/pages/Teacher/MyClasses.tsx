import React, { useState } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  // Empty,
  Spin,
  Select,
  Space,
  Tag,
  Pagination,
  Progress,
  Badge,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getClassesService } from "../../services/class";
import {
  PlusOutlined,
  EyeOutlined,
  LoadingOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FilterOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { formatStatusLabel } from "../../utils/mapping";
import type { Class } from "../../services/class/type";
import CreateClassForm from "./components/CreateClassForm";
import { Book } from "lucide-react";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const statusOptions = [
  { value: "", label: "All Classes" },
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
];

const statusColors: Record<string, string> = {
  Draft: "#bfbfbf",
  Published: "#bfbfbf",
};

const MyClasses: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const pageSize = 9;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["classes", status, page],
    queryFn: () => getClassesService({ status, page, pageSize }),
    retry: 1,
    retryDelay: 500,
  });

  const classes = data?.data ?? [];

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
    refetch();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const calculateEnrollmentPercentage = (current: number, capacity: number) => {
    if (!capacity) return 0;
    return Math.round((current / capacity) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
        <Spin
          size="large"
          indicator={
            <LoadingOutlined className="text-5xl text-gray-500" spin />
          }
        />
        <Text className="mt-6 text-gray-600 text-lg font-medium">
          Loading your classes...
        </Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Title Bar */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Book size={24} className="text-gray-700" />
            </div>
            <Title
              level={3}
              className="m-0 text-gray-900 font-semibold text-xl"
            >
              My Classes
            </Title>
          </div>

          {/* Stats + Controls */}
          <div className="p-5 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-gray-900">
                  {classes.length}
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  {status
                    ? `${formatStatusLabel(status)} Classes`
                    : "Total Classes"}
                </div>
              </div>

              <Space
                size="middle"
                className="flex flex-wrap justify-center sm:justify-end gap-3"
              >
                <Select
                  value={status}
                  onChange={handleStatusChange}
                  style={{ width: 200 }}
                  size="large"
                  placeholder="Filter by status"
                  suffixIcon={<FilterOutlined className="text-gray-500" />}
                  className="rounded-xl"
                >
                  {statusOptions.map((s) => (
                    <Option key={s.value} value={s.value}>
                      <Space size={6}>
                        {s.value && (
                          <Badge
                            color={statusColors[s.value]}
                            style={{ width: 8, height: 8 }}
                          />
                        )}
                        <span className="font-medium text-gray-700">
                          {s.label}
                        </span>
                      </Space>
                    </Option>
                  ))}
                </Select>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsCreateModalVisible(true)}
                  size="large"
                  className="h-12 px-6 rounded-xl font-medium bg-gray-900 hover:bg-gray-800 border-0 shadow-sm"
                >
                  Create New Class
                </Button>
              </Space>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {classes.length > 0 ? (
          <div className="mt-6">
            <Row gutter={[24, 24]}>
              {classes.map((cls: Class) => {
                const enrollmentPercentage = calculateEnrollmentPercentage(
                  cls.currentEnrollments,
                  cls.capacity
                );

                return (
                  <Col key={cls.classID} xs={24} sm={12} lg={8}>
                    <Card
                      hoverable
                      bodyStyle={{ padding: 0 }}
                      style={{
                        height: "100%",
                        borderRadius: 18,
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                        overflow: "hidden",
                        backgroundColor: "#ffffff",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                    >
                      {/* Header */}
                      <div
                        style={{
                          padding: 20,
                          backgroundColor: "#ffffff",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: 12,
                          }}
                        >
                          <Tag
                            color="default"
                            style={{
                              padding: "4px 12px",
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 500,
                              border: "1px solid #d4d4d4",
                            }}
                          >
                            {formatStatusLabel(cls.status)}
                          </Tag>

                          <div
                            style={{
                              padding: 8,
                              backgroundColor: "#ffffff",
                              borderRadius: 10,
                              border: "1px solid #e5e7eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <BookOutlined
                              style={{ color: "#4b5563", fontSize: 16 }}
                            />
                          </div>
                        </div>

                        <Title
                          level={4}
                          style={{
                            margin: 0,
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#111827",
                            lineHeight: 1.4,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {cls.title}
                        </Title>

                        <Text
                          style={{
                            display: "block",
                            marginTop: 4,
                            fontSize: 13,
                            color: "#6b7280",
                          }}
                        >
                          {cls.languageName}
                        </Text>
                      </div>

                      {/* Body */}
                      <div
                        style={{
                          padding: 20,
                          display: "flex",
                          flexDirection: "column",
                          gap: 14,
                        }}
                      >
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{
                            margin: 0,
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: "#4b5563",
                            minHeight: "3rem",
                          }}
                        >
                          {cls.description}
                        </Paragraph>

                        {/* Info Blocks */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: 12,
                              borderRadius: 12,
                              backgroundColor: "#f9fafb",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <CalendarOutlined
                              style={{
                                color: "#6b7280",
                                marginRight: 12,
                                fontSize: 16,
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: "#9ca3af",
                                  display: "block",
                                  marginBottom: 2,
                                }}
                              >
                                Duration
                              </Text>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: "#1f2933",
                                }}
                              >
                                {new Date(cls.startDateTime).toLocaleDateString(
                                  "en-GB"
                                )}{" "}
                                -{" "}
                                {new Date(cls.endDateTime).toLocaleDateString(
                                  "en-GB"
                                )}
                              </Text>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: 12,
                              borderRadius: 12,
                              backgroundColor: "#f9fafb",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <ClockCircleOutlined
                              style={{
                                color: "#6b7280",
                                marginRight: 12,
                                fontSize: 16,
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: "#9ca3af",
                                  display: "block",
                                  marginBottom: 2,
                                }}
                              >
                                Time
                              </Text>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: "#1f2933",
                                }}
                              >
                                {new Date(cls.startDateTime).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}{" "}
                                -{" "}
                                {new Date(cls.endDateTime).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </Text>
                            </div>
                          </div>

                          {/* Enrollment */}
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <Space size={6}>
                                <TeamOutlined className="text-gray-600 text-base" />
                                <Text className="font-medium text-gray-800">
                                  Enrollments
                                </Text>
                              </Space>
                              <Text className="font-medium text-gray-700 text-sm">
                                {cls.currentEnrollments} / {cls.capacity}
                              </Text>
                            </div>
                            <Progress
                              percent={enrollmentPercentage}
                              strokeColor="#8c8c8c"
                              trailColor="#e5e5e5"
                              showInfo={false}
                              strokeWidth={8}
                              className="mb-1"
                            />
                            <Text className="text-xs text-gray-500">
                              {enrollmentPercentage}% filled
                            </Text>
                          </div>
                        </div>

                        {/* Price + Action */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div>
                            <Text className="text-xs text-gray-500 block mb-1">
                              Price per student
                            </Text>
                            <div className="text-xl font-bold text-gray-900">
                              {cls.pricePerStudent.toLocaleString("vi-VN")} đ
                            </div>
                          </div>
                          <Button
                            type="default"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`${cls.classID}`)}
                            size="large"
                            className="rounded-xl font-medium border-gray-300 hover:border-gray-400"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {/* Pagination */}
            <div className="flex justify-center mt-10">
              <Pagination
                current={page}
                pageSize={pageSize}
                // total={data?.total}
                onChange={handlePageChange}
                showSizeChanger={false}
                className="bg-white px-6 py-3 rounded-2xl shadow-md border border-gray-200"
              />
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="mt-6 bg-white rounded-3xl shadow-lg p-12 text-center border border-gray-200">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <RocketOutlined className="text-5xl text-gray-600" />
            </div>
            <Title level={3} className="text-gray-900 mb-3 font-semibold">
              No Classes Yet
            </Title>
            <Text className="text-gray-600 max-w-md mx-auto block mb-8 text-base leading-relaxed">
              Start your teaching journey by creating your first class. Share
              your knowledge and inspire students!
            </Text>
            {/* <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
              size="large"
              className="h-14 px-10 rounded-xl font-medium bg-gray-900 hover:bg-gray-800 border-0 shadow-md"
            >
              Create Your First Class
            </Button> */}
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateClassForm
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
    </div>
  );
};

export default MyClasses;
