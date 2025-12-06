import React, { useEffect, useCallback, useState } from 'react';
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
  const [listenerSetup, setListenerSetup] = useState(false);
  
  const showNotification = useCallback(
    async (payload: NotificationPayload) => {
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';
      const url = payload.data?.url;

      console.log('=== showNotification called ===');
      console.log('Title:', title);
      console.log('Body:', body);

      // Check permission
      if (Notification.permission !== 'granted') {
        console.error('Notification permission not granted');
        return;
      }

      // Use native Notification API directly (more reliable)
      try {
        const notification = new Notification(title, {
          body: body,
          icon: '/logo.png',
          tag: 'flearn-' + Date.now(),
          requireInteraction: false,
        });
        
        notification.onclick = () => {
          window.focus();
          if (url) {
            window.location.href = url;
          }
          notification.close();
        };
        
        console.log('✓ Native notification created');
        
        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      } catch (err) {
        console.error('Native notification failed:', err);
        
        // Fallback to Service Worker
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
              body: body,
              icon: '/logo.png',
              tag: 'flearn-sw-' + Date.now(),
              data: { url },
            });
            console.log('✓ SW notification shown');
          } catch (swErr) {
            console.error('SW notification also failed:', swErr);
          }
        }
      }
    },
    []
  );

  // Setup foreground listener
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupForegroundListener = async () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        console.log('Notifications not granted, skipping listener setup');
        return;
      }

      if (listenerSetup) {
        console.log('Listener already setup');
        return;
      }

      try {
        console.log('Setting up foreground message listener...');
        const msgInstance = await initializeMessaging();
        
        if (!msgInstance) {
          console.error('Failed to initialize messaging');
          return;
        }

        // Listen for foreground messages
        unsubscribe = onForegroundMessage((payload: unknown) => {
          console.log('🔔 Foreground message received:', payload);
          showNotification(payload as NotificationPayload);
        });
        
        setListenerSetup(true);
        console.log('✓ Foreground listener setup complete');
      } catch (error) {
        console.error('Error setting up foreground listener:', error);
      }
    };

    setupForegroundListener();

    // Also check periodically in case permission changes
    const interval = setInterval(() => {
      if (Notification.permission === 'granted' && !listenerSetup) {
        setupForegroundListener();
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [showNotification, listenerSetup]);

  return <>{children}</>;
};

export default NotificationProvider;
