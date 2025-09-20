import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Typography, Card } from 'antd';
import { login } from '../../services/auth';
import { notifySuccess } from '../../utils/toastConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const { Title } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { updateAuth } = useAuth();

  const mutation = useMutation({
    mutationFn: (values: { usernameOrEmail: string; password: string }) =>
      login({ ...values, rememberMe: true }),
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem('FLEARN_ACCESS_TOKEN', data.data.accessToken);
        localStorage.setItem('FLEARN_REFRESH_TOKEN', data.data.refreshToken);
        const role = data.data.roles[0];
        localStorage.setItem('FLEARN_USER_ROLE', role);
        updateAuth();
        notifySuccess(data.message);
        if (role.toLocaleLowerCase() === 'admin') {
          navigate('/admin');
        } else if (role.toLocaleLowerCase() === 'learner') {
          navigate('/learner');
        }
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      alert('Login failed: ' + err.message);
    },
  });

  const handleSubmit = (values: { usernameOrEmail: string; password: string }) => {
    mutation.mutate(values);
  };

  return (
    <section className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='container mx-auto w-[600px] px-4 flex justify-center'>
        <Card className='w-full max-w-md shadow-lg rounded-xl'>
          <Title level={2} className='text-center !mb-6'>
            Admin Login
          </Title>
          <Form
            form={form}
            layout='vertical'
            onFinish={handleSubmit}
            initialValues={{
              usernameOrEmail: 'admin@flearn.com',
              password: 'Flearn@123',
            }}
          >
            <Form.Item
              label='Email'
              name='usernameOrEmail'
              rules={[{ required: true, message: 'Please enter your email!' }]}
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
            <Form.Item>
              <Button
                type='primary'
                htmlType='submit'
                block
                size='large'
                loading={loading}
                className='bg-blue-600 hover:!bg-blue-700'
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </section>
  );
};

export default Login;
