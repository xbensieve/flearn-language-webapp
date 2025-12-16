/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Button,
  Dropdown,
  theme,
  Typography,
} from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  WalletOutlined,
  CommentOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BookOutlined,
  UserOutlined,
  SettingOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { logoutService } from "../../services/auth";
import { getAdminWalletService } from "../../services/payout";
import { unregisterWebPush } from "../../services/webPush";
import { ArrowLeftRight, BookAudio } from "lucide-react";
import { toast } from "sonner";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const { data: wallet } = useQuery({
    queryKey: ["admin-wallet"],
    queryFn: getAdminWalletService,
    refetchInterval: 60000,
  });

  const { mutate: logout } = useMutation({
    mutationFn: (refreshToken: string) => logoutService(refreshToken),
    onSuccess: () => {
      localStorage.removeItem("FLEARN_ACCESS_TOKEN");
      localStorage.removeItem("FLEARN_REFRESH_TOKEN");
      toast.success("Đăng xuất thành công!");
      navigate("/login");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleLogoutClick = async () => {
    // Unregister web push before logout
    try {
      await unregisterWebPush();
    } catch (e) {
      console.error("Failed to unregister web push:", e);
    }

    const refreshToken = localStorage.getItem("FLEARN_REFRESH_TOKEN");
    if (refreshToken) {
      logout(refreshToken);
    } else {
      handleLogoutCleanup();
    }
  };

  const handleLogoutCleanup = () => {
    localStorage.removeItem("FLEARN_ACCESS_TOKEN");
    localStorage.removeItem("FLEARN_REFRESH_TOKEN");
    localStorage.removeItem("FLEARN_USER_ROLE");
    localStorage.removeItem("FLEARN_USER_ROLES");
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      type: "group",
      label: "QUẢN LÝ",
      children: [
        { key: "/admin/users", icon: <UserOutlined />, label: "Người dùng" },
        { key: "/admin/staff", icon: <UserOutlined />, label: "Nhân viên" },

        { key: "/admin/courses", icon: <BookOutlined />, label: "Khóa học" },
        {
          key: "/admin/course-templates",
          icon: <AppstoreOutlined />,
          label: "Mẫu khóa học",
        },
        {
          key: "/admin/programs",
          icon: <MenuFoldOutlined />,
          label: "Chương trình",
        },
        {
          key: "/admin/conversation-prompts",
          icon: <CommentOutlined />,
          label: "Prompt AI",
        },
        {
          key: "/admin/topics",
          icon: <BookAudio />,
          label: "Chủ đề",
        },
      ],
    },
    {
      type: "group",
      label: "TÀI CHÍNH",
      children: [
        { key: "/admin/refund", icon: <WalletOutlined />, label: "Hoàn tiền" },
        {
          key: "/admin/payouts",
          icon: <SwapOutlined />,
          label: "Yêu cầu rút tiền",
        },
        {
          key: "/admin/wallet-transactions",
          icon: <ArrowLeftRight />,
          label: "Giao dịch ví",
        },
      ],
    },
    {
      type: "group",
      label: "HỆ THỐNG",
      children: [
        {
          key: "/admin/settings",
          icon: <SettingOutlined />,
          label: "Cài đặt",
        },
      ],
    },
  ];

  const userMenu = {
    items: [
      {
        key: "logout",
        label: "Đăng xuất",
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogoutClick,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh" }} hasSider>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={230}
        theme="light"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 20,
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-50">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
            F
          </div>
          {!collapsed && (
            <span className="ml-3 text-lg font-bold text-slate-700">
              FLearn Admin
            </span>
          )}
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          selectedKeys={[location.pathname]}
          items={menuItems as any}
          onClick={({ key }) => navigate(key)}
          className="border-none px-2 py-4 text-sm"
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 230,
          transition: "all 0.2s",
          minHeight: "100vh",
          background: "#f8fafc",
        }}
      >
        <Header
          style={{ background: colorBgContainer, padding: "0 24px" }}
          className="sticky top-0 z-10 flex justify-between items-center h-16 shadow-sm border-b border-gray-100"
        >
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-base text-gray-500 hover:bg-blue-50 hover:text-blue-600"
            />
          </div>

          <div className="flex items-center gap-5">
            {wallet && (
              <div className="hidden md:flex items-center gap-3 px-5 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-default">
                <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <WalletOutlined />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-baseline gap-1">
                    <Text className="text-sm font-extrabold text-gray-800 font-sans">
                      {wallet.totalBalance?.toLocaleString("vi-VN")}
                    </Text>
                    <Text className="text-[10px] text-gray-400 font-semibold">
                      đ
                    </Text>
                  </div>
                  <Text className="text-[10px] text-gray-400 font-medium leading-tight">
                    (Khả dụng:{" "}
                    <span className="text-emerald-500 font-bold">
                      {wallet.availableBalance?.toLocaleString()}
                    </span>{" "}
                    - Số dư:{" "}
                    <span className="text-amber-500 font-bold">
                      {wallet.holdBalance?.toLocaleString()}
                    </span>
                    )
                  </Text>
                </div>
              </div>
            )}

            {/* User Dropdown (Chỉ còn Avatar) */}
            <Dropdown
              menu={userMenu as any}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1 px-2 rounded-full transition-colors">
                <div className="hidden md:block text-right leading-tight">
                  <div className="font-bold text-slate-700 text-sm">Admin</div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Quản trị viên
                  </div>
                </div>
                <Avatar
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                  size="default"
                  className="bg-blue-100 text-blue-600 border-2 border-white shadow-sm"
                />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ padding: "24px", overflow: "initial" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
