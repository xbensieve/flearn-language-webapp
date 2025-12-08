// components/LevelForm.tsx
import React from 'react';
import { Form, Input, InputNumber, Switch, Button } from 'antd';
import type { CreateLevelPayload } from '../../../services/level/type';

interface LevelFormProps {
  initialValues?: Partial<CreateLevelPayload> & { status?: boolean };
  onSubmit: (values: CreateLevelPayload | Partial<CreateLevelPayload>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const LevelForm: React.FC<LevelFormProps> = ({ initialValues, onSubmit, onCancel, isEdit }) => {
  const [form] = Form.useForm();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleFinish}
    >
      <Form.Item
        label="Tên"
        name="name"
        rules={[{ required: true, message: "Tên là bắt buộc" }]}
      >
        <Input placeholder="Enter level name (e.g., A1, B2, C1)" />
      </Form.Item>

      <Form.Item
        label="Mô tả"
        name="description"
        rules={[{ required: true, message: "Mô tả là bắt buộc" }]}
      >
        <Input.TextArea rows={3} placeholder="Nhập mô tả trình độ" />
      </Form.Item>

      <Form.Item
        label="Thứ tự"
        name="orderIndex"
        rules={[{ required: true, message: "Thứ tự là bắt buộc" }]}
      >
        <InputNumber min={1} style={{ width: "100%" }} max={100} />
      </Form.Item>

      {isEdit && (
        <Form.Item label="Trạng thái" name="status" valuePropName="checked">
          <Switch />
        </Form.Item>
      )}

      <Form.Item>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button onClick={onCancel}>Thoát</Button>
          <Button type="primary" htmlType="submit">
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default LevelForm;
