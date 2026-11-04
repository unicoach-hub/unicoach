import { Link, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AuthHeader } from '@/components/AuthHeader';
import { FormError } from '@/components/FormError';
import { GoogleButton } from '@/components/GoogleButton';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/lib/auth';
import { colors, fonts } from '@/theme/tokens';

export default function Login() {
  const { login } = useAuth();
  // Coming back from "Password bhool gaye?" keeps the email typed there
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.trim() || !password) {
      setError('Email aur password dono daalo.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      // On success the root layout's guard swaps to the tabs on its own.
      await login(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login nahi ho paaya.');
      setBusy(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <AuthHeader kicker="Wapas aaye, badhiya" title={['Email se ', 'log in', ' karo']} />

      <GoogleButton onError={setError} />

      <View style={{ gap: 16 }}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="aap@email.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="6 characters"
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <Pressable
          onPress={() => (email.trim() ? router.push({ pathname: '/forgot-password', params: { email: email.trim() } }) : router.push('/forgot-password'))}
          accessibilityRole="link"
          hitSlop={8}
          style={{ alignSelf: 'flex-end', marginTop: -6 }}>
          <AppText style={{ color: colors.teal, fontFamily: fonts.bodySemi, fontSize: 14 }}>Password bhool gaye?</AppText>
        </Pressable>
        <FormError message={error} />
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ gap: 16 }}>
        <Button title="Log in karo" loadingTitle="Check kar rahe hain" loading={busy} onPress={submit} />
        <AppText variant="small" style={{ textAlign: 'center' }}>
          Naye ho?{' '}
          <Link href="/register" replace style={{ color: colors.teal, fontFamily: fonts.bodySemi }}>
            Account banao
          </Link>
        </AppText>
      </View>
    </Screen>
  );
}
