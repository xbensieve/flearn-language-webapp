/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Typography, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { login, loginWithGoogle } from '../../services/auth';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import type { AxiosError } from 'axios';

const { Title, Text } = Typography;

const ROLE_PATHS: Record<string, string> = {
  admin: '/admin',
  staff: '/staff',
  teacher: '/teacher',
  learner: '/learner/application',
};

// role-based redirect
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

  // Check local roles
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

  // ===== NORMAL LOGIN =====
  const mutation = useMutation({
    mutationFn: (values: { usernameOrEmail: string; password: string; rememberMe: boolean }) =>
      login(values),
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onSuccess: (data) => {
      if (data.success) {
        handleAuthSuccess(data.data);
      }
    },
    onError: (err: AxiosError<any>) => notifyError(err?.response?.data?.message || 'Login failed'),
  });

  // ===== GOOGLE LOGIN =====
  const googleMutation = useMutation({
    mutationFn: (idToken: string) => loginWithGoogle(idToken),
    onSuccess: (data: any) => {
      if (data.success) {
        handleAuthSuccess(data.data);
      }
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

  // ===== GOOGLE BUTTON INITIALIZATION =====
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
    if (response.credential) {
      googleMutation.mutate(response.credential);
    } else {
      notifyError('Failed to get Google token');
    }
  };

  // ===== UI STYLES =====
  const page: React.CSSProperties = {
    height: '100vh',
    width: '100vw',
    background: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const container: React.CSSProperties = {
    background: '#fff',
    borderRadius: 16,
    display: 'grid',
    gridTemplateColumns: '55% 45%',
    overflow: 'hidden',
    width: '90%',
    maxWidth: 1000,
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
  };

  const left: React.CSSProperties = {
    backgroundImage:
      "url('https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
  };

  const overlay: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    background: 'rgba(0,0,0,0.45)',
    padding: 24,
    color: '#fff',
  };

  const right: React.CSSProperties = {
    padding: '48px 64px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  return (
    <section style={page}>
      <div style={container}>
        {/* LEFT SIDE */}
        <div style={left}>
          <div style={overlay}>
            <Title
              level={4}
              style={{ color: '#fff', margin: 0 }}>
              Join our community
            </Title>
            <Text style={{ color: '#e5e7eb' }}>Start your journey with us today</Text>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div style={right}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: 600 }}>Welcome back!</Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}>
            <Form.Item
              label="User name"
              name="usernameOrEmail"
              rules={[{ required: true, message: 'Please enter your user name!' }]}>
              <Input
                prefix={<UserOutlined style={{ marginRight: 6, opacity: 0.7 }} />}
                placeholder="Enter your User name"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please enter your password!' }]}>
              <Input.Password
                prefix={<LockOutlined style={{ marginRight: 6, opacity: 0.7 }} />}
                placeholder="Enter your Password"
              />
            </Form.Item>

            <Form.Item
              name="rememberMe"
              valuePropName="checked">
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

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
                fontWeight: 700,
              }}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>

          {/* Divider */}
          <div style={{ textAlign: 'center', margin: '16px 0', color: '#9ca3af' }}>
            — or continue with —
          </div>

          {/* GOOGLE BUTTON */}
          <div
            id="googleSignInDiv"
            style={{ width: '100%' }}></div>

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
            onClick={() => notifyError('Google Sign-In not initialized yet')}>
            Sign in with Google
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Login;
