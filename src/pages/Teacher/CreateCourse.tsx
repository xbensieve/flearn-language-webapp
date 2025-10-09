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
  message,
  Steps,
  Result,
  Spin,
} from 'antd';
import { UploadOutlined, BookOutlined, DollarOutlined, StarOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createCourseService, getCourseTemplatesService } from '../../services/course';
import { getTopicsService } from '../../services/topics';
import type { CreateCourseRequest } from '../../services/course/type';
import { notifyError } from '../../utils/toastConfig';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { getGoalsService } from '../../services/goals';
import { getLanguages } from '../../services/teacherApplication';

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
  languageId: string;
  goalId: number;
  courseLevel?: number;
  courseSkill?: number;
}

const CreateCourse: React.FC = () => {
  const [form] = Form.useForm<CourseFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Partial<CourseFormValues>>({});
  const navigate = useNavigate();

  // mutation
  const { mutate: createCourse, isPending } = useMutation({
    mutationFn: createCourseService,
    onSuccess: () => {
      message.success('🎉 Course created successfully!');
      form.resetFields();
      setFileList([]);
      setCurrentStep(0);
    },
    onError: (err: AxiosError<any>) => {
      notifyError(err.response?.data?.message || 'Failed to create course. Please try again.');
    },
  });

  // fetch data
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['courseTemplates'],
    queryFn: () => getCourseTemplatesService(),
  });
  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: getTopicsService,
  });
  const { data: languages } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
  });

  // Fetch goals
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: getGoalsService,
  });

  // Course settings lists
  const courseTypes = [
    { value: 0, label: 'Video Course' },
    { value: 1, label: 'Interactive Course' },
    { value: 2, label: 'Live Course' },
    { value: 3, label: 'Self-Paced Course' },
  ];
  const levels = [
    { value: 1, label: 'Beginner' },
    { value: 2, label: 'Intermediate' },
    { value: 3, label: 'Advanced' },
    { value: 4, label: 'Expert' },
  ];
  const skills = [
    { value: 1, label: 'Basic' },
    { value: 2, label: 'Practical' },
    { value: 3, label: 'Professional' },
    { value: 4, label: 'Mastery' },
  ];

  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
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
      setCurrentStep((s) => s + 1);
    } catch (err) {
      console.log(err);
    }
  };

  const prev = async () => {
    const values = await form.getFieldsValue();
    setFormValues((prev) => ({ ...prev, ...values }));
    setCurrentStep((s) => s - 1);
  };

  console.log(languages?.data);

  const onFinish = (values: CourseFormValues) => {
    const payload: CreateCourseRequest = {
      title: formValues.title || values.title,
      description: formValues.description || values.description,
      topicIds: formValues.topicIds || values.topicIds,
      courseType: Number(values.courseType),
      languageId: values.languageId,
      goalId: Number(values.goalId),
      courseLevel: Number(values.courseLevel),
      courseSkill: Number(values.courseSkill),
      templateId: formValues.templateId || values.templateId,
      price: Number(formValues.price),
      discountPrice: Number(formValues.discountPrice),
      image: fileList[0] as unknown as File,
    };
    createCourse(payload);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      {/* Left: Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <Steps
          current={currentStep}
          items={[
            { title: 'Basic Info', icon: <BookOutlined /> },
            { title: 'Pricing', icon: <DollarOutlined /> },
            { title: 'Settings', icon: <StarOutlined /> },
          ]}
          size="small"
          style={{ marginBottom: 32 }}
        />

        <Form
          form={form}
          initialValues={formValues}
          onFinish={onFinish}
          preserve={true}
          layout="vertical">
          {/* Step 0: Basic Info */}
          {currentStep === 0 && (
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="title"
                  label="Course Title"
                  rules={[{ required: true, message: 'Please enter course title' }]}
                  tooltip="Give your course a catchy title">
                  <Input
                    size="large"
                    placeholder="e.g. Mastering Business English"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Course Description"
                  rules={[{ required: true, message: 'Please enter description' }]}
                  tooltip="Briefly describe your course">
                  <TextArea
                    rows={4}
                    placeholder="Write a short description to attract learners..."
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="templateId"
                  label="Course Template"
                  rules={[{ required: true, message: 'Please select a template' }]}>
                  <Select
                    size="large"
                    placeholder="Select template"
                    loading={templatesLoading}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Button
                          type="link"
                          style={{ width: '100%' }}
                          onClick={() => navigate('/teacher/course/create-template')}>
                          + Create new template
                        </Button>
                      </>
                    )}>
                    {templates?.data?.map((tpl) => (
                      <Option
                        key={tpl.id}
                        value={tpl.id}>
                        {tpl.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="topicIds"
                  label="Course Topics"
                  rules={[{ required: true, message: 'Please select at least one topic' }]}>
                  {topics?.data?.length ? (
                    <Select
                      size="large"
                      mode="multiple"
                      placeholder="Select topics"
                      loading={topicsLoading}>
                      {topics.data.map((t) => (
                        <Option
                          key={t.topicId}
                          value={t.topicId}>
                          {t.topicName}
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <Result
                      status="warning"
                      title="No topics available"
                      subTitle="Create topics before adding a course."
                      extra={<Button href="/topics/create">Create Topic</Button>}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Course Image">
                  <Upload.Dragger
                    {...uploadProps}
                    listType="picture-card">
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag image to upload</p>
                    <p className="ant-upload-hint">Supports JPG/PNG up to 10MB</p>
                  </Upload.Dragger>
                </Form.Item>
              </Col>
            </Row>
          )}
          {/* Step 1: Pricing */}
          {currentStep === 1 && (
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Base Price"
                  rules={[{ required: true, message: 'Please enter course price' }]}>
                  <InputNumber
                    min={0}
                    size="large"
                    prefix="$"
                    className="w-full"
                    placeholder="e.g. 100"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="discountPrice"
                  label="Discount Price (optional)">
                  <InputNumber
                    min={0}
                    size="large"
                    prefix="$"
                    className="w-full"
                    placeholder="e.g. 80"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
          {/* Step 2: Settings */}
          {currentStep === 2 && (
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="courseType"
                  label="Course Type"
                  rules={[{ required: true, message: 'Please select course type' }]}>
                  <Select
                    size="large"
                    placeholder="Select type">
                    {courseTypes.map((ct) => (
                      <Option
                        key={ct.label}
                        value={ct.value}>
                        {ct.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                {/* <Form.Item
                  name="languageId"
                  label="Language"
                  rules={[{ required: true, message: 'Please select language' }]}>
                  <Select
                    size="large"
                    placeholder="Select language"
                    loading={languagesLoading}>
                    {languages?.data.map((lang) => (
                      <Option
                        key={lang.id}
                        value={lang.languageId}>
                        {lang.languageName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item> */}
              </Col>
              <Col span={12}>
                <Form.Item
                  name="goalId"
                  label="Learning Goal"
                  rules={[{ required: true, message: 'Please select or create a goal' }]}>
                  {goalsLoading ? (
                    <Spin />
                  ) : (
                    <Select placeholder="Select goal">
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
              </Col>
              <Col span={12}>
                <Form.Item
                  name="courseLevel"
                  label="Course Level">
                  <Select
                    size="large"
                    placeholder="Select level">
                    {levels.map((l) => (
                      <Option
                        key={l.value}
                        value={l.value}>
                        {l.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="courseSkill"
                  label="Skill Level">
                  <Select
                    size="large"
                    placeholder="Select skill">
                    {skills.map((s) => (
                      <Option
                        key={s.value}
                        value={s.value}>
                        {s.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}
          {/* Navigation */}
          <div className="flex justify-end gap-3 mt-6">
            {currentStep > 0 && (
              <Button
                size="large"
                onClick={prev}>
                Previous
              </Button>
            )}
            {currentStep < 2 && (
              <Button
                type="primary"
                size="large"
                onClick={next}>
                Next →
              </Button>
            )}
            {currentStep === 2 && (
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={isPending}>
                🚀 Submit
              </Button>
            )}
          </div>
        </Form>
      </div>

      {/* Right: Preview Card */}
      <div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Image */}
          <div className="relative h-48 bg-gray-200">
            {fileList.length > 0 ? (
              <img
                src={URL.createObjectURL(fileList[0] as any)}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No image uploaded
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {formValues.title || 'Course Title Preview'}
            </h2>
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {formValues.description || 'Course description will appear here...'}
            </p>

            <div className="flex items-center justify-between mb-3">
              <span className="text-indigo-600 font-semibold">${formValues.price || '0.00'}</span>
              {formValues.discountPrice ? (
                <span className="text-gray-500 line-through ml-2">${formValues.discountPrice}</span>
              ) : null}
            </div>

            <div className="flex gap-2 text-xs text-gray-500">
              {formValues.courseLevel && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  Level {formValues.courseLevel}
                </span>
              )}
              {formValues.courseSkill && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  Skill {formValues.courseSkill}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
