import React from 'react';
import { Switch, Space, Tag, Button, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  QuestionCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useWebPush } from '../../hooks/useWebPush';
import { testWebPush, getWebPushStatus } from '../../services/webPush';

const NotificationSettings: React.FC = () => {
  const {
    isSupported,
    isEnabled,
    isLoading,
    permissionStatus,
    error,
    enableNotifications,
    disableNotifications,
  } = useWebPush();

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await enableNotifications();
    } else {
      await disableNotifications();
    }
  };

  const handleTestNotification = async () => {
    try {
      // Check status first
      const status = await getWebPushStatus();
      console.log('Web Push Status:', status);
      
      const response = await testWebPush();
      console.log('Test response:', response);
      
      // Show a local notification immediately as feedback
      if ('Notification' in window && Notification.permission === 'granted') {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification('Test thông báo 🔔', {
            body: 'Nếu bạn thấy thông báo này, notification đã hoạt động!',
            icon: '/logo.png',
            tag: 'test-local-' + Date.now(),
          });
          console.log('Local test notification shown');
        }
      }
    } catch (err: unknown) {
      console.error('Test notification failed:', err);
      const error = err as { response?: { data?: unknown } };
      console.error('Error details:', error.response?.data);
    }
  };

  const getStatusTag = () => {
    if (!isSupported) {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          Not Supported
        </Tag>
      );
    }

    if (permissionStatus === 'denied') {
      return (
        <Tag icon={<WarningOutlined />} color="warning">
          Blocked
        </Tag>
      );
    }

    if (isEnabled) {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Enabled
        </Tag>
      );
    }

    return (
      <Tag icon={<BellOutlined />} color="default">
        Disabled
      </Tag>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900">Desktop Notifications</span>
            {getStatusTag()}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Receive notifications even when browser is closed
          </p>
        </div>
        <Switch
          checked={isEnabled}
          onChange={handleToggle}
          loading={isLoading}
          disabled={!isSupported || permissionStatus === 'denied'}
        />
      </div>

      {permissionStatus === 'denied' && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <Space>
            <WarningOutlined className="text-amber-500" />
            <span className="text-amber-700 text-xs">
              Notifications are blocked. Please enable them in your browser settings.
            </span>
          </Space>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <span className="text-red-600 text-xs">{error}</span>
        </div>
      )}

      {isEnabled && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Test your notifications</span>
          <Tooltip title="Send a test notification">
            <Button
              size="small"
              icon={<QuestionCircleOutlined />}
              onClick={handleTestNotification}>
              Test
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
