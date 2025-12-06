import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  onForegroundMessage,
  getNotificationPermissionStatus,
  initializeMessaging,
} from '../lib/firebase';
import { registerWebPushToken, unregisterWebPush, getWebPushStatus } from '../services/webPush';
import { notification } from 'antd';

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
        if (isSupported && permissionStatus === 'granted' && isEnabled) {
          await initializeMessaging();
          
          // Setup foreground message listener
          onForegroundMessage((payload: unknown) => {
            const message = payload as { notification?: { title?: string; body?: string } };
            notification.info({
              message: message.notification?.title || 'New Notification',
              description: message.notification?.body,
              placement: 'topRight',
              duration: 5,
            });
          });
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
          const response = await registerWebPushToken(token);
          console.log('Backend response:', response);
          
          setState((prev) => ({
            ...prev,
            isEnabled: true,
            permissionStatus: 'granted',
            isLoading: false,
            error: null,
          }));
          
          return true;
        } catch (registerError: unknown) {
          console.error('Failed to register token with backend:', registerError);
          const err = registerError as { response?: { data?: { message?: string } } };
          const errorMsg = err.response?.data?.message || 'Failed to register with server';
          console.error('Error response:', err.response?.data);
          
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: errorMsg,
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
