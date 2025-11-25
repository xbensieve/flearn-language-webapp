/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  TimePicker,
  Row,
  Col,
  Typography,
  Divider,
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { getLanguagesService } from '../../../services/language';
import { createClassService } from '../../../services/class';
import type { CreateClassRequest } from '../../../services/class/type';
import dayjs from 'dayjs';
import {
  BookOutlined,
  // GlobalOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  // VideoCameraOutlined,
  FileTextOutlined,
  RocketOutlined,
} from '@ant-design/icons';

import { notifyError, notifySuccess } from '../../../utils/toastConfig';
import { getTeachingProgramService } from '@/services/course';

const { TextArea } = Input;
const { Text } = Typography;

interface CreateClassFormProps {
  visible: boolean;
  onClose: () => void;
}

const CreateClassForm: React.FC<CreateClassFormProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // const { data: languages, isLoading: isLoadingLanguages } = useQuery({
  //   queryKey: ['languages'],
  //   queryFn: getLanguagesService,
  // });

  // Inside your CreateClassForm component
  const { data: programsRes, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ['teaching-programs'],
    queryFn: () => getTeachingProgramService({ pageNumber: 1, pageSize: 1000 }),
    select: (data) => data.data,
  });

  const { mutate: createClass, isPending: isCreating } = useMutation({
    mutationFn: (data: CreateClassRequest) => createClassService(data),
    onSuccess: (res) => {
      notifySuccess(res.message || 'Class created successfully!');
      form.resetFields();
      onClose();
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: any) => {
      notifyError(error.response?.data?.message || 'Failed to create class.');
    },
  });

  const onFinish = (values: any) => {
    const classData: CreateClassRequest = {
      ...values,
      classDate: values.classDate.format('YYYY-MM-DD'),
      startTime: values.startTime.format('HH:mm:ss'),
      programAssignmentId: values.programAssignmentId,
    };
    createClass(classData);
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-3 py-2">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl">
            <RocketOutlined className="text-white text-xl" />
          </div>
          <div>
            <div className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Create New Class
            </div>
            <Text className="text-gray-500 text-sm">Fill in the details to launch your class</Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      confirmLoading={isCreating}
      width={800}
      okText="Create Class"
      cancelText="Cancel"
      okButtonProps={{
        className:
          'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 border-0 shadow-lg h-10 px-6 font-semibold',
        icon: <RocketOutlined />,
      }}
      cancelButtonProps={{
        className: 'h-10 px-6',
      }}
      styles={{
        header: {
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '16px',
        },
        body: {
          paddingTop: '24px',
        },
      }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}>
        {/* Basic Information Section */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <BookOutlined className="text-blue-700 text-lg" />
            </div>
            <Text className="text-base font-semibold text-gray-800">Basic Information</Text>
          </div>

          <Form.Item
            name="title"
            label={
              <span className="text-gray-700 font-medium">
                <FileTextOutlined className="mr-2" />
                Class Title
              </span>
            }
            rules={[{ required: true, message: 'Please enter a title' }]}>
            <Input
              placeholder="e.g., Advanced English Conversation"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <span className="text-gray-700 font-medium">
                <FileTextOutlined className="mr-2" />
                Description
              </span>
            }
            rules={[{ required: true, message: 'Please enter a description' }]}>
            <TextArea
              rows={4}
              placeholder="Describe what students will learn in this class..."
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="programAssignmentId"
            label={
              <span className="text-gray-700 font-medium">
                <BookOutlined className="mr-2" />
                Teaching Program
              </span>
            }
            rules={[{ required: true, message: 'Please select a teaching program' }]}>
            <Select
              showSearch
              loading={isLoadingPrograms}
              placeholder="Search and select a teaching program"
              size="large"
              className="rounded-lg"
              optionFilterProp="children"
              options={programsRes?.map((program) => ({
                value: program.programAssignmentId,
                label: `${program.programName} - ${program.levelName}`,
              }))}
            />
          </Form.Item>

          {/* <Form.Item
            name="languageID"
            label={
              <span className="text-gray-700 font-medium">
                <GlobalOutlined className="mr-2" />
                Language
              </span>
            }
            rules={[{ required: true, message: 'Please select a language' }]}>
            <Select
              loading={isLoadingLanguages}
              placeholder="Select teaching language"
              size="large"
              className="rounded-lg">
              {languages?.data.map((lang) => (
                <Select.Option
                  key={lang.id}
                  value={lang.id}>
                  {lang.langName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item> */}
        </div>

        <Divider className="my-6" />

        {/* Schedule Section */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <CalendarOutlined className="text-indigo-700 text-lg" />
            </div>
            <Text className="text-base font-semibold text-gray-800">Schedule & Duration</Text>
          </div>

          <Row gutter={16}>
            <Col
              xs={24}
              md={12}>
              <Form.Item
                name="classDate"
                label={
                  <span className="text-gray-700 font-medium">
                    <CalendarOutlined className="mr-2" />
                    Class Date
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select a date' },
                  {
                    validator: (_, value) => {
                      if (value && value.isBefore(dayjs().add(7, 'day'))) {
                        return Promise.reject('Class date must be at least 7 days from now');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}>
                <DatePicker
                  className="w-full rounded-lg"
                  size="large"
                  format="DD/MM/YYYY"
                  placeholder="Select date"
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              md={12}>
              <Form.Item
                name="startTime"
                label={
                  <span className="text-gray-700 font-medium">
                    <ClockCircleOutlined className="mr-2" />
                    Start Time
                  </span>
                }
                rules={[{ required: true, message: 'Please select a time' }]}>
                <TimePicker
                  format="HH:mm"
                  className="w-full rounded-lg"
                  size="large"
                  placeholder="Select time"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="durationMinutes"
            label={
              <span className="text-gray-700 font-medium">
                <ClockCircleOutlined className="mr-2" />
                Duration
              </span>
            }
            rules={[{ required: true, message: 'Please select a duration' }]}>
            <Select
              placeholder="Select class duration"
              size="large"
              className="rounded-lg">
              <Select.Option value={45}>
                <div className="flex items-center justify-between">
                  <span>45 minutes</span>
                  <Text
                    type="secondary"
                    className="text-xs">
                    Quick session
                  </Text>
                </div>
              </Select.Option>
              <Select.Option value={60}>
                <div className="flex items-center justify-between">
                  <span>60 minutes</span>
                  <Text
                    type="secondary"
                    className="text-xs">
                    Standarded
                  </Text>
                </div>
              </Select.Option>
              <Select.Option value={90}>
                <div className="flex items-center justify-between">
                  <span>90 minutes</span>
                  <Text
                    type="secondary"
                    className="text-xs">
                    Extended
                  </Text>
                </div>
              </Select.Option>
              <Select.Option value={120}>
                <div className="flex items-center justify-between">
                  <span>120 minutes</span>
                  <Text
                    type="secondary"
                    className="text-xs">
                    Deep dive
                  </Text>
                </div>
              </Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Divider className="my-6" />

        {/* Pricing & Meeting Link Section */}
        <div className="mb-2">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <DollarOutlined className="text-green-700 text-lg" />
            </div>
            <Text className="text-base font-semibold text-gray-800">Pricing & Meeting Details</Text>
          </div>

          <Row gutter={16}>
            <Col
              xs={24}
              md={12}>
              <Form.Item
                name="pricePerStudent"
                label={
                  <span className="text-gray-700 font-medium">
                    <DollarOutlined className="mr-2" />
                    Price per Student (VNĐ)
                  </span>
                }
                initialValue={100000}
                rules={[{ required: true, message: 'Please enter a price' }]}>
                <InputNumber<number>
                  min={0}
                  className="rounded-lg"
                  size="large"
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value?.replace(/[.,]/g, '') || 0)}
                  placeholder="Enter price"
                />
              </Form.Item>
            </Col>

            {/* <Col
              xs={24}
              md={12}>
              <Form.Item
                name="googleMeetLink"
                label={
                  <span className="text-gray-700 font-medium">
                    <VideoCameraOutlined className="mr-2" />
                    Google Meet Link
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: 'Please enter a Google Meet link',
                  },
                  { type: 'url', message: 'Please enter a valid URL' },
                ]}>
                <Input
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>
            </Col> */}
          </Row>
        </div>

        {/* Helper Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
          <Text className="text-blue-800 text-sm">
            <BookOutlined className="mr-2" />
            <strong>Note:</strong> Your class will be created as a draft. You can review and publish
            it later from the class details page.
          </Text>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateClassForm;
