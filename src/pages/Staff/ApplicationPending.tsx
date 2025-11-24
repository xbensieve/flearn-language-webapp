/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Table,
  Button,
  message,
  Space,
  Tag,
  Popconfirm,
  Modal,
  Input,
  Select,
  Descriptions,
  Tabs,
  Row,
  Col,
  Card,
  Avatar as AntdAvatar,
  Typography,
  Badge,
} from 'antd';
import {
  UserOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ProfileOutlined,
  FileDoneOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  IdcardOutlined,
  BookOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { ApplicationData } from '../../services/teacherApplication/types';
import {
  getPendingApplications,
  reviewApproveApplication,
  reviewRejectApplication,
} from '../../services/staff';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const { Option } = Select;
const { TabPane } = Tabs;

const statusMap: Record<string, { text: string; color: string }> = {
  Pending: { text: 'Pending', color: 'blue' },
  Approved: { text: 'Approved', color: 'green' },
  Rejected: { text: 'Rejected', color: 'red' },
};

const ApplicationsManagement: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('Pending');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null);

  // Fetch applications with filter
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['applications', filterStatus],
    queryFn: () => getPendingApplications({ status: filterStatus }),
    retry: 1,
  });

  // --- Approve mutation ---
  const approveMutation = useMutation({
    mutationFn: (payload: { applicationId: string }) => reviewApproveApplication(payload),
    onSuccess: () => {
      notifySuccess('Application approved successfully!');
      refetch();
      setDetailModalOpen(false);
    },
    onError: (err: any) =>
      notifyError(err?.response?.data?.message || 'Failed to approve application'),
  });

  // --- Reject mutation ---
  const rejectMutation = useMutation({
    mutationFn: (payload: { applicationId: string; reason?: string }) =>
      reviewRejectApplication(payload),
    onSuccess: () => {
      notifySuccess('Application rejected successfully!');
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedRejectId(null);
      refetch();
    },
    onError: (err: any) =>
      notifyError(err?.response?.data?.message || 'Failed to reject application'),
  });

  // --- Handlers ---
  const handleApprove = (applicationId: string) => {
    approveMutation.mutate({ applicationId });
  };

  const openRejectModal = (applicationId: string) => {
    setSelectedRejectId(applicationId);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return message.warning('Please enter a rejection reason');
    if (!selectedRejectId) return;
    rejectMutation.mutate({
      applicationId: selectedRejectId,
      reason: rejectReason,
    });
  };

  const openDetailModal = (application: ApplicationData) => {
    setSelectedApplication(application);
    setDetailModalOpen(true);
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    refetch();
  };

  // const getStatusCount = (status: string) => {
  //   // For demo, using current data; in real, fetch total counts
  //   return status === filterStatus ? data?.data?.length || 0 : 0;
  // };

  const columns = [
    {
      title: 'Applicant',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          {text || 'N/A'}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => (
        <Space>
          <MailOutlined style={{ color: '#1890ff' }} />
          {text}
        </Space>
      ),
    },
    {
      title: 'Language',
      key: 'language',
      render: (_: any, record: ApplicationData) => (
        <Space>
          <GlobalOutlined style={{ color: '#1890ff' }} />
          {record.language ?? 'N/A'}
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: ApplicationData) => {
        const map = statusMap[record.status] || {
          text: 'Unknown',
          color: 'default',
        };
        return <Tag color={map.color}>{map.text}</Tag>;
      },
    },
    {
      title: 'Applied At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          {date ? new Date(date).toLocaleString() : 'Unknown'}
        </Space>
      ),
    },
    {
      title: 'Certificates',
      key: 'certificates',
      render: (_: any, record: ApplicationData) =>
        record.certificates?.length ? (
          <Space>
            <FilePdfOutlined style={{ color: '#1890ff' }} />
            <span>{record.certificates.length} files</span>
          </Space>
        ) : (
          <Space>
            <FilePdfOutlined style={{ color: '#bfbfbf' }} />
            <span>No certificates</span>
          </Space>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ApplicationData) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => openDetailModal(record)}
            size="small">
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Sidebar />
      <div className="flex  justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <Space>
          <UserOutlined className="text-2xl text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Teacher Applications</h1>
          <Badge
            count={0}
            style={{ backgroundColor: '#52c41a' }}
            offset={[-10, 10]}
          />
        </Space>

        <Space>
          <Select
            value={filterStatus}
            onChange={handleFilterChange}
            style={{ width: 180 }}
            loading={isFetching}
            suffixIcon={<FilterOutlined />}>
            <Option value="Pending">Pending</Option>
            <Option value="Approved">Approved</Option>
            <Option value="Rejected">Rejected</Option>
          </Select>
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isFetching}>
            Refresh
          </Button>
        </Space>
      </div>

      <Card
        style={{
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
        <Table
          rowKey="applicationID"
          loading={isLoading}
          columns={columns}
          dataSource={data?.data || []}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          rowClassName={(record) => {
            if (record.status === 'Approved') return 'bg-green-50';
            if (record.status === 'Rejected') return 'bg-red-50';
            return 'bg-white';
          }}
        />
      </Card>

      {/* Reject Modal */}
      <Modal
        open={rejectModalOpen}
        title={
          <Space>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            Reject Application
          </Space>
        }
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleConfirmReject}
        confirmLoading={rejectMutation.isPending}
        okText="Reject"
        okButtonProps={{ danger: true }}>
        <p className="mb-4">Please provide a reason for rejection:</p>
        <Input.TextArea
          rows={4}
          placeholder="Enter rejection reason"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          style={{ borderRadius: '6px' }}
        />
      </Modal>

      {/* Details Modal */}
      <Modal
        open={detailModalOpen}
        title={
          <div className="flex justify-between items-center">
            <div>
              <ProfileOutlined className="mr-2" />
              <Typography.Text strong>Application Details</Typography.Text>
            </div>
            <div className="flex justify-center items-center gap-2 mr-6">
              <Popconfirm
                title="Approve this application?"
                onConfirm={() => handleApprove(selectedApplication?.applicationID || '')}
                okText="Yes"
                cancelText="No">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={approveMutation.isPending}
                  disabled={selectedApplication?.status !== 'Pending'}
                  size="small">
                  Approve
                </Button>
              </Popconfirm>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => openRejectModal(selectedApplication?.applicationID || '')}
                loading={rejectMutation.isPending}
                disabled={selectedApplication?.status !== 'Pending'}
                size="small">
                Reject
              </Button>
            </div>
          </div>
        }
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={1000}
        style={{ borderRadius: '8px' }}>
        {selectedApplication && (
          <Tabs
            defaultActiveKey="1"
            tabBarGutter={40}
            style={{
              background: '#f0f2f5',
              borderRadius: '6px',
              padding: '16px',
            }}>
            <TabPane
              tab={
                <Space>
                  <UserOutlined />
                  Applicant Profile
                </Space>
              }
              key="1">
              <Row gutter={24}>
                <Col span={12}>
                  <Card
                    title={
                      <Space>
                        <IdcardOutlined />
                        Basic Information
                      </Space>
                    }
                    style={{
                      height: '100%',
                      borderRadius: '8px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    }}>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <UserOutlined className="mr-2 text-blue-500" />
                        <Typography.Text strong>Full Name:</Typography.Text>
                        <span className="ml-2">{selectedApplication.fullName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <MailOutlined className="mr-2 text-blue-500" />
                        <Typography.Text strong>Email:</Typography.Text>
                        <span className="ml-2">{selectedApplication.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneOutlined className="mr-2 text-blue-500" />
                        <Typography.Text strong>Phone Number:</Typography.Text>
                        <span className="ml-2">{selectedApplication.phoneNumber || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-2 text-blue-500" />
                        <Typography.Text strong>Date of Birth:</Typography.Text>
                        <span className="ml-2">
                          {selectedApplication?.dateOfBirth
                            ? selectedApplication.dateOfBirth
                            : 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <GlobalOutlined className="mr-2 text-blue-500" />
                        <Typography.Text strong>Language:</Typography.Text>
                        <span className="ml-2">{selectedApplication.language || 'N/A'}</span>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Row gutter={16}>
                    <Col
                      style={{ marginBottom: '12px' }}
                      span={24}>
                      <Card
                        title={
                          <Space>
                            <UserOutlined />
                            Avatar
                          </Space>
                        }
                        style={{
                          textAlign: 'center',
                          borderRadius: '8px',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        }}>
                        {selectedApplication.avatar ? (
                          <AntdAvatar
                            src={selectedApplication.avatar}
                            size={160}
                            shape="square"
                            style={{
                              marginBottom: 16,
                              border: '2px solid #1890ff',
                            }}
                          />
                        ) : (
                          <AntdAvatar
                            size={160}
                            icon={<UserOutlined style={{ fontSize: '48px' }} />}
                            shape="square"
                            style={{ background: '#f0f2f5' }}
                          />
                        )}
                      </Card>
                    </Col>
                    <Col span={24}>
                      <Card
                        title={
                          <Space>
                            <BookOutlined />
                            Bio
                          </Space>
                        }
                        style={{
                          borderRadius: '8px',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        }}>
                        <div
                          style={{
                            whiteSpace: 'pre-wrap',
                            minHeight: '120px',
                            padding: '12px',
                            textAlign: 'justify',
                            background: '#fafafa',
                            borderRadius: '4px',
                            borderLeft: '4px solid #1890ff',
                          }}>
                          {selectedApplication.bio || 'N/A'}
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row
                gutter={24}
                style={{ marginTop: 24 }}>
                <Col span={16}>
                  <Card
                    title={
                      <Space>
                        <BookOutlined />
                        Teaching Experience & Details
                      </Space>
                    }
                    style={{
                      height: '100%',
                      borderRadius: '8px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    }}>
                    <Descriptions
                      bordered
                      column={1}
                      size="small"
                      style={{ background: '#fafafa' }}>
                      <Descriptions.Item label="Teaching Experience">
                        <div
                          style={{
                            whiteSpace: 'pre-wrap',
                            minHeight: '100px',
                            padding: '12px',
                            textAlign: 'justify',
                            background: '#f0f2f5',
                            borderRadius: '4px',
                          }}>
                          {selectedApplication.teachingExperience || 'N/A'}
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Meeting URL">
                        {selectedApplication.meetingUrl ? (
                          <a
                            href={selectedApplication.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#1890ff', fontWeight: 'bold' }}>
                            <VideoCameraOutlined /> View Meeting
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card
                    title={
                      <Space>
                        <FilePdfOutlined />
                        Certificates
                      </Space>
                    }
                    style={{
                      height: '100%',
                      borderRadius: '8px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    }}>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {selectedApplication.certificates?.length ? (
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {selectedApplication.certificates.map((c: any, idx: number) => (
                            <li
                              key={idx}
                              style={{
                                marginBottom: 12,
                                padding: '8px',
                                background: '#f0f2f5',
                                borderRadius: '4px',
                              }}>
                              <a
                                href={c.certificateImageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  wordBreak: 'break-all',
                                  color: '#1890ff',
                                }}>
                                <FilePdfOutlined className="mr-1" />
                                {c.credentialName || `Certificate ${idx + 1}`}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#999',
                          }}>
                          <FilePdfOutlined style={{ fontSize: '48px', marginBottom: 8 }} />
                          No certificates available
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>
            <TabPane
              tab={
                <Space>
                  <FileDoneOutlined />
                  Application Status
                </Space>
              }
              key="3">
              <Card
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                <Descriptions
                  bordered
                  column={2}
                  size="small"
                  style={{ background: '#fafafa' }}>
                  <Descriptions.Item label="Status">
                    <Tag color={statusMap[selectedApplication.status]?.color || 'default'}>
                      {statusMap[selectedApplication.status]?.text ||
                        selectedApplication.status ||
                        'Unknown'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Submitted At">
                    {selectedApplication.submittedAt
                      ? new Date(selectedApplication.submittedAt).toLocaleString()
                      : 'N/A'}
                  </Descriptions.Item>
                  {selectedApplication.status === 'Rejected' && (
                    <Descriptions.Item
                      label="Rejection Reason"
                      span={2}>
                      <div
                        style={{
                          whiteSpace: 'pre-wrap',
                          background: '#fff2f0',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ffccc7',
                        }}>
                        {selectedApplication.rejectionReason || 'N/A'}
                      </div>
                    </Descriptions.Item>
                  )}
                  {selectedApplication.reviewedByName && (
                    <Descriptions.Item label="Reviewed By">
                      {selectedApplication.reviewedByName}
                    </Descriptions.Item>
                  )}
                  {selectedApplication.reviewedAt && (
                    <Descriptions.Item label="Reviewed At">
                      {new Date(selectedApplication.reviewedAt).toLocaleString()}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default ApplicationsManagement;
