import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { api } from './api';

// Phone notifications: counsellor messages, document requests and journey stage changes
// (backend services/pushNotify.js). The token is stored on the student's account.

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

let currentToken: string | null = null;

// Asks for permission once and registers this phone. Quietly does nothing on web, in Expo Go,
// or when the build has no push credentials yet (Android needs Firebase set up in EAS).
export async function registerForPush() {
  if (Platform.OS === 'web') return;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Counsellor updates',
        // eslint-disable-next-line import/namespace -- re-exported enum the import plugin can't see
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#14837E',
      });
    }
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const { data } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    currentToken = data;
    await api('/student/push-token', { method: 'POST', body: { token: data, platform: Platform.OS } });
  } catch (e) {
    console.warn('[push] not registered:', e instanceof Error ? e.message : e);
  }
}

// On log out this phone should stop getting the old account's notifications.
export async function unregisterPush() {
  if (!currentToken) return;
  const token = currentToken;
  currentToken = null;
  await api('/student/push-token', { method: 'DELETE', body: { token } }).catch(() => {});
}
