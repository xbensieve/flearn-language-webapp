/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Typography, Steps } from 'antd';
import { register, verifyOtp, resendOtp } from '../../services/auth';
import { notifySuccess, notifyError } from '../../utils/toastConfig';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [userEmail, setUserEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // === mutation register
  const registerMutation = useMutation({
    mutationFn: (values: {
      userName: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => register(values),
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onSuccess: (data, variables) => {
      if (data.success) {
        notifySuccess(data.message || 'Register successful! Please verify OTP.');
        setUserEmail(variables.email);
        setStep('verify');

        localStorage.setItem('registerStep', 'verify');
        localStorage.setItem('userEmail', variables.email);

        const expiry = Date.now() + 5 * 60 * 1000;
        localStorage.setItem('otpExpiry', expiry.toString());
        setTimeLeft(300);
      }
    },
    onError: (err: AxiosError<any>) =>
      notifyError(err?.response?.data?.message || 'Register failed'),
  });

  // === mutation verify
  const verifyMutation = useMutation({
    mutationFn: (values: { email: string; otpCode: string }) => verifyOtp(values),
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onSuccess: (data) => {
      if (data.success) {
        notifySuccess(data.message || 'OTP Verified successfully!');
        localStorage.removeItem('otpExpiry');
        localStorage.removeItem('registerStep');
        localStorage.removeItem('userEmail');
        navigate('/login');
      }
    },
    onError: (err: AxiosError<any>) =>
      notifyError(err?.response?.data?.message || 'OTP verification failed'),
  });

  // === mutation resend
  const resendMutation = useMutation({
    mutationFn: () => resendOtp({ email: userEmail }),
    onSuccess: (data) => {
      if (data.success) {
        notifySuccess(data.message || 'OTP resent successfully!');
        const expiry = Date.now() + 5 * 60 * 1000;
        localStorage.setItem('otpExpiry', expiry.toString());
        setTimeLeft(300);
      }
    },
    onError: (err: AxiosError<any>) =>
      notifyError(err?.response?.data?.message || 'Failed to resend OTP'),
  });

  // === mount effect
  useEffect(() => {
    const savedStep = localStorage.getItem('registerStep');
    const savedEmail = localStorage.getItem('userEmail');
    if (savedStep) setStep(savedStep as 'register' | 'verify');
    if (savedEmail) setUserEmail(savedEmail);

    const expiryStr = localStorage.getItem('otpExpiry');
    if (expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      const diff = Math.floor((expiry - Date.now()) / 1000);
      if (diff > 0) setTimeLeft(diff);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const resetRegistration = () => {
    localStorage.removeItem('otpExpiry');
    localStorage.removeItem('registerStep');
    localStorage.removeItem('userEmail');
    setStep('register');
    setUserEmail('');
    setTimeLeft(0);
    form.resetFields();
    otpForm.resetFields();
  };

  const handleRegister = (values: {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    registerMutation.mutate(values);
  };

  const handleVerify = (values: { otpCode: string }) => {
    verifyMutation.mutate({ email: userEmail, otpCode: values.otpCode });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ===== STYLES giống trang Login =====
  const page: React.CSSProperties = {
    height: '100vh',
    width: '100vw',
    margin: 0,
    background: '#e5e7eb',
  };

  const shell: React.CSSProperties = {
    height: '100%',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '55% 45%',
    background: '#ffffff',
    overflow: 'hidden',
  };

  const left: React.CSSProperties = {
    position: 'relative',
    height: '100%',
    width: '100%',
    backgroundImage: "url('https://foyle.eu/wp-content/uploads/2020/01/languages.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'flex-end',
    padding: 32,
  };

  const leftOverlay: React.CSSProperties = {
    width: '100%',
    background: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
    padding: '14px 18px',
  };

  const right: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 64px',
    overflowY: 'auto',
  };

  const rightInner: React.CSSProperties = {
    width: 'min(520px, 100%)',
  };

  const desc: React.CSSProperties = {
    margin: '4px 0 24px',
    color: '#6b7280',
    textAlign: 'center',
  };

  const loginBtn: React.CSSProperties = {
    height: 44,
    borderRadius: 999,
    border: 'none',
    backgroundColor: '#06b6d4',
    fontWeight: 700,
  };

  return (
    <section style={page}>
      <div style={shell}>
        {/* LEFT */}
        <div style={left}>
          <div style={leftOverlay}>
            <Title
              level={4}
              style={{ color: '#fff', margin: 0 }}>
              Join our community
            </Title>
            <Text style={{ color: '#e5e7eb' }}>Start your journey with us today</Text>
          </div>
        </div>

        {/* RIGHT */}
        <div style={right}>
          <div style={rightInner}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: 700 }}>Create a new account</Text>
              <div style={{ marginTop: 12, marginBottom: 16 }}>
                <Button
                  type="default"
                  style={{ marginRight: 8 }}
                  onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button
                  type="primary"
                  style={{ backgroundColor: '#06b6d4', border: 'none' }}>
                  Register
                </Button>
              </div>
            </div>

            <p style={desc}>Sign up to start your learning journey and experience the platform.</p>

            <Steps
              current={step === 'register' ? 0 : 1}
              size="small"
              items={[{ title: 'Register' }, { title: 'Verify OTP' }]}
              style={{ marginBottom: 24 }}
            />

            {step === 'register' ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleRegister}>
                <Form.Item
                  label="Username"
                  name="userName"
                  rules={[{ required: true, message: 'Please enter your username!' }]}>
                  <Input placeholder="Enter username" />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email!' },
                    { type: 'email', message: 'Please enter a valid email!' },
                  ]}>
                  <Input placeholder="Enter email" />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: 'Please enter your password!' }]}>
                  <Input.Password placeholder="Enter password" />
                </Form.Item>

                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match!'));
                      },
                    }),
                  ]}>
                  <Input.Password placeholder="Confirm password" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    style={loginBtn}>
                    {loading ? 'Registering...' : 'Register'}
                  </Button>
                </Form.Item>
              </Form>
            ) : (
              <Form
                form={otpForm}
                layout="vertical"
                onFinish={handleVerify}>
                <Form.Item>
                  <p style={{ textAlign: 'center' }}>
                    We have sent an OTP to <strong>{userEmail}</strong>
                  </p>
                </Form.Item>

                <Form.Item
                  label="OTP Code"
                  name="otpCode"
                  rules={[{ required: true, message: 'Please enter the OTP code!' }]}>
                  <Input.OTP
                    length={6}
                    size="large"
                    formatter={(str) => str.replace(/\D/g, '')}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    style={loginBtn}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </Form.Item>

                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <Button
                    type="link"
                    danger
                    onClick={resetRegistration}>
                    Not you? Start over
                  </Button>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="link"
                    onClick={() => resendMutation.mutate()}
                    disabled={timeLeft > 0 || resendMutation.isPending}>
                    {timeLeft > 0 ? `Resend available in ${formatTime(timeLeft)}` : 'Resend OTP'}
                  </Button>
                </div>
              </Form>
            )}
          </div>
        </div>
      </div>

      {/* responsive fallback */}
      <style>{`
        @media (max-width: 1024px) {
          section > div { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
};

export default Register;
