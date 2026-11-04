import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthHeader } from '@/components/AuthHeader';
import { FormError } from '@/components/FormError';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { api } from '@/lib/api';
import { colors, fonts, radius, space } from '@/theme/tokens';

// Sends the website's reset link (POST /auth/forgot-password); the student sets the new password on
// www.unicoach.com/reset-password, then logs in here. The backend answers the same whether or not the email exists.
export default function ForgotPassword() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    const clean = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(clean)) {
      setError('Sahi email daalo.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await api('/auth/forgot-password', { method: 'POST', body: { email: clean }, auth: false });
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Link nahi bhej paaye. Dobara try karo.');
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <Screen edges={['top', 'bottom']}>
        <AuthHeader kicker="Email check karo" title={['Link ', 'bhej diya', '']} />
        <View style={styles.card}>
          <View style={styles.icon}>
            <Icon name="check" size={22} color={colors.cream} strokeWidth={3} />
          </View>
          <AppText style={styles.cardTitle}>{email.trim()}</AppText>
          <AppText>Agar is email se UniCoach account hai, to password badalne ka link inbox mein aa gaya hoga. Spam folder bhi dekh lena.</AppText>
        </View>
        <View style={{ gap: 10 }}>
          <Step n={1} text="Email mein link kholo" />
          <Step n={2} text="Naya password banao (exactly 6 characters)" />
          <Step n={3} text="Yahan wapas aao aur naye password se login karo" />
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ gap: 12 }}>
          <Button title="Login pe wapas jao" onPress={() => router.replace({ pathname: '/login', params: { email: email.trim() } })} />
          <Button title="Link nahi aaya? Dobara bhejo" variant="secondary" onPress={() => setSent(false)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <AuthHeader kicker="Koi baat nahi" title={['Password ', 'bhool gaye?', '']} />
      <AppText>Apna email daalo. Hum ek link bhejenge, jisse naya password bana sakte ho.</AppText>
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
          returnKeyType="send"
          onSubmitEditing={submit}
        />
        <FormError message={error} />
      </View>
      <View style={{ flex: 1 }} />
      <Button title="Reset link bhejo" loadingTitle="Bhej rahe hain" loading={busy} onPress={submit} />
      <AppText variant="small" style={{ textAlign: 'center' }}>
        Google se account banaya tha? Login screen pe &quot;Google se continue karo&quot; dabao.
      </AppText>
    </Screen>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <AppText style={styles.stepNumText}>{n}</AppText>
      </View>
      <AppText style={{ flex: 1 }}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: space.lg, gap: 8, borderRadius: radius.lg, backgroundColor: colors.tint.teal },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.mustard, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: fonts.displayBlack, fontSize: 14, color: colors.ink },
});
