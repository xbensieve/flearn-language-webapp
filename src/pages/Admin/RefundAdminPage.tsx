/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Button,
  Select,
  Modal,
  Form,
  Input,
  Radio,
  Table,
  Image,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EyeOutlined,
  CheckCircleOutlined,
  FileImageOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  SendOutlined,
  EditOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import {
  getRefundRequestsAll,
  processRefundClass,
  requestBankUpdate,
} from "../../services/refund";
import { notifyError, notifySuccess } from "@/utils/toastConfig";

const { Title, Text } = Typography;
const { Option } = Select;

// RefundRequestType enum
// 0 = ClassCancelled_InsufficientStudents (Admin CANNOT reject)
// 1 = ClassCancelled_TeacherUnavailable (Admin CANNOT reject)
// 2 = StudentPersonalReason (Admin CAN reject)
// 3 = ClassQualityIssue (Admin CAN reject)
// 4 = TechnicalIssue (Admin CAN reject)
// 5 = Other (Admin CAN reject)
// 6 = DisputeResolved

const requestTypeMap: Record<
  number,
  { label: string; canReject: boolean; color: string; bgColor: string }
> = {
  0: {
    label: "Hủy do thiếu học viên",
    canReject: false,
    color: "#3b82f6",
    bgColor: "#eff6ff",
  },
  1: {
    label: "Giáo viên hủy lớp",
    canReject: false,
    color: "#8b5cf6",
    bgColor: "#f5f3ff",
  },
  2: {
    label: "Lý do cá nhân",
    canReject: true,
    color: "#f59e0b",
    bgColor: "#fffbeb",
  },
  3: {
    label: "Vấn đề chất lượng",
    canReject: true,
    color: "#ef4444",
    bgColor: "#fef2f2",
  },
  4: {
    label: "Lỗi kỹ thuật",
    canReject: true,
    color: "#6366f1",
    bgColor: "#eef2ff",
  },
  5: { label: "Khác", canReject: true, color: "#6b7280", bgColor: "#f9fafb" },
  6: {
    label: "Giải quyết tranh chấp",
    canReject: false,
    color: "#10b981",
    bgColor: "#ecfdf5",
  },
};

