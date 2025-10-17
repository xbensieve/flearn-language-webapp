import React from 'react';
import { Image, Layout, Menu, Spin } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getProfile, logoutService } from '../../services/auth';
import { toast } from 'react-toastify';
import { Book } from 'lucide-react';

const { Header, Sider, Content, Footer } = Layout;

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
    <Layout className="min-h-screen">
      <Header
        style={{ color: '#fff' }}
        className="bg-white shadow px-4 flex items-center font-bold">
        {getStaffLanguages(data?.data.username || '')}
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
              // {
              //   key: '/staff',
              //   icon: <DashboardOutlined />,
              //   label: 'Dashboard',
              //   children: [
              //     { key: '/staff/dashboard', label: 'Users' },
              //     { key: '/staff/courses', label: 'Courses' },
              //   ],
              // },
              { key: 'courses/pending', icon: <Book size={18} />, label: 'Course Application' },
              { key: 'application/pending', icon: <UserOutlined />, label: 'Teacher Application' },
              { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
              { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
            ]}
          />
        </Sider>

        <Layout style={{ padding: '24px', height: '100vh', overflow: 'auto' }}>
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

export default StaffDashboardLayout;
