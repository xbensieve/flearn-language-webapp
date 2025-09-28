/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Card,
  Row,
  Col,
  message,
  Steps,
  Result,
} from 'antd';
import { UploadOutlined, BookOutlined, DollarOutlined, StarOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createCourseService, getCourseTemplatesService } from '../../services/course';
import { getTopicsService } from '../../services/topics';
import { getLanguages } from '../../services/teacherApplication';
import GoalSelect from './components/GoalSelect';
import type { CreateCourseRequest } from '../../services/course/type';

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

  // mutation
  const { mutate: createCourse, isPending } = useMutation({
    mutationFn: createCourseService,
    onSuccess: () => {
      message.success('Course created successfully!');
      form.resetFields();
      setFileList([]);
      setCurrentStep(0);
    },
    onError: () => {
      message.error('Failed to create course. Please try again.');
    },
  });

  // fetch data
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['courseTemplates'],
    queryFn: getCourseTemplatesService,
  });
  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: getTopicsService,
  });
  const { data: languages, isLoading: languagesLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
  });

  // Course settings lists
  const courseTypes = [
    { value: 0, label: 'Video Course' },
    { value: 1, label: 'Interactive Course' },
    { value: 2, label: 'Live Course' },
    { value: 2, label: 'Self-Paced Course' },
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
      setFormValues((prev) => ({ ...prev, ...values })); // save step data
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

  const onFinish = (values: CourseFormValues) => {
    console.log(values);
    console.log(formValues);
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
    console.log(payload);
    createCourse(payload);
  };

  return (
    <Card style={{ maxWidth: 900, margin: '0 auto' }}>
      <Steps
        current={currentStep}
        items={[
          { title: 'Basic Information', icon: <BookOutlined /> },
          { title: 'Pricing', icon: <DollarOutlined /> },
          { title: 'Course Settings', icon: <StarOutlined /> },
        ]}
      />

      <Form
        form={form}
        initialValues={formValues}
        onFinish={onFinish}
        preserve={true}
        layout='vertical'
        style={{ marginTop: 24 }}
      >
        {/* Step 0: Basic Info */}
        {currentStep === 0 && (
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name='title'
                label='Course Title'
                rules={[{ required: true, message: 'Please enter course title' }]}
              >
                <Input placeholder='Enter course title' />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name='description'
                label='Course Description'
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <TextArea rows={3} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='templateId'
                label='Course Template'
                rules={[{ required: true, message: 'Please select a template' }]}
              >
                <Select placeholder='Select template' loading={templatesLoading}>
                  {templates?.data?.map((tpl) => (
                    <Option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='topicIds'
                label='Course Topics'
                rules={[{ required: true, message: 'Please select at least one topic' }]}
              >
                {topics?.data?.length ? (
                  <Select loading={topicsLoading} mode='multiple' placeholder='Select topics'>
                    {topics.data.map((t) => (
                      <Option key={t.topicId} value={t.topicId}>
                        {t.topicName}
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <Result
                    status='warning'
                    title='No topics available'
                    subTitle='You must create topics first before adding a course.'
                    extra={<Button href='/topics/create'>Create Topic</Button>}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label='Course Image'>
                <Upload {...uploadProps} listType='picture'>
                  <Button icon={<UploadOutlined />}>Upload Image</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Step 1: Pricing */}
        {currentStep === 1 && (
          <Card title='Pricing' bordered={false}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name='price'
                  label='Base Price'
                  rules={[{ required: true, message: 'Please enter course price' }]}
                >
                  <InputNumber min={0} prefix='$' className='w-full' placeholder='e.g. 100' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name='discountPrice' label='Discount Price (if any)'>
                  <InputNumber min={0} prefix='$' className='w-full' placeholder='e.g. 80' />
                </Form.Item>
                <span style={{ fontSize: 12, color: '#999' }}>Leave blank if no discount</span>
              </Col>
            </Row>
          </Card>
        )}

        {/* Step 2: Settings */}
        {currentStep === 2 && (
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name='courseType'
                label='Course Type'
                rules={[{ required: true, message: 'Please select course type' }]}
              >
                <Select placeholder='Select type'>
                  {courseTypes.map((ct) => (
                    <Option key={ct.label} value={ct.value}>
                      {ct.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='languageId'
                label='Language'
                rules={[{ required: true, message: 'Please select language' }]}
              >
                {languages?.data?.length ? (
                  <Select loading={languagesLoading} placeholder='Select language'>
                    {languages.data.map((lang) => (
                      <Option key={lang.languageId} value={lang.languageId}>
                        {lang.languageName}
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <Result
                    status='warning'
                    title='No languages available'
                    subTitle='You must create a language first.'
                    extra={<Button href='/languages/create'>Create Language</Button>}
                  />
                )}
              </Form.Item>
            </Col>
            <GoalSelect form={form} />
            <Col span={12}>
              <Form.Item name='courseLevel' label='Course Level'>
                <Select placeholder='Select level'>
                  {levels.map((l) => (
                    <Option key={l.value} value={l.value}>
                      {l.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='courseSkill' label='Skill Level'>
                <Select placeholder='Select skill'>
                  {skills.map((s) => (
                    <Option key={s.value} value={s.value}>
                      {s.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Navigation Buttons */}
        <div style={{ marginTop: 24 }} className='flex justify-end'>
          {currentStep > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={prev}>
              Previous
            </Button>
          )}
          {currentStep < 2 && (
            <Button type='primary' onClick={next}>
              Next
            </Button>
          )}
          {currentStep === 2 && (
            <Button type='primary' htmlType='submit' loading={isPending}>
              Submit
            </Button>
          )}
        </div>
      </Form>
    </Card>
  );
};

export default CreateCourse;
