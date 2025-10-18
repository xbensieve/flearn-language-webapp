/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Typography, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { login, loginWithGoogle } from '../../services/auth';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import type { AxiosError } from 'axios';

const { Title, Text } = Typography;

const ROLE_PATHS: Record<string, string> = {
  admin: '/admin',
  staff: '/staff',
  teacher: '/teacher',
  learner: '/learner/application',
};

const rolesCase = (roles: string[], navigate: any) => {
  const priority = ['admin', 'staff', 'teacher', 'learner'];
  const matchedRole = priority.find((r) => roles.some((ur) => ur.toLowerCase() === r));
  navigate(matchedRole ? ROLE_PATHS[matchedRole] : '/');
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { updateAuth } = useAuth();

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

  // ===== LOGIN API =====
  const mutation = useMutation({
    mutationFn: (values: { usernameOrEmail: string; password: string; rememberMe: boolean }) =>
      login(values),
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onSuccess: (data) => {
      if (data.success) handleAuthSuccess(data.data);
    },
    onError: (err: AxiosError<any>) => notifyError(err?.response?.data?.message || 'Login failed'),
  });

  // ===== GOOGLE LOGIN =====
  const googleMutation = useMutation({
    mutationFn: (idToken: string) => loginWithGoogle(idToken),
    onSuccess: (data: any) => {
      if (data.success) handleAuthSuccess(data.data);
    },
    onError: (err: AxiosError<any>) => {
      notifyError(err?.response?.data?.message || 'Google login failed');
    },
  });

  const handleAuthSuccess = (data: any) => {
    localStorage.setItem('FLEARN_ACCESS_TOKEN', data.accessToken);
    localStorage.setItem('FLEARN_REFRESH_TOKEN', data.refreshToken);
    localStorage.setItem('FLEARN_USER_ROLES', JSON.stringify(data.roles));
    updateAuth();
    notifySuccess('Login successful!');
    rolesCase(data.roles, navigate);
  };

  const handleSubmit = (values: any) => mutation.mutate(values);

  // ===== GOOGLE BUTTON INIT =====
  useEffect(() => {
    // @ts-expect-error
    if (window.google) {
      // @ts-expect-error
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      // @ts-ignore
      window.google.accounts.id.renderButton(document.getElementById('googleSignInDiv'), {
        theme: 'outline',
        size: 'large',
        width: '100%',
      });
    }
  }, []);

  const handleGoogleCallback = (response: any) => {
    if (response.credential) googleMutation.mutate(response.credential);
    else notifyError('Failed to get Google token');
  };

  // ===== CSS =====
  const wrapper: React.CSSProperties = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
  };

  const left: React.CSSProperties = {
    flex: 1,
    backgroundImage:
      "url('https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
  };

  const overlay: React.CSSProperties = {
    width: '100%',
    padding: '24px 32px',
    background: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
  };

  const right: React.CSSProperties = {
    flex: 1,
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 80px',
  };

  const formBox: React.CSSProperties = {
    width: '100%',
    maxWidth: 380,
  };

  const switchButtons: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
    marginBottom: 28,
  };

  return (
    <div style={wrapper}>
      {/* LEFT IMAGE */}
      <div style={left}>
        <div style={overlay}>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            Join our community
          </Title>
          <Text style={{ color: '#e5e7eb' }}>Start your journey with us today</Text>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div style={right}>
        <div style={formBox}>
          {/* TITLE */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 26, fontWeight: 600 }}>Welcome back!</Text>
          </div>

          {/* Login / Register Switch */}
          <div style={switchButtons}>
            <Button
              type='primary'
              shape='round'
              onClick={() => navigate('/login')}
              style={{ backgroundColor: '#06b6d4', fontWeight: 600 }}
            >
              Login
            </Button>
            <Button
              shape='round'
              onClick={() => navigate('/register')}
              style={{
                borderColor: '#06b6d4',
                color: '#06b6d4',
                fontWeight: 600,
              }}
            >
              Register
            </Button>
          </div>

          {/* FORM */}
          <Form form={form} layout='vertical' onFinish={handleSubmit}>
            <Form.Item
              label='Username or Email'
              name='usernameOrEmail'
              rules={[
                {
                  required: true,
                  message: 'Please enter your username or email!',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ marginRight: 6, opacity: 0.7 }} />}
                placeholder='Enter your username or email'
              />
            </Form.Item>

            <Form.Item
              label='Password'
              name='password'
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ marginRight: 6, opacity: 0.7 }} />}
                placeholder='Enter your password'
              />
            </Form.Item>

            {/* Forgot Password link */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Form.Item name='rememberMe' valuePropName='checked' noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <Button
                type='link'
                onClick={() => navigate('/forgot-password')}
                style={{ padding: 0, color: '#06b6d4', fontWeight: 500 }}
              >
                Forgot password?
              </Button>
            </div>

            <Button
              type='primary'
              htmlType='submit'
              block
              size='large'
              loading={loading}
              style={{
                height: 44,
                borderRadius: 999,
                backgroundColor: '#06b6d4',
                fontWeight: 700,
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>

          {/* Divider */}
          <div style={{ textAlign: 'center', marginTop: 16, color: '#9ca3af' }}>
            <Link to='/register'>Register now</Link>
          </div>

          {/* Divider */}
          <div style={{ textAlign: 'center', margin: '16px 0', color: '#9ca3af' }}>
            — or continue with —
          </div>

          {/* GOOGLE BUTTON */}
          {/* <div id='googleSignInDiv' style={{ width: '100%' }}></div> */}

          {/* Optional manual fallback */}
          <Button
            icon={<GoogleOutlined />}
            block
            style={{
              marginTop: 12,
              borderRadius: 999,
              border: '1px solid #d1d5db',
              height: 44,
            }}
            onClick={() => notifyError('Google Sign-In not initialized yet')}
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
