import messaging from '@react-native-firebase/messaging';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { DeviceEventEmitter, PermissionsAndroid, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import Request from '@utils/http/request';
import { store } from '@/store';
import { InitialState } from '@features/auth/context/slice';

const IN_APP_PUSH_RECEIVED_EVENT = 'notifications.in_app_push_received';

/**
 * Request notification permissions.
 *
 * - iOS: uses Firebase Messaging's requestPermission (shows system dialog).
 * - Android < 13: notifications are allowed by default (no runtime dialog), returns true.
 * - Android 13+: explicitly requests POST_NOTIFICATIONS using PermissionsAndroid.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      // Request explicit permissions so iOS can show banners + sounds + badge.
      const authStatus = await messaging().requestPermission({
        alert: true,
        badge: true,
        sound: true,
      });
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    }

    if (Platform.OS === 'android') {
      const sdkInt = Platform.Version as number;

      // Android 13+ requires runtime POST_NOTIFICATIONS permission
      if (sdkInt >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      // On Android < 13, notifications are enabled by default
      return true;
    }

    return false;
  } catch (error) {
    console.warn('Notification permission request failed', error);
    return false;
  }
};

/**
 * Get current FCM token for this device
 */
export const getFcmToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    return token || null;
  } catch (error) {
    console.warn('Failed to get FCM token', error);
    return null;
  }
};

/**
 * Register the current device token with the backend
 * Uses the authenticated user from Redux store and standard axios Request instance.
 */
export const registerDeviceTokenWithBackend = async (
  deviceToken: string
): Promise<void> => {
  try {
    const state: { 'feature/auth': InitialState } = store.getState() as any;
    const authState = state['feature/auth'];

    if (!authState?.tokens?.accessToken) {
      // Not logged in; nothing to do
      return;
    }

    const response = await Request.post('/notification/register-device-token', {
      deviceToken,
    });
  } catch (error) {
    console.warn('Failed to register device token with backend', error);
  }
};

/**
 * High-level helper to ensure the device is registered for push notifications.
 * Call this after a successful login and on app startup when a session already exists.
 */
export const ensurePushTokenRegistered = async () => {
  const permissionGranted = await requestNotificationPermission();
  if (!permissionGranted) {
    return;
  }

  // Ensure the device is registered for remote messages on iOS.
  try {
    await messaging().registerDeviceForRemoteMessages();
  } catch {
    // Non-fatal; token registration can still work on many setups.
  }

  const token = await getFcmToken();
  if (!token) {
    return;
  }

  await registerDeviceTokenWithBackend(token);
};

/**
 * Subscribe to FCM token refresh events and re-register with backend.
 * Call once at app startup (e.g. in AppInitializer).
 */
export const subscribeToTokenRefresh = () => {
  return messaging().onTokenRefresh(async (newToken) => {
    await registerDeviceTokenWithBackend(newToken);
  });
};

/**
 * While the app is in the foreground, FCM does not show system notification banners.
 * This listener shows an in-app toast instead (same content as the push).
 */
export const subscribeToForegroundFCM = () => {
  return messaging().onMessage(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      const n = remoteMessage.notification;
      const d = remoteMessage.data;

      const title =
        n?.title ?? (typeof d?.title === 'string' ? d.title : undefined) ?? 'Fitness Guru';
      const body =
        n?.body ?? (typeof d?.body === 'string' ? d.body : undefined) ?? '';

      if (!body && title === 'Fitness Guru') {
      }

      Toast.show({
        type: 'success',
        text1: title,
        ...(body ? { text2: body } : {}),
        visibilityTime: 4500,
        position: 'top',
        topOffset: 56,
      });

      // Trigger tab badge refresh. Delay slightly to allow backend in-app write to finish.
      setTimeout(() => {
        DeviceEventEmitter.emit(IN_APP_PUSH_RECEIVED_EVENT);
      }, 800);
    }
  );
};


