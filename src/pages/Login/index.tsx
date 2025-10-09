import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Typography, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../../services/auth';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import type { AxiosError } from 'axios';

const { Title, Text } = Typography;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rolesCase = (role: string, navigate: any) => {
  switch (role.toLowerCase()) {
    case 'admin':
      navigate('/admin');
      break;
    case 'learner':
      navigate('/learner');
      break;
    case 'teacher':
      navigate('/teacher');
      break;
    case 'staff':
      navigate('/staff');
      break;
    default:
      navigate('/');
  }
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { updateAuth } = useAuth();

  const mutation = useMutation({
    mutationFn: (values: { usernameOrEmail: string; password: string; rememberMe: boolean }) =>
      login({ ...values }),
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    retry: 1,
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem('FLEARN_ACCESS_TOKEN', data.data.accessToken);
        localStorage.setItem('FLEARN_REFRESH_TOKEN', data.data.refreshToken);
        const roles = data.data.roles; // Assuming this is your array of roles, e.g., ['teacher', 'admin']
        localStorage.setItem('FLEARN_USER_ROLES', JSON.stringify(roles)); // Note: plural 'ROLES' for clarity
        updateAuth();
        notifySuccess(data.message);
        rolesCase(roles[0], navigate);
        rolesCase(roles[0], navigate);
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: AxiosError<any>) => notifyError(err?.response?.data?.message || 'Login failed'),
  });

  const handleSubmit = (values: {
    usernameOrEmail: string;
    password: string;
    rememberMe: boolean;
  }) => mutation.mutate(values);

  // ===== FULLSCREEN INLINE STYLES =====
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
    gridTemplateColumns: '55% 45%', // 2 cột full màn hình
    background: '#ffffff',
    borderRadius: 0,
    overflow: 'hidden',
  };

  const left: React.CSSProperties = {
    position: 'relative',
    height: '100%',
    backgroundImage:
      "url('https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1600&q=80')",
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
    overflowY: 'auto', // nếu nội dung dài vẫn giữ full-height
  };

  const rightInner: React.CSSProperties = {
    width: 'min(520px, 100%)',
  };

  const tabsWrap: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
    marginBottom: 16,
  };
  const tabBase: React.CSSProperties = {
    border: 'none',
    borderRadius: 999,
    padding: '0 24px',
    height: 36,
    fontWeight: 600,
    cursor: 'pointer',
  };
  const tabActive: React.CSSProperties = { ...tabBase, backgroundColor: '#06b6d4', color: '#fff' };
  const tabInactive: React.CSSProperties = {
    ...tabBase,
    backgroundColor: '#e5e7eb',
    color: '#374151',
  };

  const desc: React.CSSProperties = { margin: '4px 0 24px', color: '#6b7280', textAlign: 'center' };
  const label: React.CSSProperties = { fontWeight: 600, color: '#374151' };
  const inputStyle: React.CSSProperties = {
    height: 44,
    borderRadius: 999,
    border: '1.5px solid #67e8f9',
    paddingLeft: 12,
  };
  const row: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
        {/* LEFT (ảnh) */}
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

        {/* RIGHT (form) */}
        <div style={right}>
          <div style={rightInner}>
            <div style={{ textAlign: 'center' }}>
              <Text>Chào mừng trở lại!</Text>
              <div style={tabsWrap}>
                <button
                  type="button"
                  style={tabActive}>
                  Login
                </button>
                <button
                  type="button"
                  style={tabInactive}
                  onClick={() => navigate('/register')}>
                  Register
                </button>
              </div>
            </div>

            <p style={desc}>
              Nền tảng học nói cho người Việt. Đăng nhập để tiếp tục hành trình học của bạn.
            </p>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}>
              <Form.Item
                label={<span style={label}>User name</span>}
                name="usernameOrEmail"
                rules={[{ required: true, message: 'Please enter your user name!' }]}>
                <Input
                  style={inputStyle}
                  prefix={<UserOutlined style={{ marginRight: 6, opacity: 0.7 }} />}
                  placeholder="Enter your User name"
                />
              </Form.Item>

              <Form.Item
                label={<span style={label}>Password</span>}
                name="password"
                rules={[{ required: true, message: 'Please enter your password!' }]}>
                <Input.Password
                  style={inputStyle}
                  prefix={<LockOutlined style={{ marginRight: 6, opacity: 0.7 }} />}
                  placeholder="Enter your Password"
                />
              </Form.Item>

              <div style={row}>
                <Form.Item
                  name="rememberMe"
                  valuePropName="checked"
                  noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <Button
                  type="link"
                  onClick={() => navigate('/forgot')}>
                  Forgot Password?
                </Button>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                  style={loginBtn}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>

      {/* Responsive fallback cho màn nhỏ */}
      <style>{`
        @media (max-width: 1024px) {
          section > div { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
};

export default Login;
