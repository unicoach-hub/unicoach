import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '324611777052-7p8vf6php65bdf7eljj753al4lj6d3kp.apps.googleusercontent.com';

// Google's sign-in script only loads on screens that show the Google button (login, signup, login modal),
// instead of on every page of the site.
const withGoogleAuth = (Screen) => {
  const WithGoogleAuth = (props) => (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Screen {...props} />
    </GoogleOAuthProvider>
  );
  return WithGoogleAuth;
};

export default withGoogleAuth;
