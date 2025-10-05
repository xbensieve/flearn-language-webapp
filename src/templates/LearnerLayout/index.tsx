/* eslint-disable @typescript-eslint/no-explicit-any */
import { Layout, Menu, Avatar, Dropdown, ConfigProvider, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logoutService } from '../../services/auth';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { LogOut, NotebookPen } from 'lucide-react';

const { Header, Content, Footer } = Layout;

const LearnerLayout = () => {
  const location = useLocation();
  const selectedKey = location.pathname;
  const navigate = useNavigate();

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: (refreshToken: string) => logoutService(refreshToken),
    onSuccess: () => {
      handleLogout();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Logout failed!');
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('FLEARN_ACCESS_TOKEN');
    localStorage.removeItem('FLEARN_REFRESH_TOKEN');
    toast.success('Bạn đã đăng xuất!');
    window.location.href = '/login';
  };
  const userMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogOut size={18} />,
        label: 'Logout',
        onClick: () => logout(localStorage.getItem('FLEARN_REFRESH_TOKEN') || ''),
      },
      {
        key: 'survey',
        icon: <NotebookPen size={18} />,
        label: 'take a survey',
        onClick: () => navigate('survey/create'),
      },
      {
        key: 'teacher',
        icon: <NotebookPen size={18} />,
        label: 'Teacher Workspace',
        onClick: () => navigate('/teacher'),
      },
    ],
  };

  if (isLoggingOut) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgBase: '#ffffff',
          colorTextBase: '#000000',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }} className='bg-background'>
        {/* Header */}
        <Header
          className='flex items-center justify-between px-8 bg-white shadow-md border-b'
          style={{
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          {/* Brand */}
          <div className='flex items-center gap-4'>
            <div
              onClick={() => navigate('/learner')}
              className='text-xl font-bold bg-gradient-to-r
               from-indigo-500 to-blue-500 bg-clip-text text-transparent cursor-pointer'
            >
              Flearn
            </div>
          </div>

          {/* Top Menu */}
          <Menu
            style={{ minWidth: 600, justifyContent: 'center' }}
            className='border-0 bg-transparent'
            mode='horizontal'
            selectedKeys={[selectedKey]}
            items={[
              { key: '/learner', label: <Link to='/learner'>Home</Link> },
              { key: '/learner/application', label: <Link to='/learner/application'>Apply</Link> },
              { key: '/learner/profile', label: <Link to='/learner/profile'>Profile</Link> },
              { key: '/learner/status', label: <Link to='/learner/status'>My Applications</Link> },
            ]}
          />

          {/* User Dropdown */}
          <Dropdown menu={userMenu} placement='bottomRight'>
            <div className='flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity'>
              <Avatar icon={<UserOutlined />} className='bg-primary' />
              <span className='text-foreground font-medium'>Learner</span>
            </div>
          </Dropdown>
        </Header>

        {/* Body Layout */}
        <Layout className='p-6'>
          <Content className='bg-card rounded-lg shadow-sm p-6'>
            <Outlet />
          </Content>
        </Layout>

        {/* Footer */}
        <Footer className='text-center border-t bg-card py-4'>
          © {new Date().getFullYear()} Flearn. All rights reserved.
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default LearnerLayout;
