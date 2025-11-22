/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Modal, Descriptions, message, Input, Space, Tag, Card, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import axios from '../../config/axios'; // Đảm bảo dùng api đã cấu hình

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const statusColors: Record<string, string> = {
  Completed: 'green',
  Pending: 'gold',
  Rejected: 'red',
};

const TeacherPayoutPage: React.FC = () => {
  const [payouts, setPayouts] = useState<any[]>([]); // State to store payouts
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Fetch data from the API on component mount
  useEffect(() => {
    const fetchPayoutRequests = async () => {
      try {
        const response = await axios.get('https://f-learn.app/api/payout-requests/mine?page=1&pageSize=10');
        setPayouts(response.data.data); // Set payouts data into state
      } catch (error) {
        message.error('Failed to load payout requests');
      }
    };

    fetchPayoutRequests();
  }, []);

  const openDetailModal = (record: any) => {
    setSelectedPayout(record);
    setDetailModalOpen(true);
  };

  const baseColumns = [
    {
      title: 'Bank Name',
      dataIndex: 'bankName',
      key: 'bankName',
      render: (_: any, record: any) => (
        <Space>
          <div>
            <Text strong style={{ color: '#333' }}>{record.bankName}</Text>
            <div style={{ fontSize: 12, color: '#888' }}>
              {record.teacherEmail}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_: any, record: any) => (
        <Space>
          <div>
            <Text strong style={{ color: '#333' }}>{record.status}</Text>
            <div style={{ fontSize: 12, color: '#888' }}>
              {record.teacherEmail}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Bank Name',
      dataIndex: 'bankName',
      key: 'bankName',
      render: (_: any, record: any) => (
        <Space>
          <div>
            <Text strong style={{ color: '#333' }}>{record.bankName}</Text>
            <div style={{ fontSize: 12, color: '#888' }}>
              {record.teacherEmail}
            </div>
          </div>
        </Space>
      ),
      
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text >
          {amount.toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
     {
      title: 'Payout Times',
      key: 'payoutTimes',
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontSize: 12, color: '#888' }}>
            <Text type="secondary">Approved At:</Text> 
            {record.approvedAt ? new Date(record.approvedAt).toLocaleString() : 'N/A'}
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            <Text type="secondary">Processed At:</Text>
            {record.processedAt ? new Date(record.processedAt).toLocaleString() : 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'accountNumber',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      render: (accountNumber: number) => (
        <Text >
          {accountNumber.toLocaleString()} 
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status] || 'default'}>{status}</Tag>,
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (_: any, record: any) => (
        <Space>
          <div>
            <Text strong style={{ color: '#333' }}>{record.note}</Text>
            <div style={{ fontSize: 12, color: '#888' }}>
              {record.teacherEmail}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => openDetailModal(record)}
            style={{
              borderRadius: '4px', 
              border: '1px solid #4CAF50', 
              backgroundColor: '#4CAF50', 
              color: 'white',
              padding: '6px 12px',
            }}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ margin: '20px' }}>
      <Card 
        title={<Title level={3} style={{ color: '#333', fontWeight: 'bold' }}>Teacher Payout Requests</Title>} 
        bordered={false} 
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}
      >
        <Space style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Search 
            placeholder="Search by teacher name or email" 
            // onChange={(e) => setSearchText(e.target.value)} 
            style={{ width: 300, borderRadius: '8px', padding: '8px' }} 
          />
        </Space>
        <Table
          columns={baseColumns}
          dataSource={payouts}
          rowKey="payoutRequestId"
          pagination={{ pageSize: 10 }}
          style={{ backgroundColor: '#fff', borderRadius: '8px' }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal 
        visible={detailModalOpen} 
        title="Payout Details" 
        onCancel={() => setDetailModalOpen(false)} 
        footer={null} 
        width={600}
        bodyStyle={{ padding: '20px' }}
        style={{ borderRadius: '8px' }}
      >
        <Descriptions column={1} style={{ padding: '10px' }}>
          <Descriptions.Item label="Payout ID" labelStyle={{ fontWeight: 'bold' }}>
            {selectedPayout?.payoutRequestId}
          </Descriptions.Item>
          <Descriptions.Item label="Amount" labelStyle={{ fontWeight: 'bold' }}>
            <Text strong style={{ color: '#16a34a' }}>
              {selectedPayout?.amount?.toLocaleString('vi-VN')} ₫
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status" labelStyle={{ fontWeight: 'bold' }}>
            <Tag color={statusColors[selectedPayout?.status] || 'default'}>
              {selectedPayout?.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Requested At" labelStyle={{ fontWeight: 'bold' }}>
            {new Date(selectedPayout?.requestedAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Approved At" labelStyle={{ fontWeight: 'bold' }}>
            {selectedPayout?.approvedAt ? new Date(selectedPayout?.approvedAt).toLocaleString() : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Processed At" labelStyle={{ fontWeight: 'bold' }}>
            {selectedPayout?.processedAt ? new Date(selectedPayout?.processedAt).toLocaleString() : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Admin Note" labelStyle={{ fontWeight: 'bold' }}>
            {selectedPayout?.note || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Bank Name" labelStyle={{ fontWeight: 'bold' }}>
            {selectedPayout?.bankName}
          </Descriptions.Item>
          <Descriptions.Item label="Account Number" labelStyle={{ fontWeight: 'bold' }}>
            {selectedPayout?.accountNumber}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
};

export default TeacherPayoutPage;
