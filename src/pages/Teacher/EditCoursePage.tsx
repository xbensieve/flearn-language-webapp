/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Row,
  Col,
  Card,
  Space,
  Tag,
  Switch,
  Spin,
  Typography,
  message,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getCourseDetailService,
  getCourseTemplatesService,
  updateCourseService,
} from '../../services/course';
import { getTopicsService } from '../../services/topics';
import type { Topic } from '../../services/topics/type';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { UploadCloud, Sparkles, DollarSign, Calendar, ArrowLeft } from 'lucide-react';
import type { UploadFile } from 'antd';
import type { CreateCourseRequest } from '../../services/course/type';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CourseFormValues {
  title: string;
  description: string;
  templateId: string;
  topicIds: string[];
  courseType: number;
  price?: number;
  learningOutcome?: string;
  durationDays?: number;
  gradingType?: string;
}

const courseTypes = [
  { value: 1, label: 'Free Course' },
  { value: 2, label: 'Paid Course' },
];

const gradingType = [
  { value: '1', label: 'AI' },
  { value: '2', label: 'AI and Teacher' },
];

const EditCoursePage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<CourseFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [formValues, setFormValues] = useState<Partial<CourseFormValues>>({});
  const [removeImage, setRemoveImage] = useState(false);

  // Watch individual fields for live preview
  const watchedTitle = Form.useWatch('title', form);
  const watchedDescription = Form.useWatch('description', form);
  const watchedPrice = Form.useWatch('price', form);
  const watchedTopicIds = Form.useWatch('topicIds', form);
  const watchedCourseType = Form.useWatch('courseType', form);

  const courseType = watchedCourseType ?? formValues.courseType ?? 1;

  // Queries
  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseDetailService(courseId!),
    enabled: !!courseId,
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['courseTemplates'],
    queryFn: () => getCourseTemplatesService(),
    select: (data) => data.data,
  });

  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: getTopicsService,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CreateCourseRequest) =>
      updateCourseService({ id: courseId!, payload }),
    onSuccess: () => {
      notifySuccess('Course updated successfully!');
      navigate(`/teacher/course/${courseId}`);
    },
    onError: (err: any) => {
      notifyError(err.response?.data?.message || 'Failed to update course');
    },
  });

  // Prefill form + initial formValues
  useEffect(() => {
    if (course) {
      const values: CourseFormValues = {
        title: course.title,
        description: course.description,
        templateId: course.templateId,
        topicIds: course.topics?.map((t: Topic) => t.topicId.toString()) || [],
        courseType: Number(course.courseType) || 1,
        price: course.price,
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

  // Sync watched fields → formValues for live preview
  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      title: watchedTitle ?? prev.title,
      description: watchedDescription ?? prev.description,
      price: watchedPrice ?? prev.price,
      topicIds: watchedTopicIds ?? prev.topicIds,
      courseType: watchedCourseType ?? prev.courseType,
    }));
  }, [watchedTitle, watchedDescription, watchedPrice, watchedTopicIds, watchedCourseType]);

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

  const onFinish = (values: CourseFormValues) => {
    const newFile = fileList[0] as unknown as File;
    console.log(newFile);

    const payload: CreateCourseRequest = {
      title: values.title || course?.title || '',
      description: values.description || course?.description || '',
      templateId: values.templateId || course?.templateId || '',
      topicIds: values.topicIds.length > 0
        ? values.topicIds
        : course?.topics?.map((t: Topic) => t.topicId.toString()) || [],
      courseType: (values.courseType ?? course?.courseType ?? 1).toString(),
      price: (values.price ?? course?.price ?? 0).toString(),
      image: newFile,
      learningOutcome: values.learningOutcome || course?.learningOutcome || '',
      durationDays: values.durationDays ?? course?.durationDays ?? 30,
      gradingType: values.gradingType ?? course?.gradingType?.toString() ?? '1',
    };

    updateMutation.mutate(payload);
  };

  if (loadingCourse) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (!course) return <div>No course found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate(-1)} type="text">
              <ArrowLeft size={20} />
            </Button>
            <Title level={3} className="!mb-0 text-gray-900">Edit Course</Title>
          </div>
          <Button type="primary" icon={<EyeOutlined />} size="large">
            Preview
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form */}
          <div className="xl:col-span-2">
            <Card className="bg-white rounded-2xl shadow-lg border-0">
              <Form form={form} onFinish={onFinish} layout="vertical" className="p-8">
                <div className="space-y-8">
                  {/* Title */}
                  <div>
                    <Title level={2} className="flex items-center gap-4 !mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {formValues.title?.[0] || 'C'}
                      </div>
                      <Form.Item name="title" noStyle rules={[{ required: true }]}>
                        <Input
                          bordered={false}
                          placeholder="Enter your course title..."
                          className="text-4xl font-bold !p-0 hover:bg-gray-50 rounded-xl"
                          style={{ fontSize: '2.5rem', fontWeight: 700 }}
                        />
                      </Form.Item>
                    </Title>
                  </div>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="topicIds" label="Topics" rules={[{ required: true }]}>
                        <Select mode="multiple" placeholder="Select topics" loading={topicsLoading}>
                          {topics?.data?.map((t: Topic) => (
                            <Select.Option key={t.topicId} value={t.topicId.toString()}>
                              {t.topicName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="templateId" label="Template" rules={[{ required: true }]}>
                        <Select placeholder="Select template" loading={templatesLoading}>
                          {templates?.map((t: any) => (
                            <Select.Option key={t.templateId} value={t.templateId}>
                              {t.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="courseType" label="Type" rules={[{ required: true }]}>
                    <Select>
                      {courseTypes.map((ct) => (
                        <Select.Option key={ct.value} value={ct.value}>
                          <Space>
                            {ct.value === 1 ? <Sparkles className="w-4 h-4 text-green-500" /> : <DollarSign className="w-4 h-4 text-blue-500" />}
                            {ct.label}
                          </Space>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                    <TextArea rows={6} placeholder="Write a compelling description..." className="rounded-xl" />
                  </Form.Item>

                  {courseType === 2 && (
                    <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                      <InputNumber
                        min={0}
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        className="w-full"
                        placeholder="1,500,000"
                        prefix="₫"
                        style={{ fontSize: '1.5rem' }}
                      />
                    </Form.Item>
                  )}

                  <Form.Item name="learningOutcome" label="What Students Will Learn">
                    <TextArea rows={5} placeholder="Students will be able to..." className="rounded-xl" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="durationDays" label="Duration (days)">
                        <InputNumber min={1} className="w-full" prefix={<Calendar className="text-blue-500" />} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="gradingType" label="Grading Type">
                        <Select>
                          {gradingType.map((g) => (
                            <Select.Option key={g.value} value={g.value}>{g.label}</Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="Image" rules={[{ required: !fileList.length && !course.imageUrl, message: 'Image required' }]}>
                    <Upload.Dragger {...uploadProps} className="bg-gray-50 border-2 border-dashed rounded-2xl">
                      {fileList.length > 0 ? (
                        <img
                          src={fileList[0].url || URL.createObjectURL(fileList[0] as any)}
                          alt="thumb"
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
                    {fileList[0]?.url && !fileList[0]?.originFileObj && (
                      <div className="mt-2 flex items-center gap-2">
                        <Switch
                          checked={removeImage}
                          onChange={(c) => {
                            setRemoveImage(c);
                            if (c) setFileList([]);
                          }}
                          size="small"
                        />
                        <Text type="secondary">Remove current image</Text>
                      </div>
                    )}
                  </Form.Item>

                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={updateMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600"
                      icon={<Sparkles className="mr-2" />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Form>
            </Card>
          </div>

          {/* Live Preview */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <Card className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
                <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <EyeOutlined className="text-2xl" />
                    <Title level={4} className="!text-white !m-0">Live Preview</Title>
                  </div>
                </div>

                <div className="p-6">
                  <div className="relative h-48 bg-gray-200 rounded-xl overflow-hidden mb-6">
                    {fileList.length > 0 ? (
                      <img
                        src={fileList[0].url || URL.createObjectURL(fileList[0] as any)}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <UploadCloud className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <Title level={4} className="line-clamp-2">
                    {formValues.title || 'Your Course Title'}
                  </Title>
                  <Text type="secondary" className="line-clamp-2 block mt-2">
                    {formValues.description || 'No description yet...'}
                  </Text>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-600">
                      {courseType === 2
                        ? `${Number(formValues.price || 0).toLocaleString('vi-VN')} ₫`
                        : 'FREE'}
                    </div>
                    <Tag color={courseType === 1 ? 'green' : 'blue'}>
                      {courseType === 1 ? 'FREE' : 'PAID'}
                    </Tag>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(formValues.topicIds || []).slice(0, 3).map((id) => {
                      const topic = topics?.data?.find((t: any) => t.topicId.toString() === id);
                      return topic ? (
                        <Tag key={id} color="blue" className="rounded-full">
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

export default EditCoursePage;