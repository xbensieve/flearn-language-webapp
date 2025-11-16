/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/PayoutPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, message, Form, InputNumber, Select } from 'antd';
import { PlusOutlined, WalletOutlined } from '@ant-design/icons';
import { createPayoutRequest, getBankAccounts } from '../../services/teacherApplication';
import type { BankAccountResponse } from '../../services/teacherApplication/types';
import BankAccountDrawer from './components/BankAccountDrawer';
import { notifyError, notifySuccess } from '../../utils/toastConfig';

const PayoutPage: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      const res = await getBankAccounts();
      setBankAccounts(res.data || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error('Lấy danh sách tài khoản thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePayout = async (values: any) => {
    try {
      await createPayoutRequest({
        amount: values.amount,
        bankAccountId: values.bankAccountId,
      });
      notifySuccess('Yêu cầu rút tiền đã được gửi!');
      form.resetFields();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      notifyError(error.response?.data?.message || 'Rút tiền thất bại');
    }
  };

  const columns = [
    {
      title: 'Ngân hàng',
      dataIndex: 'bankName',
      key: 'bankName',
      render: (text: string) => <span className='font-medium'>{text}</span>,
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'bankBranch',
      key: 'bankBranch',
    },
    {
      title: 'Số tài khoản',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
    },
    {
      title: 'Chủ tài khoản',
      dataIndex: 'accountHolderName',
      key: 'accountHolderName',
    },
    {
      title: 'Mặc định',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (isDefault: boolean) => (isDefault ? <Tag color='green'>Mặc định</Tag> : null),
    },
  ];

  return (
    <div className='p-6 max-w-5xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Yêu cầu rút tiền</h1>

      <Card className='mb-6 shadow-sm'>
        <Form form={form} layout='vertical' onFinish={handlePayout}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Form.Item
              name='amount'
              label='Số tiền rút (VNĐ)'
              rules={[
                { required: true, message: 'Vui lòng nhập số tiền' },
                { type: 'number', min: 100000, message: 'Tối thiểu 100,000 VNĐ' },
              ]}
            >
              <InputNumber
                className='w-full'
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                placeholder='10,000,000'
              />
            </Form.Item>

            <Form.Item
              name='bankAccountId'
              label='Tài khoản nhận tiền'
              rules={[{ required: true, message: 'Vui lòng chọn tài khoản' }]}
            >
              <Select placeholder='Chọn tài khoản ngân hàng'>
                {bankAccounts.map((acc) => (
                  <Select.Option key={acc.bankAccountId} value={acc.bankAccountId}>
                    {acc.bankName} - {acc.accountNumber} ({acc.accountHolderName})
                    {acc.isDefault && ' - Mặc định'}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className='flex justify-between items-center'>
            <Button
              type='link'
              icon={<PlusOutlined />}
              onClick={() => setDrawerOpen(true)}
              className='text-blue-600'
            >
              Thêm tài khoản mới
            </Button>

            <Button type='primary' size='large' htmlType='submit' icon={<WalletOutlined />}>
              Gửi yêu cầu rút tiền
            </Button>
          </div>
        </Form>
      </Card>

      <Card title='Danh sách tài khoản ngân hàng' className='shadow-sm'>
        <Table
          dataSource={bankAccounts}
          columns={columns}
          rowKey='bankAccountId'
          loading={loading}
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: 'Chưa có tài khoản ngân hàng' }}
        />
      </Card>

      <BankAccountDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={fetchBankAccounts}
      />
    </div>
  );
};

export default PayoutPage;
