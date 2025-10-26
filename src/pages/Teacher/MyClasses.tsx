import React, { useState } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Empty,
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

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const statusOptions = [
  { value: "", label: "All Classes" },
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
];

const statusColors: Record<string, string> = {
  Draft: "cyan",
  Published: "blue",
};

const statusGradients: Record<string, string> = {
  Draft: "from-cyan-500 to-blue-600",
  Published: "from-blue-600 to-indigo-700",
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
    return Math.round((current / capacity) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
        <div className="relative">
          <div className="absolute inset-0 animate-ping bg-blue-500 rounded-full opacity-20"></div>
          <Spin
            size="large"
            indicator={<LoadingOutlined style={{ fontSize: 56 }} spin />}
          />
        </div>
        <Text className="mt-6 text-gray-600 text-lg font-medium">
          Loading your classes...
        </Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>

              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <BookOutlined className="text-white text-3xl" />
                  </div>
                  <div>
                    <Title level={1} className="!mb-0 !text-white">
                      My Classes
                    </Title>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-b from-white to-gray-50">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <Text className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                      {classes.length}
                    </Text>
                    <div className="text-gray-500 text-sm">
                      {status
                        ? `${formatStatusLabel(status)} Classes`
                        : "Total Classes"}
                    </div>
                  </div>
                </div>

                <Space size="middle">
                  <Select
                    value={status}
                    onChange={handleStatusChange}
                    style={{ width: 200 }}
                    size="large"
                    placeholder="Filter by status"
                    suffixIcon={<FilterOutlined />}
                    className="rounded-xl"
                  >
                    {statusOptions.map((s) => (
                      <Option key={s.value} value={s.value}>
                        <Space>
                          {s.value && (
                            <Badge
                              color={statusColors[s.value]}
                              className="mr-1"
                            />
                          )}
                          {s.label}
                        </Space>
                      </Option>
                    ))}
                  </Select>

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalVisible(true)}
                    size="large"
                    className="bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-12 px-6 font-semibold"
                  >
                    Create New Class
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {classes.length > 0 ? (
          <>
            <Row gutter={[24, 24]}>
              {classes.map((cls: Class) => {
                const statusColor = statusColors[cls.status] || "default";
                const statusGradient =
                  statusGradients[cls.status] || "from-gray-400 to-gray-600";
                const enrollmentPercentage = calculateEnrollmentPercentage(
                  cls.currentEnrollments,
                  cls.capacity
                );

                return (
                  <Col key={cls.classID} xs={24} sm={12} lg={8}>
                    <Card
                      hoverable
                      className="group h-full shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl border-0 overflow-hidden bg-white"
                      bodyStyle={{ padding: 0 }}
                    >
                      {/* Card Header with Gradient */}
                      <div
                        className={`bg-gradient-to-r ${statusGradient} p-6 relative overflow-hidden`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-3">
                            <Tag
                              color={statusColor}
                              className="px-3 py-1 rounded-full text-xs font-semibold border-0 shadow-md"
                            >
                              {formatStatusLabel(cls.status)}
                            </Tag>
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                              <BookOutlined className="text-white text-lg" />
                            </div>
                          </div>
                          <Title
                            level={4}
                            className="!text-white !mb-1 line-clamp-2 group-hover:scale-105 transition-transform duration-300"
                          >
                            {cls.title}
                          </Title>
                          <Text className="text-white/90 text-sm font-medium">
                            {cls.languageName}
                          </Text>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          className="text-gray-600 mb-5 min-h-[3em] leading-relaxed"
                        >
                          {cls.description}
                        </Paragraph>

                        {/* Info Grid */}
                        <div className="space-y-3 mb-5">
                          <div className="flex items-center text-gray-700 bg-blue-50 p-3 rounded-xl">
                            <CalendarOutlined className="text-blue-700 mr-3 text-lg" />
                            <div className="flex-1">
                              <Text className="text-xs text-gray-500 block">
                                Duration
                              </Text>
                              <Text className="text-sm font-medium">
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

                          <div className="flex items-center text-gray-700 bg-indigo-50 p-3 rounded-xl">
                            <ClockCircleOutlined className="text-indigo-700 mr-3 text-lg" />
                            <div className="flex-1">
                              <Text className="text-xs text-gray-500 block">
                                Time
                              </Text>
                              <Text className="text-sm font-medium">
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

                          {/* Enrollment Progress */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                            <div className="flex justify-between items-center mb-2">
                              <Space>
                                <TeamOutlined className="text-blue-700 text-lg" />
                                <Text className="font-semibold text-gray-700">
                                  Enrollments
                                </Text>
                              </Space>
                              <Text className="font-bold text-blue-700">
                                {cls.currentEnrollments} / {cls.capacity}
                              </Text>
                            </div>
                            <Progress
                              percent={enrollmentPercentage}
                              strokeColor={{
                                "0%": "#1d4ed8",
                                "100%": "#4338ca",
                              }}
                              trailColor="#dbeafe"
                              showInfo={false}
                              strokeWidth={8}
                              className="mb-1"
                            />
                            <Text className="text-xs text-gray-500">
                              {enrollmentPercentage}% capacity filled
                            </Text>
                          </div>
                        </div>

                        {/* Price and Action */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div>
                            <Text className="text-xs text-gray-500 block mb-1">
                              Price per student
                            </Text>
                            <Text className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                              {cls.pricePerStudent.toLocaleString("vi-VN")} đ
                            </Text>
                          </div>
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`${cls.classID}`)}
                            size="large"
                            className="bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl font-semibold"
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
                onChange={handlePageChange}
                showSizeChanger={false}
                className="bg-white px-6 py-3 rounded-2xl shadow-md"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center min-h-[50vh] bg-white rounded-3xl shadow-xl p-12">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-8 rounded-full mb-6">
              <RocketOutlined className="text-6xl text-blue-700" />
            </div>
            <Empty
              description={
                <div className="text-center max-w-md">
                  <Title level={3} className="text-gray-800 mb-2">
                    No Classes Yet
                  </Title>
                  <Text className="text-gray-600 mb-6 block text-base">
                    Start your teaching journey by creating your first class.
                    Share your knowledge and inspire students!
                  </Text>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalVisible(true)}
                    size="large"
                    className="bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-12 px-8 font-semibold"
                  >
                    Create Your First Class
                  </Button>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
      <CreateClassForm
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
    </div>
  );
};

export default MyClasses;
