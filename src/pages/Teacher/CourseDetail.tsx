/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tag,
  Avatar,
  Typography,
  Empty,
  Spin,
  Button,
  Form,
  Input,
  message,
  Tooltip,
  Divider,
} from "antd";
import {
  createCourseUnitsService,
  deleteUnitsService,
  getCourseDetailService,
  getCourseUnitsService,
  getLessonsByUnits,
} from "../../services/course";
import type { Unit, Lesson } from "../../services/course/type";
import {
  CloseOutlined,
  FileOutlined,
  PlusOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import type { AxiosError } from "axios";
import { notifyError, notifySuccess } from "../../utils/toastConfig";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Edit,
  Trash2,
  Users,
  LayoutDashboard,
  GraduationCap,
} from "lucide-react";

const { Title, Paragraph, Text } = Typography;

const CourseDetail: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeKey, setActiveKey] = useState<string | string[]>("");

  // --- Fetch Course Info ---
  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseDetailService(courseId!),
    enabled: !!courseId,
  });

  // --- Delete Unit Mutation ---
  const deleteUnitMutation = useMutation({
    mutationFn: (unitId: string) => deleteUnitsService({ id: unitId }),
    onSuccess: () => {
      notifySuccess("Unit deleted successfully");
      refetchUnits();
    },
    onError: (error: AxiosError<any>) => {
      notifyError(error.response?.data?.message || "Failed to delete unit");
    },
  });

  // --- Fetch Units ---
  const {
    data: units,
    isLoading: loadingUnits,
    refetch: refetchUnits,
  } = useQuery<Unit[]>({
    queryKey: ["units", courseId],
    queryFn: () => getCourseUnitsService({ id: courseId! }),
    enabled: !!courseId,
  });

  // --- Create Unit Mutation ---
  const createUnitMutation = useMutation({
    mutationFn: (values: {
      id: string;
      title: string;
      description: string;
      isPreview: boolean;
    }) =>
      createCourseUnitsService({
        courseId: values.id || "",
        title: values.title,
        description: values.description,
        isPreview: values.isPreview,
      }),
    onSuccess: () => {
      message.success("Unit created successfully");
      setActiveKey("");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      refetchUnits();
    },
    onError: (error: AxiosError<any>) => {
      notifyError(error.response?.data?.message || "Failed to create unit");
    },
  });

  const handleAddUnit = (values: { title: string; description: string }) => {
    createUnitMutation.mutate({
      id: courseId!,
      title: values.title,
      description: values.description,
      isPreview: false,
    });
  };

  const handleDeleteUnit = (unitId: string) => {
    deleteUnitMutation.mutate(unitId);
  };

  if (loadingCourse || loadingUnits)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );

  if (!course)
    return <Empty description="Course not found" className="mt-20" />;

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Button
            type="text"
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-900 flex items-center gap-2 pl-0"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back to Courses</span>
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                navigate(`/teacher/course/${course?.courseId}/edit-course`)
              }
              className="flex items-center gap-2 border-gray-300 shadow-sm"
            >
              <Edit size={16} />
              Edit Details
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Course Meta (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-video w-full bg-gray-100 relative">
                <img
                  src={course?.imageUrl || "/default-course.jpg"}
                  alt={course?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Tag color="gold" className="m-0 shadow-sm font-medium">
                    Draft
                  </Tag>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <Title level={4} className="!mb-2 !text-gray-900 !font-bold">
                    {course?.title}
                  </Title>
                  <Paragraph className="text-gray-500 text-sm leading-relaxed">
                    {course?.description || "No description provided."}
                  </Paragraph>
                </div>

                <div className="flex items-center gap-3 py-3 border-t border-b border-gray-100">
                  <Avatar
                    src={course?.teacher?.avatar}
                    size="large"
                    className="bg-blue-600"
                  >
                    {course?.teacher?.name?.[0]}
                  </Avatar>
                  <div>
                    <Text className="block text-sm font-medium text-gray-900">
                      {course?.teacher?.name || "Instructor"}
                    </Text>
                    <Text className="block text-xs text-gray-500">Author</Text>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Users size={14} /> Learners
                    </span>
                    <span className="font-medium text-gray-900">
                      {course.learnerCount ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Clock size={14} /> Duration
                    </span>
                    <span className="font-medium text-gray-900">
                      {course.durationDays ?? 0} days
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <BookOpen size={14} /> Lessons
                    </span>
                    <span className="font-medium text-gray-900">
                      {course.numLessons ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <GraduationCap size={14} /> Level
                    </span>
                    <Tag
                      bordered={false}
                      className="m-0 bg-gray-100 text-gray-700 font-medium"
                    >
                      {course?.program.level.name || "N/A"}
                    </Tag>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-sm text-gray-500 mb-1">Price</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {course.price ? (
                      <>
                        {course?.discountPrice
                          ? `${course?.discountPrice.toLocaleString()} VNĐ`
                          : `${course?.price.toLocaleString()} VNĐ`}
                      </>
                    ) : (
                      "Free"
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Meta Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <LayoutDashboard size={16} /> Learning Outcomes
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {course?.learningOutcome || "No specific outcomes defined."}
              </p>
              <Divider className="my-4" />
              <h4 className="font-semibold text-gray-900">Topics</h4>
              <div className="flex flex-wrap gap-2">
                {course?.topics.map((topic: any) => (
                  <Tag
                    key={topic.topicId}
                    className="m-0 text-gray-600 bg-gray-50 border-gray-200"
                  >
                    {topic.topicName}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Curriculum Management (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Title level={3} className="!mb-1 text-gray-900">
                  Curriculum
                </Title>
                <Text className="text-gray-500">
                  Manage units, lessons, and exercises.
                </Text>
              </div>
              <Button
                type="primary"
                icon={
                  activeKey === "create" ? <CloseOutlined /> : <PlusOutlined />
                }
                onClick={() =>
                  setActiveKey(activeKey === "create" ? "" : "create")
                }
                className="bg-gray-900 hover:bg-gray-800 border-none h-10 px-5 shadow-md"
              >
                {activeKey === "create" ? "Cancel" : "Add Unit"}
              </Button>
            </div>

            {/* Quick Create Unit Panel */}
            {activeKey === "create" && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg animate-in fade-in slide-in-from-top-2">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Create New Unit
                </h4>
                <Form layout="vertical" onFinish={handleAddUnit}>
                  <Form.Item
                    name="title"
                    label="Unit Title"
                    rules={[
                      { required: true, message: "Please enter unit title" },
                    ]}
                  >
                    <Input
                      placeholder="e.g. Introduction to React"
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item name="description" label="Description">
                    <Input.TextArea
                      rows={3}
                      placeholder="What will students learn in this unit?"
                    />
                  </Form.Item>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button onClick={() => setActiveKey("")}>Cancel</Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={createUnitMutation.isPending}
                      className="bg-blue-600"
                    >
                      Create Unit
                    </Button>
                  </div>
                </Form>
              </div>
            )}

            {/* Units List */}
            <div className="space-y-4">
              {Array.isArray(units) && units.length > 0 ? (
                units.map((unit) => (
                  <UnitWithLessons
                    key={unit?.courseUnitID || Math.random()}
                    deleteUnit={handleDeleteUnit}
                    unit={unit}
                  />
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="text-center">
                      <Text className="text-gray-500">No content yet.</Text>
                      <div className="mt-2">
                        <Button
                          type="dashed"
                          onClick={() => setActiveKey("create")}
                        >
                          Create First Unit
                        </Button>
                      </div>
                    </div>
                  }
                  className="bg-white rounded-xl border border-gray-200 border-dashed py-12 m-0"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Subcomponent: Unit Item ----
const UnitWithLessons: React.FC<{
  unit: Unit;
  deleteUnit: (id: string) => void;
}> = ({ unit, deleteUnit }) => {
  const { data: lessonsResponse, isLoading } = useQuery({
    queryKey: ["lessons", unit?.courseUnitID],
    queryFn: () => getLessonsByUnits({ unitId: unit?.courseUnitID }),
    enabled: !!unit?.courseUnitID,
    retry: 1,
  });

  const lessons: Lesson[] = lessonsResponse?.data || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      {/* Unit Header */}
      <div className="p-4 flex items-start justify-between bg-white border-b border-gray-100">
        <div className="flex gap-4 items-start">
          <div className="mt-1 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
            <BookOpen size={16} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
              {unit?.title || "Untitled Unit"}
            </h4>
            <p className="text-sm text-gray-500 line-clamp-2 max-w-xl">
              {unit?.description || "No description provided"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip title="Manage Lessons">
            <Link to={`unit/${unit?.courseUnitID}`}>
              <Button
                size="small"
                icon={<Edit size={14} />}
                className="flex items-center gap-1"
              >
                Manage Content
              </Button>
            </Link>
          </Tooltip>
          <Button
            danger
            type="text"
            size="small"
            icon={<Trash2 size={14} />}
            onClick={() => deleteUnit(unit?.courseUnitID)}
          />
        </div>
      </div>

      {/* Quick Lesson Preview (Read Only) */}
      <div className="bg-gray-50/50 p-3 space-y-1">
        {isLoading ? (
          <div className="py-2 text-center text-gray-400 text-xs">
            Loading lessons...
          </div>
        ) : lessons.length === 0 ? (
          <div className="py-2 pl-12 text-gray-400 text-sm italic">
            No lessons in this unit yet.
          </div>
        ) : (
          lessons.map((lesson, idx) => (
            <div
              key={lesson.lessonID}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white hover:border-gray-200 border border-transparent transition-all group/lesson"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400 w-4">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {lesson.title}
                </span>
                {lesson.videoUrl && (
                  <VideoCameraOutlined className="text-gray-400 text-xs" />
                )}
                {lesson.documentUrl && (
                  <FileOutlined className="text-gray-400 text-xs" />
                )}
              </div>
              <Tag className="m-0 text-xs bg-white border-gray-200 text-gray-500">
                {lesson.position}
              </Tag>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
