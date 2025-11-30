/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Checkbox, ConfigProvider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { loginDashboard } from '../../services/auth';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import type { AxiosError } from 'axios';

const ROLE_PATHS: Record<string, string> = {
  admin: '/admin/dashboard',
  manager: '/dashboard',
  teacher: '/teacher',
};

const rolesCase = (roles: string[], navigate: any) => {
  const priority = ['admin', 'manager', 'teacher'];
  const matchedRole = priority.find((r) => roles.some((ur) => ur.toLowerCase() === r));
  if (matchedRole) {
    navigate(ROLE_PATHS[matchedRole]);
  } else {
    notifyError('Please use the Learner login portal for student accounts.');
    localStorage.clear();
    navigate('/dashboard/login');
  }
};

const LoginDashboard: React.FC = () => {
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
    mutationFn: loginDashboard,
    onSuccess: (data) => handleAuthSuccess(data),
    onError: (err: AxiosError<any>) => notifyError(err?.response?.data?.message || 'Login failed'),
  });

  const handleAuthSuccess = (data: any) => {
    console.log(data);
    localStorage.setItem('FLEARN_ACCESS_TOKEN', data.accessToken);
    localStorage.setItem('FLEARN_REFRESH_TOKEN', data.refreshToken);
    localStorage.setItem('FLEARN_USER_ROLES', JSON.stringify(data.roles));
    updateAuth();
    notifySuccess('Welcome back to Flearn Dashboard!');
    rolesCase(data.roles, navigate);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#722ed1',
          borderRadius: 16,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      }}
    >
      <div className='min-h-screen flex flex-row-reverse bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-500 relative overflow-hidden'>
        {/* Animated Background Blobs */}
        <div className='absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob'></div>
        <div className='absolute -bottom-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000'></div>

        {/* Right Hero Section */}
        <div className='hidden lg:flex flex-1 items-center justify-center px-12 relative z-10'>
          <div className='max-w-lg text-white'>
            <h1 className='text-5xl md:text-6xl font-bold mb-6 leading-tight'>
              Flearn <span className='text-purple-200'>Dashboard</span>
            </h1>
            <p className='text-xl md:text-2xl opacity-90 leading-relaxed mb-8'>
              Manage courses, track learner progress, and streamline your teaching experience.
            </p>
            <p className='text-lg opacity-80'>Empowering educators and administrators</p>
          </div>
        </div>

        {/* Left Login Card */}
        <div className='flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10'>
          <div className='w-full max-w-md'>
            <div className='bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10'>
              {/* Logo */}
              <div className='text-center mb-8'>
                <h2 className='text-3xl font-bold text-gray-900'>Dashboard Sign In</h2>
                <p className='text-gray-600 mt-2'>
                  Welcome back! Please login to your staff account
                </p>
              </div>

              <Form form={form} layout='vertical' onFinish={mutation.mutate}>
                <Form.Item
                  name='usernameOrEmail'
                  rules={[{ required: true, message: 'Please enter your username or email!' }]}
                >
                  <Input
                    prefix={<UserOutlined className='text-gray-400' />}
                    placeholder='Username or Email'
                    className='h-14 text-lg rounded-xl border-gray-300 hover:border-purple-500 focus:border-purple-500'
                  />
                </Form.Item>

                <Form.Item
                  name='password'
                  rules={[{ required: true, message: 'Please enter your password!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className='text-gray-400' />}
                    placeholder='Password'
                    className='h-14 text-lg rounded-xl border-gray-300 hover:border-purple-500 focus:border-purple-500'
                  />
                </Form.Item>

                <div className='flex justify-between items-center mb-6'>
                  <Form.Item name='rememberMe' valuePropName='checked' noStyle>
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item>
                  <Button
                    type='link'
                    onClick={() => navigate('/forgot-password')}
                    className='text-purple-600 font-medium hover:text-purple-700'
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type='primary'
                  htmlType='submit'
                  block
                  size='large'
                  loading={mutation.isPending}
                  className='h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300'
                >
                  Sign In
                </Button>

                <div className='text-center mt-8'>
                  <span className='text-gray-600'>New staff? </span>
                  <Button
                    type='link'
                    onClick={() => navigate('/dashboard/register')}
                    className='text-purple-600 font-semibold hover:text-purple-700'
                  >
                    Create a staff account
                  </Button>
                  <br />
                  <span className='text-gray-600'>Learner? </span>
                  <Button
                    type='link'
                    onClick={() => navigate('/login')}
                    className='text-purple-600 font-semibold hover:text-purple-700'
                  >
                    Go to Learner Login
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

export default LoginDashboard;
