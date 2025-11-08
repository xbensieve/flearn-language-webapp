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
} from '@ant-design/icons';
import { BookOpenText, School } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950">
        <Typography.Text className="text-white text-xl">Failed to load profile</Typography.Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950">
        <Spin size="large" tip={<span className="text-white">Entering Flearn...</span>} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 overflow-hidden relative">
      {/* Animated Blue Orbs - Subtle & Elegant */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-80 h-80 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-sky-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-ping"></div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Unified Glass Sidebar + Header Connection */}
      <div className="fixed inset-y-0 left-0 z-50 w-84 flex flex-col">
        {/* Floating Glass Sidebar */}
        <aside
          className={`w-full h-full bg-white/12 backdrop-blur-3xl shadow-2xl border-white/20 transform transition-all duration-500 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            } flex flex-col overflow-hidden`}
        >
          {/* Logo */}
          <div className="p-8 bg-gradient-to-b from-white/25 to-transparent">
            <div className="flex items-center space-x-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-blue-600 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-4 bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40">
                  <BookOpenText className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl !mb-0 font-black text-white tracking-tighter drop-shadow-md">Flearn</h1>
                <p className="text-sm !mb-0 text-cyan-200 font-light">Teacher Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation - Takes available space */}
          <nav className="flex-1 px-6 py-10">
            <ul className="space-y-4">
              {[
                { to: '', icon: DashboardOutlined, label: 'Dashboard' },
                { to: '/course', icon: BookOutlined, label: 'My Courses' },
                { to: '/classes', icon: School, label: 'My Classes' },
                { to: '/course/create', icon: PlusOutlined, label: 'Create Course', accent: true },
                { to: '/status', icon: CheckCircleOutlined, label: 'Status' },
              ].map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={`/teacher${item.to}`}
                      onClick={() => setSidebarOpen(false)}
                      className="group relative flex items-center px-6 py-5 rounded-2xl font-medium text-lg transition-all duration-300 overflow-hidden"
                    >
                      {/* Active Background */}
                      {active && (
                        <div className={`absolute inset-0 ${item.accent ? 'bg-gradient-to-r from-orange-500 to-pink-600' : 'bg-gradient-to-r from-cyan-500 to-blue-600'} rounded-2xl shadow-2xl blur-xl`}></div>
                      )}
                      {/* Hover Glow */}
                      <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl"></div>

                      <div className={`relative z-10 flex items-center space-x-4 ${active ? 'text-white drop-shadow-lg' : 'text-blue-200'} group-hover:text-white`}>
                        <Icon className="w-7 h-7" />
                        <span className="tracking-wide">{item.label}</span>
                      </div>

                      {/* Active Indicator */}
                      {active && (
                        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-2xl animate-ping"></div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Teacher Motivation Card */}
          <div className="px-6 pb-4">
            <Link
              to="/teacher/profile"
              className="group relative flex items-center space-x-5 px-6 py-5 bg-white/20 backdrop-blur-3xl rounded-3xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/50"
            >
              <div className="relative">
                <Avatar
                  size={56}
                  icon={<UserOutlined />}
                  className="bg-gradient-to-br from-cyan-400 to-blue-600 ring-4 ring-white/50 shadow-2xl"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-black/50"></div>
              </div>
              <div className="flex-1">
                <Typography.Text strong className="block text-white text-lg drop-shadow-md">
                  {data?.data.username}
                </Typography.Text>
                <Typography.Text strong className="block text-white text-lg drop-shadow-md">
                  {data?.data.email}
                </Typography.Text>
              </div>
            </Link>
          </div>
        </aside>
      </div>

      {/* Main Content + Unified Header */}
      <div className="flex-1 flex flex-col ml-0 md:ml-84 relative">
        {/* CLEAN BACKGROUND — NO ORBS */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50/30" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl" />

        {/* Content */}
        <div className="relative overflow-y-auto  z-10 flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TeacherLayout;