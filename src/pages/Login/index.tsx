/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Checkbox, ConfigProvider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login, loginWithGoogle } from '../../services/auth';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import type { AxiosError } from 'axios';

const ROLE_PATHS: Record<string, string> = {
  admin: '/admin/dashboard',
  manager: '/dashboard',
  teacher: '/teacher',
  learner: '/learner/application',
};

const rolesCase = (roles: string[], navigate: any) => {
  const priority = ['admin', 'manager', 'teacher', 'learner'];
  const matchedRole = priority.find((r) => roles.some((ur) => ur.toLowerCase() === r));
  navigate(matchedRole ? ROLE_PATHS[matchedRole] : '/');
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { updateAuth } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    const rolesString = localStorage.getItem('FLEARN_USER_ROLES');
    if (rolesString) {
      try {
        const roles = JSON.parse(rolesString);
        if (Array.isArray(roles)) rolesCase(roles, navigate);
      } catch {
        localStorage.removeItem('FLEARN_USER_ROLES');
      }
    }
  }, [navigate]);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => data.success && handleAuthSuccess(data.data),
    onError: (err: AxiosError<any>) => notifyError(err?.response?.data?.message || 'Login failed'),
  });

  const googleMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data: any) => data.success && handleAuthSuccess(data.data),
    onError: () => notifyError('Google login failed'),
  });

  const handleAuthSuccess = (data: any) => {
    localStorage.setItem('FLEARN_ACCESS_TOKEN', data.accessToken);
    localStorage.setItem('FLEARN_REFRESH_TOKEN', data.refreshToken);
    localStorage.setItem('FLEARN_USER_ROLES', JSON.stringify(data.roles));
    updateAuth();
    notifySuccess('Welcome back to Flearn!');
    rolesCase(data.roles, navigate);
  };

  const handleGoogleCallback = (response: any) => {
    if (response?.credential) googleMutation.mutate(response.credential);
    else notifyError('Google login failed');
  };

  // Google Sign-In
  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      // @ts-ignore
      window.google.accounts.id.renderButton(document.getElementById('googleSignInDiv'), {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'pill',
        text: 'continue_with',
        width: '100%',
      });
    };

    return () => script.remove();
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#06b6d4',
          borderRadius: 16,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      }}>
      <div className="min-h-screen flex bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

        {/* Left Hero Section */}
        <div className="hidden lg:flex flex-1 items-center justify-center px-12 relative z-10">
          <div className="max-w-lg text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to <span className="text-cyan-200">Flearn</span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90 leading-relaxed mb-8">
              Master new skills, connect with expert teachers, and unlock your full learning
              potential.
            </p>
            <p className="text-lg opacity-80">
              Join thousands of learners already growing with Flearn
            </p>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
              {/* Logo */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
                <p className="text-gray-600 mt-2">Welcome back! Please login to your account</p>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={mutation.mutate}>
                <Form.Item
                  name="usernameOrEmail"
                  rules={[{ required: true, message: 'Please enter your username or email!' }]}>
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Username or Email"
                    className="h-14 text-lg rounded-xl border-gray-300 hover:border-cyan-500 focus:border-cyan-500"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please enter your password!' }]}>
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Password"
                    className="h-14 text-lg rounded-xl border-gray-300 hover:border-cyan-500 focus:border-cyan-500"
                  />
                </Form.Item>

                <div className="flex justify-between items-center mb-6">
                  <Form.Item
                    name="rememberMe"
                    valuePropName="checked"
                    noStyle>
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item>
                  <Button
                    type="link"
                    onClick={() => navigate('/forgot-password')}
                    className="text-cyan-600 font-medium hover:text-cyan-700">
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={mutation.isPending || googleMutation.isPending}
                  className="h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  Sign In
                </Button>

                <div className="text-center my-6 text-gray-500 font-medium">
                  — or continue with —
                </div>

                <div
                  id="googleSignInDiv"
                  className="flex justify-center"
                />

                <div className="text-center mt-8">
                  <span className="text-gray-600">New to Flearn? </span>
                  <Button
                    type="link"
                    onClick={() => navigate('/register')}
                    className="text-cyan-600 font-semibold hover:text-cyan-700">
                    Create an account luxury{' '}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {/* Tailwind Animation Keyframes */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, -30px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </ConfigProvider>
  );
};

export default Login;
