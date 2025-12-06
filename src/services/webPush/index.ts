import api from '../../config/axios';

// Register FCM token for web push
// Updated to match Swagger: PUT /api/Auth/fcm-token
export const registerWebPushToken = async (token: string) => {
  const response = await api.put('/Auth/fcm-token', { fcmToken: token });
  return response.data;
};

// Unregister web push (when logout or disable notifications)
// Updated to match Swagger: DELETE /api/Auth/fcm-token
export const unregisterWebPush = async () => {
  const response = await api.delete('/Auth/fcm-token');
  return response.data;
};

// Get web push status
// Note: If this endpoint doesn't exist in Swagger, it might fail. 
// We keep it for now but handle errors gracefully in hooks.
export const getWebPushStatus = async () => {
  try {
    const response = await api.get('/web-push/status');
    return response.data;
  } catch (error) {
    console.warn('Get web push status failed (endpoint might not exist)', error);
    return { data: { isRegistered: false } }; // Fallback
  }
};

// Test web push notification
export const testWebPush = async () => {
  try {
    const response = await api.post('/web-push/test');
    return response.data;
  } catch (error) {
    console.warn('Test web push failed (endpoint might not exist)', error);
    throw error;
  }
};
