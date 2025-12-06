import React, { useEffect, useCallback } from 'react';
import { notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import {
  initializeMessaging,
  onForegroundMessage,
  isNotificationEnabled,
} from '../../lib/firebase';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
  data?: {
    url?: string;
    [key: string]: string | undefined;
  };
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();

  const showNotification = useCallback(
    (payload: NotificationPayload) => {
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';
      const url = payload.data?.url;

      // Show Ant Design notification in UI
      api.info({
        message: title,
        description: body,
        placement: 'topRight',
        duration: 6,
        icon: <BellOutlined style={{ color: '#1890ff' }} />,
        onClick: () => {
          if (url) {
            window.location.href = url;
          }
        },
        style: {
          cursor: url ? 'pointer' : 'default',
        },
      });

      // Also show native browser notification if page is visible but not focused
      if (document.visibilityState === 'visible' && !document.hasFocus()) {
        if ('Notification' in window && Notification.permission === 'granted') {
          const nativeNotif = new Notification(title, {
            body: body,
            icon: '/logo.png',
            tag: 'flearn-foreground',
          });

          nativeNotif.onclick = () => {
            window.focus();
            if (url) {
              window.location.href = url;
            }
            nativeNotif.close();
          };
        }
      }
    },
    [api]
  );

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupForegroundListener = async () => {
      if (!isNotificationEnabled()) {
        return;
      }

      try {
        await initializeMessaging();

        // Listen for foreground messages
        unsubscribe = onForegroundMessage((payload: unknown) => {
          console.log('Foreground message received:', payload);
          showNotification(payload as NotificationPayload);
        });
      } catch (error) {
        console.error('Error setting up foreground listener:', error);
      }
    };

    setupForegroundListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [showNotification]);

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
};

export default NotificationProvider;
