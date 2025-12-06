/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDpqhbypebZpdrWwH2j13YFxVAPWfYeR_o",
  authDomain: "flearn-ef3e0.firebaseapp.com",
  projectId: "flearn-ef3e0",
  storageBucket: "flearn-ef3e0.firebasestorage.app",
  messagingSenderId: "594490599338",
  appId: "1:594490599338:web:24f8687da40a24d9eeedd3"
});

const messaging = firebase.messaging();

// Handle background messages - only show notification when app is in background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  // Check if any client (tab) is focused - if so, let foreground handler deal with it
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
    const hasFocusedClient = windowClients.some(client => client.focused);
    
    if (hasFocusedClient) {
      console.log('[firebase-messaging-sw.js] App is focused, skipping SW notification');
      return;
    }
    
    // App is in background, show notification
    const notificationTitle = payload.notification?.title || 'FLearn Notification';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'flearn-bg-' + Date.now(),
      data: payload.data,
      requireInteraction: false,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  event.notification.close();

  if (event.action === 'close') return;

  // Open the app or focus if already open
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (urlToOpen !== '/') {
            client.navigate(urlToOpen);
          }
          return;
        }
      }
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
