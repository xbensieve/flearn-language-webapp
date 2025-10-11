/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Table, Button, message, Space, Tag, Popconfirm, Modal, Input } from 'antd';
import type { ApplicationData } from '../../services/teacherApplication/types';
import {
  getPendingApplications,
  reviewApproveApplication,
  reviewRejectApplication,
} from '../../services/staff';
import { notifyError, notifySuccess } from '../../utils/toastConfig';

// Map for status display
const statusMap: Record<string, { text: string; color: string }> = {
  '0': { text: 'Pending', color: 'blue' },
  '1': { text: 'Submitted', color: 'gold' },
  '2': { text: 'Reviewed', color: 'green' },
  '3': { text: 'Rejected', color: 'red' },
};

const ApplicationsPending: React.FC = () => {
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);

  // Fetch pending list
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pendingApplications'],
    queryFn: getPendingApplications,
  });

  // --- Mutation for approve ---
  const approveMutation = useMutation({
    mutationFn: (payload: { applicationId: string }) => reviewApproveApplication(payload),
    onSuccess: () => {
      notifySuccess('Application approved successfully!');
      refetch();
    },
    onError: (err: any) => {
      notifyError(err?.response?.data?.message || 'Failed to approve application');
    },
  });

  // --- Mutation for reject ---
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
    onError: (err: any) => {
      notifyError(err?.response?.data?.message || 'Failed to reject application');
    },
  });

  // --- Approve handler ---
  const handleApprove = (applicationId: string) => {
    if (!applicationId) return;
    approveMutation.mutate({ applicationId });
  };

  // --- Reject (open modal) ---
  const openRejectModal = (applicationId: string) => {
    setSelectedRejectId(applicationId);
    setRejectModalOpen(true);
  };

  // --- Confirm reject from modal ---
  const handleConfirmReject = () => {
    if (!rejectReason) {
      return message.warning('Please enter a rejection reason');
    }
    if (!selectedRejectId) return;
    rejectMutation.mutate({
      applicationId: selectedRejectId,
      reason: rejectReason,
    });
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
      render: (_: any, record: ApplicationData) => (
        <Tag color={statusMap[record.status]?.color ?? 'default'}>{record.status ?? 'Unknown'}</Tag>
      ),
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
                <a href={c.credentialFileUrl} target='_blank' rel='noopener noreferrer'>
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
            title='Approve this application?'
            onConfirm={() => handleApprove(record.applicationID)}
            okText='Yes'
            cancelText='No'
          >
            <Button type='primary' loading={approveMutation.isPending}>
              Approve
            </Button>
          </Popconfirm>

          <Button
            danger
            onClick={() => openRejectModal(record.applicationID)}
            loading={rejectMutation.isPending}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 className='text-xl font-semibold mb-4'>Pending Applications</h1>
      <Table
        rowKey='applicationID'
        loading={isLoading}
        columns={columns}
        dataSource={data?.data || []}
        style={{ overflow: 'auto' }}
      />

      {/* Reject Modal */}
      <Modal
        open={rejectModalOpen}
        title='Reject Application'
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleConfirmReject}
        confirmLoading={rejectMutation.isPending}
        okText='Reject'
        okButtonProps={{ danger: true }}
      >
        <p>Please provide a reason for rejection:</p>
        <Input.TextArea
          rows={4}
          placeholder='Enter rejection reason'
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ApplicationsPending;
