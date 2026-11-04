import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormError } from '@/components/FormError';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TextField } from '@/components/ui/TextField';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { border, colors, fonts, radius, space } from '@/theme/tokens';

const GONE = [
  'Login aur study plan (desh, course, marks)',
  'Saved universities aur scholarships',
  'Counsellor ke saath chat',
  'Upload kiye documents (files bhi delete ho jaayengi)',
];

// Play Store and App Store require in-app account deletion. Backend: DELETE /api/student/account.
export default function DeleteAccount() {
  const { user, logout } = useAuth();
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = typed.trim().toUpperCase() === 'DELETE';

  async function remove() {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api('/student/account', { method: 'DELETE', body: { confirm: 'DELETE' } });
      // Signing out sends the student back to Welcome
      await logout();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Account delete nahi ho paaya. Dobara try karo.');
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} style={styles.back}>
          <Icon name="back" size={20} />
        </Pressable>

        <View style={{ gap: 6 }}>
          <AppText variant="kicker">Dhyan se</AppText>
          <AppText style={styles.title}>Account delete karna hai?</AppText>
          <AppText>{user?.email} wala UniCoach account hamesha ke liye hat jayega. Ye wapas nahi aa sakta.</AppText>
        </View>

        <View style={styles.box}>
          <AppText variant="label">Ye sab delete ho jayega:</AppText>
          {GONE.map((g) => (
            <View key={g} style={styles.row}>
              <Icon name="close" size={16} color={colors.red} strokeWidth={2.6} />
              <AppText style={{ flex: 1 }}>{g}</AppText>
            </View>
          ))}
          <AppText variant="small">Website pe bhi isi account se login nahi ho payega. Counsellor team ke paas aapki pehli enquiry ka record rehta hai; use bhi hatwana ho to privacy@unicoach.com pe likho.</AppText>
        </View>

        <TextField
          label='Confirm karne ke liye "DELETE" likho'
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="DELETE"
        />
        <FormError message={error} />

        <Button title="Haan, account delete karo" variant="dark" loading={busy} disabled={!ready} onPress={remove} style={ready ? { backgroundColor: colors.red } : undefined} />
        <Button title="Nahi, wapas jao" variant="secondary" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  content: { padding: space.xl, gap: space.lg },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.5, color: colors.ink },
  box: { padding: space.lg, gap: 10, borderRadius: radius.lg, backgroundColor: colors.tint.red },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
