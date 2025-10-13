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
  Result,
  message,
  Spin,
  Typography,
  Card,
} from 'antd';
import { UploadOutlined, BookOutlined, DollarOutlined, SettingOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createCourseService, getCourseTemplatesService } from '../../services/course';
import { getTopicsService } from '../../services/topics';
import { getGoalsService } from '../../services/goals';
import { getLevelTypeService, getSkillTypeService } from '../../services/enums';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import type { CreateCourseRequest } from '../../services/course/type';
import type { AxiosError } from 'axios';
import { getLanguages } from '../../services/teacherApplication';

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
  goalId: number;
  Level?: number;
  courseSkill?: number;
}

const CreateCourse: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [form] = Form.useForm<CourseFormValues>();
  const [fileList, setFileList] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Partial<CourseFormValues>>({});
  const navigate = useNavigate();

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

  const { data: languages, isLoading: languagesLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
  });

  const { data: levels, isLoading: levelsLoading } = useQuery({
    queryKey: ['levels'],
    queryFn: getLevelTypeService,
    select: (data) => data.map((level) => ({ value: level.id, label: level.name })),
  });

  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: getSkillTypeService,
    select: (data) => data.map((level) => ({ value: level.id, label: level.name })),
  });

  const { mutate: createCourse, isPending } = useMutation({
    mutationFn: createCourseService,
    onSuccess: () => {
      notifySuccess('🎉 Course created successfully!');
      form.resetFields();
      setFileList([]);
      setCurrentStep(0);
    },
    onError: (err: AxiosError<any>) => {
      notifyError(err.response?.data?.message || 'Failed to create course.');
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
      setCurrentStep((s) => s + 1);
    } catch {
      return;
    }
  };

  const prev = async () => {
    const values = await form.getFieldsValue();
    setFormValues((prev) => ({ ...prev, ...values }));
    setCurrentStep((s) => s - 1);
  };

  const handleTemplateChange = (value: string) => {
    const tpl = templates?.data?.find((t) => t.id === value);
    setSelectedTemplate(tpl || null);
    form.setFieldsValue({ templateId: value });
  };

  const onFinish = (values: CourseFormValues) => {
    const payload: CreateCourseRequest = {
      title: formValues.title || values.title,
      description: formValues.description || values.description,
      topicIds: formValues.topicIds || values.topicIds,
      courseType: Number(values.courseType),
      goalId: Number(values.goalId),
      Level: Number(values.Level),
      courseSkill: Number(values.courseSkill),
      templateId: formValues.templateId || values.templateId,
      price: Number(formValues.price),
      discountPrice: Number(formValues.discountPrice),
      image: fileList[0] as unknown as File,
    };
    createCourse(payload);
  };

  const courseTypes = [
    { value: 0, label: 'Video Course' },
    { value: 1, label: 'Interactive Course' },
    { value: 2, label: 'Live Course' },
    { value: 3, label: 'Self-Paced Course' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Title
          level={2}
          className="text-gray-800 mb-6">
          ✏️ Create New Course
        </Title>

        <Card className="shadow-lg rounded-2xl p-8">
          <Steps
            current={currentStep}
            items={[
              { title: 'Basic Info', icon: <BookOutlined /> },
              { title: 'Pricing', icon: <DollarOutlined /> },
              { title: 'Settings', icon: <SettingOutlined /> },
            ]}
            className="mb-10"
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
                  <>
                    <Form.Item
                      name="title"
                      label="Course Title"
                      rules={[{ required: true, message: 'Please enter course title' }]}>
                      <Input
                        size="large"
                        placeholder="e.g. Mastering Business English"
                      />
                    </Form.Item>

                    <Form.Item
                      name="description"
                      label="Description"
                      rules={[{ required: true, message: 'Please enter description' }]}>
                      <TextArea
                        rows={4}
                        placeholder="Describe what learners will gain..."
                      />
                    </Form.Item>

                    <Form.Item
                      name="templateId"
                      label="Course Template"
                      rules={[{ required: true, message: 'Please select a template' }]}>
                      <Select
                        size="large"
                        placeholder="Select template"
                        loading={templatesLoading}
                        onChange={handleTemplateChange}
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

                    <Form.Item
                      name="topicIds"
                      label="Topics"
                      rules={[{ required: true, message: 'Please select topics' }]}>
                      {topics?.data?.length ? (
                        <Select
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
                          title="No topics found"
                          subTitle="Create topics before adding a course."
                        />
                      )}
                    </Form.Item>

                    <Form.Item label="Course Image">
                      <Upload.Dragger
                        {...uploadProps}
                        listType="picture-card">
                        <p className="ant-upload-drag-icon">
                          <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag to upload</p>
                        <p className="ant-upload-hint">JPG/PNG only, max 10MB</p>
                      </Upload.Dragger>
                    </Form.Item>
                  </>
                )}

                {currentStep === 1 && (
                  <>
                    <Form.Item
                      name="price"
                      label="Base Price"
                      rules={[{ required: true, message: 'Please enter course price' }]}>
                      <InputNumber
                        min={0}
                        prefix="$"
                        size="large"
                        className="w-full"
                        placeholder="e.g. 100"
                      />
                    </Form.Item>

                    <Form.Item
                      name="discountPrice"
                      label="Discount Price (optional)">
                      <InputNumber
                        min={0}
                        prefix="$"
                        size="large"
                        className="w-full"
                        placeholder="e.g. 80"
                      />
                    </Form.Item>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <Form.Item
                      name="courseType"
                      label="Course Type"
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
                      name="goalId"
                      label="Learning Goal"
                      rules={
                        selectedTemplate?.requireGoal
                          ? [{ required: true, message: 'Goal is required for this template' }]
                          : []
                      }>
                      {goalsLoading ? (
                        <Spin />
                      ) : (
                        <Select
                          size="large"
                          placeholder="Select goal">
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
                          label="Level"
                          rules={
                            selectedTemplate?.requireLevel
                              ? [{ required: true, message: 'Level is required for this template' }]
                              : []
                          }>
                          <Select
                            loading={levelsLoading}
                            size="large"
                            placeholder="Select level">
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
                      <Col span={12}>
                        <Form.Item
                          name="courseSkill"
                          rules={
                            selectedTemplate?.requireSkillFocus
                              ? [
                                  {
                                    required: true,
                                    message: 'Skill Focus is required for this template',
                                  },
                                ]
                              : []
                          }
                          label="Skill Level">
                          <Select
                            loading={skillsLoading}
                            size="large"
                            placeholder="Select skill">
                            {skills?.map((s) => (
                              <Option
                                key={s.value}
                                value={s.value}>
                                {s.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="languageId"
                          label="Language"
                          rules={
                            selectedTemplate?.requireLang
                              ? [
                                  {
                                    required: true,
                                    message: 'Language is required for this template',
                                  },
                                ]
                              : []
                          }>
                          <Select
                            loading={languagesLoading}
                            size="large"
                            placeholder="Select language">
                            {languages?.data?.map((lang) => (
                              <Option
                                key={lang.id}
                                value={lang.langCode}>
                                {lang.langName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )}

                {/* Navigation */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  {currentStep > 0 && (
                    <Button
                      size="large"
                      onClick={prev}>
                      ← Previous
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

            {/* Right: Preview */}
            <div className="sticky top-10">
              <Card className="rounded-xl shadow-md overflow-hidden">
                <div className="h-56 bg-gray-100 relative">
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
                <div className="p-5">
                  <Title level={4}>{formValues.title || 'Course Title Preview'}</Title>
                  <Text
                    type="secondary"
                    className="block mb-3">
                    {formValues.description || 'Course description will appear here.'}
                  </Text>

                  <div className="flex items-center gap-2 mb-3">
                    <Text
                      strong
                      className="text-indigo-600 text-lg">
                      ${formValues.price || '0.00'}
                    </Text>
                    {formValues.discountPrice && (
                      <Text
                        delete
                        className="text-gray-500">
                        ${formValues.discountPrice}
                      </Text>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {formValues.Level && (
                      <span className="bg-gray-100 px-3 py-1 rounded-full">
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
