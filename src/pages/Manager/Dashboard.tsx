import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { managerDashboardService } from "@/services/manager/managerDashboard.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Activity,
  Zap,
  TrendingDown,
  TrendingUp,
  Calendar,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";

// --- Helpers ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

// Custom Chart Tooltip for a professional look
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg ring-1 ring-black/5">
        <p className="mb-1 text-sm font-semibold text-foreground">{label}</p>
        <p className="text-sm font-medium text-primary">
          {formatter ? formatter(payload[0].value) : payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(10, "day").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });
  const [topContent, setTopContent] = useState(10);

  const { data: overview, isLoading: isLoadingOverview } = useQuery({
    queryKey: ["dashboard-overview", dateRange], // Cache key phụ thuộc vào dateRange
    queryFn: () =>
      managerDashboardService.getOverview(
        dateRange.startDate,
        dateRange.endDate
      ),
    staleTime: 5 * 60 * 1000, // Dữ liệu coi là mới trong 5 phút
  });

  const { data: engagement, isLoading: isLoadingEngagement } = useQuery({
    queryKey: ["dashboard-engagement", dateRange],
    queryFn: () =>
      managerDashboardService.getEngagement(
        dateRange.startDate,
        dateRange.endDate
      ),
    staleTime: 5 * 60 * 1000,
  });

  const { data: contentStats = [], isLoading: isLoadingContent } = useQuery({
    queryKey: ["dashboard-content", topContent], // Cache key phụ thuộc vào topContent
    queryFn: () => managerDashboardService.getContentEffectiveness(topContent),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    isLoadingOverview || isLoadingEngagement || isLoadingContent;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading && !overview) {
    return (
      <DashboardLayout>
        <div className="min-h-screen w-full space-y-8 p-6">
          <div className="mx-auto max-w-3xl">
            <div className="h-12 rounded-xl bg-gray-200 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 h-8 w-56 rounded-lg bg-gray-200 animate-pulse" />

                <div className="h-96 rounded-xl bg-gray-100 animate-pulse" />

                <div className="mt-6 flex justify-between">
                  <div className="space-y-3">
                    <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
                    <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />
                  </div>
                  <div className="h-10 w-28 rounded-lg bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 h-7 w-44 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-48 rounded-lg bg-gray-100 animate-pulse" />
                <div className="mt-4 flex justify-between">
                  <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
                  <div className="h-5 w-20 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 h-7 w-40 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-48 rounded-lg bg-gray-100 animate-pulse" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="h-5 rounded bg-gray-200 animate-pulse" />
                  <div className="h-5 rounded bg-gray-200 animate-pulse" />
                  <div className="h-5 rounded bg-gray-200 animate-pulse" />
                  <div className="h-5 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div className="h-8 w-64 rounded-lg bg-gray-200 animate-pulse" />
            </div>
            <div className="divide-y divide-gray-200">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="px-6 py-5">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                    <div className="h-5 rounded bg-gray-200 animate-pulse" />
                    <div className="h-5 rounded bg-gray-200 animate-pulse" />
                    <div className="h-5 rounded bg-gray-200 animate-pulse" />
                    <div className="h-5 rounded bg-gray-200 animate-pulse" />
                    <div className="h-5 rounded bg-gray-200 animate-pulse" />
                    <div className="h-5 w-20 rounded bg-gray-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-8 p-4 md:p-8 pt-6 min-h-screen">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Bảng điều khiển quản lý
            </h2>
            <p className="text-muted-foreground mt-1">
              Xem dữ liệu từ{" "}
              <span className="font-medium text-foreground">
                {dateRange.startDate}
              </span>{" "}
              đến{" "}
              <span className="font-medium text-foreground">
                {dateRange.endDate}
              </span>
              .
            </p>
          </div>

          <div
            className="grid gap-3 rounded-lg border bg-background p-3 shadow-sm 
                md:grid-cols-[1fr_auto_auto] md:items-center"
          >
            {/* Date Range */}
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              {/* Start */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  name="startDate"
                  className="bg-transparent text-sm outline-none w-[130px]"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
              </div>

              {/* Arrow (only on desktop) */}
              <ArrowRight className="hidden md:block h-3 w-3 text-muted-foreground" />

              {/* End */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground md:hidden" />
                <input
                  type="date"
                  name="endDate"
                  className="bg-transparent text-sm outline-none w-[130px]"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>

            {/* Limit */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Giới hạn:
              </span>
              <select
                className="h-8 bg-transparent text-sm outline-none cursor-pointer"
                value={topContent}
                onChange={(e) => setTopContent(Number(e.target.value))}
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- KPI Overview --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Tổng doanh thu"
            value={formatCurrency(overview?.totalRevenue || 0)}
            icon={
              <span
                className="flex items-center justify-center
                        h-4 w-4 rounded-full
                        text-[18px] font-semibold
                      "
              >
                ₫
              </span>
            }
            subtext="Tổng doanh thu trong kỳ"
            trend="neutral"
          />

          <KpiCard
            title="Người học tích cực"
            value={overview?.activeLearners || 0}
            icon={<Activity className="h-4 w-4 text-blue-600" />}
            subtext="Người dùng đã tương tác"
            trend="up"
          />
          <KpiCard
            title="Đăng ký mới"
            value={`+${overview?.newRegistrations || 0}`}
            icon={<Users className="h-4 w-4 text-violet-600" />}
            subtext="Đăng ký mới"
            trend="up"
          />
          <KpiCard
            title="Tỷ lệ rời bỏ"
            value={`${overview?.churnRate || 0}%`}
            icon={<Zap className="h-4 w-4 text-amber-600" />}
            subtext="Người dùng trả phí không hoạt động"
            trend={(overview?.churnRate || 0) > 20 ? "down" : "neutral"}
            alert={(overview?.churnRate || 0) > 20}
          />
        </div>

        {/* --- Charts Section --- */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Revenue Area Chart */}
          <Card className="col-span-4 shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Phân tích doanh thu</CardTitle>
              <CardDescription>
                Xu hướng doanh thu hàng ngày trong khoảng thời gian đã chọn.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={overview?.revenueChart || []}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#0ea5e9"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0ea5e9"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                      dx={-10}
                    />
                    <Tooltip
                      content={<CustomTooltip formatter={formatCurrency} />}
                      cursor={{ stroke: "#0ea5e9", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: "#0284c7" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Metrics */}
          <Card className="col-span-3 shadow-sm border-slate-200 flex flex-col">
            <CardHeader>
              <CardTitle>Tương tác & Hoạt động</CardTitle>
              <CardDescription>
                Thói quen học tập và tỷ lệ hoàn thành của người dùng.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Metric Row 1 */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-md border shadow-sm">
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      Thời gian trung bình đã dành
                    </span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">
                    {engagement?.avgTimeSpentPerUser || 0}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      phút
                    </span>
                  </span>
                </div>

                {/* Metric Row 2 */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-md border shadow-sm">
                      <Activity className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      Tỷ lệ hoàn thành
                    </span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">
                    {engagement?.avgLessonCompletionRate
                      ? engagement.avgLessonCompletionRate.toFixed(1)
                      : 0}
                    <span className="text-sm font-normal text-muted-foreground">
                      %
                    </span>
                  </span>
                </div>

                {/* Activity Bar Chart */}
                <div className="pt-4">
                  <p className="mb-4 text-sm font-semibold text-slate-500">
                    Khối lượng hoạt động
                  </p>
                  <div className="h-[140px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={engagement?.activityVolumeChart || []}>
                        <XAxis dataKey="label" hide />
                        <Tooltip
                          cursor={{ fill: "#f1f5f9" }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded border bg-black text-white px-2 py-1 text-xs">
                                  {label}: {payload[0].value} hành động
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          barSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Content Effectiveness Table --- */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Phân tích sự sụt giảm nội dung</CardTitle>
              <CardDescription>
                Xác định những bài học mà học sinh gặp khó khăn hoặc bỏ dở.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="px-3 py-1 bg-amber-50 text-amber-700 border-amber-200"
            >
              Cần chú ý
            </Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[30%]">Tiêu đề bài học</TableHead>
                  <TableHead className="w-[25%]">Khóa học</TableHead>
                  <TableHead className="text-center">Đã bắt đầu</TableHead>
                  <TableHead className="text-center">Hoàn thành</TableHead>
                  <TableHead className="text-right">Tỷ lệ bỏ học</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contentStats.map((item) => (
                  <TableRow
                    key={item.lessonId}
                    className="group hover:bg-slate-50"
                  >
                    <TableCell className="font-medium text-slate-900 group-hover:text-primary transition-colors">
                      {item.lessonTitle}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs md:text-sm">
                      <div className="min-w-[150px]" title={item.courseName}>
                        {item.courseName}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">
                      {item.totalStarted}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {item.totalCompleted}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropOffBadge rate={item.dropOffRate} />
                    </TableCell>
                  </TableRow>
                ))}
                {contentStats.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center h-32 text-muted-foreground"
                    >
                      Không tìm thấy điểm rơi quan trọng nào trong phạm vi này.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// --- Sub-Components ---

function KpiCard({ title, value, icon, subtext, trend, alert = false }: any) {
  return (
    <Card
      className={`shadow-sm border-slate-200 transition-all hover:shadow-md ${
        alert ? "border-red-200 bg-red-50/30" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <div
          className={`rounded-full p-2 bg-slate-100 ${
            alert ? "bg-red-100" : ""
          }`}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold text-slate-900 ${
            alert ? "text-red-600" : ""
          }`}
        >
          {value}
        </div>
        <div className="flex items-center mt-1">
          {trend === "up" && (
            <TrendingUp className="h-3 w-3 text-emerald-600 mr-1" />
          )}
          {trend === "down" && (
            <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
          )}
          <p className="text-xs text-muted-foreground">{subtext}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DropOffBadge({ rate }: { rate: number }) {
  let colorClass = "bg-slate-100 text-slate-700 hover:bg-slate-200"; // Low
  if (rate > 20) colorClass = "bg-amber-100 text-amber-800 hover:bg-amber-200"; // Medium
  if (rate > 50) colorClass = "bg-red-100 text-red-800 hover:bg-red-200"; // Critical

  return (
    <Badge className={`${colorClass} border-none font-mono font-medium`}>
      {rate.toFixed(1)}%
    </Badge>
  );
}
