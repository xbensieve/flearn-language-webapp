import React, { useEffect, useCallback } from 'react';
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
  const showNotification = useCallback(
    async (payload: NotificationPayload) => {
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';
      const url = payload.data?.url;

      console.log('Attempting to show notification:', { title, body });

      // Show notification via Service Worker (works even when page is focused)
      if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, {
            body: body,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: 'flearn-notification-' + Date.now(),
            data: { url },
            requireInteraction: false,
          });
          console.log('Notification shown via Service Worker');
        } catch (err) {
          console.error('Failed to show notification via SW:', err);
          // Fallback to native Notification API
          try {
            new Notification(title, {
              body: body,
              icon: '/logo.png',
            });
          } catch (e) {
            console.error('Fallback notification also failed:', e);
          }
        }
      }
    },
    []
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
      {children}
    </>
  );
};

export default NotificationProvider;
