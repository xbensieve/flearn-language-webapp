// src/pages/program/ProgramForm.tsx
import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import type { Program } from '../../../services/program/type';

interface ProgramFormProps {
  initialValues?: Program;
  languages: { id: string; name: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (values: any) => void;
  onCancel?: () => void;
}

const ProgramForm: React.FC<ProgramFormProps> = ({
  initialValues,
  languages,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      // Map server shape to form fields if needed
      form.setFieldsValue({
        ...initialValues,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (err) {
      // validation errors handled by AntDc
      console.log(err);
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={initialValues || { status: true }}>
      <Form.Item
        name="languageId"
        label="Language"
        rules={[{ required: true }]}>
        <Select options={languages.map((l) => ({ label: l.name, value: l.id }))} />
      </Form.Item>

      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Please enter program name' }]}>
        <Input />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description">
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            onClick={submit}>
            {initialValues ? 'Update' : 'Create'}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default ProgramForm;
