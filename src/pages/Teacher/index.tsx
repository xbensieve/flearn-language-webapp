/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
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
  Checkbox,
  Image,
} from 'antd';
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
import {
  BookOpen,
  Cake,
  Calendar,
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
} from 'lucide-react';
import { PROFICIENCY_LEVELS } from '../../utils/constants';
import InfoSection from './components/InfoSection';

const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

// eslint-disable-next-line react-refresh/only-export-components
export const proficiencyByLanguage: Record<string, { label: string; value: string }[]> = {
  en: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((x) => ({ label: x, value: x })),
  ja: ['N5', 'N4', 'N3', 'N2', 'N1'].map((x) => ({ label: x, value: x })),
  zh: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'].map((x) => ({
    label: x,
    value: x,
  })),
};
const LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    flag: 'US',
    color: '#3b82f6', // blue-500
    gradientStart: '#dbeafe', // blue-50
    gradientEnd: '#bfdbfe', // blue-100
    native: '379M',
    learners: '1.5B+',
    badge: 'Most Popular',
    icon: <Globe className='w-4 h-4' />,
  },
  {
    code: 'ja',
    name: '日本語 (Japanese)',
    flag: 'JP',
    color: '#ef4444', // red-500
    gradientStart: '#fee2e2', // red-50
    gradientEnd: '#fecaca', // red-100
    native: '125M',
    learners: '3M+',
    badge: 'Unique Culture',
    icon: <BookOpen className='w-4 h-4' />,
  },
  {
    code: 'zh',
    name: '中文 (Chinese)',
    flag: 'CN',
    color: '#eab308', // yellow-500
    gradientStart: '#fefce8', // yellow-50
    gradientEnd: '#fef9c3', // yellow-100
    native: '1.1B',
    learners: '40M+',
    badge: 'Business Power',
    icon: <Users className='w-4 h-4' />,
  },
] as const;

interface LanguageCardProps {
  lang: Language;
  selected: boolean;
  onClick: () => void;
  loading?: boolean;
}

