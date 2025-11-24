/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Teacher/EditCoursePage.tsx
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
import type { CreateCourseRequest } from '../../services/course/type';
import { UploadCloud, Sparkles, DollarSign, Calendar, ArrowLeft, ChevronRight } from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;

const EditCoursePage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [removeImage, setRemoveImage] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Partial<any>>({});

  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');

  const courseTypeWatch = Form.useWatch('courseType', form) || 1;

  // Fetch course detail
  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: () => getCourseDetailService(courseId!),
    enabled: !!courseId,
  });

  // Fetch program + level combos
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

  // Fetch templates based on selected program & level
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

  // Fetch topics
  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: getTopicsService,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CreateCourseRequest) => updateCourseService({ id: courseId!, payload }),
    onSuccess: () => {
      notifySuccess('Course updated successfully!');
      navigate(`/teacher/course/${courseId}`);
    },
    onError: (err: any) => {
      notifyError(err.response?.data?.message || 'Failed to update course');
    },
  });

  // Prefill form when course loads
  useEffect(() => {
    if (course) {
      const programLevelKey = `${course.programId}|${course.LevelId}`;

      setSelectedProgramId(course.programId);
      setSelectedLevelId(course.LevelId);

      const values = {
        title: course.title,
        description: course.description,
        programLevelCombo: programLevelKey,
        topicIds: course.topics?.map((t: any) => t.topicId.toString()) || [],
        templateId: course.templateId,
        courseType: Number(course.courseType) || 1,
        price: course.price ? Number(course.price) : undefined,
        learningOutcome: course.learningOutcome || '',
        durationDays: course.durationDays || 30,
        gradingType: course.gradingType?.toString() || '1',
      };

      form.setFieldsValue(values);
      setFormValues(values);

      if (course.imageUrl) {
        setFileList([
          {
            uid: '-1',
            name: 'current-image.jpg',
            status: 'done',
            url: course.imageUrl,
          },
        ]);
      }
    }
  }, [course, form]);

  const handleProgramLevelChange = (value: string) => {
    if (value) {
      const [programId, levelId] = value.split('|');
      setSelectedProgramId(programId);
      setSelectedLevelId(levelId);
      form.setFieldsValue({ programId, levelId });
    } else {
      setSelectedProgramId('');
      setSelectedLevelId('');
    }
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setRemoveImage(true);
      return true;
    },
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
      setRemoveImage(false);
      return false;
    },
    fileList,
  };

  const next = async () => {
    try {
      const values = await form.validateFields();
      setFormValues((prev) => ({ ...prev, ...values }));
      setCurrentStep((s) => (values.courseType === 1 && s === 0 ? 2 : s + 1));
    } catch {
      return;
    }
  };

  const prev = () => {
    setCurrentStep((s) => (formValues.courseType === 1 && s === 2 ? 0 : s - 1));
  };

  const onFinish = (values: any) => {
    const newFile = fileList[0]?.originFileObj || (fileList[0] as unknown as File);

    const payload: CreateCourseRequest = {
      title: values.title || course?.title,
      description: values.description || course?.description,
      LevelId: selectedLevelId || course?.LevelId || '',
      topicIds: values.topicIds || course?.topics?.map((t: any) => t.topicId.toString()) || [],
      templateId: values.templateId || course?.templateId,
      courseType: (values.courseType || course?.courseType || 1).toString(),
      price: values.courseType === 2 ? (values.price || 0).toString() : '0',
      image: removeImage ? null : newFile || undefined,
      learningOutcome: values.learningOutcome || course?.learningOutcome || '',
      durationDays: values.durationDays || course?.durationDays || 30,
      gradingType: values.gradingType || course?.gradingType?.toString() || '1',
    };

    updateMutation.mutate(payload);
  };

  if (loadingCourse) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-8 py-6 shadow-sm'>
        <div className='max-w-7xl mx-auto flex items-center gap-4'>
          <Button onClick={() => navigate(-1)} type='text'>
            <ArrowLeft size={20} />
          </Button>
          <Title level={3} className='!mb-0 text-gray-900'>
            Edit Course
          </Title>
        </div>
      </div>

      <div className='max-w-7xl mx-auto py-8'>
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
          {/* Form */}
          <div className='xl:col-span-2'>
            <Card className='bg-white rounded-2xl shadow-lg border-0'>
              {/* Steps */}
              <div className='p-8 border-b border-gray-100'>
                <Steps
                  current={currentStep}
                  items={
                    courseTypeWatch === 1
                      ? (['Basic Info', 'Settings'] as any[])
                      : (['Basic Info', 'Pricing', 'Settings'] as any[])
                  }
                />
                <Progress
                  percent={((currentStep + 1) / (courseTypeWatch === 1 ? 2 : 3)) * 100}
                  showInfo={false}
                  strokeColor='#2563eb'
                  className='mt-4'
                />
              </div>

              <Form form={form} onFinish={onFinish} layout='vertical' className='p-8'>
                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                  <div className='space-y-8'>
                    <div>
                      <Title level={2} className='!mb-6'>
                        <Form.Item name='title' noStyle rules={[{ required: true }]}>
                          <Input
                            bordered={false}
                            placeholder='Enter your course title...'
                            className='text-4xl font-bold !p-0 hover:bg-gray-50 rounded-xl'
                            style={{ fontSize: '2.5rem', fontWeight: 700 }}
                          />
                        </Form.Item>
                      </Title>
                    </div>

                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name='programLevelCombo'
                          label='Program & Level'
                          rules={[{ required: true }]}
                        >
                          <Select
                            placeholder='Select program and level'
                            loading={programLevelsLoading}
                            options={programOptions}
                            onChange={handleProgramLevelChange}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name='topicIds' label='Topics' rules={[{ required: true }]}>
                          <Select
                            mode='multiple'
                            placeholder='Select topics'
                            loading={topicsLoading}
                          >
                            {topics?.data?.map((t: any) => (
                              <Select.Option key={t.topicId} value={t.topicId.toString()}>
                                {t.topicName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name='templateId' label='Template'>
                          <Select
                            placeholder='Select template'
                            loading={templatesLoading}
                            disabled={!selectedProgramId || !selectedLevelId}
                          >
                            {templates.map((t: any) => (
                              <Select.Option key={t.templateId} value={t.templateId}>
                                <div>
                                  <div className='font-medium'>{t.name}</div>
                                  <div className='text-xs text-gray-500'>
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
                        <Form.Item name='courseType' label='Type' rules={[{ required: true }]}>
                          <Select>
                            <Select.Option value={1}>
                              <Space>
                                <Sparkles className='w-4 h-4 text-green-500' />
                                Free Course
                              </Space>
                            </Select.Option>
                            <Select.Option value={2}>
                              <Space>
                                <DollarSign className='w-4 h-4 text-blue-500' />
                                Paid Course
                              </Space>
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name='description' label='Description' rules={[{ required: true }]}>
                      <TextArea
                        rows={6}
                        placeholder='Write a compelling description...'
                        className='rounded-xl'
                      />
                    </Form.Item>

                    <Form.Item
                      label='Image'
                      rules={[{ required: !fileList.length && !course?.imageUrl }]}
                    >
                      <Upload.Dragger
                        {...uploadProps}
                        className='bg-gray-50 border-2 border-dashed rounded-2xl'
                      >
                        {fileList.length > 0 ? (
                          <img
                            src={fileList[0].url || URL.createObjectURL(fileList[0])}
                            alt='thumb'
                            className='w-full h-64 object-cover rounded-xl'
                          />
                        ) : (
                          <div className='py-16 text-center'>
                            <UploadCloud className='w-16 h-16 text-blue-500 mx-auto mb-4' />
                            <Text className='text-lg'>Drop image or click to upload</Text>
                            <Text type='secondary'>JPG/PNG • Max 10MB</Text>
                          </div>
                        )}
                      </Upload.Dragger>
                      {fileList[0]?.url && (
                        <div className='mt-2 flex items-center gap-2'>
                          <Switch checked={removeImage} onChange={setRemoveImage} size='small' />
                          <Text type='secondary'>Remove current image</Text>
                        </div>
                      )}
                    </Form.Item>
                  </div>
                )}

                {/* Step 2: Pricing (Paid only) */}
                {currentStep === 1 && courseTypeWatch === 2 && (
                  <div className='bg-blue-50 rounded-2xl p-10 text-center'>
                    <DollarSign className='w-20 h-20 text-blue-600 mx-auto mb-6' />
                    <Title level={3}>Set Your Course Price</Title>
                    <Form.Item name='price' rules={[{ required: true }]}>
                      <InputNumber
                        size='large'
                        min={0}
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        className='!w-full max-w-xs mx-auto'
                        placeholder='1,500,000'
                        prefix='₫'
                        style={{ fontSize: '2rem' }}
                      />
                    </Form.Item>
                  </div>
                )}

                {/* Step 3: Settings */}
                {currentStep === (courseTypeWatch === 1 ? 1 : 2) && (
                  <div className='space-y-8'>
                    <Form.Item
                      name='learningOutcome'
                      label='What Students Will Learn'
                      rules={[{ required: true }]}
                    >
                      <TextArea
                        rows={5}
                        placeholder='Students will be able to...'
                        className='rounded-xl'
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name='durationDays'
                          label='Duration (days)'
                          rules={[{ required: true }]}
                        >
                          <InputNumber
                            min={1}
                            className='w-full'
                            prefix={<Calendar className='text-blue-500' />}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name='gradingType'
                          label='Grading Type'
                          rules={[{ required: true }]}
                        >
                          <Select>
                            <Select.Option value='1'>AI</Select.Option>
                            <Select.Option value='2'>AI and Teacher</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Navigation */}
                <div className='flex justify-between pt-8 border-t border-gray-200'>
                  <Button size='large' onClick={prev} disabled={currentStep === 0}>
                    Previous
                  </Button>
                  <Space>
                    {currentStep < (courseTypeWatch === 1 ? 1 : 2) && (
                      <Button type='primary' size='large' onClick={next}>
                        Next <ChevronRight className='ml-2' />
                      </Button>
                    )}
                    {currentStep === (courseTypeWatch === 1 ? 1 : 2) && (
                      <Button
                        type='primary'
                        size='large'
                        htmlType='submit'
                        loading={updateMutation.isPending}
                        className='bg-gradient-to-r from-blue-600 to-indigo-600'
                      >
                        Save Changes <Sparkles className='ml-2' />
                      </Button>
                    )}
                  </Space>
                </div>
              </Form>
            </Card>
          </div>

          {/* Live Preview */}
          <div className='xl:col-span-1'>
            <div className='sticky top-8'>
              <Card className='bg-white !rounded-2xl shadow-lg border-0 overflow-hidden'>
                <div className='bg-gradient-to-br from-blue-400 to-indigo-500 p-6 text-white'>
                  <div className='flex items-center gap-3 mb-2'>
                    <EyeOutlined className='text-2xl' />
                    <Title level={4} className='!text-white !m-0'>
                      Live Preview
                    </Title>
                  </div>
                </div>
                <div className='p-6'>
                  <div className='relative h-48 bg-gray-200 rounded-xl overflow-hidden mb-6'>
                    {fileList.length > 0 ? (
                      <img
                        src={fileList[0].url || URL.createObjectURL(fileList[0])}
                        alt='preview'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='flex items-center justify-center h-full bg-gray-100'>
                        <UploadCloud className='w-16 h-16 text-gray-400' />
                      </div>
                    )}
                  </div>

                  <Title level={4} className='line-clamp-2'>
                    {form.getFieldValue('title') || course?.title || 'Your Course Title'}
                  </Title>
                  <Text type='secondary' className='line-clamp-2 block mt-2'>
                    {form.getFieldValue('description') ||
                      course?.description ||
                      'No description yet...'}
                  </Text>

                  <div className='mt-6 flex items-center justify-between'>
                    <Tag color={courseTypeWatch === 1 ? 'green' : 'blue'}>
                      {courseTypeWatch === 1 ? 'FREE' : 'PAID'}
                    </Tag>
                  </div>

                  <div className='mt-4 flex flex-wrap gap-2'>
                    {(form.getFieldValue('topicIds') || course?.topics || [])
                      .slice(0, 3)
                      .map((t: any) => (
                        <Tag key={t.topicId || t} color='blue' className='rounded-full'>
                          {t.topicName ||
                            topics?.data?.find((x: any) => x.topicId === t)?.topicName}
                        </Tag>
                      ))}
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
