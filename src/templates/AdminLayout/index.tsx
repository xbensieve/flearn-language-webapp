import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { DashboardOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Sider, Content, Footer } = Layout;

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    } else {
      navigate(key);
    }
  };

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
                  { key: '/admin/courses', label: 'Courses' },
                ],
              },
              { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
              { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
            ]}
          />
        </Sider>

        <Layout style={{ padding: '24px' }}>
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
