/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  DatePicker,
  Typography,
  Spin,
  Steps,
  Avatar,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  getLanguages,
  getMyApplication,
  updateSubmitTeacherApplication,
  submitTeacherApplication,
} from "../../services/teacherApplication";
import { getCertificatesByLanguageService } from "../../services/certificates";
import type {
  ApplicationData,
  Language,
  TeacherApplicationRequest,
} from "../../services/teacherApplication/types";
import type { AxiosError } from "axios";
import type { Certificate } from "../../services/certificates/type";
import { toast } from "react-toastify";
import { notifySuccess } from "../../utils/toastConfig";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Cake,
  GraduationCap,
  Info,
  Languages,
  Link,
  Phone,
  Users,
} from "lucide-react";

const { Option } = Select;
const { Title, Paragraph } = Typography;

// eslint-disable-next-line react-refresh/only-export-components
export const proficiencyByLanguage: Record<
  string,
  { label: string; value: string }[]
> = {
  en: ["A1", "A2", "B1", "B2", "C1", "C2"].map((x) => ({ label: x, value: x })),
  ja: ["N5", "N4", "N3", "N2", "N1"].map((x) => ({ label: x, value: x })),
  zh: ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"].map((x) => ({
    label: x,
    value: x,
  })),
};

const TeacherApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const selectedLang = Form.useWatch("LangCode", form);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ✅ Get my application
  const { data: response, isLoading } = useQuery<{ data: ApplicationData[] }>({
    queryKey: ["myApplication"],
    queryFn: getMyApplication,
    retry: 1,
    retryDelay: 500,
  });

  // ✅ Languages
  const { data: languagesData, isLoading: loadingLanguages } = useQuery({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });

  // ✅ Certificates (after language is selected)
  const { data: certificatesData, isLoading: loadingCertificates } = useQuery({
    queryKey: ["certificates", selectedLanguage],
    queryFn: () =>
      getCertificatesByLanguageService({ langCode: selectedLanguage! }),
    enabled: !!selectedLanguage,
  });

  // ✅ Submit / Update
  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: submitTeacherApplication,
    onSuccess: () => {
      setIsSubmitted(true);
      notifySuccess("Application submitted successfully!");
      navigate("/learner/application?status=success");
    },
    onError: (err: AxiosError<any>) => {
      toast.error(err.response?.data.errors || "Failed to submit application.");
    },
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: updateSubmitTeacherApplication,
    onSuccess: () => {
      setIsSubmitted(true);
      notifySuccess("Application updated successfully!");
      navigate("/teacher");
    },
    onError: (err: AxiosError<any>) => {
      toast.error(err.response?.data.errors || "Failed to update application.");
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
      console.log(values);
      const allData = { ...formData, ...values };

      const certificateImagesList = allData.Certificates?.map(
        (c: any) => c.CertificateImage?.[0]?.originFileObj
      ).filter(Boolean);

      const CertificateTypeId = allData.Certificates?.map(
        (c: any) => c.CertificateTypeId
      );

      const payload: TeacherApplicationRequest = {
        LangCode: allData.LangCode,
        FullName: allData.FullName,
        BirthDate: allData.BirthDate?.format("YYYY-MM-DD") || "",
        Bio: allData.Bio || "",
        Avatar: allData.Avatar?.[0]?.originFileObj || null,
        Email: allData.Email || "",
        PhoneNumber: allData.PhoneNumber || "",
        TeachingExperience: allData.TeachingExperience || "",
        MeetingUrl: allData.MeetingUrl || "",
        CertificateImages: certificateImagesList || [],
        CertificateTypeIds: Array.isArray(CertificateTypeId)
          ? CertificateTypeId
          : [],
        ProficiencyCode: allData.proficiencyCode,
      };

      const now = new Date();
      const closestApplication = response?.data.reduce(
        (closest: any, current: any) => {
          const currentDate = new Date(current.submittedAt);
          const closestDate = closest ? new Date(closest.submittedAt) : null;
          const currentDiff = Math.abs(now.getTime() - currentDate.getTime());
          const closestDiff = closestDate
            ? Math.abs(now.getTime() - closestDate.getTime())
            : Infinity;
          return currentDiff < closestDiff ? current : closest;
        },
        null
      );

      console.log("closestApplication", closestApplication);

      if (
        closestApplication &&
        closestApplication.status.toLowerCase() === "pending"
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
      title: "Language",
      content: (
        <Form form={form} layout="vertical" size="large">
          <Form.Item
            name="LangCode"
            label="Language"
            rules={[{ required: true, message: "Please select a language" }]}
          >
            <Select
              placeholder={
                loadingLanguages ? "Loading..." : "Select a language"
              }
              loading={loadingLanguages}
            >
              {languagesData?.data?.map((lang: Language) => (
                <Option key={lang.langCode} value={lang.langCode}>
                  {lang.langName} ({lang.langCode})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="proficiencyCode"
            label="Proficiency Level"
            rules={[
              { required: true, message: "Proficiency level is required" },
            ]}
          >
            <Select
              placeholder="Select proficiency level"
              disabled={!selectedLang}
              options={selectedLang ? proficiencyByLanguage[selectedLang] : []}
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      title: " Information",
      content: (
        <Form form={form} layout="vertical" size="large">
          <div className="flex gap-3.5">
            <div className="flex-1">
              <Form.Item
                name="FullName"
                label="Full Name"
                rules={[{ required: true }]}
              >
                <Input placeholder="Your full name" />
              </Form.Item>
            </div>
            <div className="flex-1">
              <Form.Item
                name="BirthDate"
                label="Date of Birth"
                rules={[
                  { required: true },
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.reject(
                          new Error("Date of birth is required")
                        );
                      }

                      const today = new Date();
                      const age = today.getFullYear() - value.year();
                      const month = today.getMonth() + 1 - value.month();
                      const day = today.getDate() - value.date();

                      if (
                        age < 18 ||
                        (age === 18 && (month < 0 || (month === 0 && day < 0)))
                      ) {
                        return Promise.reject(
                          new Error(
                            "You must be at least 18 years old to apply"
                          )
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="Bio" label="Bio" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Write a short bio" />
          </Form.Item>

          <div className="flex gap-2.5">
            <div className="flex-1">
              <Form.Item
                name="Email"
                label="Email"
                rules={[
                  { required: true, type: "email", message: "Invalid email" },
                ]}
              >
                <Input placeholder="you@example.com" />
              </Form.Item>
            </div>
            <div className="flex-1">
              <Form.Item
                name="PhoneNumber"
                label="Phone Number"
                rules={[{ required: true }]}
              >
                <Input placeholder="+84..." />
              </Form.Item>
            </div>
          </div>

          <Form.Item
            name="TeachingExperience"
            label="Teaching Experience"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} placeholder="Describe your experience" />
          </Form.Item>

          <Form.Item
            name="MeetingUrl"
            label="Meeting URL"
            rules={[{ required: true }]}
          >
            <Input placeholder="https://zoom.us/..." />
          </Form.Item>

          <Form.Item
            name="Avatar"
            label="Profile "
            rules={[{ required: true }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
          >
            <Upload beforeUpload={() => false} listType="picture">
              <Button icon={<UploadOutlined />}>Upload Avatar</Button>
            </Upload>
          </Form.Item>
        </Form>
      ),
    },
    {
      title: "Certificates",
      content: (
        <Form form={form} layout="vertical" size="large">
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
                    icon={<UploadOutlined />}
                  >
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
                    className="border rounded-xl p-4 mb-4 bg-gray-50 relative"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Form.Item
                        {...restField}
                        name={[name, "CertificateTypeId"]}
                        label=" Type"
                        rules={[{ required: true }]}
                      >
                        <Select
                          placeholder="Select certificate type"
                          disabled={!selectedLanguage || loadingCertificates}
                        >
                          {certificatesData?.data?.map((cert: Certificate) => (
                            <Option
                              key={cert.certificateId}
                              value={cert.certificateId}
                            >
                              {cert.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "CertificateImage"]}
                        label=" Image"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e.fileList}
                        rules={[
                          { required: true, message: "Please upload image" },
                        ]}
                      >
                        <Upload
                          beforeUpload={() => false}
                          listType="picture-card"
                          maxCount={1}
                        >
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
                      onClick={() => remove(name)}
                    >
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
      title: "Review & Submit",
      content: (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-xl">
          <Title
            level={3} // Bumped to level 3 for more prominence
            className="text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 mb-2 tracking-wide"
          >
            Review Your Application
          </Title>
          <Paragraph className="text-center text-gray-600 mb-8">
            Double-check your details before submitting. Everything looks good?
            Hit submit!
          </Paragraph>

          {/* Language Card */}
          <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <Paragraph className="text-gray-700 font-semibold !mb-0">
                Preferred Language
              </Paragraph>
            </div>
            <p className="text-gray-800 text-lg font-medium">
              {languagesData?.data?.find(
                (l: any) => l.langCode === formData.LangCode
              )?.langName || "Not selected"}{" "}
              <span className="text-blue-600">({formData.LangCode})</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info Card */}
            <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <Paragraph className="text-gray-700 font-semibold !mb-0">
                  Basic Information
                </Paragraph>
              </div>

              <div className="space-y-4 text-gray-800">
                {/* Avatar + Name - Full width hero section */}
                <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  {formData.Avatar?.[0] ? (
                    <Avatar
                      src={URL.createObjectURL(
                        formData.Avatar[0].originFileObj
                      )}
                      alt="Applicant Avatar Preview"
                      className="!w-16 !h-16 border-2 border-indigo-300 object-cover rounded-full shadow-md ring-2 ring-indigo-100"
                      icon={
                        <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          A
                        </div>
                      } // Fallback icon
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-indigo-100">
                      <span className="text-white font-bold text-sm">
                        {formData.FullName?.charAt(0) || "A"}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {formData.FullName || "Unnamed Applicant"}
                    </h3>
                    <p className="text-indigo-600 font-medium">
                      {formData.Email || "No email provided"}
                    </p>
                  </div>
                </div>

                {/* Info Fields - Grid for better layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Date of Birth",
                      value:
                        formData.BirthDate?.format?.("MMM DD, YYYY") || "-",
                      icon: <Cake />,
                    },
                    {
                      label: "Phone",
                      value: formData.PhoneNumber || "-",
                      icon: <Phone />,
                    },
                    {
                      label: "Meeting URL",
                      value: formData.MeetingUrl ? (
                        <a
                          href={formData.MeetingUrl}
                          target="_blank"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          View Link
                        </a>
                      ) : (
                        "-"
                      ),
                      icon: <Link />,
                    },
                    {
                      label: "Proficiency Code",
                      value: formData.proficiencyCode ? (
                        <p>{formData.proficiencyCode}</p>
                      ) : (
                        "-"
                      ),
                      icon: <Languages />,
                    },
                  ].map((field, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-2xl">{field.icon}</span>
                      <div>
                        <strong className="block text-sm font-medium text-gray-700">
                          {field.label}:
                        </strong>
                        <span className="text-gray-900">{field.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full-width fields */}
                {[
                  {
                    label: "Bio",
                    value: formData.Bio || "No bio provided",
                    icon: <Info />,
                  },
                  {
                    label: "Teaching Experience",
                    value:
                      formData.TeachingExperience || "No experience listed",
                    icon: <GraduationCap />,
                  },
                ].map((field, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-2xl mt-0.5">{field.icon}</span>
                      <strong className="text-gray-700 font-semibold">
                        {field.label}:
                      </strong>
                    </div>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {/* Certificates Card - Only if exists, otherwise hidden */}
            {formData.Certificates && formData.Certificates.length > 0 ? (
              <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Paragraph className="text-gray-700 font-semibold !mb-0">
                    Your Certificates
                  </Paragraph>
                </div>
                <div className="space-y-4 max-h-120 overflow-y-auto">
                  {formData.Certificates.map((cert: any, idx: number) => {
                    const certInfo = certificatesData?.data?.find(
                      (c: Certificate) =>
                        c.certificateId === cert.CertificateTypeId
                    );
                    return (
                      <div
                        key={idx}
                        className="group relative bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm transition-all duration-300 cursor-pointer overflow-hidden"
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Verified
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2 text-center">
                          {certInfo?.name || "Certificate"}
                        </h4>
                        {cert.CertificateImage?.[0] ? (
                          <img
                            src={URL.createObjectURL(
                              cert.CertificateImage[0].originFileObj
                            )}
                            alt={`${certInfo?.name || "Certificate"} Preview`}
                            className="w-full max-w-sm mx-auto h-32 object-cover rounded-lg border border-gray-200 shadow-inner"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }} // Hide on error
                          />
                        ) : (
                          <div className="w-full max-w-sm mx-auto h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                            <span className="text-sm">No image uploaded</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {formData.Certificates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg">No certificates added yet.</p>
                    <Button type="dashed" className="mt-2">
                      Add More
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Paragraph className="text-gray-700 font-semibold !mb-0">
                    Your Certificates
                  </Paragraph>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">No certificates added yet.</p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button - Enhanced with animation */}
          {!isSubmitted && (
            <Button
              type="primary"
              onClick={() => handleSubmit()}
              loading={isSubmitting || isUpdating}
              className="w-full max-w-md h-14 text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 rounded-xl border-none"
              size="large"
            >
              <span className="flex items-center gap-2">
                {isSubmitting || isUpdating ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </span>
            </Button>
          )}

          <Paragraph className="text-xs text-gray-500 mt-2">
            By submitting, you agree to our terms and privacy policy.
          </Paragraph>
        </div>
      ),
    },
  ];

  return isLoading ? (
    <div className="flex justify-center items-center min-h-screen">
      <Spin size="large" />
    </div>
  ) : (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-blue-950 to-blue-700 text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl text-white md:text-5xl font-bold">
            Become a Teacher
          </h1>
          <p className="text-lg text-white md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Share your knowledge and inspire the next generation of learners.
            Join our community of passionate educators.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6 !mb-0 !p-12">
        <div className="text-center space-y-3 p-6 rounded-lg bg-white border border-blue-300 transition-all duration-300">
          <div className="w-12 h-12 text-white mx-auto rounded-full bg-blue-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-accent-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Flexible Schedule</h3>
          <p className="text-sm text-muted-foreground">
            Teach on your own time and at your own pace
          </p>
        </div>
        <div className="text-center space-y-3 p-6 rounded-lg bg-white border border-blue-300 transition-all duration-300">
          <div className="w-12 h-12 text-white mx-auto rounded-full bg-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6 text-accent-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Global Reach</h3>
          <p className="text-sm text-muted-foreground">
            Connect with students from around the world
          </p>
        </div>
        <div className="text-center space-y-3 p-6 rounded-lg bg-white border border-blue-300 transition-all duration-300">
          <div className="w-12 h-12 text-white mx-auto rounded-full bg-blue-400 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-accent-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Professional Growth</h3>
          <p className="text-sm text-muted-foreground">
            Develop your teaching skills with our support
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-xl p-10 m-12"
      >
        <Steps
          current={currentStep}
          items={steps.map((s) => ({ title: s.title }))}
        />

        <div className="mt-10">{steps[currentStep].content}</div>

        <div className="mt-8 flex justify-between">
          {currentStep > 0 && (
            <Button onClick={prev} className="px-6">
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button
              type="primary"
              onClick={next}
              className="px-6 bg-gradient-to-r from-indigo-600 to-blue-500"
            >
              Next
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherApplicationPage;
