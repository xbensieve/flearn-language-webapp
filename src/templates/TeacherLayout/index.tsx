import { Avatar, Spin, Tooltip, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { getProfile } from "../../services/auth";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Library,
  Users,
  FilePlus2,
  ClipboardCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  GraduationCap,
  ArrowLeftRight,
} from "lucide-react";
import { BankFilled, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/utils/AuthContext";

const TeacherLayout: React.FC = () => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { updateAuth } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 10, // (10 phút) Dữ liệu profile được coi là mới trong 10 phút, không cần fetch lại
    gcTime: 1000 * 60 * 30, // (30 phút) Giữ trong cache 30 phút (tên cũ là cacheTime ở v4)
    refetchOnWindowFocus: false, // Không fetch lại khi click chuột vào lại tab
    retry: false,
  });
  useEffect(() => {
    if (isError) {
      localStorage.removeItem("FLEARN_ACCESS_TOKEN"); // Xóa token
      localStorage.removeItem("FLEARN_USER_ROLES");
      updateAuth(); // Cập nhật lại context để đẩy user ra trang login
    }
  }, [isError, updateAuth]);
  const isActive = (path: string) => location.pathname === `/teacher${path}`;

  if (isError) return <Typography.Text>Error loading profile</Typography.Text>;
  if (isLoading) return <Spin fullscreen />;

  const navItems = [
    { to: "", icon: LayoutDashboard, label: "Tổng quan" },
    { to: "/course", icon: Library, label: "Khóa học" },
    { to: "/classes", icon: Users, label: "Lớp học" },
    { to: "/course/create", icon: FilePlus2, label: "Tạo khóa học" },
    {
      to: "/assignments",
      icon: ClipboardCheck,
      label: "Chấm điểm & Đánh giá",
    },
    { to: "/payout-request", icon: BankFilled, label: "Thanh toán" },
    {
      to: "/wallet-transactions",
      icon: ArrowLeftRight,
      label: "Giao dịch ví",
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden glass-effect"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 
          flex flex-col h-full bg-white border-r border-gray-200 shadow-xl lg:shadow-none
          transition-all duration-300 ease-in-out
          
          w-72 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          
          lg:translate-x-0 ${collapsed ? "lg:w-20" : "lg:w-72"}
        `}
      >
        {/* Toggle Button (Desktop Only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-9 z-50 
            w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm 
            items-center justify-center text-gray-500 hover:text-blue-600 cursor-pointer"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* --- LOGO SECTION --- */}
        <div
          className={`h-20 flex items-center shrink-0 transition-all duration-300 
          /* FIX: Mobile luôn padding chuẩn (px-6). Desktop mới check collapsed */
          px-6 gap-3 ${collapsed ? "lg:justify-center lg:px-0 lg:gap-0" : ""}
        `}
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* FIX: Mobile luôn hiện chữ. Desktop mới ẩn khi collapsed */}
          <div
            className={`overflow-hidden transition-all duration-300 
            w-auto opacity-100 ${collapsed ? "lg:w-0 lg:opacity-0" : ""}
          `}
          >
            <h1 className="text-xl font-bold text-blue-600 leading-none m-0 tracking-tight">
              FLearn
            </h1>
            <p className="text-[11px] font-medium text-blue-600 uppercase tracking-wider m-0 mt-1">
              Teacher Portal
            </p>
          </div>
        </div>

        {/* --- NAVIGATION --- */}
        {/* FIX: Padding nav cũng cần responsive */}
        <nav
          className={`flex-1 py-6 overflow-y-auto scrollbar-hide transition-all 
          px-4 ${collapsed ? "lg:px-2" : ""}
        `}
        >
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);

              const LinkContent = (
                <Link
                  to={`/teacher${item.to}`}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`
                    flex items-center rounded-xl transition-all duration-200 group relative
                    ${
                      active
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                    
                    /* FIX LOGIC QUAN TRỌNG:
                       - Mặc định (Mobile + Desktop Mở): w-full, px-4, py-3, gap-3.5
                       - Desktop Thu gọn (lg: + collapsed): Override thành hình vuông w-11 h-11
                    */
                    w-full px-4 py-3 gap-3.5
                    ${
                      collapsed
                        ? "lg:justify-center lg:w-11 lg:h-11 lg:mx-auto lg:p-0 lg:gap-0"
                        : ""
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className={`shrink-0 transition-colors ${
                      active
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />

                  {/* FIX: Mobile luôn hiện Label. Desktop mới ẩn */}
                  <span
                    className={`whitespace-nowrap font-medium text-sm overflow-hidden transition-all duration-300 
                    w-auto opacity-100 block
                    ${collapsed ? "lg:w-0 lg:opacity-0 lg:hidden" : ""}
                  `}
                  >
                    {item.label}
                  </span>

                  {/* Dot indicator chỉ hiện ở Desktop Collapsed */}
                  {collapsed && active && (
                    <div className="hidden lg:block absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 border border-white" />
                  )}
                </Link>
              );

              return (
                <li key={item.to}>
                  {/* Tooltip chỉ kích hoạt trên Desktop khi thu gọn */}
                  {collapsed ? (
                    <>
                      <div className="hidden lg:block">
                        <Tooltip
                          placement="right"
                          title={item.label}
                          mouseEnterDelay={0.1}
                        >
                          {LinkContent}
                        </Tooltip>
                      </div>
                      <div className="block lg:hidden">{LinkContent}</div>
                    </>
                  ) : (
                    LinkContent
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* --- PROFILE SECTION --- */}
        <div
          className={`border-t border-gray-100 shrink-0 bg-white transition-all 
          p-4 ${collapsed ? "lg:p-2" : ""}
        `}
        >
          <Link
            to="/teacher/profile"
            className={`
              flex items-center rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200
              
              /* FIX: Mobile full width. Desktop collapsed mới thu nhỏ */
              w-full p-3 gap-3
              ${
                collapsed
                  ? "lg:justify-center lg:w-11 lg:h-11 lg:mx-auto lg:p-0 lg:gap-0"
                  : ""
              }
            `}
          >
            <div className="relative shrink-0">
              {/* Avatar size responsive */}
              <Avatar
                size={40}
                className={`bg-gray-200 border-2 border-white shadow-sm transition-all
                  ${collapsed ? "lg:w-9 lg:h-9 lg:text-xs" : ""}
                `}
                icon={<UserOutlined />}
                src={data?.data.avatar}
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            {/* FIX: Mobile luôn hiện tên */}
            <div
              className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 
              w-auto opacity-100 block
              ${collapsed ? "lg:w-0 lg:opacity-0 lg:hidden" : ""}
            `}
            >
              <p className="text-sm font-semibold text-gray-900 truncate m-0">
                {data?.data.username || "Instructor"}
              </p>
              <p className="text-xs text-gray-500 truncate m-0">
                {data?.data.email}
              </p>
            </div>

            {!collapsed && (
              <ChevronDown
                size={16}
                className="text-gray-400 group-hover:text-gray-600 block lg:hidden"
              />
            )}
            {/* Chỉ hiện Chevron ở Desktop khi mở rộng */}
            <ChevronDown
              size={16}
              className={`text-gray-400 group-hover:text-gray-600 hidden lg:block ${
                collapsed ? "hidden" : ""
              }`}
            />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-gray-50 relative transition-all duration-300">
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 shrink-0 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg active:bg-gray-200"
            >
              <Menu size={24} />
            </button>
            <span className="font-semibold text-gray-900">Teacher Portal</span>
          </div>

          <Link to="/teacher/profile">
            <Avatar src={data?.data.avatar} size={32} icon={<UserOutlined />} />
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
