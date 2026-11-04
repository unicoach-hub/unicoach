import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

type GoogleModule = typeof import('@react-native-google-signin/google-signin');

// The native module only exists in our own builds (development build / store app), not in Expo Go
// or the web preview, so it is loaded lazily and the Google button is hidden where it can't work.
export const googleSignInAvailable =
  Platform.OS !== 'web' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

let mod: GoogleModule | null = null;
function load(): GoogleModule {
  if (!mod) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('@react-native-google-signin/google-signin') as GoogleModule;
    const extra = Constants.expoConfig?.extra ?? {};
    mod.GoogleSignin.configure({
      // The website's (web-type) client ID: the backend verifies the ID token against it.
      webClientId: extra.googleWebClientId,
      iosClientId: extra.googleIosClientId || undefined,
    });
  }
  return mod;
}

export class GoogleCancelled extends Error {}

// Opens Google's account picker and returns the ID token for POST /api/auth/google.
export async function getGoogleIdToken(): Promise<string> {
  const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = load();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const res = await GoogleSignin.signIn();
    if (!isSuccessResponse(res)) throw new GoogleCancelled();
    if (!res.data.idToken) throw new Error('Google se token nahi mila. Dobara try karo.');
    return res.data.idToken;
  } catch (e) {
    if (e instanceof GoogleCancelled) throw e;
    if (isErrorWithCode(e)) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) throw new GoogleCancelled();
      if (e.code === statusCodes.IN_PROGRESS) throw new Error('Google login pehle se chal raha hai.');
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) throw new Error('Is phone pe Google Play Services update karo.');
    }
    throw new Error('Google login nahi ho paaya. Email se try karo ya thodi der baad.');
  }
}

// Forget the chosen Google account, so the next login shows the account picker again.
export async function googleSignOut() {
  if (!googleSignInAvailable || !mod) return;
  try {
    await mod.GoogleSignin.signOut();
  } catch {
    // nothing to clear
  }
}
