/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
    } catch (error: any) {
      message.error('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handlePayout = async (values: any) => {
    try {
      await createPayoutRequest({
        amount: values.amount,
        bankAccountId: values.bankAccountId,
      });
      notifySuccess('Payout request submitted successfully!');
      form.resetFields();
    } catch (error: any) {
      notifyError(error.response?.data?.message || 'Payout request failed');
    }
  };

  const columns = [
    {
      title: 'Bank',
      dataIndex: 'bankName',
      key: 'bankName',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Branch',
      dataIndex: 'bankBranch',
      key: 'bankBranch',
    },
    {
      title: 'Account Number',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
    },
    {
      title: 'Account Holder',
      dataIndex: 'accountHolderName',
      key: 'accountHolderName',
    },
    {
      title: 'Default',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (isDefault: boolean) => (isDefault ? <Tag color="green">Default</Tag> : null),
    },
  ];

  return (
    <div className="!space-y-6 p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Request Payout</h1>

      <Card className="mb-6 shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePayout}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="amount"
              label="Amount to Withdraw (VND)"
              rules={[
                { required: true, message: 'Please enter the amount' },
                { type: 'number', min: 100000, message: 'Minimum withdrawal is 100,000 VND' },
              ]}>
              <InputNumber
                className="w-full"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                placeholder="10,000,000"
              />
            </Form.Item>

            <Form.Item
              name="bankAccountId"
              label="Receiving Bank Account"
              rules={[{ required: true, message: 'Please select a bank account' }]}>
              <Select placeholder="Select a bank account">
                {bankAccounts.map((acc) => (
                  <Select.Option
                    key={acc.bankAccountId}
                    value={acc.bankAccountId}>
                    {acc.bankName} - {acc.accountNumber} ({acc.accountHolderName})
                    {acc.isDefault && ' - Default'}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={() => setDrawerOpen(true)}
              className="text-blue-600">
              Add New Bank Account
            </Button>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              icon={<WalletOutlined />}>
              Submit Payout Request
            </Button>
          </div>
        </Form>
      </Card>

      <Card
        title="Bank Accounts"
        className="shadow-sm">
        <Table
          dataSource={bankAccounts}
          columns={columns}
          rowKey="bankAccountId"
          loading={loading}
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: 'No bank accounts added yet' }}
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
