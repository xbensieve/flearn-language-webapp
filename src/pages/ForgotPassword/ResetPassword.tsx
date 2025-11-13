/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Typography, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { notifySuccess, notifyError } from '../../utils/toastConfig';
import type { AxiosError } from 'axios';
import { resetPassword } from '../../services/auth';

const { Title, Text } = Typography;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('resetEmail');
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  const resetPasswordMutation = useMutation({
    mutationFn: (values: { otpCode: string; newPassword: string; confirmPassword: string }) =>
      resetPassword({
        email: userEmail,
        otpCode: values.otpCode,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }),
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onSuccess: (data) => {
      if (data.success) {
        notifySuccess(data.message || 'Password reset successful!');
        localStorage.removeItem('resetEmail');
        navigate('/login');
      }
    },
    onError: (err: AxiosError<any>) => {
      console.log(err?.response?.data.errors.NewPassword);
      if (err?.response?.data.errors) {
        if (err?.response.data.errors.NewPassword) {
          notifyError(err?.response.data.errors.NewPassword[0]);
          return;
        } else {
          notifyError(err?.response?.data?.message || 'Failed to reset password');
        }
      }
    },
  });

  const handleSubmit = (values: any) => {
    resetPasswordMutation.mutate(values);
  };

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
          maxWidth: 480,
          padding: '40px 32px',
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: '#06b6d4', marginBottom: 4 }}>
            Reset Password
          </Title>
          <Text style={{ color: '#6b7280' }}>
            Enter the OTP and your new password for <strong>{userEmail}</strong>
          </Text>
        </div>

        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item
            label='OTP Code'
            name='otpCode'
            rules={[{ required: true, message: 'Please enter your OTP code!' }]}
          >
            <Input.OTP length={6} size='large' />
          </Form.Item>

          <Form.Item
            label='New Password'
            name='newPassword'
            rules={[{ required: true, message: 'Please enter a new password!' }]}
          >
            <Input.Password placeholder='Enter new password' />
          </Form.Item>

          <Form.Item
            label='Confirm Password'
            name='confirmPassword'
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder='Confirm new password' />
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
            {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
