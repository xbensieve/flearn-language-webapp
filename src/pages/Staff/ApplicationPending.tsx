/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Table, Modal, Button, Descriptions, message, Space, Input, Spin } from 'antd';
import type { ApplicationData } from '../../services/teacherApplication/types';
import {
  getApplicationDetail,
  getPendingApplications,
  reviewApplication,
} from '../../services/staff';

const ApplicationsPending: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch pending list
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pendingApplications'],
    queryFn: getPendingApplications,
  });

  // Fetch application detail (only enabled when a row is selected)
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['applicationDetail', selectedId],
    queryFn: () => getApplicationDetail(selectedId as string),
    enabled: !!selectedId,
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: reviewApplication,
    onSuccess: () => {
      message.success('Application reviewed successfully!');
      setSelectedId(null);
      setShowReviewModal(false);
      setRejectReason('');
      refetch();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to review application');
    },
  });

  const handleView = (id: string) => {
    setSelectedId(id);
  };

  const handleClose = () => {
    setSelectedId(null);
    setRejectReason('');
    setShowReviewModal(false);
  };

  const handleApprove = () => {
    if (!detail?.data) return;
    reviewMutation.mutate({
      applicationId: detail.data.teacherApplicationID,
      isApproved: true,
    });
  };

  const handleReject = () => {
    if (!detail?.data) return;
    if (!rejectReason) {
      return message.warning('Please enter a rejection reason');
    }
    reviewMutation.mutate({
      applicationId: detail.data.teacherApplicationID,
      isApproved: false,
      rejectionReason: rejectReason,
    });
  };

  const columns = [
    { title: 'Applicant', dataIndex: 'userName', key: 'userName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Language', dataIndex: 'languageName', key: 'languageName' },
    { title: 'Applied At', dataIndex: 'appliedAt', key: 'appliedAt' },
    {
      title: 'Credentials',
      key: 'credentials',
      render: (_: any, record: ApplicationData) =>
        record.credentials?.length ? (
          <ul>
            {record.credentials.map((c) => (
              <li key={c.teacherCredentialID}>
                <a href={c.credentialFileUrl} target='_blank' rel='noopener noreferrer'>
                  {c.credentialName}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          'No credentials'
        ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ApplicationData) => (
        <Button type='link' onClick={() => handleView(record.teacherApplicationID)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 className='text-xl font-semibold mb-4'>Pending Applications</h1>
      <Table
        rowKey='teacherApplicationID'
        loading={isLoading}
        columns={columns}
        dataSource={data?.data || []}
      />

      {/* Detail modal */}
      <Modal
        open={!!selectedId}
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
            }}
          >
            <span>Application Detail</span>
            <Button type='primary' onClick={() => setShowReviewModal(true)}>
              Review
            </Button>
          </div>
        }
        onCancel={handleClose}
        footer={null}
        width={800}
      >
        {detailLoading ? (
          <Spin />
        ) : detail?.data ? (
          <Descriptions bordered column={1} size='small'>
            <Descriptions.Item label='Name'>{detail.data.userName}</Descriptions.Item>
            <Descriptions.Item label='Email'>{detail.data.email}</Descriptions.Item>
            <Descriptions.Item label='Language'>{detail.data.languageName}</Descriptions.Item>
            <Descriptions.Item label='Motivation'>{detail.data.motivation}</Descriptions.Item>
            <Descriptions.Item label='Applied At'>{detail.data.appliedAt}</Descriptions.Item>
            <Descriptions.Item label='Credentials'>
              {detail.data.credentials?.length ? (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {detail.data.credentials.map((c) => (
                    <li key={c.teacherCredentialID}>
                      <a href={c.credentialFileUrl} target='_blank' rel='noopener noreferrer'>
                        {c.credentialName}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                'No credentials'
              )}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p>No data found</p>
        )}
      </Modal>

      {/* Review modal */}
      <Modal
        open={showReviewModal}
        title='Review Application'
        onCancel={() => setShowReviewModal(false)}
        footer={null}
      >
        <Space direction='vertical' style={{ width: '100%' }}>
          <Input
            placeholder='Rejection reason (optional if approving)'
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <Space>
            <Button type='primary' onClick={handleApprove} loading={reviewMutation.isPending}>
              Approve
            </Button>
            <Button danger onClick={handleReject} loading={reviewMutation.isPending}>
              Reject
            </Button>
          </Space>
        </Space>
      </Modal>
    </div>
  );
};

export default ApplicationsPending;
