// src/templates/LearnerLayout.tsx
import React from 'react';
import { Layout, Menu, Typography, Card } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  ProfileOutlined,
  FileAddOutlined,
  QuestionCircleOutlined,
  SolutionOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

const LearnerLayout: React.FC = () => {
  const location = useLocation();
  const selectedKey = location.pathname;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header
        style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #1677ff, #2f54eb)',
              borderRadius: 8,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            FL
          </div>
          <div className='flex flex-col'>
            <Text style={{ margin: 0 }}>Flearn - Learner Portal</Text>
            <Text type='secondary' style={{ fontSize: 12 }}>
              Apply to become a teacher • Manage profile
            </Text>
          </div>
        </div>

        <Menu
          mode='horizontal'
          selectedKeys={[selectedKey]}
          items={[
            { key: '/learner/application', label: <Link to='/learner/application'>Apply</Link> },
            { key: '/learner/profile', label: <Link to='/learner/profile'>Profile</Link> },
            { key: '/learner/status', label: <Link to='/learner/status'>My Applications</Link> },
          ]}
        />
      </Header>

      <Layout>
        {/* Sidebar */}
        <Sider
          width={260}
          breakpoint='lg'
          collapsedWidth='0'
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            padding: '16px',
          }}
        >
          <Card size='small' title='Quick Links' style={{ marginBottom: 16 }}>
            <Menu
              mode='inline'
              selectedKeys={[selectedKey]}
              items={[
                {
                  key: '/learner/survey',
                  icon: <FileTextOutlined />,
                  label: <Text>Survey</Text>,
                  children: [
                    {
                      key: '/learner/survey',
                      label: <Link to='/learner/survey'>My Survey</Link>,
                    },
                    {
                      key: '/learner/survey/create',
                      label: <Link to='/learner/survey/create'>Create Survey</Link>,
                    },
                  ],
                },
                {
                  key: '/teacher/course',
                  icon: <ProfileOutlined />,
                  label: <Text>Course</Text>,
                  children: [
                    {
                      key: '/teacher/course',
                      label: <Link to='/teacher/course'>My Course</Link>,
                    },
                    {
                      key: '/teacher/course/create',
                      label: <Link to='/teacher/course/create'>Create Course</Link>,
                    },
                    {
                      key: '/teacher/course/create-template',
                      label: <Link to='/teacher/course/create-template'>Create Templates</Link>,
                    },
                  ],
                },
                {
                  key: '/learner/profile',
                  icon: <ProfileOutlined />,
                  label: <Link to='/learner/profile'>My Profile</Link>,
                },
                {
                  key: '/learner/application',
                  icon: <FileAddOutlined />,
                  label: <Link to='/learner/application'>Apply to Teach</Link>,
                },
                {
                  key: '/learner/status',
                  icon: <SolutionOutlined />,
                  label: <Link to='/learner/status'>Application Status</Link>,
                },
                {
                  key: '/learner/help',
                  icon: <QuestionCircleOutlined />,
                  label: <Link to='/learner/help'>Help & FAQ</Link>,
                },
              ]}
            />
          </Card>

          <Card size='small' title='Tips'>
            <Text type='secondary' style={{ fontSize: 12 }}>
              Prepare your credentials (CV, certificates) before uploading. Use PDF, JPG or PNG.
            </Text>
          </Card>
        </Sider>

        {/* Main Content */}
        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      {/* Footer */}
      <Footer style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
        © {new Date().getFullYear()} Flearn. All rights reserved.
      </Footer>
    </Layout>
  );
};

export default LearnerLayout;
