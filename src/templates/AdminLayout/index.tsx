import React from 'react';
import { Layout, Menu, Spin } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { DashboardOutlined, LogoutOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { logoutService } from '../../services/auth';
import { toast } from 'react-toastify';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/admin',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    children: [
      { key: '/admin/dashboard', label: 'Users' },
      { key: '/admin/course-templates', label: 'Courses Templates' },
      { key: '/admin/conversation-prompts', label: 'Conversation Prompts' },
      { key: '/admin/refund', label: 'Refund' },
      { key: '/admin/programs', label: 'Programs' },
      { key: '/admin/payouts', label: 'Payouts' },
    ],
  },
  { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
];

const DashboardLayout: React.FC = () => {
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
            items={menuItems}
          />
        </Sider>

        {/* Main Content */}
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: '#fff',
              padding: '24px',
              minHeight: '280px',
              borderRadius: '8px', // Góc bo tròn
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', // Shadow nhẹ cho content
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
