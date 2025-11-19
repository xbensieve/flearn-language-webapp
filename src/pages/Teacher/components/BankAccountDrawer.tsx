// src/components/BankAccountDrawer.tsx
import React from 'react';
import { Drawer, Form, Input, Button, message } from 'antd';
import type { BankAccountRequest } from '../../../services/teacherApplication/types';
import { createBankAccount } from '../../../services/teacherApplication';

interface BankAccountDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BankAccountDrawer: React.FC<BankAccountDrawerProps> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: BankAccountRequest) => {
    try {
      await createBankAccount(values);
      message.success('Thêm tài khoản ngân hàng thành công!');
      form.resetFields();
      onSuccess();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi thêm tài khoản');
    }
  };

  return (
    <Drawer
      title='Thêm tài khoản ngân hàng'
      width={500}
      open={open}
      onClose={onClose}
      footer={
        <div className='flex justify-end gap-2'>
          <Button onClick={onClose}>Hủy</Button>
          <Button type='primary' onClick={() => form.submit()}>
            Lưu
          </Button>
        </div>
      }
    >
      <Form form={form} layout='vertical' onFinish={handleSubmit}>
        <Form.Item
          name='bankName'
          label='Tên ngân hàng'
          rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng' }]}
        >
          <Input placeholder='VD: Vietcombank' />
        </Form.Item>

        <Form.Item
          name='bankBranch'
          label='Chi nhánh'
          rules={[{ required: true, message: 'Vui lòng nhập chi nhánh' }]}
        >
          <Input placeholder='VD: Chi nhánh Hà Nội' />
        </Form.Item>

        <Form.Item
          name='accountNumber'
          label='Số tài khoản'
          rules={[{ required: true, message: 'Vui lòng nhập số tài khoản' }]}
        >
          <Input placeholder='123456789' />
        </Form.Item>

        <Form.Item
          name='accountHolderName'
          label='Chủ tài khoản'
          rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản' }]}
        >
          <Input placeholder='Nguyễn Văn A' />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default BankAccountDrawer;
