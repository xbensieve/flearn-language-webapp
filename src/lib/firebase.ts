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

    // Register service worker - check if already registered first
    console.log('Registering service worker...');
    let registration: ServiceWorkerRegistration;
    
    try {
      // Check for existing registration
      const existingReg = await navigator.serviceWorker.getRegistration('/');
      if (existingReg) {
        console.log('Using existing Service Worker registration');
        registration = existingReg;
      } else {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        console.log('New Service Worker registered');
      }
    } catch (swError) {
      console.error('Service Worker registration failed:', swError);
      return null;
    }
    
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

// Global message handlers
const messageHandlers: Set<(payload: unknown) => void> = new Set();
let isListenerSetup = false;

// Setup global listener once
const setupGlobalListener = () => {
  if (!messaging || isListenerSetup) return;
  
  isListenerSetup = true;
  console.log('📩 Setting up global Firebase message listener');
  
  onMessage(messaging, (payload) => {
    console.log('📩 Firebase message received:', payload);
    
    // ALWAYS show desktop notification first
    showDesktopNotification(payload);
    
    // Then broadcast to all handlers
    messageHandlers.forEach(handler => {
      try {
        handler(payload);
      } catch (err) {
        console.error('Handler error:', err);
      }
    });
  });
};

// Show desktop notification directly
const showDesktopNotification = async (payload: unknown) => {
  const data = payload as { notification?: { title?: string; body?: string }; data?: { url?: string } };
  const title = data.notification?.title || 'New Notification';
  const body = data.notification?.body || '';
  
  if (Notification.permission !== 'granted') return;
  
  try {
    const notification = new Notification(title, {
      body,
      icon: '/logo.png',
      tag: 'flearn-' + Date.now(),
    });
    
    notification.onclick = () => {
      window.focus();
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
      notification.close();
    };
    
    setTimeout(() => notification.close(), 5000);
    console.log('📩 Desktop notification shown');
  } catch (err) {
    console.error('Failed to show notification:', err);
  }
};

// Listen for foreground messages - register handler
export const onForegroundMessage = (callback: (payload: unknown) => void) => {
  messageHandlers.add(callback);
  console.log('📩 Handler registered, total handlers:', messageHandlers.size);
  
  // Setup global listener if not already done
  if (messaging && !isListenerSetup) {
    setupGlobalListener();
  }
  
  // Return unsubscribe function
  return () => {
    messageHandlers.delete(callback);
    console.log('📩 Handler unregistered, remaining handlers:', messageHandlers.size);
  };
};

// Initialize messaging and setup listener
export const initializeMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      setupGlobalListener();
      return messaging;
    }
    console.warn('Firebase Messaging is not supported in this browser');
    return null;
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return null;
  }
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
