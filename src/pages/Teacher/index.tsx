/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Select, Upload, DatePicker, Typography, Spin, Steps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {
  getLanguages,
  getMyApplication,
  updateSubmitTeacherApplication,
  submitTeacherApplication,
} from '../../services/teacherApplication';
import { getCertificatesByLanguageService } from '../../services/certificates';
import type {
  ApplicationData,
  Language,
  TeacherApplicationRequest,
} from '../../services/teacherApplication/types';
import type { AxiosError } from 'axios';
import type { Certificate } from '../../services/certificates/type';
import { toast } from 'react-toastify';
import { notifySuccess } from '../../utils/toastConfig';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Title, Paragraph } = Typography;

const TeacherApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // ✅ Get my application
  const { data: response, isLoading } = useQuery<{ data: ApplicationData }>({
    queryKey: ['myApplication'],
    queryFn: getMyApplication,
    retry: 1,
    retryDelay: 500,
  });

  // ✅ Languages
  const { data: languagesData, isLoading: loadingLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
  });

  // ✅ Certificates (after language is selected)
  const { data: certificatesData, isLoading: loadingCertificates } = useQuery({
    queryKey: ['certificates', selectedLanguage],
    queryFn: () => getCertificatesByLanguageService({ langCode: selectedLanguage! }),
    enabled: !!selectedLanguage,
  });

  // ✅ Submit / Update
  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: submitTeacherApplication,
    onSuccess: () => notifySuccess('Application submitted successfully!'),
    onError: (err: AxiosError<any>) => {
      toast.error(err.response?.data.errors || 'Failed to submit application.');
    },
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: updateSubmitTeacherApplication,
    onSuccess: () => {
      notifySuccess('Application updated successfully!');
      navigate('/teacher');
    },
    onError: (err: AxiosError<any>) => {
      toast.error(err.response?.data.errors || 'Failed to update application.');
    },
  });

  // ✅ Step navigation
  const next = async () => {
    try {
      const values = await form.validateFields();
      setFormData((prev: any) => ({ ...prev, ...values }));
      if (currentStep === 0 && values.LangCode) {
        setSelectedLanguage(values.LangCode);
      }
      setCurrentStep((prev) => prev + 1);
      form.resetFields();
    } catch (err) {
      // validation failed
      console.log(err);
      return;
    }
  };

  const prev = () => setCurrentStep((prev) => prev - 1);

  // ✅ Submit final
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const allData = { ...formData, ...values };

      const certificateImagesList = allData.Certificates?.map(
        (c: any) => c.CertificateImage?.[0]?.originFileObj
      ).filter(Boolean);

      const CertificateTypeId = allData.Certificates?.map((c: any) => c.CertificateTypeId);

      const payload: TeacherApplicationRequest = {
        LangCode: allData.LangCode,
        FullName: allData.FullName,
        BirthDate: allData.BirthDate?.format('YYYY-MM-DD') || '',
        Bio: allData.Bio || '',
        Avatar: allData.Avatar?.[0]?.originFileObj || null,
        Email: allData.Email || '',
        PhoneNumber: allData.PhoneNumber || '',
        TeachingExperience: allData.TeachingExperience || '',
        MeetingUrl: allData.MeetingUrl || '',
        CertificateImages: certificateImagesList || [],
        CertificateTypeIds: Array.isArray(CertificateTypeId) ? CertificateTypeId : [],
      };

      if (
        response?.data.status.toLowerCase() === 'pending' ||
        response?.data.status.toLowerCase() === 'rejected'
      ) {
        updateMutate(payload);
      } else {
        mutate(payload);
      }
    } catch (err) {
      // validation failed
      console.log(err);
    }
  };

  // ✅ Step content
  const steps = [
    {
      title: 'Language',
      content: (
        <Form
          form={form}
          layout="vertical"
          size="large">
          <Form.Item
            name="LangCode"
            label="Language"
            rules={[{ required: true, message: 'Please select a language' }]}>
            <Select
              placeholder={loadingLanguages ? 'Loading...' : 'Select a language'}
              loading={loadingLanguages}>
              {languagesData?.data?.map((lang: Language) => (
                <Option
                  key={lang.langCode}
                  value={lang.langCode}>
                  {lang.langName} ({lang.langCode})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      ),
    },
    {
      title: 'Basic Information',
      content: (
        <Form
          form={form}
          layout="vertical"
          size="large">
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
              placeholder="Write a short bio"
            />
          </Form.Item>

          <Form.Item
            name="Email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Invalid email' }]}>
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
              placeholder="Describe your experience"
            />
          </Form.Item>

          <Form.Item
            name="MeetingUrl"
            label="Meeting URL">
            <Input placeholder="https://zoom.us/..." />
          </Form.Item>

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
        </Form>
      ),
    },
    {
      title: 'Certificates',
      content: (
        <Form
          form={form}
          layout="vertical"
          size="large">
          <Form.List name="Certificates">
            {(fields, { add, remove }) => (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-gray-700 flex items-center gap-2">
                    🎓 Certificates
                  </div>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    disabled={!selectedLanguage}
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
                      <Form.Item
                        {...restField}
                        name={[name, 'CertificateTypeId']}
                        label="Certificate Type"
                        rules={[{ required: true }]}>
                        <Select
                          placeholder="Select certificate type"
                          disabled={!selectedLanguage || loadingCertificates}>
                          {certificatesData?.data?.map((cert: Certificate) => (
                            <Option
                              key={cert.certificateId}
                              value={cert.certificateId}>
                              {cert.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'CertificateImage']}
                        label="Certificate Image"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e.fileList}
                        rules={[{ required: true, message: 'Please upload image' }]}>
                        <Upload
                          beforeUpload={() => false}
                          listType="picture-card"
                          maxCount={1}>
                          <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                          </div>
                        </Upload>
                      </Form.Item>
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
              </>
            )}
          </Form.List>
        </Form>
      ),
    },
    {
      title: 'Review & Submit',
      content: (
        <div className="text-center">
          <Paragraph className="text-gray-600 mb-4">
            Please review your information before submitting your application.
          </Paragraph>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting || isUpdating}
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-blue-500">
            Submit Application
          </Button>
        </div>
      ),
    },
  ];

  return isLoading ? (
    <div className="flex justify-center items-center min-h-screen">
      <Spin size="large" />
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col">
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

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto -mt-16 bg-white rounded-2xl shadow-xl p-10 w-[90%]">
        <Steps
          current={currentStep}
          items={steps.map((s) => ({ title: s.title }))}
        />

        <div className="mt-10">{steps[currentStep].content}</div>

        <div className="mt-8 flex justify-between">
          {currentStep > 0 && (
            <Button
              onClick={prev}
              className="px-6">
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button
              type="primary"
              onClick={next}
              className="px-6 bg-gradient-to-r from-indigo-600 to-blue-500">
              Next
            </Button>
          )}
        </div>
      </motion.div>

      <div className="text-center mt-10 text-gray-500 text-sm mb-6">
        © {new Date().getFullYear()} Flearn — Empowering Global Education 🌍
      </div>
    </div>
  );
};

export default TeacherApplicationPage;
