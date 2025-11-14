/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Spin, Typography } from 'antd';
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { getProfile } from '../../services/auth';
import { useQuery } from '@tanstack/react-query';
import {
  DashboardOutlined,
  BookOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  UserOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { BookOpenText, School, ChevronDown } from 'lucide-react';

const TeacherLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const isActive = (path: string) => location.pathname === `/teacher${path}`;

  if (isError) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <Typography.Text className='text-red-600'>Failed to load profile</Typography.Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <Spin size='large' tip='Loading Flearn...' />
      </div>
    );
  }

  const navItems = [
    { to: '', icon: DashboardOutlined, label: 'Dashboard' },
    { to: '/course', icon: BookOutlined, label: 'Courses' },
    { to: '/classes', icon: School, label: 'Classes' },
    { to: '/course/create', icon: PlusOutlined, label: 'Create Course' },
    { to: '/status', icon: CheckCircleOutlined, label: 'Status' },
    { to: '/payout-request', icon: UserOutlined, label: 'Bank Account' },
  ];

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        {/* Logo */}
        <div className='p-8 border-b border-gray-100'>
          <div className='flex items-center gap-4'>
            <div className='relative'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg'>
                <BookOpenText className='w-8 h-8 text-white' />
              </div>
            </div>
            <div>
              <h1 className='text-2xl !mb-0 font-bold text-gray-900'>Flearn</h1>
              <p className='text-sm !mb-0 text-gray-500'>Teacher Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className='flex-1 px-6 py-6'>
          <ul className='space-y-2'>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={`/teacher${item.to}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-medium transition-all duration-200 group ${
                      active
                        ? 'bg-blue-50 text-blue-700 shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-blue-700' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                    {item.to === '/course' && (
                      <span className='ml-auto w-2 h-2 bg-red-500 rounded-full'></span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile Card - Bottom */}
        <div className='p-6 border-t border-gray-100'>
          <Link
            to='/teacher/profile'
            className='flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-200 group'
          >
            <div className='relative'>
              <Avatar
                size={48}
                icon={<UserOutlined />}
                className='bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg'
              />
              <div className='absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white'></div>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-gray-900 truncate'>{data?.data.username}</p>
              <p className='text-xs text-gray-500 truncate'>{data?.data.email}</p>
            </div>
            <ChevronDown className='w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors' />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className='lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-xl border border-gray-200'
        >
          <MenuOutlined className='text-xl text-gray-700' />
        </button>

        {/* Content Area */}
        <main className='flex-1 overflow-y-auto pt-20 lg:pt-8 pb-8 px-8'>
          <div className='max-w-7xl mx-auto'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
