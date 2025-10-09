/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button, Card, Descriptions, Spin, Table, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getMyApplication } from '../../services/teacherApplication';
import type { ApplicationData } from '../../services/teacherApplication/types';

const { Title, Paragraph } = Typography;

const statusMap: Record<string, { text: string; color: string }> = {
  '0': { text: 'Pending', color: 'blue' },
  '1': { text: 'Submitted', color: 'gold' },
  '2': { text: 'Reviewed', color: 'green' },
  '3': { text: 'Rejected', color: 'red' },
};

const ApplicationStatus: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery<{ data: ApplicationData }>({
    queryKey: ['myApplication'],
    queryFn: getMyApplication,
    retry: 1,
    retryDelay: 500,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <Title level={3}>Something went wrong</Title>
        <Paragraph>{(error as any)?.response?.data?.message ?? 'Unknown error occurred'}</Paragraph>
        <Button
          type="primary"
          onClick={() => navigate('/learner/application')}>
          Apply to Teach
        </Button>
      </div>
    );
  }

  const data = response?.data;
  if (!data) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <Title level={3}>No application found</Title>
        <Button
          type="primary"
          onClick={() => navigate('/learner/application')}>
          Apply Now
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Title level={3}>Application Status</Title>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions
          bordered
          column={1}
          size="middle">
          <Descriptions.Item label="Application ID">{data.applicationID}</Descriptions.Item>
          <Descriptions.Item label="Name">{data.fullName}</Descriptions.Item>
          <Descriptions.Item label="Email">{data.email}</Descriptions.Item>
          <Descriptions.Item label="Language">{data.language?.langName ?? 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Motivation">{data.bio}</Descriptions.Item>
          <Descriptions.Item label="Applied At">
            {new Date(data.submittedAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusMap[data.status]?.color ?? 'default'}>{data.status ?? 'Unknown'}</Tag>
          </Descriptions.Item>
          {data.rejectionReason && (
            <Descriptions.Item label="Rejection Reason">{data.rejectionReason}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* ✅ Fixed: certificates is an array */}
      {data.certificates?.length ? (
        <Card title="Uploaded Certificates">
          <Table
            dataSource={data.certificates}
            rowKey={(record) => record.teacherCredentialID ?? record.credentialName}
            pagination={false}
            columns={[
              {
                title: 'Name',
                dataIndex: 'credentialName',
                key: 'credentialName',
              },
              {
                title: 'File',
                dataIndex: 'credentialFileUrl',
                key: 'credentialFileUrl',
                render: (url: string) =>
                  url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer">
                      View File
                    </a>
                  ) : (
                    'N/A'
                  ),
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (type: number) => (type === 1 ? 'Certificate' : 'Other'),
              },
              {
                title: 'Uploaded At',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (date: string) => (date ? new Date(date).toLocaleString() : 'Unknown'),
              },
            ]}
          />
        </Card>
      ) : (
        <Card>
          <Paragraph>No certificates uploaded.</Paragraph>
        </Card>
      )}
    </div>
  );
};

export default ApplicationStatus;
