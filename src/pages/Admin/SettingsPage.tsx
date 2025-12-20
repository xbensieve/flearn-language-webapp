import React from "react";
import { Card, Typography } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import NotificationSettings from "@/components/NotificationSettings";

const { Title } = Typography;

const SettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={3} className="!mb-1 flex items-center gap-2">
          <SettingOutlined />
          Cài đặt
        </Title>
        <p className="text-gray-500">Quản lý tùy chọn và thông báo của bạn</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Notification Settings */}
        <Card title="Notifications" bordered={false} className="shadow-sm">
          <NotificationSettings />
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
