import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';
import { DeviceEventEmitter } from 'react-native';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

// iOS/Android: when the app is in the background, show notifications via the OS
// (we send `notification` payloads). For keeping the in-app unread badge in sync,
// we emit an event when a push is received.
messaging().setBackgroundMessageHandler(async () => {
  try {
    DeviceEventEmitter.emit('notifications.in_app_push_received');
  } catch {
    // Non-fatal: background handler is best-effort.
  }
});

registerRootComponent(App);
