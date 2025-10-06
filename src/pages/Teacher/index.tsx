/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Select, Upload, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getLanguages, submitTeacherApplication } from '../../services/teacherApplication';
import type { Language, TeacherApplicationRequest } from '../../services/teacherApplication/types';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import { notifySuccess } from '../../utils/toastConfig';

const { Option } = Select;
const { Title, Paragraph } = Typography;

const TeacherApplicationPage: React.FC = () => {
  const { data: languagesData, isLoading: loadingLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: TeacherApplicationRequest) => submitTeacherApplication(payload),
    onSuccess: () => notifySuccess('Application submitted successfully!'),
    onError: (err: AxiosError<any>) => {
      toast.error(err.response?.data.message || 'Failed to submit application.');
    },
  });

  const onFinish = (values: any) => {
    const payload: TeacherApplicationRequest = {
      LanguageID: values.languageId,
      Motivation: values.motivation,
      CredentialFiles: values.credentialFiles.map((file: any) => file.originFileObj),
      CredentialNames: values.credentialNames.split(',').map((s: string) => s.trim()),
      CredentialTypes: [1],
    };
    mutate(payload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col">
      {/* Hero Section */}
      <div className="text-center py-16 px-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <Title level={2} className="!text-4xl !font-extrabold mb-3">
          Join Our Global Teaching Community
        </Title>
        <Paragraph className="!text-lg text-blue-100 max-w-2xl mx-auto mb-0">
          Inspire learners worldwide and grow your teaching career with Flearn.
        </Paragraph>
      </div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto -mt-16 bg-white rounded-2xl shadow-xl p-10 w-[90%]"
      >
        <Title level={3} className="text-center text-gray-800 font-bold mb-6">
          Become a Teacher
        </Title>
        <Paragraph className="text-gray-600 text-center mb-10">
          Share your knowledge and help learners achieve their goals. Fill in the form below to get started.
        </Paragraph>

        <Form
          layout="vertical"
          onFinish={onFinish}
          className="space-y-6"
          size="large"
        >
          {/* Language */}
          <Form.Item
            name="languageId"
            label={<span className="font-medium text-gray-700">Choose Language</span>}
            rules={[{ required: true, message: 'Please select a language' }]}
          >
            <Select
              placeholder="Select the language you wish to teach"
              loading={loadingLanguages}
              className="rounded-md"
            >
              {languagesData?.data.map((lang: Language) => (
                <Option key={lang.languageId} value={lang.languageId}>
                  {lang.languageName} ({lang.languageCode})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Motivation */}
          <Form.Item
            name="motivation"
            label={<span className="font-medium text-gray-700">Your Motivation</span>}
            rules={[{ required: true, message: 'Please enter your motivation' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Tell us why you want to teach and what inspires you."
              className="rounded-md"
            />
          </Form.Item>

          {/* Credentials Upload */}
          <Form.Item
            name="credentialFiles"
            label={<span className="font-medium text-gray-700">Upload Credentials</span>}
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
            rules={[{ required: true, message: 'Please upload at least one file' }]}
          >
            <Upload multiple beforeUpload={() => false} className="w-full">
              <Button icon={<UploadOutlined />}>Click or Drag to Upload Files</Button>
            </Upload>
          </Form.Item>

          {/* Credential Names */}
          <Form.Item
            name="credentialNames"
            label={<span className="font-medium text-gray-700">Credential Names</span>}
            rules={[{ required: true }]}
          >
            <Input
              placeholder="e.g., Bachelor Degree, TESOL Certificate"
              className="rounded-md"
            />
          </Form.Item>

          {/* Credential Types */}
          <Form.Item
            name="credentialTypes"
            label={<span className="font-medium text-gray-700">Credential Types</span>}
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g., 1, 2" className="rounded-md" />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              className="w-full h-12 text-lg font-semibold rounded-md bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 shadow-md"
            >
              Submit Application
            </Button>
          </Form.Item>
        </Form>
      </motion.div>

      {/* Footer */}
      <div className="text-center mt-10 text-gray-500 text-sm mb-6">
        © {new Date().getFullYear()} Flearn — Empowering Global Education 🌍
      </div>
    </div>
  );
};

export default TeacherApplicationPage;
