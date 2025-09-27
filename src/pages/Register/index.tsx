/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Typography, Card, Steps } from 'antd';
import { register, verifyOtp, resendOtp } from '../../services/auth';
import { notifySuccess, notifyError } from '../../utils/toastConfig';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';

const { Title } = Typography;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [userEmail, setUserEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Register mutation
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

        // Save state to localStorage
        localStorage.setItem('registerStep', 'verify');
        localStorage.setItem('userEmail', variables.email);

        const expiry = Date.now() + 5 * 60 * 1000;
        localStorage.setItem('otpExpiry', expiry.toString());
        setTimeLeft(300);
      }
    },
    onError: (err: AxiosError<any>) => {
      notifyError(err?.response?.data?.message || 'Register failed');
    },
  });

  // Verify OTP mutation
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
    onError: (err: AxiosError<any>) => {
      notifyError(err?.response?.data?.message || 'OTP verification failed');
    },
  });

  // Resend OTP mutation
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
    onError: (err: AxiosError<any>) => {
      notifyError(err?.response?.data?.message || 'Failed to resend OTP');
    },
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

  return (
    <section className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='container mx-auto w-[600px] px-4 flex justify-center'>
        <Card className='w-full max-w-md shadow-lg rounded-xl'>
          {/* Step header */}
          <Steps
            direction='horizontal'
            responsive={true}
            current={step === 'register' ? 0 : 1}
            size='small'
            items={[{ title: 'Register' }, { title: 'Verify OTP' }]}
            style={{ marginBottom: 16 }}
          />

          {/* Title */}
          <Title level={3} style={{ textAlign: 'center', marginBottom: 16 }}>
            {step === 'register' ? 'Register' : 'Verify OTP'}
          </Title>

          {step === 'register' ? (
            <Form
              form={form}
              layout='vertical'
              onFinish={handleRegister}
              initialValues={{
                userName: '',
                email: '',
                password: '',
                confirmPassword: '',
              }}
            >
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
                style={{ marginBottom: '8px' }}
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

              <div className='text-center mt-4'>
                <Button type='link' danger onClick={() => (window.location.href = '/login')}>
                  Back to Login?
                </Button>
              </div>

              <Form.Item>
                <Button
                  type='primary'
                  htmlType='submit'
                  block
                  size='large'
                  loading={loading}
                  className='bg-blue-600 hover:!bg-blue-700'
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Form form={otpForm} layout='vertical' onFinish={handleVerify}>
              <Form.Item>
                <p className='text-center'>
                  We have sent an OTP to <strong>{userEmail}</strong>
                </p>
              </Form.Item>

              <Form.Item
                label='OTP Code'
                name='otpCode'
                rules={[{ required: true, message: 'Please enter the OTP code!' }]}
              >
                <Input.OTP length={6} size='large' formatter={(str) => str.replace(/\D/g, '')} />
              </Form.Item>

              <Form.Item>
                <Button
                  type='primary'
                  htmlType='submit'
                  block
                  size='large'
                  loading={loading}
                  className='bg-blue-600 hover:!bg-blue-700'
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </Form.Item>

              <div className='text-center mt-4'>
                <Button type='link' danger onClick={resetRegistration}>
                  Not you? Start over
                </Button>
              </div>

              <div className='text-center'>
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
    </section>
  );
};

export default Register;
