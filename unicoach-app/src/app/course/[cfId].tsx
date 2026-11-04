import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StationBoard } from '@/components/desi/StationBoard';
import { AppText, Highlight } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { courseDetail, highlights, type CourseDetail, type Highlight as HighlightT } from '@/lib/courseDetail';
import { COUNTRIES, durationShort, money, type Course } from '@/lib/courses';
import { SITE } from '@/lib/feed';
import { useSaved } from '@/lib/saved';
import { border, colors, fonts, radius, space } from '@/theme/tokens';

const RANKING_LABEL: Record<string, string> = {
  qsWorld: 'QS World',
  theWorld: 'THE World',
  usNewsWorld: 'US News',
  webometricsWorld: 'Webometrics World',
  webometricsNational: 'Webometrics (desh mein)',
};

// Course detail inside the app (was a website page before)
export default function CourseScreen() {
  const { cfId } = useLocalSearchParams<{ cfId: string }>();
  const { isSaved, toggle } = useSaved();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [labels, setLabels] = useState<HighlightT[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      courseDetail(cfId)
        .then((c) => {
          setCourse(c);
          setError(null);
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'Course load nahi hua.')),
    [cfId],
  );

  useEffect(() => {
    load();
    highlights().then(setLabels);
  }, [load]);

  const back = (
    <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} style={styles.round}>
      <Icon name="back" size={20} />
    </Pressable>
  );

  if (!course) {
    return (
      <SafeAreaView edges={['top']} style={styles.page}>
        <View style={styles.body}>
          {back}
          {error ? (
            <View style={styles.card}>
              <AppText variant="bodyStrong">{error}</AppText>
              <Button title="Dobara try karo" variant="secondary" onPress={load} />
            </View>
          ) : (
            <SkeletonGroup>
              <View style={{ gap: 14 }}>
                <Skeleton height={190} radius={28} />
                <Skeleton height={26} width="85%" />
                <Skeleton height={14} width="55%" />
                <Skeleton height={140} radius={20} />
              </View>
            </SkeletonGroup>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const uni = course.university;
  const country = COUNTRIES.find((c) => c.name.toLowerCase() === uni.countryName?.toLowerCase());
  const saved = isSaved(uni.name);
  const city = course.campus || uni.city;
  const english = course.testRequirements?.english ?? [];
  const exams = course.testRequirements?.standardized ?? [];
  const chips = (course.highlightIds ?? []).map((id) => labels.find((l) => l.id === id)).filter(Boolean) as HighlightT[];
  const rankings = Object.entries(uni.rankings ?? {}).filter(([k, v]) => RANKING_LABEL[k] && v);
  const appFee = course.applicationFee;

  // The saved-universities toggle takes a search result; build the fields it uses.
  const asCourse: Course = {
    _id: course.id,
    cfId: Number(course.id),
    courseName: course.name,
    universityName: uni.name,
    cfUniversityId: uni.cfUniversityId,
    countryName: uni.countryName ?? '',
    city,
    annualFee: course.tuitionFee,
    minIeltsScore: english.find((e) => e.test === 'IELTS Overall')?.score,
  };

  const facts = [
    { k: 'Fees/saal', v: course.tuitionFee?.amount ? money(course.tuitionFee.amount, course.tuitionFee.currency) : 'Pata karo', hot: true },
    { k: 'Duration', v: durationShort(course.duration) ?? '—' },
    { k: 'Intake', v: course.intakesList?.length ? course.intakesList.join(', ') : '—' },
    { k: 'Application fee', v: appFee?.isWaived || appFee?.amount === 0 ? 'Free' : appFee?.amount ? money(appFee.amount, appFee.currency) : '—' },
  ];

  const ask = `Namaste! Mujhe ye course pasand aaya: ${course.name}, ${uni.name}. Kya main eligible hoon aur aage kya karna hai?`;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          {back}
          <Pressable
            onPress={() => toggle(asCourse)}
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Saved se hatao' : 'Save karo'}
            accessibilityState={{ selected: saved }}
            style={styles.round}>
            <Icon name="heart" size={20} color={saved ? colors.teal : colors.ink} fill={saved ? colors.teal : 'none'} />
          </Pressable>
        </View>

        <View style={[styles.hero, { backgroundColor: country?.tint ?? colors.tint.teal }]}>
          <Image source={country?.image ?? require('@/assets/images/3d/map-pin.webp')} style={country ? { width: 200, height: 160 } : { width: 110, height: 110 }} contentFit="contain" />
          {!!city && (
            <View style={styles.board}>
              <StationBoard name={`${city.toUpperCase()} JN.`} size="sm" />
            </View>
          )}
        </View>

        <View style={{ gap: 6 }}>
          <AppText variant="kicker" numberOfLines={2}>
            {uni.name}
          </AppText>
          <AppText style={styles.title}>{course.name}</AppText>
          <AppText variant="small" style={{ fontSize: 14 }}>
            {[city, uni.countryName].filter(Boolean).join(', ')}
          </AppText>
        </View>

        {chips.length > 0 && (
          <View style={styles.chips}>
            {chips.map((c) => (
              <View key={c.id} style={styles.chip}>
                <Icon name="check" size={13} color={colors.tealDark} strokeWidth={3} />
                <AppText style={styles.chipText}>{c.name}</AppText>
              </View>
            ))}
          </View>
        )}

        <View style={styles.grid}>
          {facts.map((f) => (
            <View key={f.k} style={[styles.fact, { backgroundColor: f.hot ? colors.tint.mustard : colors.white }]}>
              <AppText variant="small">{f.k}</AppText>
              <AppText style={styles.factValue}>{f.v}</AppText>
            </View>
          ))}
        </View>

        {!!course.applicationDeadline && (
          <Section title="Deadline">
            <View style={styles.line}>
              <Icon name="calendar" size={18} color={colors.red} />
              <AppText style={{ flex: 1 }}>{course.applicationDeadline}</AppText>
            </View>
          </Section>
        )}

        {(english.length > 0 || exams.length > 0) && (
          <Section title="Kya score chahiye">
            {[...english, ...exams].map((e) => (
              <View key={e.test} style={styles.kv}>
                <AppText>{e.test}</AppText>
                <AppText style={styles.kvValue}>{e.score}</AppText>
              </View>
            ))}
          </Section>
        )}

        {(course.scholarshipAvailable || course.scholarshipRange) && (
          <View style={styles.sch}>
            <AppText variant="kicker" style={{ color: colors.ink }}>
              Scholarship
            </AppText>
            <AppText style={styles.schText}>
              {course.scholarshipRange ? (
                <>
                  <Highlight>{`${money(course.scholarshipRange.min, course.scholarshipRange.currency)} – ${money(course.scholarshipRange.max, course.scholarshipRange.currency)}`}</Highlight>
                  {' tak mil sakti hai'}
                </>
              ) : (
                'Is course pe scholarship milti hai'
              )}
            </AppText>
            <AppText variant="small">Counsellor bata dega aapko kitni mil sakti hai.</AppText>
          </View>
        )}

        {!!course.deposit?.amount && (
          <Section title="Seat pakki karne ka deposit">
            <AppText>{money(course.deposit.amount, course.deposit.currency)}</AppText>
          </Section>
        )}

        {rankings.length > 0 && (
          <Section title="University ranking">
            {rankings.map(([k, v]) => (
              <View key={k} style={styles.kv}>
                <AppText>{RANKING_LABEL[k]}</AppText>
                <AppText style={styles.kvValue}>#{v}</AppText>
              </View>
            ))}
          </Section>
        )}

        <Pressable onPress={() => WebBrowser.openBrowserAsync(`${SITE}/program/${course.id}`)} accessibilityRole="link" style={{ alignSelf: 'center', padding: 8 }}>
          <AppText style={styles.link}>Website pe poori detail dekho</AppText>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => toggle(asCourse)}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Saved se hatao' : 'Save karo'}
          accessibilityState={{ selected: saved }}
          style={[styles.saveBtn, saved && { backgroundColor: colors.tint.teal, borderColor: colors.teal }]}>
          <Icon name="heart" size={22} color={saved ? colors.teal : colors.ink} fill={saved ? colors.teal : 'none'} />
        </Pressable>
        <Button
          title="Counsellor se poochho"
          icon={<Icon name="chat" size={18} color={colors.cream} />}
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/chat', params: { draft: ask } })}
        />
      </View>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  body: { paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.xxl, gap: space.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { height: 190, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  board: { position: 'absolute', right: 14, top: 14 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.4, color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.tint.teal },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.tealDark },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fact: { width: '48%', flexGrow: 1, padding: 12, gap: 3, borderRadius: radius.md, borderWidth: border.width, borderColor: border.color },
  factValue: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22, color: colors.ink },
  card: { padding: space.lg, gap: 8, borderRadius: radius.lg, borderWidth: border.width, borderColor: border.color, backgroundColor: colors.white },
  sectionTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.ink },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  kvValue: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  sch: { padding: space.lg, gap: 6, borderRadius: radius.lg, backgroundColor: colors.tint.mustard },
  schText: { fontFamily: fonts.display, fontSize: 18, lineHeight: 26, color: colors.ink },
  link: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.teal },
  saveBtn: { width: 56, height: 56, borderRadius: radius.md, borderWidth: border.width, borderColor: border.color, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: space.xl, paddingTop: 10, paddingBottom: 6, borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.cream },
});
