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
  Card,
  Space,
  Row,
  Col,
  Flex,
  Badge,
  Modal,
} from "antd";
import { UploadOutlined, ClockCircleOutlined } from "@ant-design/icons";
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
  Camera,
  Globe,
  GraduationCap,
  Info,
  Languages,
  Link,
  Mail,
  Phone,
  Trash2,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { PROFICIENCY_LEVELS } from "../../utils/constants";
import InfoSection from "./components/InfoSection";
import LoadingScreen from "@/components/Loading/LoadingScreen";
import BackgroundImage from "@/assets/background-image-05.jpg";
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;
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
const LANGUAGES = [
  {
    code: "en",
    name: "Tiếng Anh",
    flag: "US",
    color: "#3b82f6",
    gradientStart: "#dbeafe",
    gradientEnd: "#bfdbfe",
    native: "379M",
    learners: "1.5B+",
    badge: "Most Popular",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    code: "ja",
    name: "Tiếng Nhật",
    flag: "JP",
    color: "#ef4444",
    gradientStart: "#fee2e2",
    gradientEnd: "#fecaca",
    native: "125M",
    learners: "3M+",
    badge: "Unique Culture",
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    code: "zh",
    name: "Tiếng Trung",
    flag: "CN",
    color: "#eab308",
    gradientStart: "#fefce8",
    gradientEnd: "#fef9c3",
    native: "1.1B",
    learners: "40M+",
    badge: "Business Power",
    icon: <Users className="w-4 h-4" />,
  },
] as const;
interface LanguageCardProps {
  lang: Language;
  selected: boolean;
  onClick: () => void;
  loading?: boolean;
}
const LanguageCard: React.FC<LanguageCardProps> = ({
  lang,
  selected,
  onClick,
  loading,
}) => {
  const info = LANGUAGES.find((l) => l.code === lang.langCode)!;
  return (
    <motion.div className="w-full">
      <Card
        hoverable={!loading}
        onClick={loading ? undefined : onClick}
        className="relative overflow-hidden rounded-md transition-all duration-300 cursor-pointer"
        style={{
          border: selected
            ? `2px solid ${info.color.replace("bg-", "#")}`
            : "1px solid #e5e7eb",
          background: selected
            ? `linear-gradient(135deg, ${info.gradientStart}, ${info.gradientEnd})`
            : "white",
          boxShadow: selected
            ? `0 0 0 4px ${info.color.replace(
                "bg-",
                "#"
              )}20, 0 12px 30px rgba(0,0,0,0.12)`
            : "0 4px 12px rgba(0,0,0,0.08)",
          opacity: loading ? 0.6 : 1,
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div className="flex justify-center mb-4 relative">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-md overflow-hidden shadow-lg ring-4 ring-white"
              style={{
                backgroundImage: `url(https://flagcdn.com/w160/${info.flag.toLowerCase()}.png)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {selected && (
              <motion.div
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-md flex items-center justify-center shadow-xl"
                style={{ backgroundColor: info.color.replace("bg-", "#") }}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}
          </div>
        </div>
        <Text
          strong
          className="block text-center text-lg mb-3"
          style={{
            color: selected ? info.color.replace("bg-", "#") : "#1f2937",
            fontWeight: 700,
          }}
        >
          {info.name}
        </Text>
        {selected && (
          <motion.div
            className="absolute inset-0 rounded-md pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              background: `radial-gradient(circle at center, ${info.color.replace(
                "bg-",
                "#"
              )}15 0%, transparent 70%)`,
            }}
          />
        )}
      </Card>
    </motion.div>
  );
};
interface ProficiencyCardProps {
  level: { label: string; value: string; description?: string };
  selected: boolean;
  onClick: () => void;
  langCode: string;
}
const ProficiencyCard: React.FC<ProficiencyCardProps> = ({
  level,
  selected,
  onClick,
  langCode,
}) => {
  const levelInfo = PROFICIENCY_LEVELS[langCode]?.find(
    (l) => l.value === level.value
  );
  if (!levelInfo) return null;

  return (
    <motion.div className="w-full">
      <Card
        hoverable
        onClick={onClick}
        className="relative overflow-hidden rounded-md transition-all duration-300"
        style={{
          border: selected
            ? `2px solid ${levelInfo.color}`
            : "1px solid #e5e7eb",
          background: selected
            ? `linear-gradient(135deg, ${levelInfo.color}05, ${levelInfo.color}10)`
            : "#ffffff",
          boxShadow: selected
            ? `0 0 0 3px ${levelInfo.color}25, 0 8px 20px rgba(0,0,0,0.1)`
            : "0 2px 8px rgba(0,0,0,0.06)",
          cursor: "pointer",
        }}
        bodyStyle={{ padding: "18px" }}
      >
        <Text
          strong
          className="block text-center text-lg mb-2"
          style={{
            color: selected ? levelInfo.color : "#1f2937",
            fontWeight: 700,
          }}
        >
          {level.label}
        </Text>
        {selected && (
          <motion.div
            className="absolute inset-0 rounded-md pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{
              background: `radial-gradient(circle at center, ${levelInfo.color}20 0%, transparent 70%)`,
            }}
          />
        )}
      </Card>
    </motion.div>
  );
};
const TeacherApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const selectedLang = Form.useWatch("LangCode", form);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const { data: response, isLoading } = useQuery<{ data: ApplicationData[] }>({
    queryKey: ["myApplication"],
    queryFn: () => getMyApplication(),
    retry: 1,
    retryDelay: 500,
  });

  const { data: languagesData, isLoading: loadingLanguages } = useQuery({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });

  const { data: certificatesData, isLoading: loadingCertificates } = useQuery({
    queryKey: ["certificates", selectedLanguage],
    queryFn: () =>
      getCertificatesByLanguageService({ langCode: selectedLanguage! }),
    enabled: !!selectedLanguage,
  });

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: submitTeacherApplication,
    onSuccess: () => {
      setIsSubmitted(true);
      notifySuccess("Đơn đăng ký đã được gửi thành công!");
      navigate("/learner/application?status=success");
    },
    onError: (err: AxiosError<any>) => {
      toast.error(err.response?.data.errors || "Không nộp được đơn!");
    },
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: updateSubmitTeacherApplication,
    onSuccess: () => {
      setIsSubmitted(true);
      notifySuccess("Đơn được cập nhật thành công!");
      navigate("/teacher");
    },
    onError: (err: AxiosError<any>) => {
      toast.error(err.response?.data.errors || "Không cập nhật được đơn!");
    },
  });

  React.useEffect(() => {
    const current = form.getFieldValue("Certificates") || [];
    if (current.length === 0) {
      form.setFieldsValue({
        Certificates: [{}],
      });
    }
  }, [form]);

  const next = async () => {
    try {
      const values = await form.validateFields();
      setFormData((prev: any) => ({ ...prev, ...values }));
      if (currentStep === 0 && values.LangCode) {
        setSelectedLanguage(values.LangCode);
      }
      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const prev = () => setCurrentStep((prev) => prev - 1);

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

      const handleSuccessActions = () => {
        form.resetFields();
        setFormData({});
        setSelectedLanguage(null);
        setCurrentStep(0);
        navigate("/learner/status");
      };
      console.log("closestApplication", closestApplication);
      if (
        closestApplication &&
        closestApplication.status.toLowerCase() === "pending"
      ) {
        updateMutate(payload, {
          onSuccess: handleSuccessActions,
        });
      } else {
        mutate(payload, {
          onSuccess: handleSuccessActions,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const steps = [
    {
      title: "Ngôn ngữ",
      content: (
        <Form form={form} layout="vertical" size="large">
          <Form.Item
            label={<Text strong>Chọn ngôn ngữ</Text>}
            name="LangCode"
            rules={[{ required: true, message: "Vui lòng chọn một ngôn ngữ" }]}
          >
            <div>
              {loadingLanguages ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spin size="large" tip="Đang tải ngôn ngữ..." />
                </div>
              ) : (
                <Flex gap={24} justify="space-between">
                  {languagesData?.data?.map((lang: Language) => (
                    <div className="w-1/3" key={lang.langCode}>
                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          const isSelected =
                            getFieldValue("LangCode") === lang.langCode;
                          return (
                            <LanguageCard
                              lang={lang}
                              selected={isSelected}
                              onClick={() =>
                                form.setFieldsValue({ LangCode: lang.langCode })
                              }
                            />
                          );
                        }}
                      </Form.Item>
                    </div>
                  ))}
                </Flex>
              )}
            </div>
          </Form.Item>
          <Form.Item
            label={<Text strong>Mức độ thành thạo</Text>}
            name="proficiencyCode"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn trình độ thành thạo của bạn",
              },
            ]}
          >
            <div>
              {!selectedLang ? (
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
                  Vui lòng chọn ngôn ngữ trước
                </Text>
              ) : (
                <Row gutter={[12, 12]}>
                  {proficiencyByLanguage[selectedLang]?.map((level) => (
                    <Col xs={12} sm={8} md={6} key={level.value}>
                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          const isSelected =
                            getFieldValue("proficiencyCode") === level.value;
                          return (
                            <ProficiencyCard
                              level={level}
                              langCode={selectedLang}
                              selected={isSelected}
                              onClick={() =>
                                form.setFieldsValue({
                                  proficiencyCode: level.value,
                                })
                              }
                            />
                          );
                        }}
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </Form.Item>
        </Form>
      ),
    },
    {
      title: "Thông tin",
      content: (
        <Form form={form} layout="vertical" className="!space-y-6" size="large">
          <InfoSection
            title="Thông tin cá nhân"
            icon={<User className="w-5 h-5" />}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="FullName"
                  label="Họ và tên"
                  required
                  rules={[
                    { required: true, message: "Tên đầy đủ là bắt buộc" },
                  ]}
                >
                  <Input placeholder="Nguyễn Văn Nam" className="h-11" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="BirthDate"
                  label="Ngày sinh"
                  rules={[
                    { required: true, message: "Ngày sinh là bắt buộc" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.reject();
                        const today = new Date();
                        const age = today.getFullYear() - value.year();
                        if (age < 18) {
                          return Promise.reject("Bạn phải ít nhất 18 tuổi");
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <DatePicker
                    placeholder="DD/MM/YYYY"
                    format="DD/MM/YYYY"
                    className="w-full h-11"
                  />
                </Form.Item>
              </Col>
            </Row>
          </InfoSection>
          <InfoSection
            title="Hình đại diện"
            icon={<Camera className="w-5 h-5" />}
          >
            <Form.Item
              noStyle
              shouldUpdate={(prev, next) => prev.Avatar !== next.Avatar}
            >
              {({ getFieldValue, getFieldError }) => {
                const fileList: any[] = getFieldValue("Avatar") || [];
                const errors = getFieldError("Avatar");

                const beforeUpload = (file: any) => {
                  form.setFieldsValue({ Avatar: [file] });
                  return false;
                };

                const previewFile = fileList[0];
                const previewUrl = previewFile
                  ? previewFile.thumbUrl ||
                    (previewFile.originFileObj
                      ? URL.createObjectURL(previewFile.originFileObj)
                      : undefined)
                  : undefined;

                const hasError = errors.length > 0;

                return (
                  <div className="flex flex-col items-center">
                    <div className="mb-6">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Avatar preview"
                          className="w-40 h-40 rounded-md object-cover shadow-lg ring-4 ring-white"
                        />
                      ) : (
                        <div className="w-40 h-40 bg-gray-200 rounded-md flex items-center justify-center">
                          <Camera className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="text-center mb-4">
                      <Text strong className="block text-lg">
                        Chỉnh sửa hình đại diện
                      </Text>
                      <Text
                        type="secondary"
                        className="text-xs leading-relaxed"
                      >
                        Ít nhất 250×250 pixel
                        <br />
                        Chỉ định dạng JPG, PNG và BMP
                        <br />
                        Kích thước tối đa 2 MB
                      </Text>
                    </div>
                    <Form.Item
                      name="Avatar"
                      valuePropName="fileList"
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng tải lên một bức ảnh",
                        },
                      ]}
                      validateTrigger={["onChange", "onSubmit"]}
                      help={hasError ? errors[0] : undefined}
                      validateStatus={hasError ? "error" : undefined}
                    >
                      <Upload
                        beforeUpload={beforeUpload}
                        fileList={fileList}
                        showUploadList={false}
                        accept="image/jpeg,image/png,image/bmp"
                      >
                        <Button
                          type="primary"
                          danger
                          icon={<UploadOutlined />}
                          className="w-full max-w-xs"
                          size="large"
                        >
                          CHỌN MỘT ẢNH
                        </Button>
                      </Upload>
                    </Form.Item>
                  </div>
                );
              }}
            </Form.Item>
          </InfoSection>
          <InfoSection
            title="Giới thiệu về bạn"
            icon={<User className="w-5 h-5" />}
          >
            <Form.Item
              name="Bio"
              label="Hãy cho chúng tôi biết về bạn"
              rules={[
                {
                  required: true,
                  message: "Xin hãy cho chúng tôi biết về bạn",
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Ví dụ, giáo viên tiếng Anh nhiệt tình với 3 năm kinh nghiệm giúp học sinh đạt được trình độ nói lưu loát..."
                className="resize-none"
              />
            </Form.Item>
          </InfoSection>
          <InfoSection
            title="Thông tin liên hệ"
            icon={<Mail className="w-5 h-5" />}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="Email"
                  rules={[
                    { required: true, message: "Email là bắt buộc" },
                    { type: "email", message: "Định dạng email không hợp lệ" },
                  ]}
                >
                  <Input placeholder="johndoe@gmail.com" className="h-11" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="PhoneNumber"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: "Số điện thoại là bắt buộc" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.reject();
                        const digits = value.replace(/\D/g, "");
                        const isVN =
                          /^0\d{9}$/.test(digits) || /^84\d{9}$/.test(digits);
                        if (!isVN) {
                          return Promise.reject(
                            "Vui lòng nhập số điện thoại Việt Nam hợp lệ"
                          );
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    placeholder="+84 901 234 567"
                    className="h-11"
                    maxLength={14}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.startsWith("0") && val.length > 1) {
                        val = "84" + val.slice(1);
                      }
                      if (val.startsWith("84") && val.length > 2) {
                        val =
                          "+84 " +
                          val
                            .slice(2)
                            .replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
                      }
                      form.setFieldsValue({ PhoneNumber: val });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </InfoSection>
          <InfoSection
            title="Kinh nghiệm giảng dạy"
            icon={<BookOpen className="w-5 h-5" />}
          >
            <Form.Item
              label="Kinh nghiệm giảng dạy"
              name="TeachingExperience"
              rules={[
                {
                  required: true,
                  message: "Vui lòng mô tả lý lịch giảng dạy của bạn",
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Ví dụ: Đã dạy trực tuyến cho hơn 200 học viên, chuyên về tiếng Anh giao tiếp, luyện thi TOEIC..."
                className="resize-none"
              />
            </Form.Item>
          </InfoSection>
          <InfoSection title="Meeting Link" icon={<Link className="w-5 h-5" />}>
            <Form.Item
              name="MeetingUrl"
              label="Meeting link"
              rules={[
                { required: true, message: "Meeting link là bắt buộc" },
                { type: "url", message: "Vui lòng nhập URL hợp lệ" },
              ]}
            >
              <Input
                placeholder="https://zoom.us/j/123456789"
                className="h-11"
              />
            </Form.Item>
          </InfoSection>
        </Form>
      ),
    },
    {
      title: "Chứng chỉ",
      content: (
        <Form form={form} layout="vertical" size="large">
          <Form.List name="Certificates">
            {(fields, { add, remove }) => (
              <>
                {loadingCertificates && (
                  <div className="flex justify-center py-8">
                    <Spin size="large" tip="Đang tải chứng chỉ..." />
                  </div>
                )}

                <Space direction="vertical" size="middle" className="w-full">
                  {fields.map(({ key, name, ...restField }) => (
                    <motion.div key={key} className="relative group">
                      <Card
                        className="overflow-hidden rounded-md border border-gray-200 shadow-sm transition-all duration-300 bg-gradient-to-br from-white to-indigo-50"
                        bodyStyle={{ padding: 0 }}
                      >
                        <div className="p-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Form.Item
                              {...restField}
                              name={[name, "CertificateTypeId"]}
                              label={
                                <span className="flex items-center gap-2 text-gray-700 font-medium">
                                  <Trophy className="w-4 h-4 text-yellow-500" />
                                  Loại chứng chỉ
                                </span>
                              }
                              rules={[
                                {
                                  required: true,
                                  message: "Chọn chứng chỉ",
                                },
                              ]}
                            >
                              <Select
                                placeholder="Chọn chứng chỉ"
                                disabled={
                                  !selectedLanguage || loadingCertificates
                                }
                                className="w-full"
                                dropdownClassName="z-50"
                                size="large"
                              >
                                {certificatesData?.data?.map(
                                  (cert: Certificate) => (
                                    <Option
                                      key={cert.certificateId}
                                      value={cert.certificateId}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          color={cert.name ? "gold" : "blue"}
                                          dot
                                        />
                                        {cert.name}
                                      </div>
                                    </Option>
                                  )
                                )}
                              </Select>
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "CertificateImage"]}
                              label="Hình ảnh"
                              valuePropName="fileList"
                              getValueFromEvent={(e) => e && e.fileList}
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng tải hình ảnh lên",
                                },
                              ]}
                            >
                              <Upload
                                listType="picture-card"
                                maxCount={1}
                                beforeUpload={() => false}
                                onPreview={(file) => {
                                  setPreviewImage(
                                    file.url ||
                                      URL.createObjectURL(
                                        file.originFileObj as File
                                      )
                                  );
                                  setPreviewOpen(true);
                                  setPreviewTitle(file.name || "Preview");
                                }}
                              >
                                <div>
                                  <UploadOutlined />
                                  <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                              </Upload>
                            </Form.Item>
                            <Modal
                              open={previewOpen}
                              title={previewTitle}
                              footer={null}
                              onCancel={() => setPreviewOpen(false)}
                            >
                              <img
                                alt="Preview"
                                style={{ width: "100%" }}
                                src={previewImage}
                              />
                            </Modal>
                          </div>
                        </div>

                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            className="!absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => remove(name)}
                          />
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </Space>

                {fields.length === 0 && !loadingCertificates && (
                  <div className="text-center py-12 text-gray-500">
                    <Text type="secondary">
                      Chưa có chứng chỉ nào được thêm vào.
                    </Text>
                  </div>
                )}

                <div className="flex items-center justify-end mb-6 mt-4">
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    disabled={!selectedLanguage}
                    icon={<UploadOutlined />}
                    className="border-indigo-300 text-indigo-600 hover:border-indigo-500 hover:text-indigo-700"
                  >
                    Thêm chứng chỉ
                  </Button>
                </div>
              </>
            )}
          </Form.List>
        </Form>
      ),
    },
    {
      title: "Xem xét & Gửi",
      content: (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          <Title
            level={3}
            className="text-center text-transparent bg-clip-text mb-2 tracking-wide"
          >
            Xem lại đơn đăng ký của bạn
          </Title>
          <Paragraph className="text-center text-gray-600 mb-8">
            Kiểm tra lại thông tin của bạn trước khi gửi. Mọi thứ đã ổn chưa?
            Nhấn gửi!
          </Paragraph>

          {/* Language Card */}
          <div className="bg-white border p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-md"></div>
              <Paragraph className="text-gray-700 font-semibold !mb-0">
                Ngôn ngữ đã chọn
              </Paragraph>
            </div>
            <p className="text-gray-800 text-lg font-medium">
              {languagesData?.data?.find(
                (l: any) => l.langCode === formData.LangCode
              )?.langName || "Not selected"}{" "}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-md"></div>
                <Paragraph className="text-gray-700 font-semibold !mb-0">
                  Thông tin cơ bản
                </Paragraph>
              </div>
              <div className="space-y-4 text-gray-800">
                <div className="flex items-center gap-4 p-4">
                  {formData.Avatar?.[0] ? (
                    <Avatar
                      src={URL.createObjectURL(
                        formData.Avatar[0].originFileObj
                      )}
                      alt="Applicant Avatar Preview"
                      className="!w-16 !h-16 border-2 border-indigo-300 object-cover rounded-md shadow-md ring-2 ring-indigo-100"
                      icon={
                        <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-blue-500 rounded-md flex items-center justify-center text-white font-bold text-sm">
                          A
                        </div>
                      }
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-md flex items-center justify-center shadow-md ring-2 ring-indigo-100">
                      <span className="text-white font-bold text-sm">
                        {formData.FullName?.charAt(0) || "A"}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {formData.FullName || "Người nộp đơn không tên"}
                    </h3>
                    <p className="text-indigo-600 font-medium">
                      {formData.Email || "Không có email nào được cung cấp"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Ngày sinh",
                      value:
                        formData.BirthDate?.format?.("MMM DD, YYYY") || "-",
                      icon: <Cake />,
                    },
                    {
                      label: "Số điện thoại",
                      value: formData.PhoneNumber || "-",
                      icon: <Phone />,
                    },
                    {
                      label: "Meeting URL",
                      value: formData.MeetingUrl ? (
                        <a
                          href={formData.MeetingUrl}
                          target="_blank"
                          className="text-blue-600 hover:underline font-medium block max-w-full"
                        >
                          <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                            {formData.MeetingUrl}
                          </span>
                        </a>
                      ) : (
                        "-"
                      ),
                      icon: <Link />,
                    },
                    {
                      label: "Mức độ thành thạo",
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
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                    >
                      <span className="text-2xl">{field.icon}</span>

                      <div className="flex-1 min-w-0">
                        <strong className="block text-sm font-medium text-gray-700">
                          {field.label}
                        </strong>

                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-gray-900">
                          {field.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {[
                  {
                    label: "Tiểu sử",
                    value: formData.Bio || "Không có sinh học được cung cấp",
                    icon: <Info />,
                  },
                  {
                    label: "Kinh nghiệm giảng dạy",
                    value:
                      formData.TeachingExperience ||
                      "Không có kinh nghiệm được liệt kê",
                    icon: <GraduationCap />,
                  },
                ].map((field, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-blue-50 rounded-md border border-blue-200"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-2xl mt-0.5">{field.icon}</span>
                      <strong className="text-gray-700 font-semibold">
                        {field.label}
                      </strong>
                    </div>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {formData.Certificates && formData.Certificates.length > 0 ? (
              <div className="bg-white border  p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-md"></div>
                  <Paragraph className="text-gray-700 font-semibold !mb-0">
                    Chứng chỉ của bạn
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
                        className="group relative bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-md p-4 shadow-sm transition-all duration-300 cursor-pointer overflow-hidden"
                      >
                        <h4 className="font-bold text-gray-900 mb-2 text-center">
                          {certInfo?.name || "Certificate"}
                        </h4>
                        {cert.CertificateImage?.[0] ? (
                          <img
                            src={URL.createObjectURL(
                              cert.CertificateImage[0].originFileObj
                            )}
                            alt={`${certInfo?.name || "Certificate"} Preview`}
                            className="w-full max-w-sm mx-auto h-32 object-cover rounded-md border border-gray-200 shadow-inner"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full max-w-sm mx-auto h-32 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                            <span className="text-sm">
                              Không có hình ảnh được tải lên
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {formData.Certificates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg">
                      Chưa có chứng chỉ nào được thêm vào.
                    </p>
                    <Button type="dashed" className="mt-2">
                      Thêm nhiều hơn nữa
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-blue-200 rounded-md p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-md"></div>
                  <Paragraph className="text-gray-700 font-semibold !mb-0">
                    Chứng chỉ của bạn
                  </Paragraph>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">
                    Chưa có chứng chỉ nào được thêm vào.
                  </p>
                </div>
              </div>
            )}
          </div>

          {isSubmitting || isUpdating ? (
            <LoadingScreen message="Đang gửi đơn đăng ký..." />
          ) : (
            !isSubmitted && (
              <div className="flex flex-col items-center">
                <Button
                  type="primary"
                  onClick={() => handleSubmit()}
                  size="large"
                >
                  Gửi đơn đăng ký{" "}
                </Button>
                <Paragraph className="text-xs text-gray-500 mt-2">
                  Bằng cách gửi, bạn đồng ý với các điều khoản và chính sách bảo
                  mật của chúng tôi.
                </Paragraph>
              </div>
            )
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingScreen />
      </div>
    );
  }
  const pendingApplication = response?.data?.find(
    (app) => app.status === "Pending"
  );
  if (pendingApplication) {
    return (
      <div className="mt-15 flex items-center justify-center bg-gray-50 px-4">
        <div className="p-10 rounded-md max-w-lg w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 rounded-md flex items-center justify-center animate-pulse">
              <ClockCircleOutlined className="text-5xl" />
            </div>
          </div>
          <Title level={2} className="mb-3 text-gray-800 whitespace-nowrap">
            Đơn đăng ký đang được xem xét
          </Title>
          <Paragraph className="text-gray-500 text-lg mb-8 leading-relaxed">
            Bạn đã nộp đơn đăng ký và đơn đăng ký này hiện đang được quản trị
            viên của chúng tôi xem xét. Bạn không thể nộp đơn đăng ký mới cho
            đến khi quá trình hoàn tất.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/learner/status")}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-medium rounded-md shadow-lg shadow-blue-200"
          >
            Kiểm tra trạng thái đơn đăng ký
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-12">
      <div
        className="relative w-full h-[600px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-start pt-20 max-w-5xl">
          <Title
            level={1}
            style={{
              color: "white",
              fontSize: "3.5rem",
              fontWeight: 800,
              marginBottom: "1.5rem",
              lineHeight: 1.2,
            }}
          >
            Giải pháp đào tạo ngôn ngữ chuyên nghiệp – tạo giá trị từ việc nâng
            cao năng lực học tập.
          </Title>

          <Text
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "1.25rem",
              fontWeight: 500,
              maxWidth: "1000px",
            }}
          >
            FLearn là nền tảng trực tuyến kết nối người học với giáo viên tiếng
            Anh, tiếng Trung và tiếng Nhật. Hãy tham gia cộng đồng những nhà
            giáo dục đầy nhiệt huyết của chúng tôi và bắt đầu tạo nên sự khác
            biệt ngay hôm nay!
          </Text>
        </div>
      </div>
      <div className="px-4 relative z-20 -mt-20">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-md shadow-2xl p-10 max-w-5xl w-full mx-auto border border-gray-100"
        >
          {/* Steps Indicator */}
          <div className="mb-8">
            <Steps
              current={currentStep}
              items={steps.map((s) => ({ title: s.title }))}
            />
          </div>

          {/* Form Content */}
          <div className="mt-6 min-h-[400px]">{steps[currentStep].content}</div>

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
            <div>
              {currentStep > 0 && (
                <Button
                  onClick={prev}
                  className="px-8 h-10 text-gray-600 hover:text-gray-900 border-gray-300"
                  size="large"
                >
                  Trước
                </Button>
              )}
            </div>

            <div>
              {currentStep < steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={next}
                  size="large"
                  className="px-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none shadow-lg shadow-blue-200"
                >
                  Tiếp theo
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherApplicationPage;
