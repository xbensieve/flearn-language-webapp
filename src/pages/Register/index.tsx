/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Typography, Steps, Card } from 'antd';
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

  // === register mutation
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

  // === verify mutation
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

  // === resend mutation
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

  // ===== STYLES refined for full-screen + card layout =====
  const container: React.CSSProperties = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#a9d4ef',
  };

  const leftSide: React.CSSProperties = {
    flex: 1,
    backgroundImage: "url('10290108.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100%',
    width: '100%',
  };

  const rightSide: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #ffffff, #e6f7fb)',
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 480,
    padding: '40px 32px',
    borderRadius: 16,
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff',
  };

  const primaryButton: React.CSSProperties = {
    height: 44,
    borderRadius: 999,
    border: 'none',
    backgroundColor: '#06b6d4',
    fontWeight: 700,
  };

  const subtitle: React.CSSProperties = {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  };

  return (
    <div style={container}>
      {/* LEFT IMAGE SIDE */}
      <div style={leftSide}></div>

      {/* RIGHT FORM SIDE */}
      <div style={rightSide}>
        <Card style={cardStyle} bordered={false}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3} style={{ color: '#06b6d4', marginBottom: 4 }}>
              Create a New Account
            </Title>
            <Text style={subtitle}>Join our learning community and start your journey!</Text>
          </div>

          <Steps
            current={step === 'register' ? 0 : 1}
            size='small'
            items={[{ title: 'Register' }, { title: 'Verify OTP' }]}
            style={{ marginBottom: 24 }}
          />

          {step === 'register' ? (
            <Form form={form} layout='vertical' onFinish={handleRegister}>
              <Form.Item
                label='Username'
                name='userName'
                rules={[{ required: true, message: 'Please enter your username!' }]}
              >
                <Input placeholder='Enter username' />
              </Form.Item>

              <Form.Item
                label='Email'
                name='email'
                rules={[
                  { required: true, message: 'Please enter your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input placeholder='Enter email' />
              </Form.Item>

              <Form.Item
                label='Password'
                name='password'
                rules={[{ required: true, message: 'Please enter your password!' }]}
              >
                <Input.Password placeholder='Enter password' />
              </Form.Item>

              <Form.Item
                label='Confirm Password'
                name='confirmPassword'
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
                ]}
              >
                <Input.Password placeholder='Confirm password' />
              </Form.Item>

              <Button
                type='primary'
                htmlType='submit'
                block
                size='large'
                loading={loading}
                style={primaryButton}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Text>Already have an account? </Text>
                <Button type='link' onClick={() => navigate('/login')} style={{ color: '#06b6d4' }}>
                  Login
                </Button>
              </div>
            </Form>
          ) : (
            <Form form={otpForm} layout='vertical' onFinish={handleVerify}>
              <p style={{ textAlign: 'center' }}>
                We have sent an OTP to <strong>{userEmail}</strong>
              </p>

              <Form.Item
                label='OTP Code'
                name='otpCode'
                rules={[{ required: true, message: 'Please enter the OTP code!' }]}
              >
                <Input.OTP length={6} size='large' formatter={(str) => str.replace(/\D/g, '')} />
              </Form.Item>

              <Button
                type='primary'
                htmlType='submit'
                block
                size='large'
                loading={loading}
                style={primaryButton}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Button type='link' danger onClick={resetRegistration}>
                  Not you? Start over
                </Button>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Button
                  type='link'
                  onClick={() => resendMutation.mutate()}
                  disabled={timeLeft > 0 || resendMutation.isPending}
                >
                  {timeLeft > 0 ? `Resend available in ${formatTime(timeLeft)}` : 'Resend OTP'}
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Register;
