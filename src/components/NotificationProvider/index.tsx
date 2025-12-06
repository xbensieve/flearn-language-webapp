import React, { useEffect } from 'react';
import { initializeMessaging, requestNotificationPermission } from '../../lib/firebase';
import { registerWebPushToken, getWebPushStatus } from '../../services/webPush';

interface NotificationProviderProps {
  children: React.ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Initialize Firebase Messaging on app load
  useEffect(() => {
    const init = async () => {
      // Always initialize messaging to be ready
      console.log('🔔 Initializing Firebase Messaging...');
      await initializeMessaging();
      console.log('🔔 Firebase Messaging initialized, permission:', Notification.permission);
    };
    
    init();
  }, []);

  // Auto-register FCM token when user is logged in and notification is granted
  useEffect(() => {
    const autoRegisterFCM = async () => {
      // Check if user is logged in
      const token = localStorage.getItem('FLEARN_ACCESS_TOKEN');
      if (!token) {
        console.log('🔔 User not logged in, skipping auto FCM registration');
        return;
      }

      // Check if notification permission is granted
      if (Notification.permission !== 'granted') {
        console.log('🔔 Notification permission not granted, skipping auto FCM registration');
        return;
      }

      // Check if already registered with backend
      try {
        const status = await getWebPushStatus();
        console.log('🔔 Backend web push status:', status);
        
        if (status?.data?.isRegistered === true) {
          console.log('🔔 FCM token already registered with backend');
          return;
        }

        // Not registered, get FCM token and register
        console.log('🔔 Auto-registering FCM token...');
        const fcmToken = await requestNotificationPermission();
        
        if (fcmToken) {
          await registerWebPushToken(fcmToken);
          console.log('🔔 FCM token auto-registered successfully!');
        } else {
          console.log('🔔 Failed to get FCM token for auto-registration');
        }
      } catch (error) {
        console.error('🔔 Auto FCM registration error:', error);
      }
    };

    // Delay a bit to ensure app is fully loaded
    const timer = setTimeout(autoRegisterFCM, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
};

export default NotificationProvider;
