/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Learner/ApplicationStatus.tsx
import React from 'react';
import { Button, Card, Descriptions, Spin, Table, Tag, Typography } from 'antd';
import { getMyApplication } from '../../services/teacherApplication';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: 'Pending', color: 'blue' },
  1: { text: 'Submitted', color: 'gold' },
  2: { text: 'Reviewed', color: 'green' },
  3: { text: 'Rejected', color: 'red' },
};

const ApplicationStatus: React.FC = () => {
  const {
    data: myApplication,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['myApplication'],
    queryFn: getMyApplication,
    retry: 1,
    retryDelay: 500,
  });
  const navigate = useNavigate();

  if (isLoading)
    return (
      <div className='flex items-center justify-center h-screen'>
        <Spin size='large' />
      </div>
    );

  const data = myApplication?.data;
  return isError ? (
    <div className='flex flex-col justify-center items-center h-screen'>
      <Typography.Title level={3}>Something went wrong</Typography.Title>
      <Typography.Paragraph>{(error as any)?.response?.data?.message}</Typography.Paragraph>
      <Button type='primary' onClick={() => navigate('/learner/application')}>
        Apply to Teach
      </Button>
    </div>
  ) : (
    <div>
      <Title level={3}>Application Status</Title>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions bordered column={1} size='middle'>
          <Descriptions.Item label='Application ID'>{data?.teacherApplicationID}</Descriptions.Item>
          <Descriptions.Item label='Name'>{data?.userName}</Descriptions.Item>
          <Descriptions.Item label='Email'>{data?.email}</Descriptions.Item>
          <Descriptions.Item label='Language'>{data?.languageName}</Descriptions.Item>
          <Descriptions.Item label='Motivation'>{data?.motivation}</Descriptions.Item>
          <Descriptions.Item label='Applied At'>
            {new Date(data?.appliedAt || '').toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label='Status'>
            <Tag color={statusMap[data?.status || 0]?.color}>
              {statusMap[data?.status || 0]?.text}
            </Tag>
          </Descriptions.Item>
          {data?.rejectionReason && (
            <Descriptions.Item label='Rejection Reason'>{data?.rejectionReason}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title='Uploaded Credentials'>
        <Table
          dataSource={data?.credentials}
          rowKey='teacherCredentialID'
          pagination={false}
          columns={[
            {
              title: 'Name',
              dataIndex: 'credentialName',
            },
            {
              title: 'File',
              dataIndex: 'credentialFileUrl',
              render: (url: string) => (
                <a href={url} target='_blank' rel='noopener noreferrer'>
                  View File
                </a>
              ),
            },
            {
              title: 'Type',
              dataIndex: 'type',
              render: (type: number) => (type === 1 ? 'Certificate' : 'Other'),
            },
            {
              title: 'Uploaded At',
              dataIndex: 'createdAt',
              render: (date: string) => new Date(date).toLocaleString(),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ApplicationStatus;
