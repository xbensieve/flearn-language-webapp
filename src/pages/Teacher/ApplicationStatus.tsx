/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button, Card, Descriptions, Spin, Table, Tag, Typography, List } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ApplicationData } from '../../services/teacherApplication/types';
import { getMyApplication } from '../../services/teacherApplication';

const { Title, Paragraph } = Typography;

const statusMap: Record<string, { text: string; color: string }> = {
  Pending: { text: 'Pending', color: 'blue' },
  Submitted: { text: 'Submitted', color: 'gold' },
  Reviewed: { text: 'Reviewed', color: 'green' },
  Rejected: { text: 'Rejected', color: 'red' },
};

// Truncate function
function truncate(str: string, n: number) {
  return str.length > n ? str.substr(0, n - 1) + '...' : str;
}

const ApplicationStatus: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery<{ data: ApplicationData[] }>({
    queryKey: ['myApplications'], // Updated queryKey to match TeacherApplicationPage
    queryFn: getMyApplication, // Updated to use getMyApplications
    retry: 1,
    retryDelay: 500,
  });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Spin size='large' />
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex flex-col justify-center items-center h-screen text-center'>
        <Title level={3}>Something went wrong</Title>
        <Paragraph>{(error as any)?.response?.data?.message ?? 'Unknown error occurred'}</Paragraph>
        <Button type='primary' onClick={() => navigate('/learner/application')}>
          Apply to Teach
        </Button>
      </div>
    );
  }

  const applications = response?.data;
  if (!applications || applications.length === 0) {
    return (
      <div className='flex flex-col justify-center items-center h-screen text-center'>
        <Title level={3}>No applications found</Title>
        <Button type='primary' onClick={() => navigate('/learner/application')}>
          Apply Now
        </Button>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <Title level={3} className='mb-6'>
        Your Application Status
      </Title>

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1 }}
        dataSource={applications}
        renderItem={(data: ApplicationData) => (
          <List.Item>
            <Card style={{ marginBottom: 24 }} title={`Application ID: ${data.applicationID}`}>
              <Descriptions bordered column={1} size='middle'>
                <Descriptions.Item label='Name'>{data.fullName}</Descriptions.Item>
                <Descriptions.Item label='Email'>{data.email}</Descriptions.Item>
                <Descriptions.Item label='Language'>
                  {data.language?.langName ?? 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label='Bio'>{data.bio}</Descriptions.Item>
                <Descriptions.Item label='Applied At'>
                  {new Date(data.submittedAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label='Status'>
                  <Tag color={statusMap[data.status]?.color ?? 'default'}>
                    {statusMap[data.status]?.text ?? 'Unknown'}
                  </Tag>
                </Descriptions.Item>
                {data.rejectionReason && (
                  <Descriptions.Item label='Rejection Reason'>
                    {data.rejectionReason}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* Certificates */}
              {data.certificates?.length ? (
                <div className='mt-6'>
                  <Title level={5}>Uploaded Certificates</Title>
                  <Table
                    dataSource={data.certificates}
                    rowKey={(record) => record.applicationCertTypeId}
                    pagination={false}
                    columns={[
                      {
                        title: 'Certificate Image',
                        dataIndex: 'certificateImageUrl',
                        key: 'certificateImageUrl',
                        render: (url: string) => (
                          <a href={url} target='_blank' rel='noopener noreferrer'>
                            {truncate(url, 40)}
                          </a>
                        ),
                      },
                      {
                        title: 'Certificate Type Name',
                        key: 'certificateType',
                        render: (_: any, record: any) => (
                          <Typography.Text strong>
                            {record.certificateType?.name || 'N/A'}
                          </Typography.Text>
                        ),
                      },
                      {
                        title: 'Certificate Type Description',
                        key: 'certificateType',
                        render: (_: any, record: any) => (
                          <Typography.Text type='secondary'>
                            {record.certificateType?.description || 'No description'}
                          </Typography.Text>
                        ),
                      },
                    ]}
                  />
                </div>
              ) : (
                <Paragraph className='mt-4'>No certificates uploaded.</Paragraph>
              )}
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ApplicationStatus;
