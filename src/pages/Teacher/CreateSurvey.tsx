/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Select, Card, Typography, Spin } from 'antd';
import { getSurveyOptions, completeSurvey } from '../../services/survey';
import { notifySuccess, notifyError } from '../../utils/toastConfig';
import type { AxiosError } from 'axios';
import type { SurveyCompleteRequest, SurveyOptionsResponse } from '../../services/survey/types';
import { getLanguages } from '../../services/teacherApplication';

const { Title } = Typography;
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
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-2xl shadow-lg rounded-xl">
        <Title
          level={3}
          className="text-center mb-6">
          Complete Your Survey
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}>
          {/* Current Level */}
          <Form.Item
            name="currentLevel"
            label="Current Level"
            rules={[{ required: true, message: 'Please select your level' }]}>
            <Select placeholder="Select your current level">
              {options?.data.currentLevels.map((level) => (
                <Option
                  key={level}
                  value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Preferred Language */}
          <Form.Item
            name="preferredLanguageID"
            label="Preferred Language"
            rules={[{ required: true, message: 'Please select a language' }]}>
            <Select placeholder="Select preferred language">
              {languages?.data.map((lang) => (
                <Option
                  key={lang.languageId}
                  value={lang.languageId}>
                  {lang.languageName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Learning Reason */}
          <Form.Item
            name="learningReason"
            label="Learning Reason"
            rules={[
              { required: true, message: 'Please enter your reason' },
              { min: 10, message: 'Reason must be at least 10 characters' },
              { max: 500, message: 'Reason must be at most 500 characters' },
            ]}>
            <Input.TextArea
              rows={3}
              placeholder="Why are you learning?"
            />
          </Form.Item>

          {/* Previous Experience */}
          <Form.Item
            name="previousExperience"
            label="Previous Experience">
            <Input.TextArea
              rows={3}
              placeholder="Describe your experience (if any)"
            />
          </Form.Item>

          {/* Learning Style */}
          <Form.Item
            name="preferredLearningStyle"
            label="Preferred Learning Style"
            rules={[{ required: true, message: 'Please select a style' }]}>
            <Select placeholder="Select learning style">
              {options?.data.learningStyles.map((style) => (
                <Option
                  key={style}
                  value={style}>
                  {style}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Interested Topics */}
          <Form.Item
            name="interestedTopics"
            label="Interested Topics">
            <Input placeholder="e.g. Business, Travel, Casual Conversation" />
          </Form.Item>

          {/* Priority Skills */}
          <Form.Item
            name="prioritySkills"
            label="Priority Skills">
            <Select
              placeholder="Select priority skill"
              allowClear>
              {options?.data.prioritySkills.map((skill) => (
                <Option
                  key={skill}
                  value={skill}>
                  {skill}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Target Timeline */}
          <Form.Item
            name="targetTimeline"
            label="Target Timeline"
            rules={[{ required: true, message: 'Please select a timeline' }]}>
            <Select placeholder="Select target timeline">
              {options?.data.targetTimelines.map((time) => (
                <Option
                  key={time}
                  value={time}>
                  {time}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Speaking Challenges */}
          <Form.Item
            name="speakingChallenges"
            label="Speaking Challenges">
            <Select
              placeholder="Select challenge"
              allowClear>
              {options?.data.speakingChallenges.map((challenge) => (
                <Option
                  key={challenge}
                  value={challenge}>
                  {challenge}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Confidence Level */}
          <Form.Item
            name="confidenceLevel"
            label="Confidence Level">
            <Select
              placeholder="Select confidence level"
              allowClear>
              {options?.data.confidenceLevels.map((level) => (
                <Option
                  key={level.value}
                  value={level.value}>
                  {level.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Preferred Accent */}
          <Form.Item
            name="preferredAccent"
            label="Preferred Accent">
            <Select
              placeholder="Select preferred accent"
              allowClear>
              {options?.data.preferredAccents.map((accent) => (
                <Option
                  key={accent}
                  value={accent}>
                  {accent}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={mutation.isPending}
              className="bg-blue-600 hover:!bg-blue-700">
              Submit Survey
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </section>
  );
};

export default CreateSurvey;
