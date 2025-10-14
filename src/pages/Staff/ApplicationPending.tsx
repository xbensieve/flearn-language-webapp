/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Table, Button, message, Space, Tag, Popconfirm, Modal, Input, Select } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { ApplicationData } from '../../services/teacherApplication/types';
import {
  getPendingApplications,
  reviewApproveApplication,
  reviewRejectApplication,
} from '../../services/staff';
import { notifyError, notifySuccess } from '../../utils/toastConfig';

const { Option } = Select;

const statusMap: Record<string, { text: string; color: string }> = {
  Pending: { text: 'Pending', color: 'blue' },
  Approved: { text: 'Approved', color: 'green' },
  Rejected: { text: 'Rejected', color: 'red' },
};

const ApplicationsManagement: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('Pending'); // default: pending
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);

  // Fetch applications with filter
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['applications', filterStatus],
    queryFn: () => getPendingApplications({ status: filterStatus }), // <-- must support status param in service
  });

  // --- Approve mutation ---
  const approveMutation = useMutation({
    mutationFn: (payload: { applicationId: string }) => reviewApproveApplication(payload),
    onSuccess: () => {
      notifySuccess('Application approved successfully!');
      refetch();
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
    rejectMutation.mutate({ applicationId: selectedRejectId, reason: rejectReason });
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    refetch();
  };

  const columns = [
    {
      title: 'Applicant',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string) => text || 'N/A',
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Language',
      key: 'language',
      render: (_: any, record: ApplicationData) => record.language?.langName ?? 'N/A',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: ApplicationData) => {
        const map = statusMap[record.status] || { text: 'Unknown', color: 'default' };
        return <Tag color={map.color}>{map.text}</Tag>;
      },
    },
    {
      title: 'Applied At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => (date ? new Date(date).toLocaleString() : 'Unknown'),
    },
    {
      title: 'Certificates',
      key: 'certificates',
      render: (_: any, record: ApplicationData) =>
        record.certificates?.length ? (
          <ul>
            {record.certificates.map((c: any, idx: number) => (
              <li key={idx}>
                <a
                  href={c.certificateImageUrl}
                  target="_blank"
                  rel="noopener noreferrer">
                  {c.credentialName || 'View File'}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          'No certificates'
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ApplicationData) => (
        <Space>
          <Popconfirm
            title="Approve this application?"
            onConfirm={() => handleApprove(record.applicationID)}
            okText="Yes"
            cancelText="No">
            <Button
              type="primary"
              loading={approveMutation.isPending}
              disabled={record.status !== 'Pending'}>
              Approve
            </Button>
          </Popconfirm>

          <Button
            danger
            onClick={() => openRejectModal(record.applicationID)}
            loading={rejectMutation.isPending}
            disabled={record.status !== 'Pending'}>
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Teacher Applications</h1>

        <Space>
          <Select
            value={filterStatus}
            onChange={handleFilterChange}
            style={{ width: 180 }}
            loading={isFetching}>
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
          <Button onClick={() => refetch()}>Refresh</Button>
        </Space>
      </div>

      <Table
        rowKey="applicationID"
        loading={isLoading}
        columns={columns}
        dataSource={data?.data || []}
        pagination={{ pageSize: 10 }}
      />

      {/* Reject Modal */}
      <Modal
        open={rejectModalOpen}
        title="Reject Application"
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleConfirmReject}
        confirmLoading={rejectMutation.isPending}
        okText="Reject"
        okButtonProps={{ danger: true }}>
        <p>Please provide a reason for rejection:</p>
        <Input.TextArea
          rows={4}
          placeholder="Enter rejection reason"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ApplicationsManagement;
