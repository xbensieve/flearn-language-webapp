import api from '../../config/axios';

// Register FCM token for web push
export const registerWebPushToken = async (token: string) => {
  const response = await api.post('/web-push/register', { token });
  return response.data;
};

// Unregister web push (when logout or disable notifications)
export const unregisterWebPush = async () => {
  const response = await api.post('/web-push/unregister');
  return response.data;
};

// Get web push status
export const getWebPushStatus = async () => {
  const response = await api.get('/web-push/status');
  return response.data;
};

// Test web push notification
export const testWebPush = async () => {
  const response = await api.post('/web-push/test');
  return response.data;
};
