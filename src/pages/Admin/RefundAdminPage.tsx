import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Tag, Button, Select, Modal, Form, Input, Radio, message, Table, Image } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EyeOutlined, CheckCircleOutlined, SyncOutlined, FileImageOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { processRefund } from '../../services/refund';
import api from '../../config/axios';
import type { RefundRequest } from '../../services/refund/type';

const { Title, Text } = Typography;
const { Option } = Select;

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: 'Pending', color: 'blue' },
  1: { label: 'Under Review', color: 'orange' },
  2: { label: 'Approved', color: 'green' },
  3: { label: 'Rejected', color: 'red' },
  4: { label: 'Completed', color: 'green' },
  5: { label: 'Cancelled', color: 'default' },
};

const StatCard = ({ title, value, icon, colorClass, bgClass }: any) => (
  <div className={`p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4 h-full transition-transform hover:-translate-y-1 duration-300`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${bgClass} ${colorClass}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-800 leading-none">{value}</div>
      <div className="text-gray-400 text-[11px] font-semibold uppercase tracking-wide mt-1">{title}</div>
    </div>
  </div>
);

const RefundAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { data: refunds = [] } = useQuery<RefundRequest[]>({
    queryKey: ['refunds', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== '' ? { status: Number(statusFilter) } : {};
      const res = await api.get('/Refund/admin/list', { params });
      return res.data.data || [];
    },
  });

  const processMutation = useMutation({
    mutationFn: processRefund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      setIsModalVisible(false);
      message.success('Processed successfully');
    },
    onError: () => message.error('Failed to process'),
  });

  useEffect(() => {
    if (selectedRefund && isModalVisible) {
      form.resetFields();
      form.setFieldValue('Action', 'Approve');
    }
  }, [selectedRefund, isModalVisible, form]);

  const pendingCount = refunds.filter(r => r.status === 0).length;
  const processingCount = refunds.filter(r => r.status === 1).length;
  const completedCount = refunds.filter(r => r.status === 2 || r.status === 4).length;

  const columns = [
    {
      title: 'Student',
      dataIndex: 'studentName',
      render: (text: string) => <Text strong className="text-gray-700 text-sm">{text}</Text>
    },
    {
      title: 'Class',
      dataIndex: 'className',
      ellipsis: true,
      render: (t: string) => <span className="text-xs text-gray-500">{t}</span>
    },
    {
      title: 'Amount',
      dataIndex: 'refundAmount',
      render: (val: number) => <span className="font-semibold text-emerald-600">{val?.toLocaleString()} ₫</span>
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      ellipsis: true,
      render: (t: string) => <span className="text-sm text-gray-600">{t}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (s: number) => {
        const info = statusMap[s] || { label: 'Unknown', color: 'default' };
        return <Tag color={info.color} className="text-[10px] px-2 border-0 font-medium uppercase">{info.label}</Tag>;
      }
    },
    {
      title: 'Date',
      dataIndex: 'requestedAt',
      width: 110,
      render: (d: string) => <span className="text-xs text-gray-400">{new Date(d).toLocaleDateString()}</span>
    },
    {
      title: '',
      width: 60,
      render: (_: any, r: RefundRequest) => (
        <Button 
          size="small" 
          type="text" 
       
          icon={ (r.status === 0 || r.status === 1) ? <EyeOutlined className="text-blue-500"/> : <EyeOutlined className="text-gray-400"/> } 
          onClick={() => { setSelectedRefund(r); setIsModalVisible(true); }} 
        />
      )
    }
  ];


  const canProcess = selectedRefund?.status === 0 || selectedRefund?.status === 1;

  return (
    <div className="space-y-5">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}><StatCard title="New Requests" value={pendingCount} icon={<ClockCircleOutlined/>} colorClass="text-blue-600" bgClass="bg-blue-50" /></Col>
        <Col xs={24} sm={8}><StatCard title="Processing" value={processingCount} icon={<SyncOutlined spin={processingCount > 0} />} colorClass="text-orange-500" bgClass="bg-orange-50" /></Col>
        <Col xs={24} sm={8}><StatCard title="Completed" value={completedCount} icon={<CheckCircleOutlined />} colorClass="text-green-600" bgClass="bg-green-50" /></Col>
      </Row>

      <Card bordered={false} className="rounded-2xl shadow-sm border border-gray-100" bodyStyle={{ padding: '16px' }}>
        <div className="flex justify-between items-center mb-4 px-2">
          <Title level={5} className="!mb-0 !font-semibold text-gray-700">Refund Requests</Title>
          <Select value={statusFilter} onChange={setStatusFilter} size="middle" style={{ width: 160 }} placeholder="Filter Status" allowClear>
            <Option value="">All Status</Option>
            <Option value="0">Pending</Option>
            <Option value="2">Approved</Option>
            <Option value="3">Rejected</Option>
          </Select>
        </div>
        <Table dataSource={refunds} columns={columns} rowKey="refundRequestID" pagination={{ pageSize: 8, size: 'small' }} size="small" />
      </Card>

      <Modal 
        title={canProcess ? "Process Refund" : "Refund Details"} 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        footer={null} 
        width={480}
        centered
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={(v) => processMutation.mutate({ RefundRequestId: selectedRefund!.refundRequestID, ...v })}
        >
          {/* Phần hiển thị thông tin chung (Luôn hiện) */}
          {selectedRefund && (
            <div className="mb-5 p-4 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-2 border border-gray-100">
              <div className="flex justify-between">
                <span>Student:</span>
                <strong className="text-gray-800">{selectedRefund.studentName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <strong className="text-emerald-600">{selectedRefund.refundAmount?.toLocaleString()} ₫</strong>
              </div>
              <div className="flex justify-between">
                <span>Bank:</span>
                <strong className="text-gray-800">{selectedRefund.bankName} - {selectedRefund.bankAccountNumber}</strong>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span className="block mb-1">Reason:</span>
                <p className="text-gray-800 italic">{selectedRefund.reason}</p>
              </div>
          
              {selectedRefund.proofImageUrl && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <span className="block mb-2 font-semibold flex items-center gap-1"><FileImageOutlined /> Proof of Transfer:</span>
                  <div className="rounded-lg overflow-hidden border border-gray-200 inline-block">
                    <Image src={selectedRefund.proofImageUrl} height={150} style={{ objectFit: 'contain' }} />
                  </div>
                </div>
              )}
            </div>
          )}

    
          {canProcess ? (
            <>
              <Form.Item name="Action" label="Action" className="mb-4">
                <Radio.Group buttonStyle="solid" className="w-full flex text-center">
                  <Radio.Button value="Approve" className="flex-1">Approve</Radio.Button>
                  <Radio.Button value="Reject" className="flex-1">Reject</Radio.Button>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item 
                noStyle 
                shouldUpdate={(prev, current) => prev.Action !== current.Action}
              >
                {({ getFieldValue }) => 
                  getFieldValue('Action') === 'Approve' ? (
                    <Form.Item 
                      name="ProofImage" 
                      label="Proof Image (Required)" 
                      valuePropName="file"
                      getValueFromEvent={(e) => e && e.file}
                      rules={[{ required: true, message: 'Please upload proof image' }]}
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
                        <input type="file" className="w-full text-xs" accept="image/*" onChange={(e) => {
                           const file = e.target.files?.[0];
                           form.setFieldsValue({ ProofImage: file });
                        }}/>
                      </div>
                    </Form.Item>
                  ) : null
                }
              </Form.Item>

              <Form.Item name="AdminNote" label="Admin Note">
                <Input.TextArea rows={2} placeholder="Transaction ID or notes..." />
              </Form.Item>
              
              <Button type="primary" htmlType="submit" block loading={processMutation.isPending} size="large" className="bg-blue-600 shadow-md h-10 font-medium">
                Confirm Action
              </Button>
            </>
          ) : (
          
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col items-center gap-2">
                {selectedRefund?.status === 3 ? (
                   <CloseCircleOutlined className="text-3xl text-red-500" />
                ) : (
                   <CheckCircleOutlined className="text-3xl text-green-500" />
                )}
                <div>
                  <div className="text-gray-800 font-semibold text-base">Request {statusMap[selectedRefund?.status || 0].label}</div>
                  <div className="text-xs text-gray-500 mt-1">This request has been processed and is closed.</div>
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