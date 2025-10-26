/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Typography, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { notifySuccess, notifyError } from '../../utils/toastConfig';
import type { AxiosError } from 'axios';
import { forgotPassword } from '../../services/auth';

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: (values: { emailOrUsername: string }) => forgotPassword(values),
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onSuccess: (data, variables) => {
      if (data.success) {
        notifySuccess(data.message || 'OTP sent to your email!');
        localStorage.setItem('resetEmail', variables.emailOrUsername);
        navigate('/reset-password');
      }
    },
    onError: (err: AxiosError<any>) =>
      notifyError(err?.response?.data?.message || 'Failed to send OTP'),
  });

  const handleSubmit = (values: { emailOrUsername: string }) => {
    forgotPasswordMutation.mutate(values);
  };

  // --- Simple layout consistent with Register ---
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#a9d4ef',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 450,
          padding: '40px 32px',
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: '#06b6d4', marginBottom: 4 }}>
            Forgot Password
          </Title>
          <Text style={{ color: '#6b7280' }}>Enter your email or username to receive an OTP.</Text>
        </div>

        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item
            label='Email or Username'
            name='emailOrUsername'
            rules={[{ required: true, message: 'Please enter your email or username!' }]}
          >
            <Input placeholder='Enter email or username' />
          </Form.Item>

          <Button
            type='primary'
            htmlType='submit'
            block
            size='large'
            loading={loading}
            style={{
              height: 44,
              borderRadius: 999,
              border: 'none',
              backgroundColor: '#06b6d4',
              fontWeight: 700,
            }}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type='link' onClick={() => navigate('/login')} style={{ color: '#06b6d4' }}>
              Back to Login
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
