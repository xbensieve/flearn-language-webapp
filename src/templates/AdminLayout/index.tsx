import React from 'react';
import { Layout, Menu, Spin } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { DashboardOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { logoutService } from '../../services/auth';
import { toast } from 'react-toastify';

const { Header, Sider, Content, Footer } = Layout;

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
    <Layout className="min-h-screen">
      <Header
        style={{ color: '#fff' }}
        className="bg-white shadow px-4 flex items-center font-bold">
        Flearn Admin
      </Header>

      <Layout>
        <Sider
          width={200}
          className="bg-white border-r">
          <Menu
            mode="inline"
            defaultSelectedKeys={['/admin']}
            style={{ height: '100%', borderRight: 0 }}
            onClick={handleMenuClick}
            items={[
              {
                key: '/admin',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
                children: [
                  { key: '/admin/dashboard', label: 'Users' },
                  { key: '/admin/course-templates', label: 'Courses Templates' },
                  { key: '/admin/goals', label: 'Goals' },
                ],
              },
              { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
              { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
            ]}
          />
        </Sider>

        <Layout style={{ padding: '24px', height: '100vh' }}>
          <Content
            style={{
              background: 'white',
              padding: 24,
              minHeight: 280,
              borderRadius: 8,
            }}>
            <Outlet />
          </Content>
          <Footer className="text-center text-gray-500">
            © {new Date().getFullYear()} Flearn Admin
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
