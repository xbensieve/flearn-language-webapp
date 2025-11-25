/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
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
  Spin,
  Switch,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getCourseDetailService,
  getCourseTemplatesByProgramService,
  getTeachingProgramService,
  updateCourseService,
} from '../../services/course';
import { getTopicsService } from '../../services/topics';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { UploadCloud, Sparkles, DollarSign, Calendar, ArrowLeft, ChevronRight } from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CourseFormValues {
  title: string;
  description: string;
  programLevelCombo: string;
  topicIds: string[];
  templateId?: string;
  courseType: number;
  price?: number;
  learningOutcome: string;
  durationDays: number;
  gradingType: string;
}

const EditCoursePage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<CourseFormValues>();

  const [fileList, setFileList] = useState<any[]>([]);
  const [removeImage, setRemoveImage] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');
  const [formValues, setFormValues] = useState<Partial<CourseFormValues>>({});

  const courseType = Form.useWatch('courseType', form);

  // Fetch course detail
  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: () => getCourseDetailService(courseId!),
    enabled: !!courseId,
  });

  // Program + Level
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

  // Templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['courseTemplates', selectedProgramId, selectedLevelId],
    queryFn: () =>
      getCourseTemplatesByProgramService({
        programId: selectedProgramId,
        levelId: selectedLevelId,
      }),
    enabled: !!selectedProgramId && !!selectedLevelId,
    select: (data) => data.data || [],
  });

  // Topics
  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: getTopicsService,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateCourseService({ id: courseId!, payload }),
    onSuccess: () => {
      notifySuccess('Course updated successfully!');
      navigate(`/teacher/course/${courseId}`);
    },
    onError: (err: any) => {
      notifyError(err.response?.data?.message || 'Failed to update course');
    },
  });

  // Prefill form on course load
  useEffect(() => {
    if (!course) return;

    const programLevelKey = `${course.program.name} | ${course.program.level.name}`;

    setSelectedProgramId(course.program.programId);
    setSelectedLevelId(course.program.levelId);

    const values: Partial<CourseFormValues> = {
      title: course.title,
      description: course.description,
      programLevelCombo: programLevelKey,
      topicIds: course.topics?.map((t: any) => t.topicId.toString()) || [],
      templateId: course.templateId || undefined,
      courseType: Number(course.courseType) || 1,
      price: course.price ? Number(course.price) : undefined,
      learningOutcome: course.learningOutcome || '',
      durationDays: course.durationDays || 30,
      gradingType: course.gradingType?.toString() || '1',
    };

    form.setFieldsValue(values);

    // Set existing image
    if (course.imageUrl) {
      setFileList([
        {
          uid: '-1',
          name: 'current-image.jpg',
          status: 'done',
          url: course.imageUrl,
          thumbUrl: course.imageUrl,
        },
      ]);
    }
  }, [course, form]);

  const handleProgramLevelChange = (value: string) => {
    if (value) {
      const [programId, levelId] = value.split('|');
      setSelectedProgramId(programId);
      setSelectedLevelId(levelId);
    } else {
      setSelectedProgramId('');
      setSelectedLevelId('');
    }
  };

  const uploadProps = {
    fileList,
    onRemove: () => {
      setFileList([]);
      setRemoveImage(true);
      return true;
    },
    beforeUpload: (file: any) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Only image files allowed!');
        return Upload.LIST_IGNORE;
      }
      if (file.size / 1024 / 1024 > 10) {
        message.error('Image must be smaller than 10MB!');
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      setRemoveImage(false);
      return false;
    },
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
      // Validation failed
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
    const newImageFile = fileList[0]?.originFileObj;

    const payload: any = {
      title: values.title,
      description: values.description,
      LevelId: selectedLevelId,
      topicIds: values.topicIds,
      templateId: values.templateId || null,
      courseType: (values.courseType || 1).toString(),
      price: values.courseType === 2 ? (values.price || 0).toString() : '0',
      learningOutcome: values.learningOutcome,
      durationDays: values.durationDays,
      gradingType: values.gradingType,
      image: removeImage ? null : newImageFile || undefined,
    };
    console.log(values);

    updateMutation.mutate(payload);
  };

  if (loadingCourse) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  console.log(courseType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            type="text"
            icon={<ArrowLeft size={20} />}
          />
          <Title
            level={3}
            className="!mb-0 text-gray-900">
            Edit Course
          </Title>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form */}
          <div className="xl:col-span-2">
            <Card className="bg-white rounded-2xl shadow-lg border-0">
              <div className="p-8 border-b border-gray-100">
                <Steps
                  current={currentStep}
                  items={
                    courseType === 1
                      ? [{ title: 'Basic Info' }, { title: 'Settings' }]
                      : [{ title: 'Basic Info' }, { title: 'Pricing' }, { title: 'Settings' }]
                  }
                />
                <Progress
                  percent={((currentStep + 1) / courseType === 1 ? 2 : 3) * 100}
                  showInfo={false}
                  strokeColor="#2563eb"
                  className="mt-4"
                />
              </div>

              <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                className="p-8">
                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                  <div className="space-y-8">
                    <Title
                      level={2}
                      className="!mb-6">
                      <Form.Item
                        name="title"
                        noStyle
                        rules={[{ required: true, message: 'Title is required' }]}>
                        <Input
                          bordered={false}
                          placeholder="Enter your course title..."
                          className="text-4xl font-bold !p-0 hover:bg-gray-50 rounded-xl"
                          style={{ fontSize: '2.5rem', fontWeight: 700 }}
                        />
                      </Form.Item>
                    </Title>

                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="programLevelCombo"
                          label="Program & Level"
                          rules={[{ required: true, message: 'Please select program and level' }]}>
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
                              <Select.Option
                                key={t.topicId}
                                value={t.topicId.toString()}>
                                {t.topicName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="templateId"
                          label="Template">
                          <Select
                            placeholder="Select template (optional)"
                            loading={templatesLoading}
                            disabled={!selectedProgramId || !selectedLevelId}
                            allowClear>
                            {templates.map((t: any) => (
                              <Select.Option
                                key={t.templateId}
                                value={t.templateId}>
                                <div>
                                  <div className="font-medium">{t.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {t.unitCount} units • {t.lessonsPerUnit} lessons/unit •{' '}
                                    {t.exercisesPerLesson} exercises
                                  </div>
                                </div>
                              </Select.Option>
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
                          <Select>
                            <Select.Option value={1}>
                              <Space>
                                <Sparkles className="w-4 h-4 text-green-500" />
                                Free Course
                              </Space>
                            </Select.Option>
                            <Select.Option value={2}>
                              <Space>
                                <DollarSign className="w-4 h-4 text-blue-500" />
                                Paid Course
                              </Space>
                            </Select.Option>
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

                    <Form.Item label="Course Image">
                      <Upload.Dragger
                        {...uploadProps}
                        className="bg-gray-50 border-2 border-dashed rounded-2xl">
                        {fileList.length > 0 ? (
                          <img
                            src={fileList[0].url || URL.createObjectURL(fileList[0])}
                            alt="course"
                            className="w-full h-64 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="py-16 text-center">
                            <UploadCloud className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                            <Text className="text-lg">Drop image or click to upload</Text>
                            <Text type="secondary">JPG/PNG • Max 10MB</Text>
                          </div>
                        )}
                      </Upload.Dragger>
                      {fileList[0]?.url && (
                        <div className="mt-3 flex items-center gap-2">
                          <Switch
                            checked={removeImage}
                            onChange={setRemoveImage}
                            size="small"
                          />
                          <Text type="secondary">Remove current image</Text>
                        </div>
                      )}
                    </Form.Item>
                  </div>
                )}

                {/* Step 2: Pricing */}
                {currentStep === 1 && formValues.courseType === 2 && (
                  <div className="bg-blue-50 rounded-2xl p-10 text-center">
                    <DollarSign className="w-20 h-20 text-blue-600 mx-auto mb-6" />
                    <Title level={3}>Set Your Course Price</Title>
                    <Form.Item
                      name="price"
                      rules={[{ required: true, message: 'Price is required' }]}>
                      <InputNumber
                        size="large"
                        min={0}
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        className="!w-full max-w-xs mx-auto"
                        placeholder="1,500,000"
                        prefix="₫"
                        style={{ fontSize: '2rem' }}
                      />
                    </Form.Item>
                  </div>
                )}

                {/* Step 3: Settings */}
                {currentStep === (courseType === 1 ? 1 : 2) && (
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
                            <Select.Option value="1">AI Only</Select.Option>
                            <Select.Option value="2">AI + Teacher Review</Select.Option>
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
                    {!(currentStep === (courseType === 1 ? 2 : 3) - 1) && (
                      <Button
                        type="primary"
                        size="large"
                        onClick={next}>
                        Next <ChevronRight className="ml-2" />
                      </Button>
                    )}
                    {currentStep === (courseType === 1 ? 2 : 3) - 1 && (
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={updateMutation.isPending}
                        icon={<Sparkles className="mr-2" />}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        Save Changes
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
                <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <EyeOutlined className="text-2xl" />
                    <Title
                      level={4}
                      className="!text-white !m-0">
                      Live Preview
                    </Title>
                  </div>
                </div>
                <div className="p-6">
                  <div className="relative h-48 bg-gray-200 rounded-xl overflow-hidden mb-6">
                    {fileList.length > 0 ? (
                      <img
                        src={fileList[0].url || URL.createObjectURL(fileList[0])}
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
                    {form.getFieldValue('title') || course?.title || 'Untitled Course'}
                  </Title>
                  <Text
                    type="secondary"
                    className="line-clamp-2 block mt-2">
                    {form.getFieldValue('description') ||
                      course?.description ||
                      'No description yet...'}
                  </Text>

                  <div className="mt-6">
                    <Tag color={courseType === 1 ? 'green' : 'blue'}>
                      {courseType === 1 ? 'FREE' : 'PAID'}
                    </Tag>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(form.getFieldValue('topicIds') || course?.topics || [])
                      .slice(0, 3)
                      .map((t: any) => {
                        const topicName =
                          typeof t === 'object'
                            ? t.topicName
                            : topics?.data?.find((x: any) => x.topicId === t)?.topicName;
                        return topicName ? (
                          <Tag
                            key={t.topicId || t}
                            color="blue"
                            className="rounded-full">
                            {topicName}
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

export default EditCoursePage;
