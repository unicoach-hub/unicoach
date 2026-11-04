import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TrainTrack } from '@/components/brand/Train';
import { CourseCard } from '@/components/CourseCard';
import { AppText, Highlight } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { COUNTRIES, LEVELS, REQUIREMENTS, searchCourses, type Course, type CourseFilters } from '@/lib/courses';
import { useAuth } from '@/lib/auth';
import { countryIdFor, levelIdFor } from '@/lib/profile';
import { useSaved } from '@/lib/saved';
import { useTabBarSpace } from '@/lib/useTabBarSpace';
import { border, colors, fonts, radius, space } from '@/theme/tokens';

type Status = 'loading' | 'ready' | 'error';

function toggleIn(list: number[], id: number) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

// Course Finder, shown inside the Search tab. `top` is the Courses / Scholarships switch.
export function CourseFinder({ top }: { top?: ReactNode }) {
  const { isSaved, toggle } = useSaved();
  const { user } = useAuth();
  const bottom = useTabBarSpace();

  // Start from the student's onboarding answers; they can change any filter.
  const [text, setText] = useState(user?.dreamCourse ?? '');
  const [query, setQuery] = useState(user?.dreamCourse ?? '');
  const [country, setCountry] = useState<number | null>(() => (user?.dreamCountry ? countryIdFor(user.dreamCountry) : 9));
  const [level, setLevel] = useState<number | null>(() => levelIdFor(user?.highestEducation) ?? 2);
  const [reqs, setReqs] = useState<number[]>([]);
  const [picking, setPicking] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [unis, setUnis] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Only the newest request may write results, so fast filter taps never show stale lists.
  const requestId = useRef(0);

  // Wait for a pause in typing before searching.
  useEffect(() => {
    const t = setTimeout(() => setQuery(text.trim()), 400);
    return () => clearTimeout(t);
  }, [text]);

  const filters: CourseFilters = {
    searchText: query || undefined,
    country: country ? [country] : undefined,
    programLevel: level ? [level] : undefined,
    requirements: reqs.length ? reqs : undefined,
  };
  const filterKey = JSON.stringify(filters);

  const run = useCallback(async (key: string) => {
    const id = ++requestId.current;
    try {
      const res = await searchCourses(JSON.parse(key), 1);
      if (id !== requestId.current) return;
      setCourses(res.data);
      setTotal(res.total);
      setUnis(res.universitiesCount);
      setPage(1);
      setTotalPages(res.totalPages);
      setStatus('ready');
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e instanceof Error ? e.message : 'Search nahi ho paaya.');
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
    if (status !== 'ready' || loadingMore || page >= totalPages) return;
    const id = requestId.current;
    setLoadingMore(true);
    try {
      const res = await searchCourses(JSON.parse(filterKey), page + 1);
      if (id !== requestId.current) return;
      setCourses((prev) => {
        const seen = new Set(prev.map((c) => c._id));
        return [...prev, ...res.data.filter((c) => !seen.has(c._id))];
      });
      setPage(page + 1);
    } catch {
      // the next scroll to the end tries again
    } finally {
      setLoadingMore(false);
    }
  }, [status, loadingMore, page, totalPages, filterKey]);

  const countryName = COUNTRIES.find((c) => c.id === country)?.name;
  const levelName = LEVELS.find((l) => l.id === level)?.label;

  const header = (
    <View style={styles.header}>
      {top}
      <View style={styles.titleRow}>
        <View style={{ gap: 4, flex: 1 }}>
          <AppText variant="kicker">Course finder</AppText>
          <AppText style={styles.title}>
            Course <Highlight>dhoondho</Highlight>
          </AppText>
        </View>
        <Image source={require('@/assets/images/3d/map-pin.webp')} style={{ width: 54, height: 54 }} contentFit="contain" />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Icon name="search" size={20} color={colors.mutedDark} />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Course, subject ya university"
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            onSubmitEditing={() => setQuery(text.trim())}
            autoCorrect={false}
            accessibilityLabel="Search courses"
            style={styles.searchInput}
          />
          {!!text && (
            <Pressable onPress={() => setText('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
              <Icon name="close" size={18} color={colors.mutedDark} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => setPicking((p) => !p)}
          accessibilityRole="button"
          accessibilityLabel="Country chuno"
          accessibilityState={{ expanded: picking }}
          style={[styles.filterBtn, picking && { backgroundColor: colors.tealDark }]}>
          <Icon name="filter" size={20} color={colors.cream} />
        </Pressable>
      </View>

      {picking && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.countries} style={styles.bleed}>
          {COUNTRIES.map((c) => {
            const on = country === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => {
                  setCountry(on ? null : c.id);
                  setPicking(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={c.name}
                style={[styles.country, { backgroundColor: on ? c.tint : colors.white }, on && styles.countryOn]}>
                <Image source={c.image} style={styles.countryArt} contentFit="contain" />
                <AppText style={styles.countryName}>{c.name}</AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.bleed}>
        {countryName ? (
          <Pressable onPress={() => setCountry(null)} accessibilityRole="button" accessibilityLabel={`${countryName} hatao`} style={[styles.chip, styles.chipSolid]}>
            <AppText style={[styles.chipText, { color: colors.cream }]}>{countryName}</AppText>
            <Icon name="close" size={14} color={colors.cream} strokeWidth={2.6} />
          </Pressable>
        ) : (
          <Chip label="Country" on={false} onPress={() => setPicking(true)} />
        )}
        {LEVELS.map((l) => (
          <Chip key={l.id} label={l.label} on={level === l.id} onPress={() => setLevel(level === l.id ? null : l.id)} />
        ))}
        {REQUIREMENTS.map((r) => (
          <Chip key={r.id} label={r.label} on={reqs.includes(r.id)} tone="mustard" onPress={() => setReqs(toggleIn(reqs, r.id))} />
        ))}
      </ScrollView>

      {status === 'ready' && (
        <AppText variant="small">
          <AppText variant="label">{total.toLocaleString('en-IN')} courses mile</AppText>
          {' · '}
          {[countryName, levelName].filter(Boolean).join(' · ') || 'sab jagah'} · {unis.toLocaleString('en-IN')} universities
        </AppText>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <FlatList
        data={status === 'ready' ? courses : []}
        keyExtractor={(c) => c._id}
        renderItem={({ item }) => <CourseCard course={item} saved={isSaved(item.universityName)} onToggleSave={toggle} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          status === 'loading' ? (
            <SkeletonGroup>
              <View style={{ gap: space.md }}>
                <View style={styles.searching}>
                  <TrainTrack color={colors.teal} duration={1800} />
                  <AppText variant="small">Aapke liye courses dhoondh rahe hain…</AppText>
                </View>
                {[0, 1, 2].map((i) => (
                  <Card key={i} contentStyle={styles.skeletonCard}>
                    <Skeleton width={56} height={56} radius={16} />
                    <View style={{ flex: 1, gap: 8 }}>
                      <Skeleton width="80%" height={14} />
                      <Skeleton width="55%" height={10} />
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <Skeleton width={70} height={18} radius={9} />
                        <Skeleton width={50} height={18} radius={9} />
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </SkeletonGroup>
          ) : status === 'error' ? (
            <Card contentStyle={styles.empty}>
              <AppText>{error}</AppText>
              <Button title="Dobara try karo" variant="secondary" onPress={() => run(filterKey)} />
            </Card>
          ) : (
            <Card contentStyle={styles.empty}>
              <AppText variant="bodyStrong">Is filter mein koi course nahi mila</AppText>
              <AppText>Ek-do filter hatao ya doosra country try karo.</AppText>
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

function Chip({ label, on, tone = 'teal', onPress }: { label: string; on: boolean; tone?: 'teal' | 'mustard'; onPress: () => void }) {
  const onStyle = tone === 'teal' ? styles.chipTeal : styles.chipMustard;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.chip, on && onStyle]}>
      <AppText style={[styles.chipText, on && { color: tone === 'teal' ? colors.tealDark : colors.ink }, !on && { color: colors.mutedDark }]}>
        {label}
      </AppText>
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
  searchRow: { flexDirection: 'row', gap: 10 },
  search: {
    flex: 1,
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
  filterBtn: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  countries: { gap: 10, paddingHorizontal: space.xl },
  country: {
    width: 84,
    height: 96,
    borderRadius: radius.md,
    borderWidth: border.width,
    borderColor: border.color,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 8,
  },
  countryOn: { borderColor: colors.teal },
  countryArt: { width: 56, height: 56 },
  countryName: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.ink },
  chips: { gap: 8, alignItems: 'center', paddingHorizontal: space.xl },
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
  chipSolid: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipTeal: { backgroundColor: colors.tint.teal, borderColor: colors.teal },
  chipMustard: { backgroundColor: colors.tint.mustard, borderColor: colors.mustard },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink },
  skeletonCard: { padding: 12, gap: 12, flexDirection: 'row', alignItems: 'center' },
  searching: { gap: 6, alignItems: 'center', paddingBottom: space.xs },
  empty: { padding: space.lg, gap: space.md },
});
