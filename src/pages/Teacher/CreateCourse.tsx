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
  Typography,
  Card,
  Progress,
} from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createCourseService, getCourseTemplatesService } from '../../services/course';
import { getTopicsService } from '../../services/topics';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import type { CreateCourseRequest } from '../../services/course/type';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenText,
  Calendar,
  DollarSign,
  Image,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  UploadCloud,
  Eye,
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
  learningOutcome: string;
  durationDays: number;
  gradingType: string;
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

  const courseTypeWatch = Form.useWatch('courseType', form);

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['courseTemplates'],
    queryFn: () => getCourseTemplatesService(),
    select: (data) => data.data,
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
      if (errorData?.errors && typeof errorData.errors === 'object') {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => notifyError(`${field}: ${msg}`));
          } else {
            notifyError(`${field}: ${String(messages)}`);
          }
        });
        return;
      }
      notifyError(errorData?.message || 'Failed to create course.');
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

  const next = async () => {
    try {
      const values = await form.validateFields();
      setFormValues((prev) => ({ ...prev, ...values }));
      setCurrentStep((s) => {
        if (values.courseType === 1 && s === 0) return 2;
        return s + 1;
      });
    } catch {
      console.log('validation failed');
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

  const steps = courseTypeWatch === 1
    ? ['Basic Info', 'Settings']
    : ['Basic Info', 'Pricing', 'Settings'];

  return (
    <div className="min-h-screen bg-gradient-to-br bg-transparent p-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen blur-3xl opacity-15 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            <Title level={2} className="!m-0 font-black tracking-tight">
              Launch Your Masterpiece
            </Title>
          </div>
          <Text className="text-lg block mt-3">
            Craft a course that inspires thousands
          </Text>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="xl:col-span-2">
            <Card className="bg-white/12 backdrop-blur-3xl border-white/20 shadow-2xl rounded-3xl overflow-hidden">
              {/* Steps */}
              <div className="p-8 border-b border-white/10">
                <Steps
                  current={currentStep}
                  items={steps.map((title, i) => ({
                    title: <span className="text-black font-medium">{title}</span>,
                    icon: i === currentStep ? <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div> : null,
                  }))}
                  className="site-navigation-steps"
                />
                <Progress percent={((currentStep + 1) / steps.length) * 100} showInfo={false} strokeColor="#06b6d4" className="mt-4" />
              </div>

              <Form form={form} initialValues={formValues} onFinish={onFinish} layout="vertical" className="p-8">
                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
                        <Input size="large" prefix={<BookOpenText className="text-cyan-400" />} placeholder="e.g. Advanced React Mastery" />
                      </Form.Item>

                      <Form.Item name="courseType" label="Type" rules={[{ required: true, message: 'Type is required' }]}>
                        <Select size="large" placeholder="Free or Paid?">
                          {courseTypes.map(ct => (
                            <Option key={ct.value} value={ct.value}>
                              <div className="flex items-center gap-2">
                                {ct.value === 1 ? <Sparkles className="w-4 h-4 text-green-400" /> : <DollarSign className="w-4 h-4 text-yellow-400" />}
                                {ct.label}
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>

                    <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Description is required' }]}>
                      <TextArea rows={4} placeholder="What will students learn? Be inspiring!" />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Form.Item name="templateId" label="Template" rules={[{ required: true, message: 'Template is required' }]}>
                        <Select size="large" loading={templatesLoading} placeholder="Choose structure">
                          {templates?.map(tpl => (
                            <Option key={tpl.templateId} value={tpl.templateId}>{tpl.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item name="topicIds" label="Topics" rules={[{ required: true, message: 'Topics is required' }]}>
                        <Select mode="multiple" placeholder="Select relevant topics" loading={topicsLoading}>
                          {topics?.data?.map(t => (
                            <Option key={t.topicId} value={t.topicId}>{t.topicName}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>

                    <Form.Item required name="image" label="Image" rules={[
                      { required: true, message: 'Image is required' }
                    ]}>
                      <Upload.Dragger {...uploadProps} className="bg-white/10 backdrop-blur-xl border-2 border-dashed border-white/30 hover:border-cyan-400 transition-all">
                        {fileList.length > 0 ? (
                          <img src={URL.createObjectURL(fileList[0])} alt="thumb" className="w-full h-48 object-cover rounded-xl" />
                        ) : (
                          <div className="py-10">
                            <UploadCloud className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                            <Text className="text-white">Drop image here or click to upload</Text>
                            <Text className="text-blue-300 text-xs block mt-2">Max 10MB • JPG/PNG</Text>
                          </div>
                        )}
                      </Upload.Dragger>
                    </Form.Item>
                  </div>
                )}

                {/* Step 2: Pricing */}
                {currentStep === 1 && formValues.courseType === 2 && (
                  <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                      <DollarSign className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                      <Title level={3} className="!text-black">Set Your Price</Title>
                    </div>
                    <Row gutter={24}>
                      <Col span={24}>
                        <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Price is required' }]}>
                          <InputNumber
                            className="!w-full"
                            size="large"
                            min={0}
                            formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫' : ''}
                            placeholder="1,500,000"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Step 3: Settings */}
                {currentStep === (formValues.courseType === 1 ? 1 : 2) && (
                  <div className="space-y-6">
                    <Form.Item name="learningOutcome" label="Learning Outcome" rules={[{ required: true, message: 'Learning Outcome is required' }]}>
                      <TextArea rows={5} placeholder="Students will be able to..." />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Form.Item name="durationDays" label="Duration (days)" rules={[{ required: true, message: 'Duration is required' }]}>
                        <InputNumber min={1} className="w-full" size="large" prefix={<Calendar className="text-cyan-400" />} />
                      </Form.Item>

                      <Form.Item name="gradingType" label="Grading Type" rules={[{ required: true, message: 'Grading is required' }]}>
                        <Select size="large">
                          {gradingType.map(g => (
                            <Option key={g.value} value={g.value}>{g.label}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center pt-8 border-t border-white/10">
                  <Button size="large" onClick={prev} disabled={currentStep === 0} className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20">
                    Previous
                  </Button>

                  <div className="flex gap-4">
                    {currentStep < steps.length - 1 && (
                      <Button type="primary" size="large" onClick={next} className="bg-gradient-to-r from-cyan-500 to-blue-600 border-0 shadow-xl hover:shadow-cyan-500/50">
                        Next <ChevronRight className="ml-2" />
                      </Button>
                    )}
                    {currentStep === steps.length - 1 && (
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => onFinish(form.getFieldsValue())}
                        loading={isPending}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 border-0 shadow-xl hover:shadow-emerald-500/50 px-12"
                      >
                        <Sparkles className="mr-2" /> Launch Course
                      </Button>
                    )}
                  </div>
                </div>
              </Form>
            </Card>
          </div>

          {/* Live Preview */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white backdrop-blur-3xl rounded-3xl p-6 borde mb-6">
                <div className="flex items-center gap-3">
                  <Eye className="w-8 h-8 text-cyan-400" />
                  <div>
                    <Title level={4} className="!m-0">Live Preview</Title>
                    <Text className="!text-blue-500">See it come to life</Text>
                  </div>
                </div>
              </div>

              <Card className="bg-white/12 backdrop-blur-3xl border-white/20 shadow-2xl overflow-hidden">
                <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900">
                  {fileList.length > 0 ? (
                    <img src={URL.createObjectURL(fileList[0])} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Image className="w-20 h-20 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-6 right-6">
                    <Title level={3} className="!text-white !m-0 line-clamp-2">
                      {formValues.title || 'Your Course Title'}
                    </Title>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <Text className="text-blue-200 line-clamp-3">
                    {formValues.description || 'Students will learn amazing things...'}
                  </Text>

                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-2xl font-bold text-white">
                        {formValues.courseType === 2 ? `${Number(formValues.price).toLocaleString('vi-VN')} ₫` : 'Free'}
                      </Text>
                    </div>
                    <div className="bg-cyan-500/20 text-cyan-500 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-xl">
                      {formValues.courseType === 1 ? 'FREE' : 'PREMIUM'}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formValues.topicIds?.slice(0, 3).map((id, i) => (
                      <span key={i} className="bg-white/10 backdrop-blur-xl px-3 py-1 rounded-full text-xs text-blue-200">
                        {topics?.data?.find(t => t.topicId === id)?.topicName || 'Topic'}
                      </span>
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


export default CreateCourse;