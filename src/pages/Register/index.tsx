/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Steps, ConfigProvider } from 'antd';
import { register, verifyOtp, resendOtp } from '../../services/auth';
import { notifySuccess, notifyError } from '../../utils/toastConfig';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [userEmail, setUserEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (data, variables) => {
      if (data.success) {
        notifySuccess(data.message || 'OTP sent to your email!');
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
      notifyError(err?.response?.data?.message || 'Registration failed'),
  });

  const verifyMutation = useMutation({
    mutationFn: (values: { email: string; otpCode: string }) => verifyOtp(values),
    onSuccess: (data) => {
      if (data.success) {
        notifySuccess('Account verified successfully!');
        localStorage.removeItem('otpExpiry');
        localStorage.removeItem('registerStep');
        localStorage.removeItem('userEmail');
        navigate('/login');
      }
    },
    onError: (err: AxiosError<any>) => notifyError(err?.response?.data?.message || 'Invalid OTP'),
  });

  const resendMutation = useMutation({
    mutationFn: () => resendOtp({ email: userEmail }),
    onSuccess: (data) => {
      if (data.success) {
        notifySuccess('New OTP sent!');
        const expiry = Date.now() + 5 * 60 * 1000;
        localStorage.setItem('otpExpiry', expiry.toString());
        setTimeLeft(300);
      }
    },
  });

  useEffect(() => {
    const savedStep = localStorage.getItem('registerStep');
    const savedEmail = localStorage.getItem('userEmail');
    if (savedStep === 'verify' && savedEmail) {
      setStep('verify');
      setUserEmail(savedEmail);
    }

    const expiryStr = localStorage.getItem('otpExpiry');
    if (expiryStr) {
      const diff = Math.floor((parseInt(expiryStr) - Date.now()) / 1000);
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#06b6d4',
          borderRadius: 16,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      }}>
      {/* Full Blue Gradient Background */}
      <div className="min-h-screen flex bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-600 relative overflow-hidden">
        {/* Animated Blue Blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-20 left-1/3 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-3000"></div>

        {/* Left Hero Section */}
        <div className="hidden lg:flex flex-1 items-center justify-center px-12 relative z-10">
          <div className="max-w-lg text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to <span className="text-cyan-200">Flearn</span>
            </h1>
            <p className="text-xl md:text-2xl opacity-95 leading-relaxed mb-8">
              Learn from the best teachers. Grow without limits.
            </p>
            <p className="text-lg opacity-90">
              Join thousands of learners already mastering new skills with Flearn.
            </p>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 md:p-10">
              {/* Logo + Title */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold text-white shadow-xl">
                  F
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {step === 'register' ? 'Create Account' : 'Verify Your Email'}
                </h2>
                <p className="text-gray-600 mt-2">
                  {step === 'register'
                    ? 'Start your learning journey today'
                    : `Enter the code sent to ${userEmail}`}
                </p>
              </div>

              {/* Progress Steps */}
              <Steps
                current={step === 'register' ? 0 : 1}
                size="small"
                className="!mb-10"
                items={[{ title: 'Register' }, { title: 'Verify OTP' }]}
              />

              {/* Register Form */}
              {step === 'register' ? (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={registerMutation.mutate}>
                  <Form.Item
                    name="userName"
                    rules={[{ required: true, message: 'Username is required' }]}>
                    <Input
                      placeholder="Choose a username"
                      className="h-14 text-lg rounded-xl border-gray-300 focus:border-cyan-500"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Email is required' },
                      { type: 'email', message: 'Enter a valid email' },
                    ]}>
                    <Input
                      placeholder="your@email.com"
                      className="h-14 text-lg rounded-xl border-gray-300 focus:border-cyan-500"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Password is required' }]}>
                    <Input.Password
                      placeholder="Create a strong password"
                      className="h-14 text-lg rounded-xl"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value)
                            return Promise.resolve();
                          return Promise.reject(new Error('Passwords do not match'));
                        },
                      }),
                    ]}>
                    <Input.Password
                      placeholder="Confirm your password"
                      className="h-14 text-lg rounded-xl"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={registerMutation.isPending}
                    className="h-14 text-lg font-semibold rounded-xl shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0">
                    Create Account
                  </Button>

                  <div className="text-center mt-6">
                    <span className="text-gray-600">Already have an account? </span>
                    <Button
                      type="link"
                      onClick={() => navigate('/login')}
                      className="text-cyan-600 font-semibold hover:text-cyan-700">
                      Sign In
                    </Button>
                  </div>
                </Form>
              ) : (
                /* OTP Verification */
                <Form
                  form={otpForm}
                  layout="vertical"
                  onFinish={(v) => verifyMutation.mutate({ email: userEmail, otpCode: v.otpCode })}>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-cyan-600 mb-2">Check your email</div>
                    <p className="text-gray-600">We've sent a 6-digit code to</p>
                    <p className="font-semibold text-gray-800">{userEmail}</p>
                  </div>

                  <Form.Item
                    style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}
                    name="otpCode"
                    rules={[{ required: true, message: 'Enter the 6-digit code' }]}>
                    <Input.OTP
                      length={6}
                      formatter={(str) => str.replace(/\D/g, '')}
                      className="text-3xl tracking-widest text-center letter-spacing-8"
                      style={{ letterSpacing: '0.5rem' }}
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={verifyMutation.isPending}
                    className="h-14 text-lg font-semibold rounded-xl shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                    Verify & Continue
                  </Button>

                  <div className="text-center mt-6 space-y-3">
                    <Button
                      type="link"
                      danger
                      onClick={resetRegistration}
                      className="text-sm">
                      Not you? Start over
                    </Button>

                    <div>
                      <Button
                        type="link"
                        onClick={() => resendMutation.mutate()}
                        disabled={timeLeft > 0 || resendMutation.isPending}
                        className="text-cyan-600 font-medium hover:text-cyan-700">
                        {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : 'Resend OTP'}
                      </Button>
                    </div>
                  </div>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Blob Animation */}
      <style>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(40px, -60px) scale(1.15);
          }
          66% {
            transform: translate(-30px, 40px) scale(0.95);
          }
        }
        .animate-blob {
          animation: blob 22s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </ConfigProvider>
  );
};

export default Register;
