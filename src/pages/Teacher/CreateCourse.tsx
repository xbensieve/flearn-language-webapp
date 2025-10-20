/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
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
  Spin,
  Typography,
  Card,
  Tooltip,
  Alert,
} from 'antd';
import { UploadOutlined, BookOutlined, DollarOutlined, SettingOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createCourseService, getCourseTemplatesService } from '../../services/course';
import { getTopicsService } from '../../services/topics';
import { getGoalsService } from '../../services/goals';
import { getLevelTypeService } from '../../services/enums';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import type { CreateCourseRequest } from '../../services/course/type';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar1,
  DollarSign,
  FileText,
  GraduationCap,
  ImageIcon,
  Lightbulb,
  Settings,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CourseFormValues {
  title: string;
  description: string;
  templateId: string;
  topicIds: string[];
  price: number;
  discountPrice?: number;
  courseType: number;
  goalIds: number[];
  Level?: number;
  courseSkill?: number;
}

const courseTypes = [
  { value: 0, label: 'Free Course' },
  { value: 1, label: 'Paid Course' },
];

const CreateCourse: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const navigate = useNavigate();
  const [form] = Form.useForm<CourseFormValues>();
  const [fileList, setFileList] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Partial<CourseFormValues>>({});

  const courseTypeWatch = Form.useWatch('courseType', form);

  // Fetch data
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['courseTemplates'],
    queryFn: () => getCourseTemplatesService(),
  });

  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: getTopicsService,
  });
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: getGoalsService,
  });

  const { data: levels, isLoading: levelsLoading } = useQuery({
    queryKey: ['levels'],
    queryFn: getLevelTypeService,
    select: (data) => data.map((level) => ({ value: level.id, label: level.name })),
  });

  const { mutate: createCourse, isPending } = useMutation({
    mutationFn: createCourseService,
    onSuccess: () => {
      notifySuccess('🎉 Course created successfully!');
      form.resetFields();
      setFileList([]);
      setCurrentStep(0);
      navigate('/teacher/course');
    },
    onError: (err: AxiosError<any>) => {
      const errorData = err.response?.data;
      console.log(errorData);

      if (errorData?.errors && typeof errorData.errors === 'object') {
        // Loop through backend field errors and show all messages
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => notifyError(`${field}: ${msg}`));
          } else {
            notifyError(`${field}: ${String(messages)}`);
          }
        });
        return;
      }

      // Fallback for generic message
      notifyError(errorData?.message || 'Failed to create course.');
    },
  });

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file: any) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
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

  const next = async () => {
    try {
      const values = await form.validateFields();
      setFormValues((prev) => ({ ...prev, ...values }));
      setCurrentStep((s) => {
        // Skip Pricing step for free courses (courseType === 0)
        if (values.courseType === 0 && s === 0) return 2;
        return s + 1;
      });
    } catch {
      // Validation failed, stay on current step
    }
  };

  const prev = async () => {
    const values = await form.getFieldsValue(true); // Include all fields, even if not validated
    setFormValues((prev) => ({ ...prev, ...values }));
    setCurrentStep((s) => {
      // Skip Pricing step for free courses when going back
      if (formValues.courseType === 0 && s === 2) return 0;
      return s - 1;
    });
  };

  const handleTemplateChange = (value: string) => {
    const tpl = templates?.data?.find((t) => t.id === value);
    setSelectedTemplate(tpl || null);
    form.setFieldsValue({ templateId: value });
  };

  const onFinish = (values: CourseFormValues) => {
    console.log(form.getFieldsError());
    console.log('values', formValues);
    const payload: CreateCourseRequest = {
      title: formValues.title || values.title,
      description: formValues.description || values.description,
      topicIds: formValues.topicIds || values.topicIds,
      courseType: formValues.courseType || 0,
      goalIds: values.goalIds || [],
      Level: Number(values.Level),
      templateId: formValues.templateId || values.templateId,
      price: Number(formValues.price || 0),
      discountPrice: Number(formValues.discountPrice || 0),
      image: fileList[0] as unknown as File,
    };
    createCourse(payload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-8 h-8 text-yellow-500" />
          <div>
            <Title
              level={2}
              className="text-gray-800">
              Create New Course
            </Title>
            <Text type="secondary">
              Build your course step-by-step and watch it come to life! ✨
            </Text>
          </div>
        </div>

        <Card className="shadow-xl rounded-3xl p-8 border-0 bg-white/80 backdrop-blur-sm">
          <Steps
            current={currentStep}
            items={
              courseTypeWatch === 0
                ? [
                    { title: 'Infomation', icon: <BookOutlined /> },
                    { title: 'Settings', icon: <SettingOutlined /> },
                  ]
                : [
                    { title: 'Infomation', icon: <BookOutlined /> },
                    { title: 'Pricing', icon: <DollarOutlined /> },
                    { title: 'Settings', icon: <SettingOutlined /> },
                  ]
            }
            className="!mb-10"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Form */}
            <div className="space-y-6">
              <Form
                form={form}
                initialValues={formValues}
                onFinish={onFinish}
                layout="vertical"
                preserve>
                {currentStep === 0 && (
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <Text
                        strong
                        className="text-blue-800">
                        Basic Information
                      </Text>
                    </div>
                    <Form.Item
                      name="title"
                      label={
                        <span className="flex items-center gap-1">
                          Course Title <Sparkles className="w-4 h-4 text-yellow-500" />
                        </span>
                      }
                      rules={[{ required: true, message: 'Please enter course title' }]}>
                      <Input
                        size="large"
                        placeholder="e.g. Mastering Business English"
                        prefix={<BookOpen className="text-gray-400 mr-2 w-4 h-4" />}
                      />
                    </Form.Item>

                    <Form.Item
                      name="description"
                      label={
                        <span className="flex items-center gap-1">
                          Description <FileText className="w-4 h-4 text-gray-500" />
                        </span>
                      }
                      rules={[{ required: true, message: 'Please enter description' }]}>
                      <TextArea
                        rows={4}
                        placeholder="Describe what learners will gain..."
                      />
                    </Form.Item>

                    <Form.Item
                      name="templateId"
                      label={
                        <span className="flex items-center gap-1">
                          Course Template <Settings className="w-4 h-4 text-purple-500" />
                        </span>
                      }
                      rules={[{ required: true, message: 'Please select a template' }]}>
                      <Select
                        size="large"
                        placeholder="Select template"
                        loading={templatesLoading}
                        onChange={handleTemplateChange}
                        suffixIcon={<Settings className="w-4 h-4" />}>
                        {templates?.data?.map((tpl) => (
                          <Option
                            key={tpl.id}
                            value={tpl.id}>
                            {tpl.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="courseType"
                      label={
                        <span className="flex items-center gap-1">
                          Course Type <Users className="w-4 h-4 text-green-500" />
                        </span>
                      }
                      rules={[{ required: true, message: 'Please select course type' }]}>
                      <Select
                        size="large"
                        placeholder="Select type">
                        {courseTypes.map((ct) => (
                          <Option
                            key={ct.value}
                            value={ct.value}>
                            {ct.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="topicIds"
                      label={
                        <span className="flex items-center gap-1">
                          Topics <Target className="w-4 h-4 text-indigo-500" />
                        </span>
                      }
                      rules={[{ required: true, message: 'Please select topics' }]}>
                      {topics?.data?.length ? (
                        <Select
                          mode="multiple"
                          placeholder="Select topics"
                          loading={topicsLoading}
                          maxTagCount="responsive"
                          suffixIcon={<Target className="w-4 h-4" />}>
                          {topics.data.map((t) => (
                            <Option
                              key={t.topicId}
                              value={t.topicId}>
                              {t.topicName}
                            </Option>
                          ))}
                        </Select>
                      ) : (
                        <Alert
                          message="No Topics Found"
                          description="Create topics before adding a course."
                          type="warning"
                          showIcon
                          className="mt-2"
                        />
                      )}
                    </Form.Item>

                    <Form.Item
                      label={
                        <span className="flex items-center gap-1">
                          Course Image <ImageIcon className="w-4 h-4 text-pink-500" />
                        </span>
                      }>
                      <Upload.Dragger
                        {...uploadProps}
                        listType="picture-card"
                        className="border-dashed border-2 border-gray-300 hover:border-indigo-400 transition-colors">
                        <p className="ant-upload-drag-icon flex justify-center">
                          <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                        </p>
                        <p className="ant-upload-text">Click or drag to upload</p>
                        <p className="ant-upload-hint">JPG/PNG only, max 10MB</p>
                      </Upload.Dragger>
                    </Form.Item>
                  </div>
                )}

                {currentStep === 1 && formValues.courseType === 1 && (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <Text
                        strong
                        className="text-green-800">
                        Pricing Details
                      </Text>
                    </div>
                    <Row gutter={16}>
                      <Col
                        xs={24}
                        md={12}>
                        <Form.Item
                          name="price"
                          label={
                            <span className="flex items-center gap-1">
                              Base Price (VNĐ) <DollarSign className="w-4 h-4 text-green-500" />
                            </span>
                          }
                          rules={[
                            {
                              required: formValues.courseType === 1,
                              message: 'Please enter course price',
                            },
                          ]}>
                          <InputNumber<number>
                            min={0}
                            size="large"
                            className="w-full"
                            style={{ width: '100%' }}
                            placeholder="e.g. 1,000,000"
                            formatter={(value) =>
                              value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫' : ''
                            }
                            parser={(value) => Number(value?.replace(/\₫\s?|(,*)/g, '') || 0)}
                            prefix={<DollarSign className="text-gray-400 mr-2 w-4 h-4" />}
                          />
                        </Form.Item>
                      </Col>

                      <Col
                        xs={24}
                        md={12}>
                        <Form.Item
                          name="discountPrice"
                          label={
                            <span className="flex items-center gap-1">
                              Discount Price (VNĐ, optional){' '}
                              <Sparkles className="w-4 h-4 text-yellow-500" />
                            </span>
                          }>
                          <InputNumber<number>
                            min={0}
                            size="large"
                            className="w-full"
                            style={{ width: '100%' }}
                            placeholder="e.g. 800,000"
                            formatter={(value) =>
                              value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫' : ''
                            }
                            parser={(value) => Number(value?.replace(/\₫\s?|(,*)/g, '') || 0)}
                            prefix={<DollarSign className="text-gray-400 mr-2 w-4 h-4" />}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="w-5 h-5 text-purple-600" />
                      <Text
                        strong
                        className="text-purple-800">
                        Advanced Settings
                      </Text>
                    </div>
                    <Form.Item
                      name="goalIds"
                      label={
                        <span className="flex items-center gap-1">
                          Learning Goals <Target className="w-4 h-4 text-indigo-500" />
                        </span>
                      }
                      rules={
                        selectedTemplate?.requireGoal
                          ? [{ required: true, message: 'Please select at least one goal' }]
                          : []
                      }>
                      {goalsLoading ? (
                        <Spin />
                      ) : (
                        <Select
                          mode="multiple"
                          size="large"
                          placeholder="Select one or more goals"
                          maxTagCount="responsive"
                          suffixIcon={<Target className="w-4 h-4" />}>
                          {goals?.data.map((g) => (
                            <Option
                              key={g.id}
                              value={g.id}>
                              {g.name}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="Level"
                          label={
                            <span className="flex items-center gap-1">
                              Level <GraduationCap className="w-4 h-4 text-green-500" />
                            </span>
                          }
                          rules={
                            selectedTemplate?.requireLevel
                              ? [{ required: true, message: 'Level is required for this template' }]
                              : []
                          }>
                          <Select
                            loading={levelsLoading}
                            size="large"
                            placeholder="Select level"
                            suffixIcon={<GraduationCap className="w-4 h-4" />}>
                            {levels?.map((l) => (
                              <Option
                                key={l.value}
                                value={l.value}>
                                {l.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  {currentStep > 0 && (
                    <Tooltip title="Go back to previous step">
                      <Button
                        size="large"
                        onClick={prev}
                        icon={<Calendar1 className="w-4 h-4" />}>
                        Previous
                      </Button>
                    </Tooltip>
                  )}
                  {currentStep < 2 && (
                    <Tooltip title="Proceed to next step">
                      <Button
                        type="primary"
                        size="large"
                        onClick={next}
                        icon={<Sparkles className="w-4 h-4" />}>
                        Next →
                      </Button>
                    </Tooltip>
                  )}
                  {currentStep === 2 && (
                    <Tooltip title="Launch your course!">
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => onFinish(form.getFieldsValue())}
                        loading={isPending}
                        icon={<Sparkles className="w-4 h-4" />}>
                        Submit
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </Form>
            </div>

            {/* Right: Preview */}
            <div className="sticky top-10">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white mb-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  <Text
                    strong
                    className="!text-white">
                    Live Preview
                  </Text>
                </div>
                <Text
                  type="secondary"
                  className="!text-indigo-100 text-sm mt-1 block">
                  See how your course looks to learners
                </Text>
              </div>
              <Card className="rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {fileList.length > 0 ? (
                    <img
                      src={URL.createObjectURL(fileList[0] as any)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-t-2xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                      <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                      <Text className="text-sm">No image uploaded</Text>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Title
                      level={4}
                      className="m-0 text-gray-900 truncate max-w-[80%]">
                      {formValues.title || 'Course Title Preview'}
                    </Title>
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      New
                    </div>
                  </div>
                  <Text
                    type="secondary"
                    className="block mb-3 line-clamp-3">
                    {formValues.description || 'Course description will appear here.'}
                  </Text>

                  <div className="flex items-center gap-2 mb-3">
                    <Text
                      strong
                      className="text-indigo-600 text-lg">
                      {formValues.discountPrice
                        ? `${Number(formValues.discountPrice).toLocaleString('vi-VN')} ₫`
                        : `${Number(formValues.price || 0).toLocaleString('vi-VN')} ₫`}
                    </Text>

                    {formValues.discountPrice && (
                      <Text
                        delete
                        className="text-gray-500">
                        {`${Number(formValues.price || 0).toLocaleString('vi-VN')} ₫`}
                      </Text>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {formValues.Level && (
                      <span className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        Level {formValues.Level}
                      </span>
                    )}
                    {formValues.courseSkill && (
                      <span className="bg-gray-100 px-3 py-1 rounded-full">
                        Skill {formValues.courseSkill}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateCourse;
