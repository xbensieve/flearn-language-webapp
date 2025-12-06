import React, { useEffect, useCallback } from 'react';
import {
  initializeMessaging,
  onForegroundMessage,
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

      console.log('=== showNotification called ===');
      console.log('Title:', title);
      console.log('Body:', body);
      console.log('Notification.permission:', Notification.permission);

      // Check permission
      if (Notification.permission !== 'granted') {
        console.error('Notification permission not granted');
        return;
      }

      // Try Service Worker first
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          console.log('Service Worker ready, showing notification...');
          
          await registration.showNotification(title, {
            body: body,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: 'flearn-' + Date.now(),
            data: { url },
            requireInteraction: false,
          });
          console.log('✓ Notification shown via Service Worker');
          return;
        } catch (err) {
          console.error('SW notification failed:', err);
        }
      }

      // Fallback to native Notification
      try {
        console.log('Trying native Notification...');
        const notif = new Notification(title, {
          body: body,
          icon: '/logo.png',
          tag: 'flearn-native-' + Date.now(),
        });
        console.log('✓ Native notification created:', notif);
      } catch (e) {
        console.error('Native notification failed:', e);
      }
    },
    []
  );

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupForegroundListener = async () => {
      // Check if notifications are supported and permission granted
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        console.log('Notifications not granted, skipping listener setup');
        return;
      }

      try {
        console.log('Setting up foreground message listener...');
        await initializeMessaging();

        // Listen for foreground messages
        unsubscribe = onForegroundMessage((payload: unknown) => {
          console.log('Foreground message received:', payload);
          showNotification(payload as NotificationPayload);
        });
        console.log('Foreground listener setup complete');
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
