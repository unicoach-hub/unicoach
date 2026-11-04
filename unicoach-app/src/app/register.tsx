import { Link } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthHeader } from '@/components/AuthHeader';
import { FormError } from '@/components/FormError';
import { GoogleButton } from '@/components/GoogleButton';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/lib/auth';
import { colors, fonts } from '@/theme/tokens';

// Mirrors the backend's register rules (middleware/validate.js) so students see the problem before sending.
function check(name: string, email: string, phone: string, password: string): string | null {
  if (name.trim().length < 2) return 'Apna naam likho.';
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Sahi email daalo.';
  if (phone && !/^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ''))) return 'Phone number 10 digit ka hona chahiye.';
  if (password.length !== 6) return 'Password exactly 6 characters ka hona chahiye.';
  return null;
}

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const problem = check(name, email, phone, password);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      await register({ name: name.trim(), email: email.trim(), password, phone: cleanPhone || undefined });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Account nahi ban paaya.');
      setBusy(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <AuthHeader kicker="Chalo shuru karte hain" title={['Apna ', 'account', ' banao']} />

      <GoogleButton onError={setError} />

      <View style={{ gap: 16 }}>
        <TextField label="Naam" value={name} onChangeText={setName} placeholder="Riya Sharma" autoComplete="name" textContentType="name" />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="aap@email.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextField
          label="Phone (optional)"
          value={phone}
          onChangeText={setPhone}
          placeholder="98765 43210"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          hint="Counsellor isi number pe call karega."
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="6 characters"
          secureTextEntry
          maxLength={6}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <FormError message={error} />
      </View>

      <View style={{ gap: 16 }}>
        <Button title="Account banao" loadingTitle="Bana rahe hain" loading={busy} onPress={submit} />
        <AppText variant="small" style={{ textAlign: 'center' }}>
          Pehle se account hai?{' '}
          <Link href="/login" replace style={{ color: colors.teal, fontFamily: fonts.bodySemi }}>
            Log in
          </Link>
        </AppText>
      </View>
    </Screen>
  );
}
