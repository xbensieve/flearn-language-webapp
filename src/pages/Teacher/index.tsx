/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Select, Upload, DatePicker, Typography, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getLanguages } from '../../services/teacherApplication';
import { submitTeacherApplication } from '../../services/teacherApplication';
import { getCertificatesByLanguageService } from '../../services/certificates';
import type { Language, TeacherApplicationRequest } from '../../services/teacherApplication/types';
import { toast } from 'react-toastify';
import { notifySuccess } from '../../utils/toastConfig';
import type { AxiosError } from 'axios';
import type { Certificate } from '../../services/certificates/type';

const { Option } = Select;
const { Title, Paragraph } = Typography;

const TeacherApplicationPage: React.FC = () => {
  const [form] = Form.useForm();

  // ✅ Watch language select
  const langCode = Form.useWatch('LangCode', form);

  // ✅ Fetch languages
  const { data: languagesData, isLoading: loadingLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
  });

  // ✅ Fetch certificates when language changes
  const { data: certificatesData, isLoading: loadingCertificates } = useQuery({
    queryKey: ['certificates', langCode],
    queryFn: () => getCertificatesByLanguageService({ langCode }),
    enabled: !!langCode,
  });

  // ✅ Submit mutation
  const { mutate, isPending } = useMutation({
    mutationFn: submitTeacherApplication,
    onSuccess: () => notifySuccess('Application submitted successfully!'),
    onError: (err: AxiosError<any>) => {
      toast.error(err.response?.data.message || 'Failed to submit application.');
    },
  });

  // ✅ Submit handler
  const onFinish = (values: any) => {
    console.log(values);
    const payload: TeacherApplicationRequest = {
      LangCode: values.LangCode,
      FullName: values.FullName,
      BirthDate: values.BirthDate?.format('YYYY-MM-DD') || '',
      Bio: values.Bio || '',
      Avatar: values.Avatar?.[0].originFileObj || null,
      Email: values.Email || '',
      PhoneNumber: values.PhoneNumber || '',
      TeachingExperience: values.TeachingExperience || '',
      MeetingUrl: values.MeetingUrl || '',
      CertificateImages: Array.isArray(values.CertificateImages)
        ? values.CertificateImages.map((f: any) => f.originFileObj || f)
        : [],
      CertificateTypeIds: Array.isArray(values.CertificateTypeIds) ? values.CertificateTypeIds : [],
    };

    mutate(payload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="text-center py-16 px-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <Title
          level={2}
          className="!text-4xl !font-extrabold mb-3">
          Join Our Global Teaching Community
        </Title>
        <Paragraph className="!text-lg text-blue-100 max-w-2xl mx-auto mb-0">
          Inspire learners worldwide and grow your teaching career with Flearn.
        </Paragraph>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto -mt-16 bg-white rounded-2xl shadow-xl p-10 w-[90%]">
        <Title
          level={3}
          className="text-center text-gray-800 font-bold mb-6">
          Become a Teacher
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large">
          {/* Language */}
          <Form.Item
            name="LangCode"
            label="Language"
            rules={[{ required: true, message: 'Please select a language' }]}>
            <Select
              placeholder={loadingLanguages ? 'Loading languages...' : 'Select a language'}
              loading={loadingLanguages}
              disabled={loadingLanguages}>
              {languagesData?.data?.map((lang: Language) => (
                <Option
                  key={lang.langCode}
                  value={lang.langCode}>
                  {lang.langName} ({lang.langCode})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Basic Info */}
          <Form.Item
            name="FullName"
            label="Full Name"
            rules={[{ required: true }]}>
            <Input placeholder="Your full name" />
          </Form.Item>

          <Form.Item
            name="BirthDate"
            label="Birth Date"
            rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="Bio"
            label="Bio"
            rules={[{ required: true }]}>
            <Input.TextArea
              rows={3}
              placeholder="Write a short bio about yourself"
            />
          </Form.Item>

          <Form.Item
            name="Email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            name="PhoneNumber"
            label="Phone Number"
            rules={[{ required: true }]}>
            <Input placeholder="+84..." />
          </Form.Item>

          <Form.Item
            name="TeachingExperience"
            label="Teaching Experience"
            rules={[{ required: true }]}>
            <Input.TextArea
              rows={3}
              placeholder="Describe your teaching experience"
            />
          </Form.Item>

          <Form.Item
            name="MeetingUrl"
            label="Meeting URL">
            <Input placeholder="https://zoom.us/..." />
          </Form.Item>

          {/* Avatar Upload */}
          <Form.Item
            name="Avatar"
            label="Profile Picture"
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}>
            <Upload
              beforeUpload={() => false}
              listType="picture">
              <Button icon={<UploadOutlined />}>Upload Avatar</Button>
            </Upload>
          </Form.Item>

          {/* Certificates Section */}
          <Form.List name="Certificates">
            {(fields, { add, remove }) => (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-gray-700 flex items-center gap-2">
                    🎓 Certificates
                  </div>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    disabled={!langCode}
                    icon={<UploadOutlined />}>
                    Add Certificate
                  </Button>
                </div>

                {loadingCertificates && (
                  <div className="flex justify-center py-4">
                    <Spin />
                  </div>
                )}

                {fields.map(({ key, name, ...restField }) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border rounded-xl p-4 mb-4 bg-gray-50 relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Certificate Type */}
                      <Form.Item
                        {...restField}
                        name={[name, 'CertificateTypeId']}
                        label="Certificate Type"
                        rules={[{ required: true, message: 'Select a certificate type' }]}>
                        <Select
                          placeholder={
                            langCode ? 'Select certificate type' : 'Select a language first'
                          }
                          disabled={!langCode || loadingCertificates}>
                          {certificatesData?.data?.map((cert: Certificate) => (
                            <Option
                              key={cert.certificateId}
                              value={cert.certificateId}>
                              {cert.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      {/* Certificate Image */}
                      <div className="w-full justify-center">
                        <Form.Item
                          {...restField}
                          name={[name, 'CertificateImage']}
                          label="Certificate Image"
                          valuePropName="fileList"
                          getValueFromEvent={(e) => e.fileList}
                          rules={[{ required: true, message: 'Please upload an image' }]}>
                          <Upload
                            beforeUpload={() => false}
                            listType="picture-card"
                            maxCount={1}
                            accept="image/*">
                            <div>
                              <UploadOutlined />
                              <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                          </Upload>
                        </Form.Item>
                      </div>
                    </div>

                    <Button
                      type="text"
                      danger
                      className="absolute top-2 right-2"
                      onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </Form.List>

          {/* Submit */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              className="w-full h-12 text-lg font-semibold rounded-md bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 shadow-md">
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
