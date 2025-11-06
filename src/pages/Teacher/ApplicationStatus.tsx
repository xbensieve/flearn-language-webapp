/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Button,
  Card,
  Spin,
  Tag,
  Typography,
  List,
  Collapse,
  Image,
  Empty,
  Alert,
  Space,
  Divider,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
  GlobalOutlined,
  FileTextOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ApplicationData } from '../../services/teacherApplication/types';
import { getMyApplication } from '../../services/teacherApplication';

const { Title, Paragraph, Text } = Typography;

const statusMap: Record<
  string,
  { text: string; color: string; icon: React.ReactNode; progress: number }
> = {
  Pending: {
    text: 'Pending Review',
    color: 'processing',
    icon: <ClockCircleOutlined />,
    progress: 25,
  },
  Submitted: {
    text: 'Submitted',
    color: 'warning',
    icon: <ClockCircleOutlined />,
    progress: 50,
  },
  Reviewed: {
    text: 'Under Review',
    color: 'success',
    icon: <TrophyOutlined />,
    progress: 75,
  },
  Rejected: {
    text: 'Rejected',
    color: 'error',
    icon: <ExclamationCircleOutlined />,
    progress: 0,
  },
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
    queryKey: ['myApplications'],
    queryFn: getMyApplication,
    retry: 1,
    retryDelay: 500,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Space
          direction="vertical"
          size="large"
          className="text-center">
          <Spin size="large" />
          <Title
            level={4}
            type="secondary">
            Loading your applications...
          </Title>
        </Space>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
        <Space
          direction="vertical"
          size="middle"
          className="text-center max-w-md">
          <Alert
            message="Something went wrong"
            description={
              (error as any)?.response?.data?.message ??
              'An unknown error occurred while fetching your applications.'
            }
            type="error"
            showIcon
          />
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/learner/application')}
            icon={<UserOutlined />}>
            Apply to Teach
          </Button>
        </Space>
      </div>
    );
  }

  const applications = response?.data;
  if (!applications || applications.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 text-center">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          imageStyle={{ height: 120 }}
          description={
            <Space
              direction="vertical"
              size="small">
              <Title
                level={3}
                type="secondary">
                No applications yet
              </Title>
              <Paragraph type="secondary">
                Get started by submitting your first teacher application!
              </Paragraph>
            </Space>
          }
        />
        <Button
          type="primary"
          size="large"
          onClick={() => navigate('/learner/application')}
          className="mt-6"
          icon={<UserOutlined />}>
          Apply Now
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Space
          direction="vertical"
          className="text-center mb-12 w-full">
          <Title
            level={1}
            className="text-4xl font-bold text-gray-900 mb-2">
            Application Status
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            Monitor your teacher applications with ease. View details, track progress, and take next
            steps.
          </Paragraph>
        </Space>

        {/* Applications List */}
        <List
          dataSource={applications}
          renderItem={(data: ApplicationData) => (
            <List.Item style={{ padding: 0, marginBottom: '2rem' }}>
              <Card
                className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden"
                styles={{
                  body: { padding: '2rem' },
                }}>
                {/* Status Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {statusMap[data.status]?.icon}
                    </div>
                    <div>
                      <Text className="block text-sm text-gray-500 mb-1">
                        Application #{data.applicationID}
                      </Text>
                      <Title
                        level={4}
                        className="m-0 font-semibold text-gray-900">
                        {data.fullName}
                      </Title>
                    </div>
                  </div>
                  <Space size="middle">
                    <Tag
                      color={statusMap[data.status]?.color}
                      className="px-4 py-2 text-sm font-medium">
                      {statusMap[data.status]?.text}
                    </Tag>
                  </Space>
                </div>

                {/* Key Details Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Space
                    direction="vertical"
                    className="w-full">
                    <div className="flex items-center gap-3">
                      <MailOutlined className="text-gray-400" />
                      <Text
                        strong
                        className="text-gray-700 text-sm">
                        Email
                      </Text>
                    </div>
                    <Text className="text-gray-900">{data.email}</Text>
                  </Space>
                  <Space
                    direction="vertical"
                    className="w-full">
                    <div className="flex items-center gap-3">
                      <GlobalOutlined className="text-gray-400" />
                      <Text
                        strong
                        className="text-gray-700 text-sm">
                        Language
                      </Text>
                    </div>
                    <Text className="text-gray-900">{data.language ?? 'N/A'}</Text>
                  </Space>
                  <Space
                    direction="vertical"
                    className="w-full">
                    <div className="flex items-center gap-3">
                      <CalendarOutlined className="text-gray-400" />
                      <Text
                        strong
                        className="text-gray-700 text-sm">
                        Submitted
                      </Text>
                    </div>
                    <Text className="text-gray-900">
                      {new Date(data.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </Space>
                </div>

                <Divider className="my-8" />

                {/* Bio Section */}
                <Collapse
                  defaultActiveKey={['1']}
                  bordered={false}
                  ghost
                  expandIconPosition="end"
                  items={[
                    {
                      key: '1',
                      label: (
                        <Space>
                          <FileTextOutlined />
                          <span className="font-medium">Bio</span>
                        </Space>
                      ),
                      children: (
                        <Paragraph className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {data.bio || 'No bio provided.'}
                        </Paragraph>
                      ),
                    },
                    ...(data.rejectionReason
                      ? [
                          {
                            key: '2',
                            label: (
                              <Space className="text-red-600">
                                <ExclamationCircleOutlined />
                                <span className="font-medium">Rejection Reason</span>
                              </Space>
                            ),
                            children: (
                              <Alert
                                message="Feedback"
                                description={data.rejectionReason}
                                type="error"
                                showIcon
                                className="mt-3"
                              />
                            ),
                          },
                        ]
                      : []),
                  ]}
                />

                {/* Certificates */}
                {data.certificates?.length > 0 ? (
                  <div className="mt-8">
                    <Space
                      align="start"
                      className="mb-4 w-full">
                      <TrophyOutlined className="text-2xl text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <Title
                          level={4}
                          className="m-0 text-gray-900">
                          Certificates
                        </Title>
                        <Text
                          type="secondary"
                          className="block text-sm">
                          Your uploaded qualifications
                        </Text>
                      </div>
                    </Space>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.certificates.map((cert) => (
                        <Card
                          key={cert.applicationCertTypeId}
                          hoverable
                          className="rounded-xl border-gray-200"
                          cover={
                            <Image
                              src={cert.certificateImageUrl}
                              alt={cert.certificateType?.name}
                              preview={false}
                              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
                              className="rounded-t-xl h-48 object-cover"
                            />
                          }>
                          <Card.Meta
                            title={cert.certificateType?.name || 'Certificate'}
                            description={truncate(
                              cert.certificateType?.description || 'No description',
                              100
                            )}
                          />
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Alert
                    message="No Certificates Uploaded"
                    description="Consider adding relevant certificates to boost your application."
                    type="info"
                    showIcon
                    className="mt-8 rounded-xl"
                  />
                )}
              </Card>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default ApplicationStatus;
