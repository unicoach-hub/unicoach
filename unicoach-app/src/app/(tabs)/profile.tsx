import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StationBoard } from '@/components/desi/StationBoard';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useAuth } from '@/lib/auth';
import { SITE } from '@/lib/feed';
import { currentStation, STATIONS } from '@/lib/plan';
import { levelLabelFor } from '@/lib/profile';
import { useSaved } from '@/lib/saved';
import { useSavedScholarships } from '@/lib/scholarshipSaved';
import { useTabBarSpace } from '@/lib/useTabBarSpace';
import { border, colors, fonts, radius, space } from '@/theme/tokens';

function confirmLogout(email: string | undefined, logout: () => void) {
  const message = email ? `${email} se log out karna hai?` : 'Log out karna hai?';
  // Alert has no buttons on web, so the browser preview uses confirm()
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(message)) logout();
    return;
  }
  Alert.alert('Account', message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log out', style: 'destructive', onPress: logout },
  ]);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { saved } = useSaved();
  const sch = useSavedScholarships();
  const bottom = useTabBarSpace();
  const step = currentStation({ savedCount: saved?.length ?? 0, profileCompleted: user?.profileCompleted, journeyStage: user?.journeyStage });

  const plan: [string, string | undefined][] = [
    ['Desh', user?.dreamCountry],
    ['Course', user?.dreamCourse],
    ['Level', levelLabelFor(user?.highestEducation) ?? undefined],
    ['Intake', user?.preferredIntake],
    ['Padhai', user?.highestEducation ? `${user.highestEducation}${user.percentage ? ` · ${user.percentage}%` : ''}` : undefined],
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom }]} showsVerticalScrollIndicator={false}>
        <View style={styles.me}>
          <View style={styles.avatar}>
            <AppText style={styles.initials}>{initials(user?.name || 'U')}</AppText>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText style={styles.name} numberOfLines={1}>
              {user?.name}
            </AppText>
            <AppText variant="small" numberOfLines={1}>
              {user?.email}
            </AppText>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat value={saved?.length ?? 0} label="Universities" onPress={() => router.push('/shortlist')} />
          <Stat value={sch.saved?.length ?? 0} label="Scholarships" onPress={() => router.push('/shortlist')} />
          <Stat value={`${step + 1}/6`} label="Safar" onPress={() => router.push('/journey')} />
        </View>

        <Pressable onPress={() => router.push('/journey')} accessibilityRole="button" style={styles.journey}>
          <StationBoard name={STATIONS[step].board} left={`PF ${step + 1}`} right="ABHI YAHAN HO" size="sm" />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText style={styles.rowTitle}>Mera safar</AppText>
            <AppText variant="small">Shortlist se visa tak, har station</AppText>
          </View>
          <Icon name="arrow" size={18} color={colors.teal} />
        </Pressable>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <AppText style={styles.rowTitle}>Mera study plan</AppText>
            <Pressable onPress={() => router.push('/edit-profile')} accessibilityRole="button" hitSlop={8}>
              <AppText style={styles.link}>Badlo</AppText>
            </Pressable>
          </View>
          {plan.map(([k, v]) => (
            <View key={k} style={styles.kv}>
              <AppText variant="small">{k}</AppText>
              <AppText variant="label" style={{ flexShrink: 1, textAlign: 'right' }} numberOfLines={1}>
                {v || '—'}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Row icon="chat" title="Counsellor se free call" onPress={() => WebBrowser.openBrowserAsync(`${SITE}/book-consultation`)} />
          <Row icon="calendar" title="Live masterclasses" onPress={() => WebBrowser.openBrowserAsync(`${SITE}/events`)} />
          <Row icon="external" title="Website pe dashboard" onPress={() => WebBrowser.openBrowserAsync(`${SITE}/dashboard`)} last />
        </View>

        <Button title="Log out" variant="secondary" icon={<Icon name="logout" size={18} />} onPress={() => confirmLogout(user?.email, logout)} />
        <Pressable onPress={() => router.push('/delete-account')} accessibilityRole="button" hitSlop={8} style={{ alignSelf: 'center', paddingVertical: 8 }}>
          <AppText style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.red }}>Account delete karo</AppText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label, onPress }: { value: number | string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.stat}>
      <AppText style={styles.statValue}>{value}</AppText>
      <AppText variant="small">{label}</AppText>
    </Pressable>
  );
}

function Row({ icon, title, onPress, last }: { icon: IconName; title: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.row, !last && styles.rowLine]}>
      <Icon name={icon} size={20} color={colors.teal} />
      <AppText style={[styles.rowTitle, { flex: 1, fontSize: 15 }]}>{title}</AppText>
      <Icon name="arrow" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: space.xl, paddingTop: space.md, gap: 14 },
  me: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.tint.teal, alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: fonts.display, fontSize: 22, color: colors.tealDark },
  name: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.ink },
  stats: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    padding: 12,
    gap: 2,
    borderRadius: radius.lg,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
  },
  statValue: { fontFamily: fonts.displayBlack, fontSize: 22, color: colors.ink },
  journey: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.peach },
  card: { padding: 14, borderRadius: radius.lg, borderWidth: border.width, borderColor: border.color, backgroundColor: colors.white, gap: 4 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  rowTitle: { fontFamily: fonts.display, fontSize: 16, lineHeight: 21, color: colors.ink },
  link: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.teal },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.divider },
});
