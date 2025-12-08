/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Avatar,
  Input,
  Select,
  Image,
  Tooltip,
  Empty,
  Button,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  getAdminCoursesService,
  getAdminCourseSubmissionsService,
} from "../../services/course";
import type { Course, ICourseDataStaff } from "../../services/course/type";
import {
  SearchOutlined,
  BookOutlined,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useDebounce } from "../../utils/useDebound";

const { Title, Text } = Typography;
const { Option } = Select;

const CoursesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("newest");

  const debouncedSearch = useDebounce(searchTerm, 500);

  const handleClearFilters = () => {
    setSearchTerm("");
    setLanguage(undefined);
    setStatus(undefined);
    setSortBy("newest");
    setPage(1);
  };

  const formatDateSafe = (dateString: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-GB");
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "admin-courses",
      page,
      pageSize,
      debouncedSearch,
      language,
      status,
      sortBy,
    ],
    queryFn: async () => {
      try {
        if (status === "Pending") {
          const res = await getAdminCourseSubmissionsService({
            page,
            pageSize,
            status: "Pending",
          });

          const mappedData =
            (res as any)?.data?.map((item: ICourseDataStaff) => ({
              ...item.course,
              courseId: item.course.courseId,
              teacher: {
                teacherId: item.submitter?.teacherId,
                name: item.submitter?.name,
                email: item.submitter?.email,
                avatar: item.submitter?.avatar,
              },
              courseStatus: "Pending",
              createdAt: item.submittedAt,
            })) || [];

          return {
            data: mappedData,
            meta: {
              page: page,
              pageSize: pageSize,
              totalItems: mappedData.length,
              totalPages: 1,
            },
          };
        } else {
          return await getAdminCoursesService({
            Page: page,
            PageSize: pageSize,
            SearchTerm: debouncedSearch,
            lang: language,
            Status: status,
            SortBy: sortBy,
          });
        }
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          return {
            data: [],
            meta: { page: 1, pageSize: pageSize, totalItems: 0, totalPages: 0 },
          };
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      if (error.response && error.response.status === 404) return false;
      return failureCount < 2;
    },
  });

  const columns = [
    {
      title: "Thông tin khóa học",
      width: 320,
      render: (_: any, record: Course) => (
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-gray-100 relative">
            <Image
              src={record.imageUrl || "error"}
              fallback="https://via.placeholder.com/80x60?text=No+Img"
              width="100%"
              height="100%"
              style={{ objectFit: "cover" }}
              preview={false}
            />
          </div>
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <Tooltip title={record.title}>
              <Text
                strong
                className="truncate text-sm mb-0.5 block text-slate-700"
              >
                {record.title}
              </Text>
            </Tooltip>
            <div className="flex flex-wrap gap-1">
              {record.language && (
                <Tag className="mr-0 text-[10px] px-1 bg-gray-50">
                  {record.language}
                </Tag>
              )}
              {record.program?.level?.name && (
                <Tag color="blue" className="mr-0 text-[10px] px-1">
                  {record.program.level.name}
                </Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Giáo viên",
      dataIndex: "teacher",
      width: 200,
      render: (teacher: any) => (
        <div className="flex items-center gap-2">
          <Avatar src={teacher?.avatar} icon={<UserOutlined />} size="small" />
          <div className="flex flex-col">
            <Text className="text-xs font-medium">
              {teacher?.name || "Unknown"}
            </Text>
            <Text className="text-[10px] text-gray-400 truncate w-32">
              {teacher?.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      width: 120,
      render: (price: number, record: Course) => (
        <div>
          {record.courseType === "Free" || price === 0 ? (
            <Tag color="green" className="font-semibold">
              Miễn phí
            </Tag>
          ) : (
            <div className="flex flex-col">
              <Text strong className="text-emerald-600">
                {price?.toLocaleString()} ₫
              </Text>
              {record.discountPrice ? (
                <Text delete className="text-[10px] text-gray-400">
                  {record.discountPrice.toLocaleString()} ₫
                </Text>
              ) : null}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      width: 160,
      render: (_: any, record: Course) => (
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-1">
            <UserOutlined /> {record.learnerCount || 0} học viên
          </div>
          <div className="flex items-center gap-1">
            {record.numLessons || 0} bài học
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "courseStatus",
      width: 120,
      render: (st: string) => {
        let color = "default";
        if (st === "Published") color = "success";
        if (st === "Draft") color = "warning";
        if (st === "Rejected") color = "error";
        if (st === "Pending") color = "processing";
        return (
          <Tag color={color} className="min-w-[70px] text-center">
            {st}
          </Tag>
        );
      },
    },
    {
      title: "Ngày",
      dataIndex: "createdAt",
      width: 120,
      render: (date: string) => (
        <div className="flex flex-col">
          <Text className="text-xs text-gray-600">{formatDateSafe(date)}</Text>
          <Text className="text-[10px] text-gray-400">Created</Text>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        bordered={false}
        className="rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <BookOutlined className="text-xl" />
              </div>
              <div>
                <Title level={4} className="!mb-0 !font-bold text-gray-800">
                  Tất cả các khóa học
                </Title>
                <Text className="text-xs text-gray-500">
                  Quản lý và giám sát tất cả các khóa học
                </Text>
              </div>
            </div>

            {(searchTerm || language || status || sortBy !== "newest") && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleClearFilters}
                size="small"
                className="text-gray-500"
              >
                Đặt lại bộ lọc
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-3 rounded-xl">
            <Input
              placeholder="Tìm kiếm theo tiêu đề..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              allowClear
              disabled={status === "Pending"}
            />
            <Select
              placeholder="Ngôn ngữ"
              style={{ width: 120 }}
              allowClear
              value={language}
              onChange={(val) => setLanguage(val)}
              disabled={status === "Pending"}
            >
              <Option value="en">Tiếng Anh</Option>
              <Option value="ja">Tiếng Nhật</Option>
              <Option value="zh">Tiếng Trung</Option>
            </Select>
            <Select
              placeholder="Trạng thái"
              style={{ width: 130 }}
              allowClear
              value={status}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
            >
              <Option value="Published">Đã xuất bản</Option>
              <Option value="Draft">Bản nháp</Option>
              <Option value="Pending">Đang chờ xử lý (Đánh giá)</Option>
              <Option value="Rejected">Từ chối</Option>
            </Select>
            <Select
              value={sortBy}
              style={{ width: 140 }}
              onChange={(val) => setSortBy(val)}
              disabled={status === "Pending"}
            >
              <Option value="newest">Mới nhất</Option>
              <Option value="oldest">Cũ nhất</Option>
              <Option value="price_asc">Giá: Thấp đến Cao</Option>
              <Option value="price_desc">Giá: Cao đến Thấp</Option>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="courseId"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.meta?.totalItems || 0,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showTotal: (total) => `Tổng ${total} khóa học`,
            position: ["bottomRight"],
          }}
          scroll={{ x: 1100 }}
          size="middle"
          locale={{
            emptyText: (
              <Empty
                description="Không tìm thấy khóa học nào."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default CoursesPage;
