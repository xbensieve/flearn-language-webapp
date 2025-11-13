/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Typography, Checkbox, Card } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { login, loginWithGoogle } from '../../services/auth';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import type { AxiosError } from 'axios';

const { Title, Text } = Typography;

const ROLE_PATHS: Record<string, string> = {
  admin: '/admin',
  manager: '/manager',
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
    display: 'flex',
    width: '100vw',
    height: '100vh',
  };

  const left: React.CSSProperties = {
    flex: 2,
    backgroundImage: "url('/src/assets/10290108.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  const right: React.CSSProperties = {
    flex: 1.2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to bottom, #ffffff, #e0f2fe)',
  };

  const cardBox: React.CSSProperties = {
    width: '100%',
    maxWidth: 400,
    padding: '40px 32px',
    borderRadius: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    background: '#fff',
  };

  return (
    <div style={wrapper}>
      {/* LEFT SIDE IMAGE */}
      <div style={left}></div>

      {/* RIGHT SIDE - LOGIN BOX */}
      <div style={right}>
        <Card
          bordered={false}
          style={cardBox}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title
              level={3}
              style={{ margin: 0, color: '#06b6d4', fontWeight: 700 }}>
              Welcome Back
            </Title>
            <Text type="secondary">Login to your account</Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}>
            <Form.Item
              label="Username or Email"
              name="usernameOrEmail"
              rules={[{ required: true, message: 'Please enter your username or email!' }]}>
              <Input
                size="large"
                prefix={<UserOutlined style={{ opacity: 0.6 }} />}
                placeholder="Enter your username or email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please enter your password!' }]}>
              <Input.Password
                size="large"
                prefix={<LockOutlined style={{ opacity: 0.6 }} />}
                placeholder="Enter your password"
              />
            </Form.Item>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}>
              <Form.Item
                name="rememberMe"
                valuePropName="checked"
                noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Button
                type="link"
                onClick={() => navigate('/forgot-password')}
                style={{ padding: 0, color: '#06b6d4' }}>
                Forgot password?
              </Button>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{
                height: 44,
                borderRadius: 999,
                backgroundColor: '#06b6d4',
                fontWeight: 600,
              }}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text>Don't have an account? </Text>
              <Button
                type="link"
                onClick={() => navigate('/register')}
                style={{ padding: 0 }}>
                Register
              </Button>
            </div>

            <div style={{ textAlign: 'center', color: '#9ca3af', margin: '12px 0' }}>
              — or continue with —
            </div>

            <Button
              icon={<GoogleOutlined />}
              block
              size="large"
              style={{
                borderRadius: 999,
                border: '1px solid #d1d5db',
                height: 44,
              }}
              onClick={() => notifyError('Google Sign-In not initialized yet')}>
              Sign in with Google
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
