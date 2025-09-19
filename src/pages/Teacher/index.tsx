/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Select, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getLanguages, submitTeacherApplication } from '../../services/teacherApplication';
import type { Language, TeacherApplicationRequest } from '../../services/teacherApplication/types';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

const { Option } = Select;

const TeacherApplicationPage: React.FC = () => {
  // Fetch languages
  const { data: languagesData, isLoading: loadingLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
  });

  // Mutation for submitting form
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: TeacherApplicationRequest) => submitTeacherApplication(payload),
    onSuccess: () => {
      message.success('Application submitted successfully!');
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
      CredentialTypes: [1],
    };

    console.log(values);

    try {
      mutate(payload);
    } catch (err) {
      console.error('Mutate failed before sending:', err);
    }
  };

  return (
    <div className='max-w-2xl mx-auto bg-white p-6 rounded shadow'>
      <h1 className='text-2xl font-bold mb-4'>Teacher Application</h1>

      <Form layout='vertical' onFinish={onFinish}>
        <Form.Item
          name='languageId'
          label='Choose Language'
          rules={[{ required: true, message: 'Please select a language' }]}
        >
          <Select placeholder='Select language' loading={loadingLanguages}>
            {languagesData?.data.map((lang: Language) => (
              <Option key={lang.languageId} value={lang.languageId}>
                {lang.languageName} ({lang.languageCode})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name='motivation'
          label='Motivation'
          rules={[{ required: true, message: 'Please enter motivation' }]}
        >
          <Input.TextArea rows={4} placeholder='Why do you want to teach?' />
        </Form.Item>

        <Form.Item
          name='credentialFiles'
          label='Upload Credential Files'
          valuePropName='fileList'
          getValueFromEvent={(e) => e.fileList}
          rules={[{ required: true, message: 'Upload at least one file' }]}
        >
          <Upload multiple beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>Upload Files</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          name='credentialNames'
          label='Credential Names (comma separated)'
          rules={[{ required: true }]}
        >
          <Input placeholder='e.g., Bachelor Degree, TESOL' />
        </Form.Item>

        <Form.Item
          name='credentialTypes'
          label='Credential Types (comma separated integers)'
          rules={[{ required: true }]}
        >
          <Input placeholder='e.g., 1, 2' />
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit' loading={isPending}>
            Submit Application
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TeacherApplicationPage;