const LanguageCard: React.FC<LanguageCardProps> = ({ lang, selected, onClick, loading }) => {
  const info = LANGUAGES.find((l) => l.code === lang.langCode)!;

  return (
    <motion.div
      whileHover={{ scale: loading ? 1 : 1.06 }}
      whileTap={{ scale: loading ? 1 : 0.96 }}
      className='w-full'
    >
      <Card
        hoverable={!loading}
        onClick={loading ? undefined : onClick}
        className='relative overflow-hidden rounded-3xl transition-all duration-300 cursor-pointer'
        style={{
          border: selected ? `2px solid ${info.color.replace('bg-', '#')}` : '1px solid #e5e7eb',
          background: selected
            ? `linear-gradient(135deg, ${info.gradientStart}, ${info.gradientEnd})`
            : 'white',
          boxShadow: selected
            ? `0 0 0 4px ${info.color.replace('bg-', '#')}20, 0 12px 30px rgba(0,0,0,0.12)`
            : '0 4px 12px rgba(0,0,0,0.08)',
          opacity: loading ? 0.6 : 1,
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {/* Flag + Badge */}
        <div className='flex justify-center mb-4 relative'>
          <div className='relative'>
            {/* Flag */}
            <div
              className='w-16 h-16 rounded-full overflow-hidden shadow-lg ring-4 ring-white'
              style={{
                backgroundImage: `url(https://flagcdn.com/w160/${info.flag.toLowerCase()}.png)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            {/* Selected Indicator */}
            {selected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className='absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-xl'
                style={{ backgroundColor: info.color.replace('bg-', '#') }}
              >
                <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </motion.div>
            )}
          </div>
        </div>

        {/* Language Name */}
        <Text
          strong
          className='block text-center text-lg mb-3'
          style={{
            color: selected ? info.color.replace('bg-', '#') : '#1f2937',
            fontWeight: 700,
          }}
        >
          {info.name}
        </Text>

        {/* Badge */}
        {/* <div className='flex justify-center mb-4'>
          <Badge
            count={info.badge}
            style={{
              backgroundColor: info.color.replace('bg-', '#'),
              color: 'white',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '0 8px',
              height: '22px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
            }}
          />
        </div> */}

        {/* Stats */}
        {/* <Space direction='vertical' size={8} className='w-full'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600 flex items-center gap-1'>
              <Globe className='w-3.5 h-3.5' /> Native
            </span>
            <span className='font-bold text-gray-900'>{info.native}</span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600 flex items-center gap-1'>
              <Users className='w-3.5 h-3.5' /> Learners
            </span>
            <span className='font-bold text-gray-900'>{info.learners}</span>
          </div>
        </Space> */}

        {/* Pulse Animation */}
        {selected && (
          <motion.div
            className='absolute inset-0 rounded-3xl pointer-events-none'
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              background: `radial-gradient(circle at center, ${info.color.replace(
                'bg-',
                '#'
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
  const levelInfo = PROFICIENCY_LEVELS[langCode]?.find((l) => l.value === level.value);
  if (!levelInfo) return null;

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className='w-full'>
      <Card
        hoverable
        onClick={onClick}
        className='relative overflow-hidden rounded-2xl transition-all duration-300'
        style={{
          border: selected ? `2px solid ${levelInfo.color}` : '1px solid #e5e7eb',
          background: selected
            ? `linear-gradient(135deg, ${levelInfo.color}05, ${levelInfo.color}10)`
            : '#ffffff',
          boxShadow: selected
            ? `0 0 0 3px ${levelInfo.color}25, 0 8px 20px rgba(0,0,0,0.1)`
            : '0 2px 8px rgba(0,0,0,0.06)',
          cursor: 'pointer',
        }}
        bodyStyle={{ padding: '18px' }}
      >
        {/* Level Label */}
        <Text
          strong
          className='block text-center text-lg mb-2'
          style={{
            color: selected ? levelInfo.color : '#1f2937',
            fontWeight: 700,
          }}
        >
          {level.label}
        </Text>

        {/* Description */}
        {/* <Text
          type='secondary'
          className='block text-center text-xs mb-3'
          style={{ color: selected ? '#555' : '#6b7280' }}
        >
          {levelInfo.description}
        </Text> */}

        {/* Pulse when selected */}
        {selected && (
          <motion.div
            className='absolute inset-0 rounded-2xl pointer-events-none'
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
  const selectedLang = Form.useWatch('LangCode', form);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ✅ Get my application
  const { data: response, isLoading } = useQuery<{ data: ApplicationData[] }>({
    queryKey: ['myApplication'],
    queryFn: () => getMyApplication(),
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
    onSuccess: () => {
      setIsSubmitted(true);
      notifySuccess('Application submitted successfully!');
      navigate('/learner/application?status=success');
    },
    onError: (err: AxiosError<any>) => {
      toast.error(err.response?.data.errors || 'Failed to submit application.');
    },
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: updateSubmitTeacherApplication,
    onSuccess: () => {
      setIsSubmitted(true);
      notifySuccess('Application updated successfully!');
      navigate('/teacher');
    },
    onError: (err: AxiosError<any>) => {
      toast.error(err.response?.data.errors || 'Failed to update application.');
    },
  });

  React.useEffect(() => {
    const current = form.getFieldValue('Certificates') || [];
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
        ProficiencyCode: allData.proficiencyCode,
      };

      const now = new Date();
      const closestApplication = response?.data.reduce((closest: any, current: any) => {
        const currentDate = new Date(current.submittedAt);
        const closestDate = closest ? new Date(closest.submittedAt) : null;
        const currentDiff = Math.abs(now.getTime() - currentDate.getTime());
        const closestDiff = closestDate
          ? Math.abs(now.getTime() - closestDate.getTime())
          : Infinity;
        return currentDiff < closestDiff ? current : closest;
      }, null);

      console.log('closestApplication', closestApplication);

      if (closestApplication && closestApplication.status.toLowerCase() === 'pending') {
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
        <Form form={form} layout='vertical' size='large'>
          <Form.Item
            label={<Text strong>Select Language</Text>}
            name='LangCode'
            rules={[{ required: true, message: 'Please select a language' }]}
          >
            <div>
              {loadingLanguages ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size='large' tip='Loading languages...' />
                </div>
              ) : (
                <Flex gap={24} justify='space-between'>
                  {languagesData?.data?.map((lang: Language) => (
                    <div className='w-1/3' key={lang.langCode}>
                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          const isSelected = getFieldValue('LangCode') === lang.langCode;
                          return (
                            <LanguageCard
                              lang={lang}
                              selected={isSelected}
                              onClick={() => form.setFieldsValue({ LangCode: lang.langCode })}
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
            label={<Text strong>Proficiency Level</Text>}
            name='proficiencyCode'
            rules={[{ required: true, message: 'Please select your proficiency level' }]}
          >
            <div>
              {!selectedLang ? (
                <Text
                  type='secondary'
                  style={{ display: 'block', textAlign: 'center', padding: '20px 0' }}
                >
                  Please select a language first
                </Text>
              ) : (
                <Row gutter={[12, 12]}>
                  {proficiencyByLanguage[selectedLang]?.map((level) => (
                    <Col xs={12} sm={8} md={6} key={level.value}>
                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          const isSelected = getFieldValue('proficiencyCode') === level.value;
                          return (
                            <ProficiencyCard
                              level={level}
                              langCode={selectedLang}
                              selected={isSelected}
                              onClick={() => form.setFieldsValue({ proficiencyCode: level.value })}
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
      title: 'Information',
      content: (
        <Form form={form} layout='vertical' className='!space-y-6' size='large'>
          {/* === 1. Personal Details === */}
          <InfoSection title='Personal Details' icon={<User className='w-5 h-5' />}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name='FullName'
                  label='Full Name'
                  required
                  rules={[{ required: true, message: 'Full name is required' }]}
                >
                  <Input placeholder='Nguyễn Văn A' className='h-11' />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name='BirthDate'
                  label='Date of Birth'
                  rules={[
                    { required: true, message: 'Date of birth is required' },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.reject();
                        const today = new Date();
                        const age = today.getFullYear() - value.year();
                        if (age < 18) {
                          return Promise.reject('You must be at least 18 years old');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <DatePicker
                    placeholder='DD/MM/YYYY'
                    format='DD/MM/YYYY'
                    className='w-full h-11'
                  />
                </Form.Item>
              </Col>
            </Row>
          </InfoSection>

          {/* === 6. Profile Picture – italki style (no local state) === */}
          <InfoSection title='Profile Picture' icon={<Camera className='w-5 h-5' />}>
            <Form.Item noStyle shouldUpdate={(prev, next) => prev.Avatar !== next.Avatar}>
              {({ getFieldValue }) => {
                const fileList: any[] = getFieldValue('Avatar') || [];

                // --------------------------------------------------------------
                //  No validation – just store the file the user picks
                // --------------------------------------------------------------
                const beforeUpload = (file: any) => {
                  // keep only the selected file (replace any previous one)
                  form.setFieldsValue({ Avatar: [file] });
                  return false; // prevent AntD from uploading
                };

                // --------------------------------------------------------------
                //  Build a preview URL from the file object
                // --------------------------------------------------------------
                const previewFile = fileList[0];
                const previewUrl = previewFile
                  ? previewFile.thumbUrl ||
                    (previewFile.originFileObj
                      ? URL.createObjectURL(previewFile.originFileObj)
                      : undefined)
                  : undefined;

                return (
                  <Row gutter={32} align='middle'>
                    {/* ---------- LEFT – PREVIEW ---------- */}
                    <Col xs={24} md={10} className='text-center'>
                      <div className='mb-4 flex items-center justify-center'>
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt='Avatar preview'
                            className='w-40 h-40 rounded-full object-cover shadow-lg ring-4 ring-white'
                          />
                        ) : (
                          <div className='w-40 h-40 mx-auto bg-gray-200 rounded-full flex items-center justify-center'>
                            <Camera className='w-16 h-16 text-gray-400' />
                          </div>
                        )}
                      </div>

                      <Space direction='vertical' size='small' className='w-full'>
                        <Text strong>Edit Profile Photo</Text>

                        <Text type='secondary' className='text-xs'>
                          • At least 250×250 pixels
                          <br />
                          • JPG, PNG and BMP formats only
                          <br />• Maximum size of 2 MB
                        </Text>

                        {/* ---- Upload button (no validation) ---- */}
                        <Form.Item
                          name='Avatar'
                          valuePropName='fileList'
                          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                          rules={[{ required: true, message: 'Please upload a photo' }]}
                          noStyle
                        >
                          <Upload
                            beforeUpload={beforeUpload}
                            fileList={fileList}
                            showUploadList={false}
                            accept='image/jpeg,image/png,image/bmp'
                          >
                            <Button
                              type='primary'
                              danger
                              className='mt-3 w-full max-w-xs'
                              icon={<UploadOutlined />}
                            >
                              CHOOSE A PHOTO
                            </Button>
                          </Upload>
                        </Form.Item>
                      </Space>
                    </Col>

                    {/* ---------- RIGHT – DO / DON’T ---------- */}
                    <Col xs={24} md={14}>
                      <Text className='block mb-4'>
                        Your photo has to respect the following characteristics:
                        <strong> Does your photo look like these? If so, that’s great!</strong>
                      </Text>

                      {/* GOOD examples – replace with your own assets */}
                      <Space
                        size='large'
                        className='mb-6 flex flex-wrap justify-center md:justify-start'
                      >
                        {['/good1.jpg', '/good2.jpg', '/good3.jpg', '/good4.jpg'].map((src, i) => (
                          <Image
                            key={i}
                            src={src}
                            width={70}
                            height={70}
                            className='rounded-full object-cover shadow'
                            preview={false}
                          />
                        ))}
                      </Space>

                      <Text type='danger' strong className='block mb-2'>
                        Please <span className='underline'>DO NOT</span> use photos like the ones
                        shown below:
                      </Text>

                      {/* BAD examples */}
                      <Space
                        size='large'
                        className='flex flex-wrap justify-center md:justify-start'
                      >
                        {['/bad1.jpg', '/bad2.jpg', '/bad3.jpg', '/bad4.jpg'].map((src, i) => (
                          <Image
                            key={i}
                            src={src}
                            width={70}
                            height={70}
                            className='rounded-full object-cover shadow ring-2 ring-red-500'
                            preview={false}
                          />
                        ))}
                      </Space>

                      {/* Warning checkbox */}
                      <Form.Item
                        name='photoAgreement'
                        valuePropName='checked'
                        rules={[
                          {
                            validator: (_, value) =>
                              value
                                ? Promise.resolve()
                                : Promise.reject(
                                    'You must confirm that your photo meets the requirements'
                                  ),
                          },
                        ]}
                        className='mt-6'
                      >
                        <Checkbox>
                          I’m aware that if my profile photo does not respect the listed
                          characteristics, my application to become a teacher on italki could be
                          rejected.
                        </Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>
                );
              }}
            </Form.Item>
          </InfoSection>

          {/* === 2. About You === */}
          <InfoSection title='About You' icon={<Calendar className='w-5 h-5' />}>
            <Form.Item
              name='Bio'
              label='Tell us about yourself'
              rules={[{ required: true, message: 'Please tell us about yourself' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder='E.g., Passionate English teacher with 3 years of experience helping students achieve fluency...'
                className='resize-none'
              />
            </Form.Item>
          </InfoSection>

          {/* === 3. Contact Information === */}
          <InfoSection title='Contact Information' icon={<Mail className='w-5 h-5' />}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label='Email'
                  name='Email'
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Invalid email format' },
                  ]}
                >
                  <Input placeholder='you@example.com' className='h-11' />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name='PhoneNumber'
                  label='Phone number'
                  rules={[
                    { required: true, message: 'Phone number is required' },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.reject();

                        // Remove all non-digits
                        const digits = value.replace(/\D/g, '');

                        // Must start with 0 (local) or 84 (intl)
                        const isVN = /^0\d{9}$/.test(digits) || /^84\d{9}$/.test(digits);
                        if (!isVN) {
                          return Promise.reject('Please enter a valid Vietnamese phone number');
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    placeholder='+84 901 234 567'
                    className='h-11'
                    maxLength={14}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, ''); // keep digits only

                      // Auto-convert 0... → +84...
                      if (val.startsWith('0') && val.length > 1) {
                        val = '84' + val.slice(1);
                      }

                      // Format: +84 XXX XXX XXX
                      if (val.startsWith('84') && val.length > 2) {
                        val = '+84 ' + val.slice(2).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
                      }

                      // Update form field
                      form.setFieldsValue({ PhoneNumber: val });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </InfoSection>

          {/* === 4. Teaching Experience === */}
          <InfoSection title='Teaching Experience' icon={<BookOpen className='w-5 h-5' />}>
            <Form.Item
              label='Teaching experience'
              name='TeachingExperience'
              rules={[{ required: true, message: 'Please describe your teaching background' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder='E.g., Taught 200+ students online, specialized in conversational English, TOEIC prep...'
                className='resize-none'
              />
            </Form.Item>
          </InfoSection>

          {/* === 5. Meeting Link === */}
          <InfoSection title='Meeting Link' icon={<Link className='w-5 h-5' />}>
            <Form.Item
              name='MeetingUrl'
              label='Meeting link'
              rules={[
                { required: true, message: 'Meeting link is required' },
                { type: 'url', message: 'Please enter a valid URL' },
              ]}
            >
              <Input placeholder='https://zoom.us/j/123456789' className='h-11' />
            </Form.Item>
          </InfoSection>
        </Form>
      ),
    },
    {
      title: 'Certificates',
      content: (
        <Form form={form} layout='vertical' size='large'>
          <Form.List name='Certificates'>
            {(fields, { add, remove }) => (
              <>
                {/* === Header === */}
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg'>
                      <GraduationCap className='w-5 h-5' />
                    </div>
                    <Text strong className='text-lg text-gray-800'>
                      Certificates
                    </Text>
                  </div>
                  <Button
                    type='dashed'
                    onClick={() => add()}
                    disabled={!selectedLanguage}
                    icon={<UploadOutlined />}
                    className='border-indigo-300 text-indigo-600 hover:border-indigo-500 hover:text-indigo-700'
                  >
                    Add Certificate
                  </Button>
                </div>

                {/* === Loading === */}
                {loadingCertificates && (
                  <div className='flex justify-center py-8'>
                    <Spin size='large' tip='Loading certificates...' />
                  </div>
                )}

                {/* === Certificate Cards === */}
                <Space direction='vertical' size='middle' className='w-full'>
                  {fields.map(({ key, name, ...restField }) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                      className='relative group'
                    >
                      <Card
                        hoverable
                        className='overflow-hidden rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50'
                        bodyStyle={{ padding: 0 }}
                      >
                        <div className='p-5'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                            {/* === Certificate Type === */}
                            <Form.Item
                              {...restField}
                              name={[name, 'CertificateTypeId']}
                              label={
                                <span className='flex items-center gap-2 text-gray-700 font-medium'>
                                  <Trophy className='w-4 h-4 text-yellow-500' />
                                  Certificate Type
                                </span>
                              }
                              rules={[{ required: true, message: 'Select a certificate' }]}
                            >
                              <Select
                                placeholder='Choose certificate'
                                disabled={!selectedLanguage || loadingCertificates}
                                className='w-full'
                                dropdownClassName='z-50'
                                size='large'
                              >
                                {certificatesData?.data?.map((cert: Certificate) => (
                                  <Option key={cert.certificateId} value={cert.certificateId}>
                                    <div className='flex items-center gap-2'>
                                      <Badge color={cert.name ? 'gold' : 'blue'} dot />
                                      {cert.name}
                                    </div>
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, 'CertificateImage']}
                              label=' Image'
                              valuePropName='fileList'
                              getValueFromEvent={(e) => e.fileList}
                              rules={[{ required: true, message: 'Please upload image' }]}
                            >
                              <Upload
                                beforeUpload={() => false}
                                listType='picture-card'
                                maxCount={1}
                              >
                                <div>
                                  <UploadOutlined />
                                  <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                              </Upload>
                            </Form.Item>
                          </div>
                        </div>

                        {/* === Remove Button (only if >1) === */}
                        {fields.length > 1 && (
                          <Button
                            type='text'
                            danger
                            size='small'
                            className='!absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity'
                            icon={<Trash2 className='w-4 h-4' />}
                            onClick={() => remove(name)}
                          />
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </Space>

                {/* === Empty State (never shown) === */}
                {fields.length === 0 && !loadingCertificates && (
                  <div className='text-center py-12 text-gray-500'>
                    <Text type='secondary'>No certificates added yet.</Text>
                  </div>
                )}
              </>
            )}
          </Form.List>
        </Form>
      ),
    },
    {
      title: 'Review & Submit',
      content: (
        <div className='max-w-6xl mx-auto px-4 py-8 space-y-8 bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-xl'>
          <Title
            level={3} // Bumped to level 3 for more prominence
            className='text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 mb-2 tracking-wide'
          >
            Review Your Application
          </Title>
          <Paragraph className='text-center text-gray-600 mb-8'>
            Double-check your details before submitting. Everything looks good? Hit submit!
          </Paragraph>

          {/* Language Card */}
          <div className='bg-white border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
              <Paragraph className='text-gray-700 font-semibold !mb-0'>
                Preferred Language
              </Paragraph>
            </div>
            <p className='text-gray-800 text-lg font-medium'>
              {languagesData?.data?.find((l: any) => l.langCode === formData.LangCode)?.langName ||
                'Not selected'}{' '}
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Basic Info Card */}
            <div className='bg-white border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-2 h-2 bg-indigo-500 rounded-full'></div>
                <Paragraph className='text-gray-700 font-semibold !mb-0'>
                  Basic Information
                </Paragraph>
              </div>

              <div className='space-y-4 text-gray-800'>
                {/* Avatar + Name - Full width hero section */}
                <div className='flex items-center gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200'>
                  {formData.Avatar?.[0] ? (
                    <Avatar
                      src={URL.createObjectURL(formData.Avatar[0].originFileObj)}
                      alt='Applicant Avatar Preview'
                      className='!w-16 !h-16 border-2 border-indigo-300 object-cover rounded-full shadow-md ring-2 ring-indigo-100'
                      icon={
                        <div className='w-full h-full bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                          A
                        </div>
                      } // Fallback icon
                    />
                  ) : (
                    <div className='w-16 h-16 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-indigo-100'>
                      <span className='text-white font-bold text-sm'>
                        {formData.FullName?.charAt(0) || 'A'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className='text-xl font-bold text-gray-900'>
                      {formData.FullName || 'Unnamed Applicant'}
                    </h3>
                    <p className='text-indigo-600 font-medium'>
                      {formData.Email || 'No email provided'}
                    </p>
                  </div>
                </div>

                {/* Info Fields - Grid for better layout */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {[
                    {
                      label: 'Date of Birth',
                      value: formData.BirthDate?.format?.('MMM DD, YYYY') || '-',
                      icon: <Cake />,
                    },
                    {
                      label: 'Phone',
                      value: formData.PhoneNumber || '-',
                      icon: <Phone />,
                    },
                    {
                      label: 'Meeting URL',
                      value: formData.MeetingUrl ? (
                        <a
                          href={formData.MeetingUrl}
                          target='_blank'
                          className='text-blue-600 hover:underline font-medium'
                        >
                          View Link
                        </a>
                      ) : (
                        '-'
                      ),
                      icon: <Link />,
                    },
                    {
                      label: 'Proficiency Code',
                      value: formData.proficiencyCode ? <p>{formData.proficiencyCode}</p> : '-',
                      icon: <Languages />,
                    },
                  ].map((field, idx) => (
                    <div key={idx} className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                      <span className='text-2xl'>{field.icon}</span>
                      <div>
                        <strong className='block text-sm font-medium text-gray-700'>
                          {field.label}:
                        </strong>
                        <span className='text-gray-900'>{field.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full-width fields */}
                {[
                  {
                    label: 'Bio',
                    value: formData.Bio || 'No bio provided',
                    icon: <Info />,
                  },
                  {
                    label: 'Teaching Experience',
                    value: formData.TeachingExperience || 'No experience listed',
                    icon: <GraduationCap />,
                  },
                ].map((field, idx) => (
                  <div key={idx} className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
                    <div className='flex items-start gap-3 mb-2'>
                      <span className='text-2xl mt-0.5'>{field.icon}</span>
                      <strong className='text-gray-700 font-semibold'>{field.label}:</strong>
                    </div>
                    <p className='text-gray-800 leading-relaxed whitespace-pre-wrap'>
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {/* Certificates Card - Only if exists, otherwise hidden */}
            {formData.Certificates && formData.Certificates.length > 0 ? (
              <div className='bg-white border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <Paragraph className='text-gray-700 font-semibold !mb-0'>
                    Your Certificates
                  </Paragraph>
                </div>
                <div className='space-y-4 max-h-120 overflow-y-auto'>
                  {formData.Certificates.map((cert: any, idx: number) => {
                    const certInfo = certificatesData?.data?.find(
                      (c: Certificate) => c.certificateId === cert.CertificateTypeId
                    );
                    return (
                      <div
                        key={idx}
                        className='group relative bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm transition-all duration-300 cursor-pointer overflow-hidden'
                      >
                        <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <span className='bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium'>
                            Verified
                          </span>
                        </div>
                        <h4 className='font-bold text-gray-900 mb-2 text-center'>
                          {certInfo?.name || 'Certificate'}
                        </h4>
                        {cert.CertificateImage?.[0] ? (
                          <img
                            src={URL.createObjectURL(cert.CertificateImage[0].originFileObj)}
                            alt={`${certInfo?.name || 'Certificate'} Preview`}
                            className='w-full max-w-sm mx-auto h-32 object-cover rounded-lg border border-gray-200 shadow-inner'
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }} // Hide on error
                          />
                        ) : (
                          <div className='w-full max-w-sm mx-auto h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500'>
                            <span className='text-sm'>No image uploaded</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {formData.Certificates.length === 0 && (
                  <div className='text-center py-8 text-gray-500'>
                    <p className='text-lg'>No certificates added yet.</p>
                    <Button type='dashed' className='mt-2'>
                      Add More
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className='bg-white border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <Paragraph className='text-gray-700 font-semibold !mb-0'>
                    Your Certificates
                  </Paragraph>
                </div>
                <div className='text-center py-8 text-gray-500'>
                  <p className='text-lg'>No certificates added yet.</p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button - Enhanced with animation */}
          {!isSubmitted && (
            <div className='flex flex-col items-center justify-center'>
              <Button
                type='primary'
                onClick={() => handleSubmit()}
                loading={isSubmitting || isUpdating}
                className='w-full max-w-md h-14 text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 shadow-lg
                 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 rounded-xl border-none'
                size='large'
              >
                <span className='flex items-center gap-2'>
                  {isSubmitting || isUpdating ? (
                    <>
                      <span className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </span>
              </Button>

              <Paragraph className='text-xs text-gray-500 mt-2'>
                By submitting, you agree to our terms and privacy policy.
              </Paragraph>
            </div>
          )}
        </div>
      ),
    },
  ];

  return isLoading ? (
    <div className='flex justify-center items-center min-h-screen'>
      <Spin size='large' />
    </div>
  ) : (
    <div className='min-h-screen flex flex-col'>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='bg-white rounded-2xl shadow-xl p-10 my-12 max-w-5xl w-full mx-auto'
      >
        <Steps current={currentStep} items={steps.map((s) => ({ title: s.title }))} />

        <div className='mt-10'>{steps[currentStep].content}</div>

        <div className='mt-8 flex justify-between'>
          {currentStep > 0 && (
            <Button onClick={prev} className='px-6'>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button
              type='primary'
              onClick={next}
              className='px-6 bg-gradient-to-r from-indigo-600 to-blue-500'
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
