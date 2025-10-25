/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Card,
  Row,
  Col,
  Switch,
  Spin,
  InputNumber,
  Tooltip,
  Typography,
  List,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getCourseDetailService,
  getCourseTemplatesService,
  updateCourseService,
} from '../../services/course';
import { getLanguages } from '../../services/teacherApplication';
import type { Topic } from '../../services/topics/type';
import type { CourseTemplate, GoalInfo } from '../../services/course/type';
import type { AxiosError } from 'axios';
import { getTopicsService } from '../../services/topics';
import { getGoalsService } from '../../services/goals';
import { getLevelTypeService, getSkillTypeService } from '../../services/enums';
import {
  ArrowLeft,
  BookOpen,
  Check,
  DollarSign,
  Edit,
  FileText,
  Globe,
  GraduationCap,
  ImageIcon,
  Lightbulb,
  Settings,
  Sparkles,
  Target,
  Users,
  Info,
  Sparkles as SparklesIcon,
} from 'lucide-react';
import { notifyError, notifySuccess } from '../../utils/toastConfig';

const { Option } = Select;
const { Title, Text } = Typography;

const EditCoursePage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplate | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // --- Queries ---
  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseDetailService(courseId!),
    enabled: !!courseId,
  });

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
    select: (data) => data.map((s) => ({ value: s.id, label: s.name })),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: FormData) => updateCourseService({ id: courseId!, payload }),
    onSuccess: () => {
      notifySuccess('Course updated successfully');
      navigate(`/teacher/course/${courseId}`);
    },
    onError: (error: AxiosError<any>) => {
      notifyError(error.response?.data?.message || 'Failed to update course');
    },
  });

  // --- Watchers ---
  const watchedTemplateId = Form.useWatch('templateId', form);
  const watchedType = Form.useWatch('type', form);

  // --- Handle dynamic template change ---
  useEffect(() => {
    if (watchedTemplateId && templates?.data) {
      const template = templates.data.find((t: CourseTemplate) => t.id === watchedTemplateId);
      setSelectedTemplate(template || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [watchedTemplateId, templates]);

  // Clear irrelevant fields when template changes
  useEffect(() => {
    if (selectedTemplate) {
      if (!selectedTemplate.requireGoal) form.setFieldValue('goalId', undefined);
      if (!selectedTemplate.requireLang) form.setFieldValue('language', undefined);
      if (!selectedTemplate.requireTopic) form.setFieldValue('topics', []);
      if (!selectedTemplate.requireLevel) form.setFieldValue('level', undefined);
      if (!selectedTemplate.requireSkillFocus) form.setFieldValue('skills', []);
    }
  }, [selectedTemplate]);

  // Optional: reset dependent fields when type changes
  useEffect(() => {
    if (watchedType) {
      form.setFieldsValue({ level: undefined, goalId: undefined });
    }
  }, [watchedType]);

  // --- Prefill form from backend ---
  useEffect(() => {
    if (course) {
      form.setFieldsValue({
        title: course.title,
        description: course.description,
        price: course.price,
        discountPrice: course.discountPrice,
        templateId: course.templateInfo?.templateId,
        language: course.languageInfo?.code,
        goalIds: course.goals?.map((g: GoalInfo) => g.id),
        level: course.courseLevel,
        type: course.courseType,
        topics: course.topics?.map((t: Topic) => t.topicId),
      });
      console.log(course.goals);
      setCurrentImage(course.imageUrl);
    }
  }, [course, form]);

  // --- Submit ---
  const handleFinish = (values: any) => {
    const payload = new FormData();

    try {
      payload.append('Title', values.title);
      payload.append('Description', values.description);
      payload.append('TemplateId', values.templateId);
      payload.append('Price', String(values.price));
      payload.append('DiscountPrice', String(values.discountPrice || 0));
      payload.append('Type', String(values.type));
      console.log(values);

      if (selectedTemplate?.requireGoal && values.goalIds?.length)
        values.goalIds.map((g: number) => payload.append('GoalIds', String(g)));
      if (selectedTemplate?.requireLevel && values.level)
        payload.append('Level', String(values.level));
      if (selectedTemplate?.requireLang && values.language)
        payload.append('LanguageCode', values.language);
      if (selectedTemplate?.requireTopic && values.topics?.length)
        payload.append('TopicIds', values.topics);
      if (removeImage) {
        payload.append('RemoveImage', 'true');
      } else if (values.image?.file) {
        payload.append('Image', values.image.file);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      return;
    }

    updateMutation.mutate(payload);
  };

  if (loadingCourse) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!course) return <div>No course found.</div>;

  // Tips content
  const tips = [
    {
      icon: Lightbulb,
      title: 'Craft a Killer Title',
      description:
        'Keep it under 60 characters—focus on benefits like "Master Python in 30 Days" to boost clicks!',
    },
    {
      icon: SparklesIcon,
      title: 'Engage with Descriptions',
      description:
        'Start with a hook: "Transform your skills..." Use bullet points for outcomes. Aim for 150-200 words.',
    },
    {
      icon: DollarSign,
      title: 'Smart Pricing Strategy',
      description:
        'Value-based? $49 for beginners, $99 for pros. Test discounts—20% off can increase conversions by 25%.',
    },
    {
      icon: Target,
      title: 'Template Magic',
      description:
        'Pick one that matches your style—pre-built lessons save hours. Customize freely later!',
    },
  ];

  // --- JSX ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Row gutter={24}>
          {/* Left: Form */}
          <Col span={16}>
            <Card
              className="shadow-xl rounded-3xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden h-fit"
              title={
                <div className="flex items-center gap-3">
                  <Tooltip title="Back to course overview">
                    <Button
                      onClick={() => navigate(-1)}
                      type="default"
                      className="rounded-xl shadow-sm border-gray-200 hover:border-sky-300 transition-all flex items-center gap-1">
                      <ArrowLeft size={16} />
                      Back
                    </Button>
                  </Tooltip>
                  <div className="flex items-center gap-2">
                    <Edit
                      size={20}
                      className="text-sky-600"
                    />
                    <Title
                      level={2}
                      className="!mb-0 text-gray-800">
                      Edit Course
                    </Title>
                  </div>
                </div>
              }>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                className="space-y-6">
                {/* Template */}
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings
                      size={20}
                      className="text-sky-600"
                    />
                    <Text
                      strong
                      className="text-sky-800">
                      Course Template
                    </Text>
                  </div>
                  <Form.Item
                    label={
                      <span className="flex items-center gap-2">
                        <BookOpen
                          size={16}
                          className="text-gray-600"
                        />
                        Select Template
                      </span>
                    }
                    name="templateId"
                    rules={[{ required: true, message: 'Template is required' }]}>
                    <Select
                      placeholder="Choose a pre-built structure"
                      loading={templatesLoading}
                      allowClear
                      suffixIcon={
                        <Settings
                          size={16}
                          className="text-gray-400"
                        />
                      }>
                      {templates?.data?.map((tpl: CourseTemplate) => (
                        <Option
                          key={tpl.id}
                          value={tpl.id}>
                          {tpl.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                {/* Basic Info */}
                <div className="p-4 bg-sky-100 rounded-2xl border border-sky-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb
                      size={20}
                      className="text-sky-600"
                    />
                    <Text
                      strong
                      className="text-sky-800">
                      Basic Information
                    </Text>
                  </div>
                  <Form.Item
                    label={
                      <span className="flex items-center gap-2">
                        <BookOpen
                          size={16}
                          className="text-gray-600"
                        />
                        Course Title
                      </span>
                    }
                    name="title"
                    rules={[{ required: true, message: 'Please enter course title' }]}>
                    <Input
                      placeholder="e.g., Mastering Business English"
                      prefix={
                        <BookOpen
                          size={16}
                          className="text-gray-400"
                        />
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="flex items-center gap-2">
                        <FileText
                          size={16}
                          className="text-gray-600"
                        />
                        Description
                      </span>
                    }
                    name="description"
                    rules={[{ required: true, message: 'Please enter course description' }]}>
                    <Input.TextArea
                      rows={3}
                      placeholder="What will learners gain? Highlight key benefits..."
                    />
                  </Form.Item>
                </div>

                {/* Pricing */}
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign
                      size={20}
                      className="text-sky-600"
                    />
                    <Text
                      strong
                      className="text-sky-800">
                      Pricing
                    </Text>
                  </div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span className="flex items-center gap-2">
                            <DollarSign
                              size={16}
                              className="text-gray-600"
                            />
                            Price (VNĐ)
                          </span>
                        }
                        name="price"
                        rules={[{ required: true, message: 'Please enter price' }]}>
                        <InputNumber
                          min={0}
                          placeholder="e.g., 1,000,000"
                          formatter={(value) =>
                            value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫' : ''
                          }
                          prefix={
                            <DollarSign
                              size={16}
                              className="text-gray-400"
                            />
                          }
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <span className="flex items-center gap-2">
                            <Sparkles
                              size={16}
                              className="text-sky-500"
                            />
                            Discount Price (VNĐ, optional)
                          </span>
                        }
                        name="discountPrice">
                        <InputNumber
                          min={0}
                          placeholder="e.g., 800,000"
                          formatter={(value) =>
                            value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫' : ''
                          }
                          prefix={
                            <DollarSign
                              size={16}
                              className="text-gray-400"
                            />
                          }
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* Course Type */}
                <div className="p-4 bg-sky-100 rounded-2xl border border-sky-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Users
                      size={20}
                      className="text-sky-600"
                    />
                    <Text
                      strong
                      className="text-sky-800">
                      Course Type
                    </Text>
                  </div>
                  <Form.Item
                    label={
                      <span className="flex items-center gap-2">
                        <Users
                          size={16}
                          className="text-gray-600"
                        />
                        Type
                      </span>
                    }
                    name="type"
                    rules={[{ required: true, message: 'Please select course type' }]}>
                    <Select
                      placeholder="Select type"
                      suffixIcon={
                        <Users
                          size={16}
                          className="text-gray-400"
                        />
                      }>
                      <Option value="1">Basic</Option>
                      <Option value="2">Advanced</Option>
                    </Select>
                  </Form.Item>
                </div>

                {/* Conditional Fields */}
                {selectedTemplate?.requireLang && (
                  <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
                    <Form.Item
                      label={
                        <span className="flex items-center gap-2">
                          <Globe
                            size={16}
                            className="text-gray-600"
                          />
                          Language
                        </span>
                      }
                      name="language"
                      rules={[{ required: true, message: 'Language is required' }]}>
                      <Select
                        placeholder="Select language"
                        loading={languagesLoading}
                        suffixIcon={
                          <Globe
                            size={16}
                            className="text-gray-400"
                          />
                        }
                        options={languages?.data.map((lang) => ({
                          value: lang.langCode,
                          label: lang.langName,
                        }))}
                      />
                    </Form.Item>
                  </div>
                )}

                {selectedTemplate?.requireGoal && (
                  <div className="p-4 bg-sky-100 rounded-2xl border border-sky-200">
                    <Form.Item
                      label={
                        <span className="flex items-center gap-2">
                          <Target
                            size={16}
                            className="text-gray-600"
                          />
                          Goals
                        </span>
                      }
                      name="goalIds"
                      rules={[
                        {
                          required: true,
                          type: 'array',
                          min: 1,
                          message: 'Please select at least one goal',
                        },
                      ]}>
                      <Select
                        mode="multiple"
                        placeholder="Select one or more goals"
                        loading={goalsLoading}
                        maxTagCount="responsive"
                        suffixIcon={
                          <Target
                            size={16}
                            className="text-gray-400"
                          />
                        }
                        options={goals?.data.map((goal: any) => ({
                          value: goal.id,
                          label: goal.name,
                        }))}
                      />
                    </Form.Item>
                  </div>
                )}

                {selectedTemplate?.requireLevel && (
                  <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
                    <Form.Item
                      label={
                        <span className="flex items-center gap-2">
                          <GraduationCap
                            size={16}
                            className="text-gray-600"
                          />
                          Level
                        </span>
                      }
                      name="level"
                      rules={[{ required: true, message: 'Level is required' }]}>
                      <Select
                        placeholder="Select level"
                        loading={levelsLoading}
                        suffixIcon={
                          <GraduationCap
                            size={16}
                            className="text-gray-400"
                          />
                        }
                        options={levels}
                      />
                    </Form.Item>
                  </div>
                )}

                {selectedTemplate?.requireSkillFocus && (
                  <div className="p-4 bg-sky-100 rounded-2xl border border-sky-200">
                    <Form.Item
                      label={
                        <span className="flex items-center gap-2">
                          <Sparkles
                            size={16}
                            className="text-gray-600"
                          />
                          Skill Focus
                        </span>
                      }
                      name="skills"
                      rules={[{ required: true, message: 'Please select skills' }]}>
                      <Select
                        mode="multiple"
                        placeholder="Select skills"
                        loading={skillsLoading}
                        maxTagCount="responsive"
                        suffixIcon={
                          <Sparkles
                            size={16}
                            className="text-gray-400"
                          />
                        }
                        options={skills}
                      />
                    </Form.Item>
                  </div>
                )}

                {selectedTemplate?.requireTopic && (
                  <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
                    <Form.Item
                      label={
                        <span className="flex items-center gap-2">
                          <Target
                            size={16}
                            className="text-gray-600"
                          />
                          Topics
                        </span>
                      }
                      name="topics"
                      rules={[{ required: true, message: 'Select at least one topic' }]}>
                      <Select
                        mode="multiple"
                        placeholder="Select topics"
                        loading={topicsLoading}
                        maxTagCount="responsive"
                        suffixIcon={
                          <Target
                            size={16}
                            className="text-gray-400"
                          />
                        }
                        options={topics?.data.map((topic: Topic) => ({
                          value: topic.topicId,
                          label: topic.topicName,
                        }))}
                      />
                    </Form.Item>
                  </div>
                )}

                {/* Image */}
                <div className="p-4 bg-sky-100 rounded-2xl border border-sky-200">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon
                      size={20}
                      className="text-sky-600"
                    />
                    <Text
                      strong
                      className="text-sky-800">
                      Course Image
                    </Text>
                  </div>
                  {currentImage && !removeImage && (
                    <div className="mb-4 p-4 bg-white rounded-xl shadow-sm">
                      <img
                        src={currentImage}
                        alt="course"
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                      <div className="mt-3 flex items-center gap-3">
                        <Switch
                          checked={removeImage}
                          onChange={setRemoveImage}
                          checkedChildren="Remove"
                          unCheckedChildren="Keep"
                        />
                        <Text type="secondary">Current image</Text>
                      </div>
                    </div>
                  )}
                  {!removeImage && (
                    <Form.Item
                      name="image"
                      valuePropName="file"
                      label={
                        <span className="flex items-center gap-2">
                          <ImageIcon
                            size={16}
                            className="text-gray-600"
                          />
                          Upload New Image
                        </span>
                      }>
                      <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        className="border-dashed border-2 border-gray-300 hover:border-sky-400 transition-colors">
                        <Button icon={<UploadOutlined />}>Select Image (JPG/PNG, max 10MB)</Button>
                      </Upload>
                    </Form.Item>
                  )}
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Tooltip title="Save all changes">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={updateMutation.isPending}
                      className="rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700"
                      icon={<Check size={16} />}>
                      Save Changes
                    </Button>
                  </Tooltip>
                </div>
              </Form>
            </Card>
          </Col>

          {/* Right: Tips Sidebar */}
          <Col span={8}>
            <Card
              className="h-fit rounded-2xl shadow-md border-0 bg-white/80 backdrop-blur-sm sticky top-8"
              title={
                <div className="flex items-center gap-2">
                  <Info
                    size={20}
                    className="text-sky-600"
                  />
                  <Text
                    strong
                    className="text-sky-800">
                    Quick Tips
                  </Text>
                </div>
              }>
              <List
                dataSource={tips}
                renderItem={(tip) => (
                  <List.Item className="p-3 border-0 hover:bg-sky-50 rounded-lg transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <tip.icon
                          size={16}
                          className="text-sky-600"
                        />
                      </div>
                      <div className="flex-1">
                        <Text
                          strong
                          className="text-gray-800 block mb-1">
                          {tip.title}
                        </Text>
                        <Text
                          type="secondary"
                          className="text-sm leading-relaxed">
                          {tip.description}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
                className="p-0"
                style={{ background: 'transparent' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EditCoursePage;
