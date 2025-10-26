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
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Book, ChevronDown, School2 } from 'lucide-react';

const TeacherLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  // Helper to check if a path is active
  const isActive = (path: string) => {
    return location.pathname === `/teacher${path}`;
  };

  if (isError) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
        Error loading profile
      </div>
    );
  }

  return isLoading ? (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <Spin size='large' />
    </div>
  ) : (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-blue-50'>
      {/* Header */}
      <header className='bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100'>
        <div className='flex items-center justify-between px-6 py-4'>
          <div className='flex items-center space-x-4'>
            {/* Hamburger Menu for Mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className='md:hidden text-blue-600 hover:text-blue-800 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50'
            >
              <MenuOutlined className='w-6 h-6' />
            </button>
            <div className='flex items-center space-x-3'>
              <div className='!p-2 !block bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md'>
                <Book className='text-white w-6 h-6' />
              </div>
              <h1 className='text-2xl !mb-0 font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent'>
                Teacher Dashboard
              </h1>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            {/* User Profile Dropdown - Enhanced */}
            <div className='relative group'>
              <Link
                to='/teacher/profile'
                className='flex items-center space-x-3 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all duration-200 hover:scale-105 shadow-sm border border-blue-200'
              >
                <Avatar
                  size='small'
                  icon={<UserOutlined />}
                  className='bg-gradient-to-r from-blue-500 to-indigo-600'
                />
                <Typography.Text strong className='hidden sm:block ml-2'>
                  {data?.data.username}
                </Typography.Text>
                <ChevronDown className='w-4 h-4' />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className='flex flex-1 relative'>
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className='fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in'
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-md shadow-2xl border-r border-blue-100 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 md:flex-shrink-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } overflow-y-auto`}
        >
          <nav className='p-6 h-full flex flex-col'>
            <div className='mb-8'>
              <h2 className='text-lg font-semibold text-gray-800 mb-2'>Navigation</h2>
              <div className='h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full'></div>
            </div>
            <ul className='space-y-1 flex-1'>
              {/* Dashboard */}
              <li>
                <Link
                  to='/teacher'
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 transform hover:scale-[1.02] group ${
                    isActive('')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <DashboardOutlined
                    className={`w-5 h-5 mr-4 flex-shrink-0 transition-colors ${
                      isActive('') ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                    }`}
                  />
                  Dashboard
                </Link>
              </li>

              {/* My Courses */}
              <li>
                <Link
                  to='/teacher/course'
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 transform hover:scale-[1.02] group ${
                    isActive('/course')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <BookOutlined
                    className={`w-5 h-5 mr-4 flex-shrink-0 transition-colors ${
                      isActive('/course') ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                    }`}
                  />
                  My Courses
                </Link>
              </li>

              <li>
                <Link
                  to='/teacher/classes'
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 transform hover:scale-[1.02] group ${
                    isActive('/classes')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <School2
                    className={`w-5 h-5 mr-4 flex-shrink-0 transition-colors ${
                      isActive('/classes')
                        ? 'text-white'
                        : 'text-gray-500 group-hover:text-blue-600'
                    }`}
                  />
                  My Classes
                </Link>
              </li>

              {/* Create Course */}
              <li>
                <Link
                  to='/teacher/course/create'
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 transform hover:scale-[1.02] group ${
                    isActive('/course/create')
                      ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-700 hover:shadow-md'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <PlusOutlined
                    className={`w-5 h-5 mr-4 flex-shrink-0 transition-colors ${
                      isActive('/course/create')
                        ? 'text-white'
                        : 'text-gray-500 group-hover:text-green-600'
                    }`}
                  />
                  Create Course
                </Link>
              </li>

              {/* Status */}
              <li>
                <Link
                  to='/teacher/status'
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 transform hover:scale-[1.02] group ${
                    isActive('/status')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <CheckCircleOutlined
                    className={`w-5 h-5 mr-4 flex-shrink-0 transition-colors ${
                      isActive('/status') ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                    }`}
                  />
                  Status
                </Link>
              </li>
            </ul>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className='md:hidden mt-6 p-3 text-gray-500 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-red-50 w-full'
            >
              <CloseOutlined className='w-5 h-5 mx-auto' />
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className='flex-1 p-8 overflow-y-auto w-full animate-fade-in'>
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className='bg-gradient-to-r from-blue-600 to-indigo-700 text-white mt-auto py-6'>
        <div className='container mx-auto px-6 text-center'>
          <p className='text-sm opacity-90'>
            &copy; 2025 Teacher App. All rights reserved. | Built with ❤️ for educators
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TeacherLayout;
