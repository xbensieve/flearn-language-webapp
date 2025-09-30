/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getLanguages, submitTeacherApplication } from '../../services/teacherApplication';
import type { Language, TeacherApplicationRequest } from '../../services/teacherApplication/types';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import { notifySuccess } from '../../utils/toastConfig';

const { Option } = Select;

const TeacherApplicationPage: React.FC = () => {
  // Fetch languages
  const { data: languagesData, isLoading: loadingLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
  });

  // Mutation
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: TeacherApplicationRequest) => submitTeacherApplication(payload),
    onSuccess: () => {
      notifySuccess('Application submitted successfully!');
    },
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
      CredentialTypes: [1], // still fixed here – maybe map later
    };
    mutate(payload);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Become a Teacher</h1>
        <p className="text-gray-600 mb-8">
          Share your knowledge and inspire learners worldwide. Fill in the application below.
        </p>

        <Form
          layout="vertical"
          onFinish={onFinish}
          className="space-y-6">
          <Form.Item
            name="languageId"
            label={<span className="font-medium text-gray-700">Choose Language</span>}
            rules={[{ required: true, message: 'Please select a language' }]}>
            <Select
              placeholder="Select language"
              loading={loadingLanguages}
              className="rounded-md">
              {languagesData?.data.map((lang: Language) => (
                <Option
                  key={lang.languageId}
                  value={lang.languageId}>
                  {lang.languageName} ({lang.languageCode})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="motivation"
            label={<span className="font-medium text-gray-700">Motivation</span>}
            rules={[{ required: true, message: 'Please enter motivation' }]}>
            <Input.TextArea
              rows={4}
              placeholder="Why do you want to teach?"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="credentialFiles"
            label={<span className="font-medium text-gray-700">Upload Credentials</span>}
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
            rules={[{ required: true, message: 'Upload at least one file' }]}>
            <Upload
              multiple
              beforeUpload={() => false}
              className="w-full">
              <Button icon={<UploadOutlined />}>Upload Files</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="credentialNames"
            label={<span className="font-medium text-gray-700">Credential Names</span>}
            rules={[{ required: true }]}>
            <Input
              placeholder="e.g., Bachelor Degree, TESOL"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="credentialTypes"
            label={<span className="font-medium text-gray-700">Credential Types</span>}
            rules={[{ required: true }]}>
            <Input
              placeholder="e.g., 1, 2"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              className="w-full h-12 text-lg font-semibold rounded-md">
              Submit Application
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default TeacherApplicationPage;
