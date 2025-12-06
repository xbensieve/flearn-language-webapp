import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDpqhbypebZpdrWwH2j13YFxVAPWfYeR_o",
  authDomain: "flearn-ef3e0.firebaseapp.com",
  projectId: "flearn-ef3e0",
  storageBucket: "flearn-ef3e0.firebasestorage.app",
  messagingSenderId: "594490599338",
  appId: "1:594490599338:web:24f8687da40a24d9eeedd3",
  measurementId: "G-2PBZRBG4ME"
};

const VAPID_KEY = "BEFP2UZmyEIts0tTbI9pQ2QxWYcvsAih4RFUityN8VnRct_Ll9VmQ-n9xmXB6jo_CAsQe-C-549DhlRNTiEoA6s";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Messaging (only if supported)
let messaging: ReturnType<typeof getMessaging> | null = null;

export const initializeMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      return messaging;
    }
    console.warn('Firebase Messaging is not supported in this browser');
    return null;
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return null;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return null;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);
    
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Initialize messaging if not already done
    if (!messaging) {
      await initializeMessaging();
    }

    if (!messaging) {
      console.warn('Firebase Messaging not initialized');
      return null;
    }

    // Register service worker
    console.log('Registering service worker...');
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('Service Worker ready:', registration);

    // Get FCM token with retries
    let token: string | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (!token && attempts < maxAttempts) {
      attempts++;
      console.log(`Getting FCM token (attempt ${attempts})...`);
      
      try {
        token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });
      } catch (err) {
        console.error(`Attempt ${attempts} failed:`, err);
        if (attempts < maxAttempts) {
          // Wait before retry
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    if (token) {
      console.log('FCM Token obtained:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('Failed to get FCM token after', maxAttempts, 'attempts');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: unknown) => void) => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return () => {};
  }
  
  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};

// Check if notifications are enabled
export const isNotificationEnabled = (): boolean => {
  return 'Notification' in window && Notification.permission === 'granted';
};

// Check notification permission status
export const getNotificationPermissionStatus = (): NotificationPermission | 'unsupported' => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

export { app, messaging };
