// src/pages/Profile.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Typography, Spin, Button } from 'antd';
import { toast } from 'react-toastify';
import { getProfile } from '../../services/auth';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    toast.success('Bạn đã đăng xuất!');
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data?.success) {
    return <div className="text-center mt-10">Không thể tải thông tin.</div>;
  }

  const profile = data.data;

  return (
    <div className="flex justify-center h-full py-10">
      <div className="flex justify-between w-full h-full max-w-5xl">
        <Card className="shadow-lg rounded-xl">
          <Title
            level={3}
            className="text-center mb-6">
            Thông tin cá nhân
          </Title>

          <div className="space-y-4">
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
            type="primary"
            danger
            block
            size="large"
            className="mt-6"
            onClick={handleLogout}>
            Logout
          </Button>
        </Card>

        {/* Right: Settings */}
        <Card
          style={{ margin: '0 20px' }}
          className="shadow-lg rounded-xl w-full">
          <Title
            level={3}
            className="text-center mb-6">
            Cài đặt
          </Title>

          <div className="space-y-4">
            <Button
              style={{ margin: '4px 0' }}
              block>
              Đổi mật khẩu
            </Button>
            <Button
              style={{ margin: '4px 0' }}
              block>
              Cập nhật Email
            </Button>
            <Button
              style={{ margin: '4px 0' }}
              block>
              Quản lý thông báo
            </Button>
            <Button
              style={{ margin: '4px 0' }}
              block>
              Ngôn ngữ
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
