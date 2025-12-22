/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Table,
  Drawer,
  Typography,
  Descriptions,
  Button,
  Tag,
  Space,
  Divider,
  Form,
  Input,
  Switch,
  Tooltip,
} from "antd";
import {
  BarChartOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  CreateConversationPromptPayload,
  IConversationPrompt,
  UpdateConversationPromptPayload,
} from "../../services/conversation/type";
import {
  createConversationPrompt,
  getConversationPrompts,
  updateConversationPrompt,
} from "../../services/conversation";
import { notifyError, notifySuccess } from "../../utils/toastConfig";
import type { ColumnsType } from "antd/es/table";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const ConversationPromptPage: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const columns: ColumnsType<IConversationPrompt> = [
    {
      title: "Tên",
      dataIndex: "promptName",
      key: "promptName",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Space>
          <Tag color={record.isActive ? "green" : "default"}>
            {record.isActive ? "Hoạt động" : "Không hoạt động"}
          </Tag>
          {record.isDefault && <Tag color="blue">Mặc định</Tag>}
        </Space>
      ),
    },
    {
      title: "Số lần sử dụng",
      dataIndex: "usageCount",
      key: "usageCount",
      align: "center",
      render: (count: number) => (
        <Space>
          <BarChartOutlined />
          {count ?? 0}
        </Space>
      ),
    },
    {
      title: "Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record: IConversationPrompt) => (
        <>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedPrompt(record);
                setDrawerVisible(true);
              }}
            >
              Xem
            </Button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                editForm.setFieldsValue(record);
                setSelectedPrompt(record);
                setEditVisible(true);
              }}
            >
              Sửa
            </Button>
          </Tooltip>
        </>
      ),
    },
  ];

  const { data: conversationPrompts } = useQuery({
    queryKey: ["conversationPrompts"],
    queryFn: () => getConversationPrompts(),
    select: (data) => data.data,
  });

  // ✅ Setup mutation for creating new prompt
  const { mutate: createConversation, isPending } = useMutation({
    mutationFn: (payload: CreateConversationPromptPayload) =>
      createConversationPrompt(payload),
    onSuccess: () => {
      notifySuccess("Đã tạo mới!");
      setCreateVisible(false);
      form.resetFields();
    },
    onError: (err: any) => {
      notifyError(err?.response?.data?.message || "Thất bại khi tạo");
    },
  });

  console.log(selectedPrompt);
  const { mutate: editConversation, isPending: updating } = useMutation({
    mutationFn: (payload: UpdateConversationPromptPayload) =>
      updateConversationPrompt({ id: selectedPrompt.globalPromptID, payload }),
    onSuccess: () => {
      notifySuccess("Cập nhật thành công!");
      setEditVisible(false);
      editForm.resetFields();
    },
    onError: (err: any) =>
      notifyError(err?.response?.data?.message || "Thất bại khi cập nhật"),
  });

  const handleCreate = (values: any) => {
    const payload: CreateConversationPromptPayload = {
      ...values,
      isActive: values.isActive || false,
      isDefault: values.isDefault || false,
    };

    createConversation(payload);
  };

  const handleEdit = (values: any) => {
    if (!selectedPrompt) return;
    editConversation({ ...selectedPrompt, ...values });
  };

  return (
    <div>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Gợi ý hội thoại
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateVisible(true)}
        >
          Tạo mới
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={conversationPrompts}
        rowKey="id"
        pagination={false}
      />

      <Drawer
        width={720}
        title={selectedPrompt?.promptName}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedPrompt && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Mô tả">
                {selectedPrompt.description}
              </Descriptions.Item>
              <Descriptions.Item label="Hoạt động">
                {selectedPrompt.isActive ? "Có" : "Không"}
              </Descriptions.Item>
              <Descriptions.Item label="Mặc định">
                {selectedPrompt.isDefault ? "Có" : "Không"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Mẫu lời nhắc chính</Title>
            <Paragraph>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {selectedPrompt.masterPromptTemplate}
              </pre>
            </Paragraph>

            <Title level={5}>Nguyên tắc kịch bản</Title>
            <Paragraph>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {selectedPrompt.scenarioGuidelines}
              </pre>
            </Paragraph>

            <Title level={5}>Hướng dẫn nhập vai</Title>
            <Paragraph>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {selectedPrompt.roleplayInstructions}
              </pre>
            </Paragraph>

            <Title level={5}>Tiêu chí đánh giá</Title>
            <Paragraph>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {selectedPrompt.evaluationCriteria}
              </pre>
            </Paragraph>
          </>
        )}
      </Drawer>

      <Drawer
        width={640}
        title="Tạo mới"
        open={createVisible}
        onClose={() => setCreateVisible(false)}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleCreate}>
          <Form.Item
            label="Tên"
            name="promptName"
            rules={[{ required: true, message: "Vui lòng điền tên" }]}
          >
            <Input placeholder="Nhập tên" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <TextArea rows={2} placeholder="Nhập mô tả ngắn" />
          </Form.Item>

          <Form.Item label="Mẫu lời nhắc chính" name="masterPromptTemplate">
            <TextArea rows={4} placeholder="Nhập mẫu lời nhắc chính" />
          </Form.Item>

          <Form.Item label="Nguyên tắc kịch bản" name="scenarioGuidelines">
            <TextArea rows={4} placeholder="Nhập nguyên tắc kịch bản" />
          </Form.Item>

          <Form.Item
            label="Hướng dẫn nhập vai"
            name="roleplayInstructions"
            rules={[
              { required: true, message: "Vui lòng nhập hướng dẫn nhập vai" },
              {
                max: 1000,
                message: "Hướng dẫn nhập vai không được vượt quá 1000 ký tự",
              },
            ]}
          >
            <TextArea rows={4} placeholder="Nhập hướng dẫn nhập vai" />
          </Form.Item>

          <Form.Item label="Tiêu chí đánh giá" name="evaluationCriteria">
            <TextArea rows={3} placeholder="Nhập tiêu chí đánh giá" />
          </Form.Item>

          {/* Switches */}
          <Form.Item
            label="Trạng thái hoạt động"
            name="isActive"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item
            label="Lời nhắc mặc định"
            name="isDefault"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch checkedChildren="Default" unCheckedChildren="Not Default" />
          </Form.Item>

          <Space style={{ marginTop: 16 }}>
            <Button onClick={() => setCreateVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              Lưu
            </Button>
          </Space>
        </Form>
      </Drawer>

      {/* === EDIT DRAWER === */}
      <Drawer
        width={640}
        title={`Edit Prompt: ${selectedPrompt?.promptName}`}
        open={editVisible}
        onClose={() => setEditVisible(false)}
        destroyOnClose
      >
        <Form layout="vertical" form={editForm} onFinish={handleEdit}>
          <Form.Item label="Tên" name="promptName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Mẫu lời nhắc chính" name="masterPromptTemplate">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Nguyên tắc kịch bản" name="scenarioGuidelines">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            label="Hướng dẫn nhập vai"
            name="roleplayInstructions"
            rules={[
              { required: true, message: "Vui lòng nhập hướng dẫn nhập vai" },
              {
                max: 1000,
                message: "Hướng dẫn nhập vai không được vượt quá 1000 ký tự",
              },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Tiêu chí đánh giá" name="evaluationCriteria">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Trạng thái hoạt động"
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
          <Form.Item
            label="Lời nhắc mặc định"
            name="isDefault"
            valuePropName="checked"
          >
            <Switch checkedChildren="Default" unCheckedChildren="Not Default" />
          </Form.Item>

          <Space style={{ marginTop: 16 }}>
            <Button onClick={() => setEditVisible(false)}>Thoát</Button>
            <Button type="primary" htmlType="submit" loading={updating}>
              Cập nhật
            </Button>
          </Space>
        </Form>
      </Drawer>
    </div>
  );
};

export default ConversationPromptPage;
