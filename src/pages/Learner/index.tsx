/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import {
  Card,
  Typography,
  Table,
  Tag,
  Statistic,
  Row,
  Col,
  Empty,
  message,
  DatePicker,
  Select,
  Space,
  Button,
} from "antd";
import { TeamOutlined, BookOutlined, FilterOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getTeacherDashboard } from "../../services/dashboard";
import LoadingScreen from "@/components/Loading/LoadingScreen";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const formatVND = (value: number): string => {
  return value.toLocaleString("vi-VN") + " ₫";
};

const TeacherDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [programId, setProgramId] = useState<string | undefined>(undefined);

  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "teacherDashboard",
      dateRange?.[0]?.format("YYYY-MM-DD"),
      dateRange?.[1]?.format("YYYY-MM-DD"),
      status,
      programId,
    ],
    queryFn: () =>
      getTeacherDashboard({
        from: dateRange?.[0]?.format("YYYY-MM-DD"),
        to: dateRange?.[1]?.format("YYYY-MM-DD"),
        status: status || undefined,
        programId: programId || undefined,
      }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const data = rawData?.data;

  React.useEffect(() => {
    if (isError) {
      message.error("Failed to load dashboard data");
      console.error(error);
    }
  }, [isError, error]);

  const programOptions = useMemo(() => {
    if (!data?.programStats) return [];
    return data.programStats.map((p) => ({
      label: p.programName,
      value: p.programId,
    }));
  }, [data?.programStats]);

  const columns = [
    {
      title: "Lớp",
      key: "title",
      render: (_: any, record: any) => (
        <div>
          <Text strong>{record.title}</Text>
          <div className="text-xs text-gray-500">{record.programName}</div>
        </div>
      ),
    },
    {
      title: "Thời gian",
      key: "time",
      render: (_: any, record: any) => (
        <div className="text-sm">
          {dayjs(record.startDateTime).format("DD/MM/YYYY HH:mm")} -{" "}
          {dayjs(record.endDateTime).format("HH:mm")}
        </div>
      ),
    },
    {
      title: "Học sinh",
      dataIndex: "studentCount",
      align: "center" as const,
      render: (count: number) => <strong>{count}</strong>,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      align: "right" as const,
      render: (value: number) => <Text strong>{formatVND(value)}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string) => {
        let color = "green";
        if (status.toLowerCase().includes("draft") || status === "Pending")
          color = "orange";
        if (status.toLowerCase().includes("cancel")) color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const handleClearFilters = () => {
    setDateRange(null);
    setStatus(undefined);
    setProgramId(undefined);
  };

  if (isLoading) {
    return <LoadingScreen message="Đang tải..." />;
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Empty description="Failed to load data. Please try again later." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="!mb-0">
          Tổng quan
        </Title>
      </div>

      {/* FILTER BAR */}
      <Card className="!mb-6">
        <Space size="middle" wrap>
          <div>
            <Text strong>Phạm vi ngày:</Text>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as any)}
              style={{ width: 260, marginLeft: 8 }}
              placeholder={["Từ", "Đến"]}
            />
          </div>

          <div>
            <Text strong>Trạng thái:</Text>
            <Select
              value={status}
              onChange={setStatus}
              style={{ width: 160, marginLeft: 8 }}
              allowClear
              placeholder="Tất cả"
            >
              <Select.Option value="Published">Đã xuất bản</Select.Option>
              <Select.Option value="Draft">Bản nháp</Select.Option>
              <Select.Option value="Cancelled">Đã hủy</Select.Option>
              <Select.Option value="Completed">Đã hoàn thành</Select.Option>
            </Select>
          </div>

          <div>
            <Text strong>Program:</Text>
            <Select
              value={programId}
              onChange={setProgramId}
              style={{ width: 220, marginLeft: 8 }}
              allowClear
              placeholder="Tất cả chương trình"
              options={programOptions}
              loading={!data.programStats}
            />
          </div>

          {(dateRange || status || programId) && (
            <Button
              type="link"
              onClick={handleClearFilters}
              icon={<FilterOutlined />}
            >
              Clear Filters
            </Button>
          )}
        </Space>
      </Card>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="!mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số lớp"
              value={data.totalClasses}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số học sinh"
              value={data.totalStudents}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={`${data.totalRevenue} đ`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Lớp học đang hoạt động"
              value={data.activeClasses}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Payout + Program Stats */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} md={8}>
          <Card title="Xuất chi" className="h-full">
            <Statistic title="Xuất chi" value={data.completedPayouts} />
            <Statistic
              title="Chưa giải quyết"
              value={data.pendingPayouts}
              valueStyle={{ color: "#fa8c16" }}
            />
            <Statistic
              title="Đã hủy"
              value={data.cancelledPayouts}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Thống kê theo chương trình">
            <Table
              dataSource={data.programStats}
              pagination={false}
              rowKey="programId"
              columns={[
                { title: "Chương trình", dataIndex: "programName" },
                {
                  title: "Lớp học",
                  dataIndex: "classCount",
                  align: "center" as const,
                },
                {
                  title: "Học viên",
                  dataIndex: "studentCount",
                  align: "center" as const,
                },
                {
                  title: "Doanh thu",
                  dataIndex: "revenue",
                  align: "right" as const,
                  render: (v: number) => <Text strong>{formatVND(v)}</Text>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Classes Table */}
      <Card title={`Danh sách lớp (${data.classes.length})`} className="!mb-8">
        <Table
          columns={columns}
          dataSource={data.classes}
          rowKey="classID"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "No classes yet" }}
        />
      </Card>

      {/* Monthly Revenue Cards */}
      {data.periodStats.length > 0 && (
        <Card title="Doanh thu hàng tháng">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.periodStats.map((item: any) => (
              <Card key={item.period} className="text-center shadow-sm">
                <div className="text-sm text-gray-500">
                  {item.period.replace("-", "/")}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatVND(item.revenue)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {item.classCount} lớp học • {item.studentCount} học viên
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TeacherDashboard;
