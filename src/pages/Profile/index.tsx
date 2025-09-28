import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, Typography, Spin, Button, Row, Col } from 'antd';
import { toast } from 'react-toastify';
import { getProfile, logoutService } from '../../services/auth';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: (refreshToken: string) => logoutService(refreshToken),
    onSuccess: () => {
      handleLogout();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('FLEARN_ACCESS_TOKEN');
    localStorage.removeItem('FLEARN_REFRESH_TOKEN');
    toast.success('Bạn đã đăng xuất!');
    window.location.href = '/login';
  };

  if (isLoading || isLoggingOut) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spin size='large' />
      </div>
    );
  }

  if (isError || !data?.success) {
    return <div className='text-center mt-10'>Không thể tải thông tin.</div>;
  }

  const profile = data.data;

  return (
    <div className='flex justify-center w-full h-full py-10'>
      <Row gutter={[16, 16]} justify='center' style={{ maxWidth: '1200px', width: '100%' }}>
        {/* Left: Profile Info */}
        <Col xs={24} md={12}>
          <Card className='shadow-lg rounded-xl h-full'>
            <Title level={3} className='text-center mb-6'>
              Thông tin cá nhân
            </Title>

            <div className='space-y-4'>
              <div>
                <Text strong>User ID: </Text>
                <Text>{profile.userId}</Text>
              </div>
              <div>
                <Text strong>Username: </Text>
                <Text>{profile.username}</Text>
              </div>
              <div>
                <Text strong>Email: </Text>
                <Text>{profile.email}</Text>
              </div>
              <div>
                <Text strong>Created At: </Text>
                <Text>{profile.createdAt}</Text>
              </div>
              <div>
                <Text strong>Roles: </Text>
                <Text>{profile.roles.join(', ')}</Text>
              </div>
            </div>

            <Button
              type='primary'
              danger
              block
              size='large'
              className='mt-6'
              onClick={() => logout(localStorage.getItem('FLEARN_REFRESH_TOKEN') || '')}
            >
              Logout
            </Button>
          </Card>
        </Col>

        {/* Right: Settings */}
        <Col xs={24} md={12}>
          <Card className='shadow-lg rounded-xl h-full'>
            <Title level={3} className='text-center mb-6'>
              Cài đặt
            </Title>

            <div className='space-y-4'>
              <Button style={{ margin: '4px 0' }} block>
                Đổi mật khẩu
              </Button>
              <Button style={{ margin: '4px 0' }} block>
                Cập nhật Email
              </Button>
              <Button style={{ margin: '4px 0' }} block>
                Quản lý thông báo
              </Button>
              <Button style={{ margin: '4px 0' }} block>
                Ngôn ngữ
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
