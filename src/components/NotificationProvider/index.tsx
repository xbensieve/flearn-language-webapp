import React, { useEffect } from 'react';
import { initializeMessaging } from '../../lib/firebase';

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

  return <>{children}</>;
};

export default NotificationProvider;
