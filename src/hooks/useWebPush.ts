import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  initializeMessaging,
} from '../lib/firebase';
import { registerWebPushToken, unregisterWebPush, getWebPushStatus } from '../services/webPush';

interface WebPushState {
  isSupported: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  permissionStatus: NotificationPermission | 'unsupported';
  error: string | null;
}

export const useWebPush = () => {
  const [state, setState] = useState<WebPushState>({
    isSupported: false,
    isEnabled: false,
    isLoading: true,
    permissionStatus: 'default',
    error: null,
  });

  // Check initial status - verify with backend
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
        const permissionStatus = getNotificationPermissionStatus();
        
        // Check with backend if notification is actually enabled
        let isEnabled = false;
        if (permissionStatus === 'granted') {
          try {
            const status = await getWebPushStatus();
            console.log('Backend status check:', status);
            // Only consider enabled if backend confirms isRegistered is true
            isEnabled = status?.data?.isRegistered === true;
          } catch {
            // If backend check fails, assume not enabled
            isEnabled = false;
          }
        }

        setState((prev) => ({
          ...prev,
          isSupported,
          isEnabled,
          permissionStatus,
          isLoading: false,
          error: null,
        }));

        // Initialize messaging only if permission is granted and backend confirmed
        // Note: Foreground message listener is handled by NotificationProvider
        if (isSupported && permissionStatus === 'granted' && isEnabled) {
          await initializeMessaging();
        }
      } catch (error) {
        console.error('Error checking notification status:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      }
    };

    checkStatus();
  }, []);

  // Enable notifications
  const enableNotifications = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = await requestNotificationPermission();
      console.log('=== FCM Token ===');
      console.log('Token obtained:', token);
      console.log('Token length:', token?.length);

      if (token) {
        // Register token with backend
        try {
          console.log('Registering token with backend...');
          await registerWebPushToken(token);
          
          // Re-initialize messaging to setup listener after permission granted
          await initializeMessaging();
          
          setState((prev) => ({
            ...prev,
            isEnabled: true,
            permissionStatus: 'granted',
            isLoading: false,
            error: null,
          }));
          
          return true;
        } catch (registerError: any) {
          console.error('Failed to register token with backend:', registerError);
          
          // Try to recover: Unregister then Register again
          // This handles cases where backend thinks token already exists or is invalid
          if (registerError?.response?.status === 400 || registerError?.response?.status === 409) {
            console.log('⚠️ Registration failed (400/409). Trying to unregister first...');
            try {
              await unregisterWebPush();
              console.log('Unregistered successfully. Retrying registration...');
              await registerWebPushToken(token);
              
              // Success on retry
              await initializeMessaging();
              setState((prev) => ({
                ...prev,
                isEnabled: true,
                permissionStatus: 'granted',
                isLoading: false,
                error: null,
              }));
              return true;
            } catch (retryError: any) {
              console.error('Retry registration failed:', retryError);
              // Fall through to error handling
            }
          }

          const errorMsg = registerError?.response?.data?.message || 'Failed to register with server';
          console.error('Error response:', registerError?.response?.data);
          
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: `${errorMsg} (Status: ${registerError?.response?.status})`,
          }));
          return false;
        }
      } else {
        const currentPermission = getNotificationPermissionStatus();
        let errorMsg = null;
        
        if (currentPermission === 'granted') {
          errorMsg = 'Failed to get notification token. Please try again.';
        } else if (currentPermission === 'denied') {
          errorMsg = 'Notification permission denied by browser.';
        }
        
        setState((prev) => ({
          ...prev,
          isLoading: false,
          permissionStatus: currentPermission,
          error: errorMsg,
        }));
        return false;
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to enable notifications. Please try again.',
      }));
      return false;
    }
  }, []);

  // Disable notifications
  const disableNotifications = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await unregisterWebPush();

      setState((prev) => ({
        ...prev,
        isEnabled: false,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Error disabling notifications:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to disable notifications',
      }));
      return false;
    }
  }, []);

  // Check server status
  const checkServerStatus = useCallback(async () => {
    try {
      const status = await getWebPushStatus();
      return status;
    } catch (error) {
      console.error('Error checking server status:', error);
      return null;
    }
  }, []);

  return {
    ...state,
    enableNotifications,
    disableNotifications,
    checkServerStatus,
  };
};

export default useWebPush;