interface RefundItem {
  refundRequestID: string;
  refundCategory: "Class" | "Course";
  studentID: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  classID?: string;
  className?: string;
  purchaseId?: string;
  courseName?: string;
  requestType: number;
  requestTypeText: string;
  reason: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolderName: string;
  status: number;
  statusText: string;
  adminNote: string | null;
  refundAmount: number;
  originalAmount: number;
  requestedAt: string;
  processedAt: string | null;
  proofImageUrl: string | null;
  processedByAdminName: string | null;
  displayTitle: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  Draft: {
    label: "Nháp",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  Pending: {
    label: "Chờ xử lý",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  UnderReview: {
    label: "Chờ xử lý",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Approved: {
    label: "Đã duyệt",
    className: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  Rejected: {
    label: "Từ chối",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  Completed: {
    label: "Hoàn thành",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Cancelled: {
    label: "Đã hủy",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

const StatCard = ({ title, value, icon, colorClass, bgClass }: any) => (
  <div
    className={`p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4 h-full transition-transform hover:-translate-y-1 duration-300`}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${bgClass} ${colorClass}`}
    >
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-800 leading-none">
        {value}
      </div>
      <div className="text-gray-400 text-[11px] font-semibold uppercase tracking-wide mt-1">
        {title}
      </div>
    </div>
  </div>
);

const parseAndFormatDate = (d: string): string => {
  const date = new Date(d);
  return date.toLocaleDateString();
};

const RefundAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [classStatusFilter, setClassStatusFilter] = useState<number | null>(
    null
  );
  const [courseStatusFilter, setCourseStatusFilter] = useState<number | null>(
    null
  );
  const [selectedRefund, setSelectedRefund] = useState<RefundItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Use new API endpoint
  const { data: refundResponse, refetch } = useQuery({
    queryKey: ["refunds-all"],
    queryFn: () => getRefundRequestsAll({}),
  });

  const allRefunds: RefundItem[] = refundResponse?.data || [];

  // Separate refunds by category
  const { classRefunds, courseRefunds } = useMemo(() => {
    const classItems: RefundItem[] = [];
    const courseItems: RefundItem[] = [];

    const matchesFilter = (itemStatus: number, filter: number | null) => {
      if (filter === null) return true;
      if (filter === 1) return itemStatus === 1 || itemStatus === 2; // Pending or UnderReview
      return itemStatus === filter;
    };

    allRefunds.forEach((item) => {
      // Ẩn các yêu cầu ở trạng thái Nháp (Draft) đối với Admin
      if (item.status === 0 || item.statusText === "Draft") return;

      if (item.refundCategory === "Class") {
        if (matchesFilter(item.status, classStatusFilter))
          classItems.push(item);
      } else {
        if (matchesFilter(item.status, courseStatusFilter))
          courseItems.push(item);
      }
    });

    return { classRefunds: classItems, courseRefunds: courseItems };
  }, [allRefunds, classStatusFilter, courseStatusFilter]);

  const processRefundMutation = useMutation({
    mutationFn: processRefundClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refunds-all"] });
      refetch();
      setIsModalVisible(false);
      notifySuccess("Đã xử lý thành công!");
    },
    onError: () => notifyError("Xử lý không thành công"),
  });

  const requestBankUpdateMutation = useMutation({
    mutationFn: ({
      refundRequestId,
      note,
    }: {
      refundRequestId: string;
      note: string;
    }) => requestBankUpdate(refundRequestId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refunds-all"] });
      refetch();
      setIsModalVisible(false);
      notifySuccess("Thông báo được gửi tới sinh viên");
    },
    onError: () => notifyError("Thất bại khi gửi thông báo"),
  });

  useEffect(() => {
    if (selectedRefund && isModalVisible) {
      form.resetFields();
      form.setFieldValue("Action", "Approve");
    }
  }, [selectedRefund, isModalVisible, form]);

  const pendingCount = allRefunds.filter(
    (r) => r.statusText === "Pending" || r.statusText === "UnderReview"
  ).length;
  const processingCount = allRefunds.filter(
    (r) => r.statusText === "Approved"
  ).length;
  const completedCount = allRefunds.filter((r) =>
    ["Rejected", "Completed", "Cancelled"].includes(r.statusText)
  ).length;

  const handleClearFilters = () => {
    setClassStatusFilter(null);
    setCourseStatusFilter(null);
  };

  const getColumns = (type: "class" | "course") => [
    {
      title: "Học viên",
      dataIndex: "studentName",
      render: (text: string, record: RefundItem) => (
        <div>
          <Text strong className="text-gray-700 text-sm block">
            {text}
          </Text>
          <span className="text-xs text-gray-400">{record.studentEmail}</span>
        </div>
      ),
    },
    {
      title: type === "class" ? "Lớp" : "Khóa học",
      dataIndex: "displayTitle",
      ellipsis: true,
      render: (t: string) => (
        <span className="text-xs text-gray-500">{t || "N/A"}</span>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "refundAmount",
      render: (val: number) => (
        <span className="font-semibold text-emerald-600">
          {val?.toLocaleString()} ₫
        </span>
      ),
    },
    {
      title: "Loại yêu cầu",
      dataIndex: "requestTypeText",
      ellipsis: true,
      width: 200,
      render: (_: string, record: RefundItem) => {
        const typeInfo = requestTypeMap[record.requestType];
        return (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{
              backgroundColor: typeInfo?.bgColor || "#f3f4f6",
              color: typeInfo?.color || "#6b7280",
              border: `1px solid ${typeInfo?.color}20`,
            }}
          >
            <span>{typeInfo?.label}</span>
            {!typeInfo?.canReject && (
              <span
                className="ml-1 w-1.5 h-1.5 rounded-full bg-green-500"
                title="Auto-approve"
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "statusText",
      width: 120,
      render: (s: string) => {
        const config = statusConfig[s] || {
          label: s,
          className: "bg-gray-100 text-gray-600 border-gray-200",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${config.className}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: "Ngày",
      dataIndex: "requestedAt",
      width: 100,
      render: (d: string) => (
        <span className="text-xs text-gray-400">{parseAndFormatDate(d)}</span>
      ),
    },
    {
      title: "",
      width: 50,
      render: (_: any, r: RefundItem) => (
        <Button
          size="small"
          type="text"
          icon={
            r.status === 1 || r.status === 2 ? (
              <EyeOutlined className="text-blue-500" />
            ) : (
              <EyeOutlined className="text-gray-400" />
            )
          }
          onClick={() => {
            setSelectedRefund(r);
            setIsModalVisible(true);
          }}
        />
      ),
    },
  ];

  const canProcess =
    selectedRefund?.status === 1 || selectedRefund?.status === 2;

  // Check if bank info is complete
  const hasBankInfo = selectedRefund
    ? selectedRefund.bankName &&
      selectedRefund.bankName.trim() !== "" &&
      selectedRefund.bankAccountNumber &&
      selectedRefund.bankAccountNumber.trim() !== "" &&
      selectedRefund.bankAccountHolderName &&
      selectedRefund.bankAccountHolderName.trim() !== ""
    : false;

  // Check if admin can reject based on requestType
  // requestType 0, 1: Class cancelled by system/teacher -> CANNOT reject
  // requestType 2, 3, 4, 5: Student requested -> CAN reject
  const canReject = selectedRefund
    ? requestTypeMap[selectedRefund.requestType]?.canReject
    : false;

  return (
    <div className="!space-y-5">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <StatCard
            title="Chờ xử lý"
            value={pendingCount}
            icon={<ClockCircleOutlined />}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Đã duyệt"
            value={processingCount}
            icon={<CheckCircleOutlined />}
            colorClass="text-cyan-600"
            bgClass="bg-cyan-50"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Đã hoàn tất"
            value={completedCount}
            icon={<FileImageOutlined />}
            colorClass="text-emerald-600"
            bgClass="bg-emerald-50"
          />
        </Col>
      </Row>

      {/* Global Filter Actions */}
      {(classStatusFilter !== null || courseStatusFilter !== null) && (
        <div className="flex justify-end">
          <Button
            icon={<FilterOutlined />}
            onClick={handleClearFilters}
            className="text-gray-500 hover:text-blue-600 hover:border-blue-600"
          >
            Xóa bộ lọc đang chọn
          </Button>
        </div>
      )}

      {/* Course Refund Requests */}
      {courseRefunds.length > 0 && (
        <Card
          bordered={false}
          className="rounded-2xl shadow-sm border border-gray-100"
          styles={{ body: { padding: "16px" } }}
        >
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-3">
              <Title level={5} className="!mb-0 !font-semibold text-gray-700">
                Yêu cầu hoàn tiền khóa học
              </Title>
              <Tag color="purple">{courseRefunds.length}</Tag>
            </div>
            <Select
              value={courseStatusFilter}
              onChange={setCourseStatusFilter}
              size="small"
              style={{ width: 140 }}
              placeholder="Tất cả trạng thái"
              allowClear
            >
              <Option value={1}>Chờ xử lý</Option>
              <Option value={3}>Đã duyệt</Option>
              <Option value={4}>Từ chối</Option>
              <Option value={5}>Hoàn thành</Option>
            </Select>
          </div>
          <Table
            dataSource={courseRefunds}
            columns={getColumns("course")}
            rowKey="refundRequestID"
            pagination={{ pageSize: 8, size: "small" }}
            size="small"
          />
        </Card>
      )}

      {/* Class Refund Requests */}
      <Card
        bordered={false}
        className="rounded-2xl shadow-sm border border-gray-100"
        styles={{ body: { padding: "16px" } }}
      >
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-3">
            <Title level={5} className="!mb-0 !font-semibold text-gray-700">
              Yêu cầu hoàn tiền lớp học
            </Title>
            <Tag color="blue">{classRefunds.length}</Tag>
          </div>
          <Select
            value={classStatusFilter}
            onChange={setClassStatusFilter}
            size="small"
            style={{ width: 140 }}
            placeholder="Tất cả trạng thái"
            allowClear
          >
            <Option value={1}>Chờ xử lý</Option>
            <Option value={3}>Đã duyệt</Option>
            <Option value={4}>Từ chối</Option>
            <Option value={5}>Hoàn thành</Option>
          </Select>
        </div>
        <Table
          dataSource={classRefunds}
          columns={getColumns("class")}
          rowKey="refundRequestID"
          pagination={{ pageSize: 8, size: "small" }}
          size="small"
        />
      </Card>

      <Modal
        title={canProcess ? "Xử lý hoàn tiền" : "Chi tiết hoàn tiền"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={520}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => {
            if (!selectedRefund) return;
            const payload = {
              RefundRequestId: selectedRefund.refundRequestID,
              Action: v.Action,
              AdminNote: v.AdminNote,
              ProofImage: v.ProofImage,
            };
            processRefundMutation.mutate(payload);
          }}
        >
          {selectedRefund && (
            <div className="mb-5 p-4 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-2 border border-gray-100">
              <div className="flex justify-between">
                <span>Học viên:</span>
                <div className="text-right">
                  <strong className="text-gray-800 block">
                    {selectedRefund.studentName}
                  </strong>
                  <span className="text-gray-400">
                    {selectedRefund.studentEmail}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Loại:</span>
                <Tag
                  color={
                    selectedRefund.refundCategory === "Class"
                      ? "blue"
                      : "purple"
                  }
                >
                  {selectedRefund.refundCategory}
                </Tag>
              </div>
              <div className="flex justify-between items-center">
                <span>Loại yêu cầu:</span>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={{
                    backgroundColor:
                      requestTypeMap[selectedRefund.requestType]?.bgColor ||
                      "#f3f4f6",
                    color:
                      requestTypeMap[selectedRefund.requestType]?.color ||
                      "#6b7280",
                    border: `1px solid ${
                      requestTypeMap[selectedRefund.requestType]?.color
                    }20`,
                  }}
                >
                  <span>
                    {requestTypeMap[selectedRefund.requestType]?.label}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>{selectedRefund.refundCategory}:</span>
                <strong className="text-gray-800">
                  {selectedRefund.displayTitle || "N/A"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <strong className="text-emerald-600">
                  {selectedRefund.refundAmount?.toLocaleString()} ₫
                </strong>
              </div>

              {/* Bank Info Section */}
              {hasBankInfo ? (
                <>
                  <div className="flex justify-between">
                    <span>Ngân hàng:</span>
                    <strong className="text-gray-800">
                      {selectedRefund.bankName}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Số tài khoản:</span>
                    <strong className="text-gray-800">
                      {selectedRefund.bankAccountNumber}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Chủ tài khoản:</span>
                    <strong className="text-gray-800">
                      {selectedRefund.bankAccountHolderName}
                    </strong>
                  </div>
                </>
              ) : null}

              <div className="pt-2 border-t border-gray-200">
                <span className="block mb-1">Lý do:</span>
                <p className="text-gray-800 italic">{selectedRefund.reason}</p>
              </div>

              {selectedRefund.proofImageUrl && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <span className="block mb-2 font-semibold flex items-center gap-1">
                    <FileImageOutlined /> Proof of Transfer:
                  </span>
                  <div className="rounded-lg overflow-hidden border border-gray-200 inline-block">
                    <Image
                      src={selectedRefund.proofImageUrl}
                      height={150}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {canProcess ? (
            <>
              {/* Warning if bank info is missing or incorrect */}
              {!hasBankInfo ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex flex-col items-center gap-2">
                      <WarningOutlined className="text-3xl text-amber-500" />
                      <div>
                        <div className="text-amber-800 font-semibold text-base">
                          Chờ thông tin ngân hàng
                        </div>
                        <div className="text-xs text-amber-600 mt-1">
                          Học viên chưa cung cấp thông tin tài khoản ngân hàng.
                          Vui lòng đợi sinh viên cập nhật thông tin trước khi xử
                          lý việc hoàn tiền.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Request bank update section */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <EditOutlined className="text-blue-500" />
                      <span className="font-medium text-gray-700 text-sm">
                        Yêu cầu cập nhật thông tin ngân hàng
                      </span>
                    </div>
                    <Form.Item name="bankUpdateNote" className="mb-3">
                      <Input.TextArea
                        rows={2}
                        placeholder="Enter note to student (e.g., Please provide correct bank account number...)"
                        className="text-sm"
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      loading={requestBankUpdateMutation.isPending}
                      onClick={() => {
                        const note =
                          form.getFieldValue("bankUpdateNote") ||
                          "Vui lòng điền thông tin tài khoản ngân hàng.";
                        if (selectedRefund) {
                          requestBankUpdateMutation.mutate({
                            refundRequestId: selectedRefund.refundRequestID,
                            note: note,
                          });
                        }
                      }}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      Gửi thông báo cho học viên
                    </Button>
                  </div>
                </div>
              ) : !canReject ? (
                /* System/Teacher cancelled - Only Approve (no reject option) */
                <>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircleOutlined className="text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-blue-700 font-medium text-xs">
                          Lớp học đã bị hủy
                        </p>
                        <p className="text-blue-600 text-[11px] mt-1">
                          Lớp học này đã bị hủy. Vui lòng xử lý việc hoàn tiền
                          cho học viên.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Request bank update if info is incorrect */}
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <EditOutlined className="text-orange-500" />
                      <span className="font-medium text-gray-700 text-xs">
                        Thông tin ngân hàng không chính xác?
                      </span>
                    </div>
                    <Form.Item name="bankUpdateNote" className="mb-2">
                      <Input.TextArea
                        rows={1}
                        placeholder="Note to student about incorrect bank info..."
                        className="text-xs"
                      />
                    </Form.Item>
                    <Button
                      size="small"
                      icon={<SendOutlined />}
                      loading={requestBankUpdateMutation.isPending}
                      onClick={() => {
                        const note =
                          form.getFieldValue("bankUpdateNote") ||
                          "Thông tin tài khoản ngân hàng của bạn có vẻ không chính xác. Vui lòng cập nhật lại.";
                        if (selectedRefund) {
                          requestBankUpdateMutation.mutate({
                            refundRequestId: selectedRefund.refundRequestID,
                            note: note,
                          });
                        }
                      }}
                      className="w-full text-xs"
                    >
                      Yêu cầu cập nhật thông tin ngân hàng
                    </Button>
                  </div>

                  <Form.Item name="Action" initialValue="Approve" hidden>
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="ProofImage"
                    label="Hình ảnh chứng minh(bắt buộc)"
                    valuePropName="file"
                    getValueFromEvent={(e) => e && e.file}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập hình ảnh chứng minh",
                      },
                    ]}
                  >
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
                      <input
                        type="file"
                        className="w-full text-xs"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          form.setFieldsValue({ ProofImage: file });
                        }}
                      />
                    </div>
                  </Form.Item>

                  <Form.Item name="AdminNote" label="Chú ý">
                    <Input.TextArea
                      rows={2}
                      placeholder="Transaction ID or notes..."
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={processRefundMutation.isPending}
                    size="large"
                    className="bg-green-600 hover:bg-green-700 shadow-md h-10 font-medium"
                  >
                    <CheckCircleOutlined className="mr-1" />
                    Phê duyệt & Hoàn tiền
                  </Button>
                </>
              ) : (
                /* Student requested - Can Approve or Reject */
                <>
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <WarningOutlined className="text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-orange-700 font-medium text-xs">
                          Yêu cầu hoàn tiền
                        </p>
                        <p className="text-orange-600 text-[11px] mt-1">
                          Học viên đã yêu cầu hoàn tiền. Vui lòng xem xét và xử
                          lý theo quy định.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Request bank update if info is incorrect */}
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <EditOutlined className="text-orange-500" />
                      <span className="font-medium text-gray-700 text-xs">
                        Thông tin ngân hàng không chính xác?
                      </span>
                    </div>
                    <Form.Item name="bankUpdateNote" className="mb-2">
                      <Input.TextArea
                        rows={1}
                        placeholder="Note to student about incorrect bank info..."
                        className="text-xs"
                      />
                    </Form.Item>
                    <Button
                      size="small"
                      icon={<SendOutlined />}
                      loading={requestBankUpdateMutation.isPending}
                      onClick={() => {
                        const note =
                          form.getFieldValue("bankUpdateNote") ||
                          "Thông tin tài khoản ngân hàng của bạn có vẻ không chính xác. Vui lòng cập nhật lại.";
                        if (selectedRefund) {
                          requestBankUpdateMutation.mutate({
                            refundRequestId: selectedRefund.refundRequestID,
                            note: note,
                          });
                        }
                      }}
                      className="w-full text-xs"
                    >
                      Yêu cầu cập nhật thông tin ngân hàng
                    </Button>
                  </div>

                  <Form.Item
                    name="Action"
                    label="Action"
                    className="mb-4"
                    initialValue="Approve"
                  >
                    <Radio.Group
                      buttonStyle="solid"
                      className="w-full flex text-center"
                    >
                      <Radio.Button value="Approve" className="flex-1">
                        Chấp thuận
                      </Radio.Button>
                      <Radio.Button value="Reject" className="flex-1">
                        Từ chối
                      </Radio.Button>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, current) =>
                      prev.Action !== current.Action
                    }
                  >
                    {({ getFieldValue }) =>
                      getFieldValue("Action") === "Approve" ? (
                        <Form.Item
                          name="ProofImage"
                          label="Hình ảnh chứng minh"
                          valuePropName="file"
                          getValueFromEvent={(e) => e && e.file}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập hình ảnh chứng minh",
                            },
                          ]}
                        >
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
                            <input
                              type="file"
                              className="w-full text-xs"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                form.setFieldsValue({ ProofImage: file });
                              }}
                            />
                          </div>
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>

                  <Form.Item name="AdminNote" label="Admin Note">
                    <Input.TextArea
                      rows={2}
                      placeholder="Transaction ID or rejection reason..."
                    />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, current) =>
                      prev.Action !== current.Action
                    }
                  >
                    {({ getFieldValue }) => (
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={processRefundMutation.isPending}
                        size="large"
                        danger={getFieldValue("Action") === "Reject"}
                        className={`shadow-md h-10 font-medium ${
                          getFieldValue("Action") === "Approve"
                            ? "bg-green-600 hover:bg-green-700"
                            : ""
                        }`}
                      >
                        {getFieldValue("Action") === "Approve" ? (
                          <>
                            <CheckCircleOutlined className="mr-1" />
                            Phê duyệt & Hoàn tiền
                          </>
                        ) : (
                          <>
                            <CloseCircleOutlined className="mr-1" />
                            Từ chối yêu cầu
                          </>
                        )}
                      </Button>
                    )}
                  </Form.Item>
                </>
              )}
            </>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col items-center gap-2">
                {selectedRefund?.status === 4 ||
                selectedRefund?.status === 6 ? (
                  <CloseCircleOutlined className="text-3xl text-red-500" />
                ) : (
                  <CheckCircleOutlined className="text-3xl text-green-500" />
                )}
                <div>
                  <div className="text-gray-800 font-semibold text-base">
                    Yêu cầu{" "}
                    {statusConfig[selectedRefund?.statusText || ""]?.label ||
                      selectedRefund?.statusText}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedRefund?.processedByAdminName && (
                      <span>
                        Được xử lý bởi: {selectedRefund.processedByAdminName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default RefundAdminPage;
