import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StationBoard } from '@/components/desi/StationBoard';
import { AppText, Highlight } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/auth';
import { COUNTRIES, durationShort, money, searchCourses, type Course } from '@/lib/courses';
import { countryIdFor, levelIdFor } from '@/lib/profile';
import { useSaved } from '@/lib/saved';
import { useTabBarSpace } from '@/lib/useTabBarSpace';
import { border, colors, fonts, radius, space } from '@/theme/tokens';

const SWIPE_OUT = 110;

// Course match: one card at a time from the student's profile search. Right = save, left = skip.
export default function Match() {
  const { user } = useAuth();
  const { toggle, isSaved } = useSaved();
  const bottom = useTabBarSpace();
  const { width } = useWindowDimensions();

  const [deck, setDeck] = useState<Course[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pos] = useState(() => new Animated.ValueXY());

  const filters = useCallback(() => {
    const country = countryIdFor(user?.dreamCountry);
    const level = levelIdFor(user?.highestEducation);
    return { country: country ? [country] : undefined, programLevel: level ? [level] : undefined };
  }, [user?.dreamCountry, user?.highestEducation]);

  const load = useCallback(
    async (p: number) => {
      try {
        const res = await searchCourses(filters(), p);
        setTotalPages(res.totalPages);
        setPage(p);
        // Universities already saved don't need swiping again
        setDeck((d) => [...(p === 1 ? [] : (d ?? [])), ...res.data.filter((c) => !isSaved(c.universityName))]);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Courses load nahi hue.');
        setDeck((d) => d ?? []);
      }
    },
    // isSaved changes on every save; the deck should only reload when the profile changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) load(1);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const current = deck?.[0];
  const next = deck?.[1];

  const finish = useCallback(
    (dir: 'left' | 'right') => {
      const course = deck?.[0];
      if (!course) return;
      if (dir === 'right' && !isSaved(course.universityName)) toggle(course);
      Animated.timing(pos, { toValue: { x: (dir === 'right' ? 1 : -1) * width * 1.3, y: 40 }, duration: 220, useNativeDriver: false }).start(() => {
        pos.setValue({ x: 0, y: 0 });
        setDeck((d) => {
          const rest = (d ?? []).slice(1);
          if (rest.length < 4 && page < totalPages) load(page + 1);
          return rest;
        });
      });
    },
    [deck, isSaved, toggle, pos, width, page, totalPages, load],
  );

  // The responder is made once; it calls the latest finish() through this ref.
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  // The ref is only read inside gesture callbacks, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [pan] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_OUT) finishRef.current('right');
        else if (g.dx < -SWIPE_OUT) finishRef.current('left');
        else Animated.spring(pos, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    }),
  );

  const rotate = pos.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-12deg', '0deg', '12deg'] });
  const likeOpacity = pos.x.interpolate({ inputRange: [0, SWIPE_OUT], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = pos.x.interpolate({ inputRange: [-SWIPE_OUT, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <View style={[styles.body, { paddingBottom: bottom }]}>
        <View style={{ gap: 4 }}>
          <AppText variant="kicker">Course match{deck && deck.length > 0 ? ` · ${deck.length}${page < totalPages ? '+' : ''} baaki` : ''}</AppText>
          <AppText style={styles.title}>
            Pasand aaya? <Highlight>Right</Highlight> karo
          </AppText>
        </View>

        <View style={styles.stage}>
          {deck === null ? (
            <SkeletonGroup>
              <Skeleton height={420} radius={28} />
            </SkeletonGroup>
          ) : !current ? (
            <View style={[styles.card, styles.empty]}>
              <AppText style={styles.cardTitle}>{error ?? 'Sab courses dekh liye!'}</AppText>
              <AppText>{error ? 'Thodi der baad try karo.' : 'Jo pasand aaye wo Shortlist mein hain.'}</AppText>
              <Button title={error ? 'Dobara try karo' : 'Shortlist dekho'} onPress={() => (error ? load(1) : router.push('/shortlist'))} />
            </View>
          ) : (
            <>
              {next && (
                <View style={[styles.card, styles.behind]} pointerEvents="none">
                  <CardBody course={next} />
                </View>
              )}
              <Animated.View
                {...pan.panHandlers}
                style={[styles.card, { transform: [{ translateX: pos.x }, { translateY: pos.y }, { rotate }] }]}>
                <CardBody course={current} />
                <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}>
                  <AppText style={[styles.stampText, { color: colors.teal }]}>SAVE</AppText>
                </Animated.View>
                <Animated.View style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]}>
                  <AppText style={[styles.stampText, { color: colors.red }]}>SKIP</AppText>
                </Animated.View>
              </Animated.View>
            </>
          )}
        </View>

        {!!current && (
          <View style={styles.actions}>
            <Pressable onPress={() => finish('left')} accessibilityRole="button" accessibilityLabel="Skip" style={[styles.circle, { width: 60, height: 60 }]}>
              <Icon name="close" size={24} color={colors.red} strokeWidth={2.6} />
            </Pressable>
            <Pressable
              onPress={() => router.push({ pathname: '/course/[cfId]', params: { cfId: String(current.cfId) } })}
              accessibilityRole="button"
              accessibilityLabel="Details dekho"
              style={[styles.circle, { width: 48, height: 48 }]}>
              <Icon name="external" size={20} color={colors.mutedDark} />
            </Pressable>
            <Pressable onPress={() => finish('right')} accessibilityRole="button" accessibilityLabel="Save" style={[styles.circle, styles.like]}>
              <Icon name="heart" size={28} color={colors.cream} fill={colors.cream} />
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function CardBody({ course }: { course: Course }) {
  const country = COUNTRIES.find((c) => c.name.toLowerCase() === course.countryName?.toLowerCase());
  const facts = [
    { k: 'Fees/saal', v: course.annualFee?.amount ? money(course.annualFee.amount, course.annualFee.currency) : '—' },
    { k: 'Duration', v: durationShort(course.duration) ?? '—' },
    { k: 'IELTS', v: course.minIeltsScore ? String(course.minIeltsScore) : '—' },
  ];
  return (
    <>
      <View style={[styles.art, { backgroundColor: country?.tint ?? colors.tint.teal }]}>
        <Image source={country?.image ?? require('@/assets/images/3d/map-pin.webp')} style={country ? { width: 210, height: 170 } : { width: 110, height: 110 }} contentFit="contain" />
        {!!course.city && (
          <View style={styles.board}>
            <StationBoard name={`${course.city.toUpperCase()} JN.`} size="sm" />
          </View>
        )}
      </View>
      <View style={{ padding: 16, gap: 8 }}>
        <AppText style={styles.cardTitle} numberOfLines={2}>
          {course.courseName}
        </AppText>
        <AppText variant="small" numberOfLines={1} style={{ fontSize: 14 }}>
          {course.universityName}
        </AppText>
        <View style={styles.facts}>
          {facts.map((f, i) => (
            <View key={f.k} style={[styles.fact, { flex: i === 0 ? 1.5 : 1, backgroundColor: i === 0 ? colors.tint.mustard : colors.sand }]}>
              <AppText variant="small" style={{ fontSize: 11 }}>
                {f.k}
              </AppText>
              <AppText style={styles.factValue} numberOfLines={1} adjustsFontSizeToFit>
                {f.v}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  body: { flex: 1, paddingHorizontal: space.xl, paddingTop: space.md, gap: space.lg },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.5, color: colors.ink },
  stage: { flex: 1, minHeight: 300 },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: border.width,
    borderColor: border.color,
    overflow: 'hidden',
  },
  behind: { transform: [{ scale: 0.95 }, { translateY: 14 }], opacity: 0.7 },
  empty: { position: 'relative', padding: space.xl, gap: space.md, justifyContent: 'center' },
  art: { flex: 1, minHeight: 150, alignItems: 'center', justifyContent: 'center' },
  board: { position: 'absolute', right: 14, top: 14 },
  cardTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 27, color: colors.ink },
  facts: { flexDirection: 'row', gap: 8, marginTop: 4 },
  fact: { flex: 1, borderRadius: 14, padding: 10, gap: 2 },
  factValue: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  stamp: { position: 'absolute', top: 28, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 3, backgroundColor: colors.white },
  stampLike: { left: 20, borderColor: colors.teal, transform: [{ rotate: '-12deg' }] },
  stampNope: { right: 20, borderColor: colors.red, transform: [{ rotate: '12deg' }] },
  stampText: { fontFamily: fonts.displayBlack, fontSize: 22, letterSpacing: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22 },
  circle: { borderRadius: radius.pill, borderWidth: border.width, borderColor: border.color, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  like: { width: 72, height: 72, backgroundColor: colors.teal, borderColor: colors.teal },
});
