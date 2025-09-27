/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/MySurvey.tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Col,
  Descriptions,
  List,
  Row,
  Spin,
  Typography,
  Button,
  message,
  Skeleton,
} from 'antd';
import { getMySurvey, regenerateRecommendations } from '../../services/survey';
import { useEffect } from 'react';
import { notifyError } from '../../utils/toastConfig';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const MySurvey = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // Fetch survey
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['mySurvey'],
    queryFn: getMySurvey,
    retry: 2,
    retryDelay: 1000,
  });

  // Mutation for regenerate
  const { mutate: handleRegenerate, isPending } = useMutation({
    mutationFn: regenerateRecommendations,
    onSuccess: () => {
      message.success('Recommendations regenerated!');
      queryClient.invalidateQueries({ queryKey: ['mySurvey'] });
    },
    onError: () => {
      message.error('Failed to regenerate recommendations');
    },
  });

  useEffect(() => {
    if (isError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      notifyError((error as any)?.response?.data?.message || 'Failed to fetch survey');
    }
  }, [isError, error]);

  if (isLoading)
    return (
      <div className='flex items-center justify-center h-screen'>
        <Spin size='large' />
      </div>
    );

  const survey = data?.data;
  const recommendations = survey?.aiRecommendations;

  return isError ? (
    <div className='flex flex-col justify-center items-center h-screen'>
      <Typography.Title level={3}>Something went wrong</Typography.Title>
      <Typography.Paragraph>{(error as any)?.response?.data?.message}</Typography.Paragraph>
      <Button type='primary' onClick={() => navigate('create')}>
        Create New Survey Here
      </Button>
    </div>
  ) : (
    <div style={{ padding: 24 }}>
      <Row gutter={16}>
        {/* Left: Recommendations */}
        <Col span={16}>
          <div className='flex justify-between'>
            <Title level={3}>🎯 AI Recommendations</Title>
            <Button
              type='primary'
              loading={isPending}
              onClick={() => handleRegenerate()}
              style={{ marginBottom: 16 }}
            >
              🔄 Regenerate
            </Button>
          </div>

          {/* Skeleton while regenerating */}
          {isPending ? (
            <>
              <Card title='Recommended Courses' style={{ marginBottom: 24 }}>
                <Skeleton active paragraph={{ rows: 4 }} />
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>

              <Card title='🧠 AI Reasoning' style={{ marginBottom: 24 }}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>

              <Card title='📚 Learning Path' style={{ marginBottom: 24 }}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>

              <Card title='💡 Study Tips'>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </>
          ) : recommendations ? (
            <>
              <Card title='Recommended Courses' style={{ marginBottom: 24 }}>
                <List
                  itemLayout='vertical'
                  dataSource={recommendations.recommendedCourses}
                  renderItem={(course) => (
                    <List.Item key={course.courseID}>
                      <List.Item.Meta
                        title={<Text strong>{course.courseName}</Text>}
                        description={
                          <>
                            <Paragraph>{course.courseDescription}</Paragraph>
                            <Text type='secondary'>Level: {course.level}</Text>
                            <br />
                            <Text type='secondary'>Match Score: {course.matchScore}%</Text>
                            <Paragraph>
                              <Text italic>{course.matchReason}</Text>
                            </Paragraph>
                          </>
                        }
                      />
                      <Paragraph>
                        <Text strong>Estimated Duration:</Text> {course.estimatedDuration} hours
                      </Paragraph>
                      <Paragraph>
                        <Text strong>Skills:</Text> {course.skills.join(', ')}
                      </Paragraph>
                    </List.Item>
                  )}
                />
              </Card>

              <Card title='🧠 AI Reasoning' style={{ marginBottom: 24 }}>
                <Paragraph>{recommendations.reasoningExplanation}</Paragraph>
              </Card>

              <Card title='📚 Learning Path' style={{ marginBottom: 24 }}>
                <Paragraph>{recommendations.learningPath}</Paragraph>
              </Card>

              <Card title='💡 Study Tips'>
                <List
                  dataSource={recommendations.studyTips}
                  renderItem={(tip, idx) => <List.Item>{`${idx + 1}. ${tip}`}</List.Item>}
                />
              </Card>
            </>
          ) : (
            <Card>
              <Paragraph>No recommendations available yet.</Paragraph>
            </Card>
          )}
        </Col>

        {/* Right: Survey Details */}
        <Col style={{ marginTop: 48 }} span={8}>
          <Card title='📋 Survey Details'>
            <Descriptions bordered column={1} size='small'>
              <Descriptions.Item label='Current Level'>{survey?.currentLevel}</Descriptions.Item>
              <Descriptions.Item label='Preferred Language'>
                {survey?.preferredLanguageName}
              </Descriptions.Item>
              <Descriptions.Item label='Learning Reason'>
                {survey?.learningReason}
              </Descriptions.Item>
              <Descriptions.Item label='Previous Experience'>
                {survey?.previousExperience || '-'}
              </Descriptions.Item>
              <Descriptions.Item label='Learning Style'>
                {survey?.preferredLearningStyle}
              </Descriptions.Item>
              <Descriptions.Item label='Interested Topics'>
                {survey?.interestedTopics || '-'}
              </Descriptions.Item>
              <Descriptions.Item label='Priority Skills'>
                {survey?.prioritySkills}
              </Descriptions.Item>
              <Descriptions.Item label='Target Timeline'>
                {survey?.targetTimeline}
              </Descriptions.Item>
              <Descriptions.Item label='Speaking Challenges'>
                {survey?.speakingChallenges}
              </Descriptions.Item>
              <Descriptions.Item label='Confidence Level'>
                {survey?.confidenceLevel}/10
              </Descriptions.Item>
              <Descriptions.Item label='Preferred Accent'>
                {survey?.preferredAccent}
              </Descriptions.Item>
              <Descriptions.Item label='Completed'>
                {survey?.isCompleted ? '✅ Yes' : '❌ No'}
              </Descriptions.Item>
              <Descriptions.Item label='Created At'>
                {new Date(survey?.createdAt || '').toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MySurvey;
