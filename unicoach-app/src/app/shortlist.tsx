import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Highlight } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { SITE } from '@/lib/feed';
import { useSaved } from '@/lib/saved';
import { useSavedScholarships } from '@/lib/scholarshipSaved';
import { deadlineLabel } from '@/lib/scholarships';
import { border, colors, fonts, radius, space } from '@/theme/tokens';

type Mode = 'unis' | 'scholarships';

// Everything the student hearted: universities (from courses / Match) and scholarships.
export default function Shortlist() {
  const unis = useSaved();
  const sch = useSavedScholarships();
  const [mode, setMode] = useState<Mode>('unis');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([unis.reload(), sch.reload()]);
    setRefreshing(false);
  }, [unis, sch]);

  const uniCount = unis.saved?.length ?? 0;
  const schCount = sch.saved?.length ?? 0;
  const loading = mode === 'unis' ? unis.saved === null && !unis.error : sch.saved === null;

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} colors={[colors.teal]} />}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} style={styles.back}>
          <Icon name="back" size={20} />
        </Pressable>
        <View style={{ gap: 4 }}>
          <AppText variant="kicker">Meri list</AppText>
          <AppText style={styles.title}>
            Meri <Highlight>shortlist</Highlight>
          </AppText>
        </View>

        <View style={styles.switch}>
          {(
            [
              ['unis', `Universities (${uniCount})`],
              ['scholarships', `Scholarships (${schCount})`],
            ] as const
          ).map(([m, label]) => (
            <Pressable key={m} onPress={() => setMode(m)} accessibilityRole="tab" accessibilityState={{ selected: mode === m }} style={[styles.half, mode === m && styles.halfOn]}>
              <AppText style={[styles.switchText, mode === m && { color: colors.ink }]}>{label}</AppText>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <SkeletonGroup>
            <View style={{ gap: 10 }}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={76} radius={20} />
              ))}
            </View>
          </SkeletonGroup>
        ) : mode === 'unis' ? (
          unis.error ? (
            <Empty title={unis.error} action="Dobara try karo" onPress={unis.reload} />
          ) : uniCount === 0 ? (
            <Empty title="Abhi koi university save nahi ki" text="Match mein right swipe karo ya course pe dil dabao." action="Match kholo" onPress={() => router.push('/match')} />
          ) : (
            unis.saved!.map((u) => (
              <View key={u._id} style={styles.row}>
                <View style={styles.logo}>
                  {u.logo ? (
                    <Image source={{ uri: u.logo }} style={{ width: 30, height: 30 }} contentFit="contain" />
                  ) : (
                    <AppText style={styles.logoLetter}>{u.name[0]}</AppText>
                  )}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText style={styles.name} numberOfLines={2}>
                    {u.name}
                  </AppText>
                  <AppText variant="small" numberOfLines={1}>
                    {[u.city, u.countryName].filter(Boolean).join(', ')}
                  </AppText>
                </View>
                <Pressable
                  onPress={() => removeUni(unis, u.name, u.countryName, u.city)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`${u.name} hatao`}
                  style={styles.heart}>
                  <Icon name="heart" size={22} color={colors.teal} fill={colors.teal} />
                </Pressable>
              </View>
            ))
          )
        ) : schCount === 0 ? (
          <Empty title="Abhi koi scholarship save nahi ki" text="Feed ya Search mein scholarship pe Save dabao." action="Scholarships dekho" onPress={() => router.push({ pathname: '/search', params: { mode: 'scholarships' } })} />
        ) : (
          sch.saved!.map((s) => (
            <Pressable
              key={s._id}
              onPress={() => {
                const url = s.urls?.informationUrl || s.urls?.applicationUrl;
                if (url) WebBrowser.openBrowserAsync(url);
              }}
              accessibilityRole="link"
              style={[styles.row, { alignItems: 'flex-start' }]}>
              <View style={[styles.logo, { backgroundColor: colors.tint.mustard }]}>
                <Icon name="award" size={22} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <AppText style={styles.name} numberOfLines={2}>
                  {s.title}
                </AppText>
                <AppText variant="small" numberOfLines={1}>
                  {s.amount?.display || s.awardCoverage}
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="calendar" size={13} color={colors.mutedDark} />
                  <AppText variant="small">{deadlineLabel(s)}</AppText>
                </View>
              </View>
              <Pressable onPress={() => sch.toggle(s)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`${s.title} hatao`} style={styles.heart}>
                <Icon name="heart" size={22} color={colors.teal} fill={colors.teal} />
              </Pressable>
            </Pressable>
          ))
        )}

        {(uniCount > 0 || schCount > 0) && (
          <View style={styles.cta}>
            <AppText style={styles.ctaTitle}>Shortlist ready? Counsellor ke saath final karo</AppText>
            <AppText variant="small">Free call mein safe, match aur dream universities chun lo.</AppText>
            <Button title="Free call book karo" size="sm" onPress={() => WebBrowser.openBrowserAsync(`${SITE}/book-consultation`)} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// The saved-universities toggle takes a course; a saved row carries enough to rebuild one.
function removeUni(unis: ReturnType<typeof useSaved>, name: string, countryName?: string, city?: string) {
  unis.toggle({ _id: name, cfId: 0, cfUniversityId: 0, courseName: '', universityName: name, countryName: countryName ?? '', city });
}

function Empty({ title, text, action, onPress }: { title: string; text?: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.empty}>
      <AppText variant="bodyStrong">{title}</AppText>
      {!!text && <AppText>{text}</AppText>}
      <Button title={action} variant="secondary" size="sm" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.xxxl, gap: 12 },
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
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: colors.ink },
  switch: { flexDirection: 'row', padding: 4, borderRadius: radius.pill, backgroundColor: colors.sand, marginBottom: 4 },
  half: { flex: 1, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  halfOn: { backgroundColor: colors.white },
  switchText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.mutedDark },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
  },
  logo: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoLetter: { fontFamily: fonts.display, fontSize: 18, color: colors.teal },
  name: { fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 20, color: colors.ink },
  heart: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: space.lg, gap: space.md, borderRadius: radius.lg, borderWidth: border.width, borderColor: border.color, backgroundColor: colors.white },
  cta: { marginTop: 6, padding: space.lg, gap: 8, borderRadius: radius.xl, backgroundColor: colors.peach },
  ctaTitle: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22, color: colors.ink },
});
