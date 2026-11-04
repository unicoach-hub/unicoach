import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Highlight } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/auth';
import { levelLabelFor } from '@/lib/profile';
import {
  deadlineLabel,
  DEGREES,
  PAGE_SIZE,
  SCHOLARSHIP_COUNTRIES,
  scholarshipCountryFor,
  searchScholarships,
  type Scholarship,
} from '@/lib/scholarships';
import { useSavedScholarships } from '@/lib/scholarshipSaved';
import { useTabBarSpace } from '@/lib/useTabBarSpace';
import { border, colors, fonts, radius, space } from '@/theme/tokens';

type Status = 'loading' | 'ready' | 'error';

const PROVIDER: Record<string, { label: string; bg: string; fg: string }> = {
  GOVERNMENT: { label: 'GOVT', bg: colors.teal, fg: colors.cream },
  UNIVERSITY: { label: 'UNI', bg: colors.tint.mustard, fg: colors.ink },
  FOUNDATION: { label: 'TRUST', bg: colors.tint.magenta, fg: colors.magenta },
  EXTERNAL_ORGANIZATION: { label: 'ORG', bg: colors.peach, fg: colors.orangeDeep },
};

// Scholarship search, shown inside the Search tab. `top` is the Courses / Scholarships switch.
export function ScholarshipFinder({ top }: { top?: ReactNode }) {
  const { user } = useAuth();
  const bottom = useTabBarSpace();

  // Start from the student's onboarding answers
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState<string | undefined>(() => scholarshipCountryFor(user?.dreamCountry));
  const [degree, setDegree] = useState<string | undefined>(() => levelLabelFor(user?.highestEducation) ?? undefined);
  const [onlySaved, setOnlySaved] = useState(false);

  const [items, setItems] = useState<Scholarship[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  // Saved list comes whole from the server, so "Saved" works whatever filters are on
  const { saved: savedList, toggle, isSaved } = useSavedScholarships();
  const saved = savedList ?? [];
  const requestId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setQuery(text.trim()), 400);
    return () => clearTimeout(t);
  }, [text]);


  const filterKey = JSON.stringify({ country, degree, search: query || undefined });

  const run = useCallback(async (key: string) => {
    const id = ++requestId.current;
    try {
      const res = await searchScholarships(JSON.parse(key), 1);
      if (id !== requestId.current) return;
      setItems(res.scholarships);
      setTotal(res.total);
      setPage(1);
      setStatus('ready');
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e instanceof Error ? e.message : 'Scholarships load nahi hui.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setStatus('loading');
      run(filterKey);
    });
    return () => {
      cancelled = true;
    };
  }, [filterKey, run]);

  const loadMore = useCallback(async () => {
    if (onlySaved || status !== 'ready' || loadingMore || page * PAGE_SIZE >= total) return;
    const id = requestId.current;
    setLoadingMore(true);
    try {
      const res = await searchScholarships(JSON.parse(filterKey), page + 1);
      if (id !== requestId.current) return;
      setItems((prev) => {
        const seen = new Set(prev.map((s) => s._id));
        return [...prev, ...res.scholarships.filter((s) => !seen.has(s._id))];
      });
      setPage(page + 1);
    } catch {
      // the next scroll to the end tries again
    } finally {
      setLoadingMore(false);
    }
  }, [onlySaved, status, loadingMore, page, total, filterKey]);

  const shown = onlySaved ? saved : items;

  const header = (
    <View style={styles.header}>
      {top}
      <View style={styles.titleRow}>
        <View style={{ gap: 4, flex: 1 }}>
          <AppText variant="kicker">Scholarship finder</AppText>
          <AppText style={styles.title}>
            Paise <Highlight>bachao</Highlight>
          </AppText>
        </View>
        <Image source={require('@/assets/images/3d/money-bag.webp')} style={{ width: 56, height: 56 }} contentFit="contain" />
      </View>

      <View style={styles.search}>
        <Icon name="search" size={20} color={colors.mutedDark} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Scholarship, university ya course"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          onSubmitEditing={() => setQuery(text.trim())}
          autoCorrect={false}
          accessibilityLabel="Search scholarships"
          style={styles.searchInput}
        />
        {!!text && (
          <Pressable onPress={() => setText('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
            <Icon name="close" size={18} color={colors.mutedDark} />
          </Pressable>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.bleed}>
        <Chip label="Sab desh" on={!country} onPress={() => setCountry(undefined)} />
        {SCHOLARSHIP_COUNTRIES.map((c) => (
          <Chip key={c} label={c} on={country === c} onPress={() => setCountry(country === c ? undefined : c)} />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.bleed}>
        {DEGREES.map((d) => (
          <Chip key={d} label={d} on={degree === d} onPress={() => setDegree(degree === d ? undefined : d)} />
        ))}
        <View style={styles.rule} />
        <Chip label={`Saved (${saved.length})`} on={onlySaved} tone="mustard" icon="heart" onPress={() => setOnlySaved(!onlySaved)} />
      </ScrollView>

      {(onlySaved || status === 'ready') && (
        <AppText variant="small">
          <AppText variant="label">{onlySaved ? `${shown.length} saved` : `${total} scholarships mili`}</AppText>
          {' · '}
          {[country ?? 'sab desh', degree].filter(Boolean).join(' · ')}
        </AppText>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <FlatList
        data={onlySaved || status === 'ready' ? shown : []}
        keyExtractor={(s) => s._id}
        renderItem={({ item }) => <ScholarshipCard item={item} saved={isSaved(item._id)} onToggle={toggle} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          !onlySaved && status === 'loading' ? (
            <SkeletonGroup>
              <View style={{ gap: space.md }}>
                {[0, 1, 2].map((i) => (
                  <Card key={i} contentStyle={styles.skeletonCard}>
                    <Skeleton width={56} height={56} radius={16} />
                    <View style={{ flex: 1, gap: 8 }}>
                      <Skeleton width="85%" height={14} />
                      <Skeleton width="50%" height={10} />
                      <Skeleton width={120} height={18} radius={9} />
                    </View>
                  </Card>
                ))}
              </View>
            </SkeletonGroup>
          ) : !onlySaved && status === 'error' ? (
            <Card contentStyle={styles.empty}>
              <AppText>{error}</AppText>
              <Button title="Dobara try karo" variant="secondary" onPress={() => run(filterKey)} />
            </Card>
          ) : (
            <Card contentStyle={styles.empty}>
              <AppText variant="bodyStrong">{onlySaved ? 'Abhi koi scholarship save nahi ki' : 'Is filter mein koi scholarship nahi mili'}</AppText>
              <AppText>{onlySaved ? 'Dil wala button dabao, scholarship yahan aa jayegi.' : 'Desh ya degree ka filter hatao.'}</AppText>
            </Card>
          )
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.teal} style={{ marginVertical: space.lg }} /> : undefined}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={[styles.list, { paddingBottom: bottom }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
}

const ScholarshipCard = memo(function ScholarshipCard({ item, saved, onToggle }: { item: Scholarship; saved: boolean; onToggle: (item: Scholarship) => void }) {
  const provider = PROVIDER[item.providerType ?? 'UNIVERSITY'] ?? PROVIDER.UNIVERSITY;
  const award = item.amount?.display || item.awardCoverage;
  const url = item.urls?.informationUrl || item.urls?.applicationUrl;
  return (
    <Pressable
      onPress={() => url && WebBrowser.openBrowserAsync(url)}
      accessibilityRole="link"
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={styles.top}>
        <View style={[styles.tile, { backgroundColor: provider.bg }]}>
          <AppText style={[styles.tileText, { color: provider.fg }]}>{provider.label}</AppText>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <AppText style={styles.name} numberOfLines={2}>
            {item.title}
          </AppText>
          <AppText variant="small" numberOfLines={1}>
            {[item.universityName, item.country].filter(Boolean).join(' · ')}
          </AppText>
        </View>
        <Pressable
          onPress={() => onToggle(item)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={saved ? `${item.title} saved se hatao` : `${item.title} save karo`}
          accessibilityState={{ selected: saved }}
          style={styles.heart}>
          <Icon name="heart" size={22} color={saved ? colors.teal : colors.mutedDark} fill={saved ? colors.teal : 'none'} />
        </Pressable>
      </View>

      {!!award && (
        <View style={styles.award}>
          <AppText style={styles.awardText} numberOfLines={2}>
            {award}
          </AppText>
        </View>
      )}

      <View style={styles.bottomRow}>
        <View style={styles.deadline}>
          <Icon name="calendar" size={14} color={colors.mutedDark} />
          <AppText variant="small" numberOfLines={1} style={{ flexShrink: 1 }}>
            {deadlineLabel(item)}
          </AppText>
        </View>
        {item.coverageLevel === 'Full' && (
          <View style={[styles.pill, { backgroundColor: colors.tint.teal }]}>
            <AppText style={[styles.pillText, { color: colors.tealDark }]}>Full funding</AppText>
          </View>
        )}
      </View>
    </Pressable>
  );
});

function Chip({
  label,
  on,
  tone = 'teal',
  icon,
  onPress,
}: {
  label: string;
  on: boolean;
  tone?: 'teal' | 'mustard';
  icon?: 'heart';
  onPress: () => void;
}) {
  const onStyle = tone === 'teal' ? styles.chipTeal : styles.chipMustard;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.chip, on && onStyle]}>
      {icon && <Icon name={icon} size={14} color={on ? colors.ink : colors.mutedDark} fill={on ? colors.ink : 'none'} />}
      <AppText style={[styles.chipText, { color: on ? (tone === 'teal' ? colors.tealDark : colors.ink) : colors.mutedDark }]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  list: { paddingHorizontal: space.xl, paddingTop: space.md, gap: space.md },
  header: { gap: 14, marginBottom: space.xs },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end' },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: colors.ink },
  bleed: { marginHorizontal: -space.xl },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: 14,
    borderWidth: border.width,
    borderColor: border.color,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  searchInput: { flex: 1, height: '100%', fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink },
  chips: { gap: 8, alignItems: 'center', paddingHorizontal: space.xl },
  rule: { width: 1.5, height: 20, backgroundColor: colors.dashed, marginHorizontal: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
  },
  chipTeal: { backgroundColor: colors.tint.teal, borderColor: colors.teal },
  chipMustard: { backgroundColor: colors.tint.mustard, borderColor: colors.mustard },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 13 },
  card: { padding: 12, gap: 10, borderRadius: radius.lg, borderWidth: border.width, borderColor: border.color, backgroundColor: colors.white },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tile: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tileText: { fontFamily: fonts.displayBlack, fontSize: 13, letterSpacing: 0.4 },
  name: { fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 20, color: colors.ink },
  heart: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  award: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, backgroundColor: colors.tint.mustard },
  awardText: { fontFamily: fonts.bodySemi, fontSize: 13, lineHeight: 18, color: colors.ink },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  deadline: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  pillText: { fontFamily: fonts.bodySemi, fontSize: 11 },
  skeletonCard: { padding: 12, gap: 12, flexDirection: 'row', alignItems: 'center' },
  empty: { padding: space.lg, gap: space.md },
});
