/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Select, Card, Typography, Spin, Divider, Row, Col } from 'antd';
import { getSurveyOptions, completeSurvey } from '../../services/survey';
import { notifySuccess, notifyError } from '../../utils/toastConfig';
import type { AxiosError } from 'axios';
import type { SurveyCompleteRequest, SurveyOptionsResponse } from '../../services/survey/types';
import { getLanguages } from '../../services/teacherApplication';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const CreateSurvey: React.FC = () => {
  const [form] = Form.useForm<SurveyCompleteRequest>();

  // Fetch survey options
  const { data: options, isLoading: loadingOptions } = useQuery<SurveyOptionsResponse, AxiosError>({
    queryKey: ['surveyOptions'],
    queryFn: getSurveyOptions,
  });

  // Fetch languages
  const { data: languages, isLoading: loadingLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
  });

  console.log(languages?.data);

  // Mutation for submit
  const mutation = useMutation<any, AxiosError<any>, SurveyCompleteRequest>({
    mutationFn: completeSurvey,
    onSuccess: (data) => {
      notifySuccess(data.message || 'Survey submitted successfully!');
      form.resetFields();
    },
    onError: (err) => {
      notifyError(err?.response?.data?.message || 'Failed to submit survey');
    },
  });

  const handleSubmit = (values: SurveyCompleteRequest) => {
    mutation.mutate(values);
  };

  if (loadingOptions || loadingLanguages) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <Title
          level={1}
          className="!text-4xl !font-bold !mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Learning Journey Survey
        </Title>
        <Paragraph className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Help us personalize your learning experience by sharing your goals and preferences
        </Paragraph>
      </div>
      <Row
        className="shadow-2xl rounded-xl border-border backdrop-blur-sm"
        style={{ height: '100%' }}
        justify="space-between"
        gutter={32}
        align="top">
        <Col
          xs={24}
          md={10}
          style={{ flex: 1 }}>
          <div className="mb-8 md:mb-0 mr-2 p-12 !w-full">
            <Title
              level={1}
              className="!text-4xl !font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Find Your Best Learning Path 🚀
            </Title>
            <Paragraph className="text-lg text-muted-foreground">
              We want to make sure you start with the <strong>most suitable course</strong> for your
              goals and skill level. <br />
              Complete this short survey to help us understand your motivations, learning style, and
              preferences. This way, we can recommend a course tailored just for you.
            </Paragraph>
            <Paragraph className="text-base text-foreground mt-4">
              ✨ The more honest and detailed your answers, the better we can match you with the
              right program.
            </Paragraph>
          </div>
        </Col>
        <Col
          style={{ flex: 1, padding: 0 }}
          xs={24}
          md={10}>
          {/* Main Form Card */}
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="border-0">
              {/* Language & Level Section */}
              <div className="">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-12 bg-primary rounded-full" />
                  <Title
                    level={4}
                    className="!mb-0 !text-foreground">
                    Language & Level
                  </Title>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* <Form.Item
                    name="preferredLanguageID"
                    label={
                      <span className="text-foreground font-semibold">Preferred Language</span>
                    }
                    rules={[{ required: true, message: 'Please select a language' }]}>
                    <Select
                      placeholder="Select preferred language"
                      size="large"
                      className="rounded-lg">
                      {languages?.data.map((lang) => (
                        <Option
                          key={lang.languageId}
                          value={lang.languageId}>
                          {lang.languageName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item> */}

                  <Form.Item
                    name="currentLevel"
                    label={<span className="text-foreground font-semibold">Current Level</span>}
                    rules={[{ required: true, message: 'Please select your level' }]}>
                    <Select
                      placeholder="Select your current level"
                      size="large">
                      {options?.data.currentLevels.map((level) => (
                        <Option
                          key={level}
                          value={level}>
                          {level}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>

              <Divider className="!my-8 border-border" />

              {/* Motivation Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-12 bg-primary rounded-full" />
                  <Title
                    level={4}
                    className="!mb-0 !text-foreground">
                    Your Motivation
                  </Title>
                </div>

                <Form.Item
                  name="learningReason"
                  label={
                    <span className="text-foreground font-semibold">Why are you learning?</span>
                  }
                  rules={[
                    { required: true, message: 'Please enter your reason' },
                    { min: 10, message: 'Reason must be at least 10 characters' },
                    { max: 500, message: 'Reason must be at most 500 characters' },
                  ]}>
                  <Input.TextArea
                    rows={4}
                    placeholder="Share your goals and what motivates you to learn..."
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="previousExperience"
                  label={
                    <span className="text-foreground font-semibold">Previous Experience</span>
                  }>
                  <Input.TextArea
                    rows={3}
                    placeholder="Tell us about your previous learning experience (if any)"
                    className="rounded-lg"
                  />
                </Form.Item>
              </div>

              <Divider className="!my-8 border-border" />

              {/* Learning Preferences Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-12 bg-primary rounded-full" />
                  <Title
                    level={4}
                    className="!mb-0 !text-foreground">
                    Learning Preferences
                  </Title>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    name="preferredLearningStyle"
                    label={<span className="text-foreground font-semibold">Learning Style</span>}
                    rules={[{ required: true, message: 'Please select a style' }]}>
                    <Select
                      placeholder="How do you prefer to learn?"
                      size="large">
                      {options?.data.learningStyles.map((style) => (
                        <Option
                          key={style}
                          value={style}>
                          {style}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="targetTimeline"
                    label={<span className="text-foreground font-semibold">Target Timeline</span>}
                    rules={[{ required: true, message: 'Please select a timeline' }]}>
                    <Select
                      placeholder="When do you want to achieve your goal?"
                      size="large">
                      {options?.data.targetTimelines.map((time) => (
                        <Option
                          key={time}
                          value={time}>
                          {time}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="interestedTopics"
                    label={
                      <span className="text-foreground font-semibold">Interested Topics</span>
                    }>
                    <Input
                      placeholder="e.g. Business, Travel, Casual Conversation"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="prioritySkills"
                    label={<span className="text-foreground font-semibold">Priority Skills</span>}>
                    <Select
                      placeholder="What skill matters most?"
                      allowClear
                      size="large">
                      {options?.data.prioritySkills.map((skill) => (
                        <Option
                          key={skill}
                          value={skill}>
                          {skill}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>

              <Divider className="!my-8 border-border" />

              {/* Speaking & Confidence Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-12 bg-primary rounded-full" />
                  <Title
                    level={4}
                    className="!mb-0 !text-foreground">
                    Speaking & Confidence
                  </Title>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    name="speakingChallenges"
                    label={
                      <span className="text-foreground font-semibold">Speaking Challenges</span>
                    }>
                    <Select
                      placeholder="What challenges do you face?"
                      allowClear
                      size="large">
                      {options?.data.speakingChallenges.map((challenge) => (
                        <Option
                          key={challenge}
                          value={challenge}>
                          {challenge}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="confidenceLevel"
                    label={<span className="text-foreground font-semibold">Confidence Level</span>}>
                    <Select
                      placeholder="How confident are you speaking?"
                      allowClear
                      size="large">
                      {options?.data.confidenceLevels.map((level) => (
                        <Option
                          key={level.value}
                          value={level.value}>
                          {level.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="preferredAccent"
                    label={<span className="text-foreground font-semibold">Preferred Accent</span>}>
                    <Select
                      placeholder="Select preferred accent"
                      allowClear
                      size="large">
                      {options?.data.preferredAccents.map((accent) => (
                        <Option
                          key={accent}
                          value={accent}>
                          {accent}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={mutation.isPending}
                  className="!h-14 !text-base !font-semibold !rounded-lg bg-primary hover:!bg-primary/90 transition-all duration-300 hover:shadow-lg">
                  {mutation.isPending ? 'Submitting...' : 'Complete Survey'}
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </section>
  );
};

export default CreateSurvey;
