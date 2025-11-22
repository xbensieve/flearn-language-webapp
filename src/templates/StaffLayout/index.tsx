import React from 'react';
import { Image, Layout, Menu, Spin } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getProfile, logoutService } from '../../services/auth';
import { toast } from 'react-toastify';
import { Book } from 'lucide-react';

const { Header, Sider, Content } = Layout;

const getStaffLanguages = (data: string) => {
  switch (data.toLowerCase()) {
    case 'staffen':
      return (
        <div className="flex justify-center items-center">
          <p className="!mb-0 mr-4">English Staff</p>
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/2560px-Flag_of_the_United_States.svg.png"
            width={20}
            height={20}
            preview={false}
          />
        </div>
      );
    case 'staffzh':
      return (
        <div className="flex justify-center items-center">
          <p className="!mb-0 mr-4">Chinese Staff</p>
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/330px-Flag_of_the_People%27s_Republic_of_China.svg.png"
            width={20}
            height={20}
            preview={false}
          />
        </div>
      );
    case 'staffja':
      return (
        <div className="flex justify-center items-center">
          <p className="!mb-0 mr-4">Japanese Staff</p>
          <Image
            src="https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Flag_of_Japan.svg/1200px-Flag_of_Japan.svg.png"
            width={20}
            height={20}
            preview={false}
          />
        </div>
      );
    default:
      return 'Ngoại ngữ';
      
  }
};

const StaffDashboardLayout: React.FC = () => {
  const navigate = useNavigate();

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

  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    retry: 1,
  });

  const handleLogout = () => {
    localStorage.removeItem('FLEARN_ACCESS_TOKEN');
    localStorage.removeItem('FLEARN_REFRESH_TOKEN');
    toast.success('Bạn đã đăng xuất!');
    window.location.href = '/login';
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout(localStorage.getItem('FLEARN_REFRESH_TOKEN') as string);
    } else {
      navigate(key);
    }
  };

  if (isLoggingOut) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header
        style={{
          color: '#333', // Chữ màu đen đậm cho dễ đọc
          backgroundColor: '#ffffff', // Màu nền trắng
          padding: '0 24px', // Padding hợp lý cho header
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)', // Shadow nhẹ cho header
          borderBottom: '1px solid #e0e0e0', // Đường viền dưới nhẹ
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
          Flearn Admin
        </div>
        {/* Ngôn ngữ nhân viên */}
        {getStaffLanguages(data?.data.username || '')}
      </Header>

      <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* Sider */}
        <Sider
          width={240}
          style={{
            backgroundColor: '#ffffff', // Nền trắng cho sidebar
            boxShadow: '2px 0 6px rgba(0, 0, 0, 0.1)', // Shadow cho sidebar
            borderRight: '1px solid #e0e0e0', // Đường viền bên phải
          }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['/admin']}
            style={{
              height: '100%',
              borderRight: 'none',
              fontSize: '16px',
              paddingTop: '20px',
              paddingLeft: '16px',
            }}
            onClick={handleMenuClick}
            items={[
              {
                key: 'courses/pending',
                icon: <Book size={18} />,
                label: 'Course Application',
              },
              {
                key: 'application/pending',
                icon: <UserOutlined />,
                label: 'Teacher Application',
              },
              // { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
              { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
            ]}
          />
        </Sider>

        {/* Main Content */}
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              minHeight: 280,
              borderRadius: '8px', // Góc bo tròn
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', // Shadow nhẹ cho content
              backgroundColor: '#fff', // Nền trắng cho content
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default StaffDashboardLayout;
