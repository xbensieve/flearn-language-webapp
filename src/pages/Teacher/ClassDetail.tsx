import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Spin,
  Select,
  Space,
  Tag,
  Button,
  Row,
  Col,
  Progress,
  Badge,
  message,
  Alert,
} from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getClassByIdService, publishClassService } from "../../services/class";
import {
  LoadingOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  BookOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { formatStatusLabel } from "../../utils/mapping";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const statusColors: Record<string, string> = {
  Draft: "cyan",
  Published: "blue",
};

const statusGradients: Record<string, string> = {
  Draft: "from-cyan-500 to-blue-600",
  Published: "from-blue-600 to-indigo-700",
};

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | undefined>(
    undefined
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["class", id],
    queryFn: () => getClassByIdService(id!),
    enabled: !!id,
  });

  const classData = data?.data;

  useEffect(() => {
    if (classData) {
      setCurrentStatus(classData.status);
    }
  }, [classData]);

  const handleStatusEdit = () => {
    setIsEditingStatus(true);
  };

  const handleStatusCancel = () => {
    setIsEditingStatus(false);
    if (classData) {
      setCurrentStatus(classData.status);
    }
  };

  const handleStatusSave = async () => {
    if (currentStatus === classData?.status) {
      setIsEditingStatus(false);
      return;
    }

    setIsSaving(true);

    if (currentStatus === "Published") {
      try {
        const res = await publishClassService(id!);

        // Wait at least 500ms before updating
        await new Promise((resolve) => setTimeout(resolve, 500));

        message.success({
          content: res.message || "Class published successfully!",
          duration: 3,
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        });

        // Refetch data and invalidate cache
        await refetch();
        queryClient.invalidateQueries({ queryKey: ["class", id] });

        setIsEditingStatus(false);
      } catch (error: any) {
        message.error({
          content:
            error.response?.data?.message ||
            "Failed to publish class. Please try again.",
          duration: 4,
        });
        // Reset to original status on error
        setCurrentStatus(classData?.status);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(false);
      setIsEditingStatus(false);
    }
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
          Loading class details...
        </Text>
      </div>
    );
  }

  if (isError || !classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center shadow-xl rounded-3xl p-12">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-8 rounded-full mb-6 inline-block">
              <BookOutlined className="text-6xl text-blue-600" />
            </div>
            <Title level={3} className="text-gray-800">
              Could not fetch class details
            </Title>
            <Text className="text-gray-600 block mb-6">
              The class you're looking for might not exist or has been removed.
            </Text>
            <Button
              type="primary"
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/teacher/classes")}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-12 px-8 font-semibold"
            >
              Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const statusColor = statusColors[classData.status] || "default";
  const statusGradient =
    statusGradients[classData.status] || "from-gray-400 to-gray-600";
  const enrollmentPercentage = Math.round(
    (classData.currentEnrollments / classData.capacity) * 100
  );
  const isPublished = classData.status === "Published";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/teacher/classes")}
            size="large"
            className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border-blue-200 hover:border-blue-400 hover:text-blue-600 font-medium"
          >
            Back
          </Button>
        </div>

        {/* Published Success Alert */}
        {isPublished && (
          <Alert
            message="Class is Live!"
            description="Your class has been successfully published and is now visible to students."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            className="mb-6 rounded-xl shadow-md border-0"
            closable
          />
        )}

        {/* Header Card */}
        <Card className="shadow-xl rounded-3xl border-0 overflow-hidden mb-6">
          <div
            className={`bg-gradient-to-r ${statusGradient} p-8 relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -ml-32 -mb-32"></div>

            <div className="relative z-10">
              <Row justify="space-between" align="middle" className="mb-4">
                <Col>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <BookOutlined className="text-white text-2xl" />
                    </div>
                    <Text className="text-white text-sm font-medium">
                      Class Details
                    </Text>
                  </div>
                </Col>
                <Col>
                  {!isEditingStatus ? (
                    <Space size="middle">
                      <Tag
                        color={statusColor}
                        className="px-4 py-2 rounded-xl text-sm font-semibold border-0 shadow-lg"
                      >
                        {formatStatusLabel(currentStatus || classData.status)}
                      </Tag>
                      {!isPublished && (
                        <Button
                          icon={<EditOutlined />}
                          onClick={handleStatusEdit}
                          size="large"
                          className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 rounded-xl font-medium"
                        >
                          Edit Status
                        </Button>
                      )}
                    </Space>
                  ) : (
                    <Space size="middle">
                      <Select
                        value={currentStatus}
                        onChange={(value) => setCurrentStatus(value)}
                        size="large"
                        className="w-40"
                        disabled={isSaving}
                      >
                        <Option value="Draft">
                          <Badge color="cyan" className="mr-2" />
                          Draft
                        </Option>
                        <Option value="Published">
                          <Badge color="blue" className="mr-2" />
                          Published
                        </Option>
                      </Select>
                      <Button
                        icon={<SaveOutlined />}
                        onClick={handleStatusSave}
                        type="primary"
                        size="large"
                        className="bg-green-600 hover:bg-green-700 border-white shadow-lg rounded-xl font-semibold"
                        loading={isSaving}
                        disabled={isSaving}
                      >
                        Save
                      </Button>
                      <Button
                        icon={<CloseOutlined />}
                        onClick={handleStatusCancel}
                        size="large"
                        className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 rounded-xl"
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </Space>
                  )}
                </Col>
              </Row>

              <Title level={1} className="!text-white !mb-3 text-4xl">
                {classData.title}
              </Title>
              <Paragraph className="text-white text-lg mb-0 leading-relaxed max-w-3xl">
                {classData.description}
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <Row gutter={[24, 24]}>
          {/* Left Column - Class Information */}
          <Col xs={24} lg={14}>
            <Card className="shadow-lg rounded-2xl border-0 h-full">
              <Title level={4} className="text-gray-800 mb-6 flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <BookOutlined className="text-blue-600 text-xl" />
                </div>
                Class Information
              </Title>

              <div className="space-y-4">
                {/* Language */}
                <div className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="p-3 bg-blue-100 rounded-xl mr-4">
                    <GlobalOutlined className="text-blue-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <Text className="text-gray-500 text-xs block mb-1">
                      Language
                    </Text>
                    <Text className="text-gray-800 text-lg font-semibold">
                      {classData.languageName}
                    </Text>
                  </div>
                </div>

                {/* Schedule */}
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                      <CalendarOutlined className="text-indigo-600 text-lg" />
                    </div>
                    <Text className="text-gray-700 font-semibold text-base">
                      Schedule
                    </Text>
                  </div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Text className="text-xs text-gray-500 block mb-1">
                          Start Date & Time
                        </Text>
                        <Text className="text-gray-800 font-medium block">
                          {new Date(classData.startDateTime).toLocaleDateString(
                            "en-GB"
                          )}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {new Date(classData.startDateTime).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Text className="text-xs text-gray-500 block mb-1">
                          End Date & Time
                        </Text>
                        <Text className="text-gray-800 font-medium block">
                          {new Date(classData.endDateTime).toLocaleDateString(
                            "en-GB"
                          )}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {new Date(classData.endDateTime).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Google Meet Link */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                  <div className="flex items-start">
                    <div className="p-3 bg-green-100 rounded-xl mr-4">
                      <VideoCameraOutlined className="text-green-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <Text className="text-gray-500 text-xs block mb-2">
                        Google Meet Link
                      </Text>
                      <a
                        href={classData.googleMeetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium break-all inline-flex items-center"
                      >
                        {classData.googleMeetLink}
                        <CheckCircleOutlined className="ml-2" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Column - Statistics */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" size="large" className="w-full">
              {/* Enrollment Card */}
              <Card className="shadow-lg rounded-2xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                <Title
                  level={4}
                  className="text-gray-800 mb-4 flex items-center"
                >
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <TeamOutlined className="text-blue-600 text-xl" />
                  </div>
                  Enrollment Status
                </Title>

                <div className="text-center mb-6">
                  <Text className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                    {classData.currentEnrollments}
                  </Text>
                  <Text className="text-2xl text-gray-400 mx-2">/</Text>
                  <Text className="text-3xl font-semibold text-gray-600">
                    {classData.capacity}
                  </Text>
                  <div className="text-gray-500 mt-2">Students Enrolled</div>
                </div>

                <Progress
                  percent={enrollmentPercentage}
                  strokeColor={{
                    "0%": "#2563eb",
                    "100%": "#4f46e5",
                  }}
                  trailColor="#dbeafe"
                  strokeWidth={12}
                  className="mb-3"
                />
                <div className="flex justify-between items-center">
                  <Text className="text-gray-600">
                    {classData.capacity - classData.currentEnrollments} spots
                    remaining
                  </Text>
                  <Tag
                    color={
                      enrollmentPercentage >= 80
                        ? "red"
                        : enrollmentPercentage >= 50
                        ? "orange"
                        : "green"
                    }
                    className="px-3 py-1 rounded-full font-semibold"
                  >
                    {enrollmentPercentage}% Full
                  </Tag>
                </div>
              </Card>

              {/* Price Card */}
              <Card className="shadow-lg rounded-2xl border-0 bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden">
                <div className="relative p-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

                  <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <DollarOutlined className="text-white text-3xl" />
                      </div>
                    </div>

                    <Text className="text-white/80 text-base block mb-3 font-medium">
                      Price per Student
                    </Text>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-4 border border-white/20">
                      <div className="flex items-center justify-center">
                        <Text className="text-6xl font-bold text-white tracking-tight">
                          {classData.pricePerStudent.toLocaleString("vi-VN")}
                        </Text>
                      </div>
                      <Text className="text-2xl text-white/90 font-semibold mt-2">
                        VNĐ
                      </Text>
                    </div>

                    <Text className="text-white/70 text-sm">
                      Per student enrollment fee
                    </Text>
                  </div>
                </div>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ClassDetail;
