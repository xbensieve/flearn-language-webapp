/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Row,
  Col,
  Steps,
  message,
  Typography,
  Card,
  Progress,
  Space,
  Tag,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createCourseService,
  getCourseTemplatesByProgramService,
  getTeachingProgramService,
} from '../../services/course';
import { getTopicsService } from '../../services/topics';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import type { CreateCourseRequest } from '../../services/course/type';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Sparkles, DollarSign, Calendar, ChevronRight } from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CourseFormValues {
  title: string;
  description: string;
  templateId: string;
  topicIds: string[];
  price: number;
  courseType: number;
  learningOutcome: string;
  durationDays: number;
  gradingType: string;
  programId: string;
  levelId: string;
  programLevelCombo: string;
}

const courseTypes = [
  { value: 1, label: 'Free Course' },
  { value: 2, label: 'Paid Course' },
];

const gradingType = [
  { value: 1, label: 'AI' },
  { value: 2, label: 'AI and Teacher' },
];

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<CourseFormValues>();
  const [fileList, setFileList] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Partial<CourseFormValues>>({});
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');

  const courseTypeWatch = Form.useWatch('courseType', form);
  const titleWatch = Form.useWatch('title', form);
  const descriptionWatch = Form.useWatch('description', form);
  const topicIdsWatch = Form.useWatch('topicIds', form);

  const { data: programLevels = [], isLoading: programLevelsLoading } = useQuery({
    queryKey: ['programLevels'],
    queryFn: () => getTeachingProgramService({ pageSize: 1000 }),
    select: (data) => data.data || [],
  });

  const programOptions = useMemo(
    () =>
      programLevels.map((pl: any) => ({
        label: `${pl.programName} - ${pl.levelName}`,
        value: `${pl.programId}|${pl.levelId}`,
      })),
    [programLevels]
  );

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['courseTemplates', selectedProgramId, selectedLevelId],
    queryFn: () => {
      if (!selectedProgramId || !selectedLevelId) {
        throw new Error('Program and level must be selected');
      }
      return getCourseTemplatesByProgramService({
        programId: selectedProgramId,
        levelId: selectedLevelId,
      });
    },
    enabled: !!selectedProgramId && !!selectedLevelId,
    select: (data) => data.data || [],
  });

  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: getTopicsService,
  });

  const { mutate: createCourse, isPending } = useMutation({
    mutationFn: createCourseService,
    onSuccess: () => {
      notifySuccess('Course launched successfully!');
      form.resetFields();
      setFileList([]);
      setCurrentStep(0);
      navigate('/teacher/course');
    },
    onError: (err: AxiosError<any>) => {
      const errorData = err.response?.data;

      if (errorData.message) {
        notifyError(errorData.message);
        return;
      }

      if (errorData?.errors && typeof errorData.errors === 'object') {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => notifyError(`${field}: ${msg}`));
          } else {
            notifyError(`${field}: ${String(messages)}`);
          }
        });
        return;
      } else {
        notifyError(errorData?.message || 'Failed to create course.');
      }
    },
  });

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file: any) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Only image files allowed!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Image must be smaller than 10MB!');
        return false;
      }
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const handleProgramLevelChange = (value: string) => {
    if (value) {
      const [programId, levelId] = value.split('|');
      setSelectedProgramId(programId);
      setSelectedLevelId(levelId);
      form.setFieldsValue({ programId, levelId });
    } else {
      setSelectedProgramId('');
      setSelectedLevelId('');
      form.setFieldsValue({ programId: undefined, levelId: undefined });
    }
  };

  const next = async () => {
    try {
      const values = await form.validateFields();
      setFormValues((prev) => ({ ...prev, ...values }));
      setCurrentStep((s) => {
        if (values.courseType === 1 && s === 0) return 2;
        return s + 1;
      });
    } catch {
      return;
    }
  };

  const prev = async () => {
    const values = await form.getFieldsValue(true);
    setFormValues((prev) => ({ ...prev, ...values }));
    setCurrentStep((s) => {
      if (formValues.courseType === 1 && s === 2) return 0;
      return s - 1;
    });
  };

  const onFinish = (values: CourseFormValues) => {
    const payload: CreateCourseRequest = {
      title: formValues.title || values.title,
      description: formValues.description || values.description,
      topicIds: formValues.topicIds || values.topicIds,
      courseType: formValues?.courseType?.toString() || '',
      templateId: formValues.templateId || values.templateId,
      price: formValues?.price?.toString() || '0',
      image: fileList[0] as unknown as File,
      learningOutcome: formValues.learningOutcome || values.learningOutcome,
      durationDays: formValues.durationDays || values.durationDays,
      gradingType: formValues.gradingType || values.gradingType,
    };
    createCourse(payload);
  };

  console.log('formValues', courseTypeWatch);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Title
            level={3}
            className="!mb-0 text-gray-900">
            Create New Course
          </Title>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form */}
          <div className="xl:col-span-2">
            <Card className="bg-white rounded-2xl shadow-lg border-0">
              {/* Steps */}
              <div className="p-8 border-b border-gray-100">
                <Steps
                  current={currentStep}
                  items={(courseTypeWatch === 1
                    ? ['Basic Info', 'Settings']
                    : ['Basic Info', 'Pricing', 'Settings']
                  ).map((title) => ({
                    title: <span className="font-medium text-gray-700">{title}</span>,
                  }))}
                />
                <Progress
                  percent={
                    ((currentStep + 1) /
                      (courseTypeWatch === 1
                        ? ['Basic Info', 'Settings']
                        : ['Basic Info', 'Pricing', 'Settings']
                      ).length) *
                    100
                  }
                  showInfo={false}
                  strokeColor="#2563eb"
                  className="mt-4"
                />
              </div>

              <Form
                form={form}
                initialValues={formValues}
                onFinish={onFinish}
                layout="vertical"
                className="p-8">
                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                  <div className="space-y-8">
                    {/* Title */}
                    <div>
                      <Title
                        level={2}
                        className="flex items-center gap-4 !mb-6">
                        <Form.Item
                          name="title"
                          noStyle
                          rules={[{ required: true, message: 'Title is required' }]}>
                          <Input
                            bordered={false}
                            placeholder="Enter your title..."
                            className="text-3 xl font-bold mt-2 !p-0 hover:bg-gray-50 rounded-xl"
                            style={{ fontSize: '2.5rem', fontWeight: 700 }}
                          />
                        </Form.Item>
                      </Title>
                    </div>

                    {/* Program and Level Selection */}
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="programLevelCombo"
                          label="Program & Level"
                          rules={[
                            {
                              required: true,
                              message: 'Program and level is required',
                            },
                          ]}>
                          <Select
                            placeholder="Select program and level"
                            loading={programLevelsLoading}
                            options={programOptions}
                            onChange={handleProgramLevelChange}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="topicIds"
                          label="Topics"
                          rules={[{ required: true }]}>
                          <Select
                            mode="multiple"
                            placeholder="Select topics"
                            loading={topicsLoading}>
                            {topics?.data?.map((t: any) => (
                              <Option
                                key={t.topicId}
                                value={t.topicId}>
                                {t.topicName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="templateId"
                          label="Template"
                          rules={[{ required: true, message: 'Template is required' }]}>
                          <Select
                            placeholder="Select template"
                            loading={templatesLoading}
                            disabled={!selectedProgramId || !selectedLevelId}
                            optionLabelProp="label">
                            {templates.map((t: any) => (
                              <Option
                                key={t.templateId}
                                value={t.templateId}
                                label={t.name}>
                                {/* Hiện trong dropdown */}
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                  }}>
                                  <span
                                    style={{
                                      fontWeight: 500,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}>
                                    {t.name}
                                  </span>

                                  <span
                                    style={{
                                      fontSize: 12,
                                      color: '#8c8c8c',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}>
                                    {t.unitCount} units · {t.lessonsPerUnit} lessons ·{' '}
                                    {t.exercisesPerLesson} exercises
                                  </span>
                                </div>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="courseType"
                          label="Type"
                          rules={[{ required: true }]}>
                          <Select placeholder="type">
                            {courseTypes.map((ct) => (
                              <Option
                                key={ct.value}
                                value={ct.value}>
                                <Space>
                                  {ct.value === 1 ? (
                                    <Sparkles className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <DollarSign className="w-4 h-4 text-blue-500" />
                                  )}
                                  {ct.label}
                                </Space>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="description"
                      label="Description"
                      rules={[{ required: true }]}>
                      <TextArea
                        rows={6}
                        placeholder="Write a compelling description..."
                        className="rounded-xl"
                      />
                    </Form.Item>

                    <Form.Item
                      required
                      label="Image"
                      rules={[{ required: true, message: 'Image required' }]}>
                      <Upload.Dragger
                        {...uploadProps}
                        className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl">
                        {fileList.length > 0 ? (
                          <img
                            src={URL.createObjectURL(fileList[0])}
                            alt="thumb"
                            className="w-full h-64 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="py-16 text-center">
                            <UploadCloud className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                            <Text className="text-lg">Drop image here or click to upload</Text>
                            <Text type="secondary">JPG/PNG • Max 10MB</Text>
                          </div>
                        )}
                      </Upload.Dragger>
                    </Form.Item>
                  </div>
                )}

                {/* Step 2: Pricing */}
                {currentStep === 1 && formValues.courseType === 2 && (
                  <div className="bg-blue-50 rounded-2xl p-10 text-center">
                    <DollarSign className="w-20 h-20 text-blue-600 mx-auto mb-6" />
                    <Title
                      level={3}
                      className="text-gray-800">
                      Set Your Course Price
                    </Title>
                    <Form.Item
                      name="price"
                      rules={[{ required: true }]}>
                      <InputNumber
                        size="large"
                        defaultValue={0}
                        min={0}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        className="!w-full max-w-xs mx-auto"
                        placeholder="1,500,000"
                        prefix="₫"
                        style={{ fontSize: '2rem' }}
                      />
                    </Form.Item>
                  </div>
                )}

                {/* Step 3: Settings */}
                {currentStep === (courseTypeWatch === 1 ? 1 : 2) && (
                  <div className="space-y-8">
                    <Form.Item
                      name="learningOutcome"
                      label="What Students Will Learn"
                      rules={[{ required: true }]}>
                      <TextArea
                        rows={5}
                        placeholder="Students will be able to..."
                        className="rounded-xl"
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="durationDays"
                          label="Duration (days)"
                          rules={[{ required: true }]}>
                          <InputNumber
                            min={1}
                            className="w-full"
                            prefix={<Calendar className="text-blue-500" />}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="gradingType"
                          label="Grading Type"
                          rules={[{ required: true }]}>
                          <Select>
                            {gradingType.map((g) => (
                              <Option
                                key={g.value}
                                value={g.value}>
                                {g.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-8 border-t border-gray-200">
                  <Button
                    size="large"
                    onClick={prev}
                    disabled={currentStep === 0}>
                    Previous
                  </Button>
                  <Space>
                    {currentStep <
                      (courseTypeWatch === 1
                        ? ['Basic Info', 'Settings']
                        : ['Basic Info', 'Pricing', 'Settings']
                      ).length -
                        1 && (
                      <Button
                        type="primary"
                        size="large"
                        onClick={next}>
                        Next <ChevronRight className="ml-2" />
                      </Button>
                    )}
                    {currentStep ===
                      (courseTypeWatch === 1
                        ? ['Basic Info', 'Settings']
                        : ['Basic Info', 'Pricing', 'Settings']
                      ).length -
                        1 && (
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={isPending}
                        icon={<Sparkles className="mr-2" />}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        Launch Course
                      </Button>
                    )}
                  </Space>
                </div>
              </Form>
            </Card>
          </div>

          {/* Live Preview */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <Card className="bg-white !rounded-2xl shadow-lg border-0 overflow-hidden">
                <div className="bg-gradient-to-br !rounded-2xl from-blue-400 to-indigo-500 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <EyeOutlined className="text-2xl" />
                    <Title
                      level={4}
                      className="!text-white !m-0">
                      Live Preview
                    </Title>
                  </div>
                  <Text className="text-blue-100">See how your course looks</Text>
                </div>

                <div className="p-6">
                  <div className="relative h-48 bg-gray-200 rounded-xl overflow-hidden mb-6">
                    {fileList.length > 0 ? (
                      <img
                        src={URL.createObjectURL(fileList[0])}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <UploadCloud className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <Title
                    level={4}
                    className="line-clamp-2">
                    {titleWatch || formValues.title || 'Your Course Title'}
                  </Title>
                  <Text
                    type="secondary"
                    className="line-clamp-2 block mt-2">
                    {descriptionWatch || formValues.description || 'No description yet...'}
                  </Text>

                  <div className="mt-6 flex items-center justify-between">
                    <Tag color={courseTypeWatch || formValues.courseType === 1 ? 'green' : 'blue'}>
                      {courseTypeWatch || formValues.courseType === 1 ? 'FREE' : 'PAID'}
                    </Tag>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(topicIdsWatch || formValues.topicIds)?.slice(0, 3).map((id) => {
                      const topic = topics?.data?.find((t: any) => t.topicId === id);
                      return topic ? (
                        <Tag
                          key={id}
                          color="blue"
                          className="rounded-full">
                          {topic.topicName}
                        </Tag>
                      ) : null;
                    })}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
