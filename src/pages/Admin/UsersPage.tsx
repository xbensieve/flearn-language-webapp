import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Avatar,
  Button,
  Drawer,
  Descriptions,
  Spin,
  Select,
  Space,
  Empty,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  getUsersListService,
  getUserDetailService,
} from "../../services/dashboard";
import type { RecentUser } from "../../services/dashboard/types";
import {
  EyeOutlined,
  UserOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

// Định nghĩa thứ tự ưu tiên để sắp xếp Tag (số bé đứng trước)
const ROLE_PRIORITY: Record<string, number> = {
  Admin: 1,
  Manager: 2,
  Learner: 3,
  Teacher: 4,
};

const UsersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || undefined;

  const [roleFilter, setRoleFilter] = useState<string | undefined>(initialRole);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Update URL khi filter thay đổi
  useEffect(() => {
    if (roleFilter) {
      setSearchParams({ role: roleFilter });
    } else {
      setSearchParams({});
    }
  }, [roleFilter, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users-all"],
    queryFn: () => getUsersListService({ page: 1, pageSize: 100 }),
  });

  const serverUsers = data?.users || [];

  const filteredUsers = roleFilter
    ? serverUsers.filter((user) => user.roles.some((r) => r === roleFilter))
    : serverUsers;

  const { data: userDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["user-detail", selectedUserId],
    queryFn: () => getUserDetailService(selectedUserId!),
    enabled: !!selectedUserId && detailOpen,
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "red";
      case "Manager":
        return "purple";
      case "Teacher":
        return "blue";
      case "Learner":
        return "cyan";
      default:
        return "default";
    }
  };

  const sortRoles = (roles: string[]) => {
    return [...roles].sort((a, b) => {
      const prioA = ROLE_PRIORITY[a] || 99;
      const prioB = ROLE_PRIORITY[b] || 99;
      return prioA - prioB;
    });
  };

  const handleClearFilters = () => {
    setRoleFilter(undefined);
    setSearchParams({});
  };

  const columns = [
    {
      title: "Người dùng",
      dataIndex: "userName",
      render: (text: string, record: RecentUser) => (
        <div className="flex items-center gap-3">
          <Avatar
            style={{ backgroundColor: record.status ? "#0ea5e9" : "#cbd5e1" }}
          >
            {text?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <Text strong className="block text-sm">
              {text}
            </Text>
            <Text type="secondary" className="text-xs">
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      render: (roles: string[]) => (
        <div className="flex gap-1">
          {sortRoles(roles).map((role) => (
            <Tag
              key={role}
              color={getRoleColor(role)}
              className="mr-0 rounded-full text-[10px] px-2 border-0 font-medium"
            >
              {role}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: boolean) => (
        <Tag
          color={status ? "success" : "error"}
          className="rounded px-2 text-[10px]"
        >
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Đã tham gia",
      dataIndex: "createdAt",
      render: (date: string) => (
        <Text className="text-xs text-gray-500">
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: "Hành động",
      render: (_: any, record: RecentUser) => (
        <Button
          size="small"
          type="text"
          icon={<EyeOutlined className="text-blue-500" />}
          onClick={() => {
            setSelectedUserId(record.userID);
            setDetailOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        bordered={false}
        className="rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <UserOutlined className="text-xl" />
            </div>
            <div>
              <Title level={4} className="!mb-0 !font-bold text-gray-800">
                Quản lý người dùng
              </Title>
              <Text className="text-xs text-gray-500">
                Đang hiển thị {filteredUsers.length} người dùng
              </Text>
            </div>
          </div>

          <Space>
            <Select
              placeholder="Lọc theo vai trò"
              value={roleFilter}
              onChange={(value) => setRoleFilter(value)}
              allowClear
              style={{ width: 180 }}
              suffixIcon={<FilterOutlined className="text-gray-400" />}
              className="rounded-lg"
            >
              <Option value="Admin">Quản trị viên</Option>
              <Option value="Manager">Quản lý</Option>
              <Option value="Teacher">Giáo viên</Option>
              <Option value="Learner">Học viên</Option>
            </Select>

            {roleFilter && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleClearFilters}
                className="text-gray-500 border-gray-300 hover:text-blue-600 hover:border-blue-600"
              >
                Cài lại
              </Button>
            )}
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="userID"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
          }}
          size="middle"
          locale={{
            emptyText: (
              <Empty
                description="No users found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* Drawer Detail */}
      <Drawer
        title="Chi tiết người dùng"
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedUserId(null);
        }}
        width={450}
      >
        {loadingDetail ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : userDetail ? (
          <div className="flex flex-col items-center">
            <Avatar
              size={80}
              src={(userDetail as any).avatar}
              icon={<UserOutlined />}
              className="mb-4 bg-blue-100 text-blue-600 border-4 border-white shadow-lg"
            />
            <Title level={4} className="!mb-1">
              {userDetail.userName}
            </Title>
            <Text type="secondary" className="mb-6 text-sm">
              {userDetail.email}
            </Text>

            <Descriptions bordered column={1} className="w-full" size="small">
              <Descriptions.Item label="ID người dùng">
                <Text copyable className="text-xs">
                  {userDetail.userID}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tên đầy đủ">
                {userDetail.userName}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <div className="flex gap-1">
                  {sortRoles(userDetail.roles).map((r: string) => (
                    <Tag key={r} color={getRoleColor(r)}>
                      {r}
                    </Tag>
                  ))}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={userDetail.status ? "green" : "red"}>
                  {userDetail.status ? "Hoạt động" : "Không hoạt động"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Email đã được xác nhận">
                {userDetail.isEmailConfirmed ? "Đã xác thực" : "Chưa xác thực"}
              </Descriptions.Item>
              <Descriptions.Item label="Đã tham gia">
                {new Date(userDetail.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
};

export default UsersPage;
