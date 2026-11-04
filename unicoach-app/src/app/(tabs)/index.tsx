import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Highlight } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/auth';
import { COUNTRIES, durationShort, money, searchCourses, type Course } from '@/lib/courses';
import { absolute, eventWhen, latestBlogs, SITE, upcomingEvents, type BlogItem, type EventItem } from '@/lib/feed';
import { currentStation, headlineFor, STATIONS } from '@/lib/plan';
import { countryIdFor, intakeShort, levelIdFor, levelLabelFor } from '@/lib/profile';
import { useSaved } from '@/lib/saved';
import { useSavedScholarships } from '@/lib/scholarshipSaved';
import { scholarshipCountryFor, searchScholarships, type Scholarship } from '@/lib/scholarships';
import { useTabBarSpace } from '@/lib/useTabBarSpace';
import { useUnread } from '@/lib/useUnread';
import { border, colors, fonts, radius, space } from '@/theme/tokens';

const BOOKING_URL = `${SITE}/book-consultation`;

type Filter = 'all' | 'courses' | 'scholarships' | 'live' | 'khabar';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Aapke liye' },
  { key: 'courses', label: 'Courses' },
  { key: 'scholarships', label: 'Scholarship' },
  { key: 'live', label: 'Live' },
  { key: 'khabar', label: 'Khabar' },
];

type Block =
  | { kind: 'course'; course: Course }
  | { kind: 'carousel'; courses: Course[] }
  | { kind: 'scholarship'; item: Scholarship }
  | { kind: 'event'; item: EventItem }
  | { kind: 'blog'; item: BlogItem }
  | { kind: 'poll' }
  | { kind: 'counsellor' };

const KIND_FILTER: Record<Block['kind'], Filter> = {
  course: 'courses',
  carousel: 'courses',
  scholarship: 'scholarships',
  event: 'live',
  blog: 'khabar',
  poll: 'all',
  counsellor: 'all',
};

type FeedData = { courses: Course[]; scholarships: Scholarship[]; events: EventItem[]; blogs: BlogItem[] };

// Courses for the student's country/level/course; if their course name finds nothing, drop it and try again.
async function loadFeed(user: ReturnType<typeof useAuth>['user']): Promise<FeedData> {
  const country = countryIdFor(user?.dreamCountry);
  const level = levelIdFor(user?.highestEducation);
  const base = { country: country ? [country] : undefined, programLevel: level ? [level] : undefined };
  const courses = (async () => {
    if (user?.dreamCourse) {
      const r = await searchCourses({ ...base, searchText: user.dreamCourse }, 1).catch(() => null);
      if (r && r.data.length >= 4) return r.data;
    }
    return (await searchCourses(base, 1).catch(() => null))?.data ?? [];
  })();
  const scholarships = searchScholarships({ country: scholarshipCountryFor(user?.dreamCountry), degree: levelLabelFor(user?.highestEducation) ?? undefined }, 1)
    .then((r) => r.scholarships)
    .catch(() => [] as Scholarship[]);
  const [c, s, e, b] = await Promise.all([courses, scholarships, upcomingEvents().catch(() => []), latestBlogs().catch(() => [])]);
  return { courses: c, scholarships: s, events: e, blogs: b };
}

// Interleave so the scroll keeps changing: course, scholarship, live, a row of courses, a poll, news...
function compose({ courses, scholarships, events, blogs }: FeedData): Block[] {
  const out: Block[] = [];
  const c = [...courses];
  const s = [...scholarships];
  const e = [...events];
  const b = [...blogs];
  const take = <T,>(arr: T[]) => arr.shift();
  const push = (blk: Block | undefined | false) => blk && out.push(blk);
  for (let round = 0; round < 4; round++) {
    const course = take(c);
    push(course && { kind: 'course', course });
    const sch = take(s);
    push(sch && { kind: 'scholarship', item: sch });
    const ev = take(e);
    push(ev && { kind: 'event', item: ev });
    if (round === 0 && c.length >= 3) push({ kind: 'carousel', courses: c.splice(0, 5) });
    if (round === 0) push({ kind: 'poll' });
    const sch2 = take(s);
    push(sch2 && { kind: 'scholarship', item: sch2 });
    const blog = take(b);
    push(blog && { kind: 'blog', item: blog });
    if (round === 1) push({ kind: 'counsellor' });
  }
  if (!out.some((x) => x.kind === 'counsellor')) out.push({ kind: 'counsellor' });
  return out;
}

export default function Feed() {
  const { user } = useAuth();
  const { saved } = useSaved();
  const bottom = useTabBarSpace();
  const [data, setData] = useState<FeedData | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const unread = useUnread();

  useEffect(() => {
    let alive = true;
    loadFeed(user).then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setData(await loadFeed(user));
    setRefreshing(false);
  }, [user]);

  const firstName = user?.name?.split(' ')[0] || 'dost';
  const route = [user?.dreamCountry, levelLabelFor(user?.highestEducation), intakeShort(user?.preferredIntake)].filter(Boolean).join(' · ');
  const step = currentStation({ savedCount: saved?.length ?? 0, profileCompleted: user?.profileCompleted, journeyStage: user?.journeyStage });
  const [before, marked, after] = headlineFor(STATIONS[step], user?.dreamCountry);
  const blocks = data ? compose(data).filter((b) => filter === 'all' || KIND_FILTER[b.kind] === filter) : [];

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} colors={[colors.teal]} />}>
        <View style={styles.header}>
          <View style={{ flex: 1, gap: 1 }}>
            {!!route && (
              <AppText variant="kicker" numberOfLines={1}>
                {route}
              </AppText>
            )}
            <AppText style={styles.hello} numberOfLines={1}>
              {firstName}, aaj kya naya?
            </AppText>
          </View>
          <Pressable onPress={() => router.push('/shortlist')} accessibilityRole="button" accessibilityLabel="Meri shortlist" style={styles.round}>
            <Icon name="heart" size={20} />
          </Pressable>
        </View>

        {unread > 0 && (
          <Pressable onPress={() => router.push('/chat')} accessibilityRole="button" style={styles.unread}>
            <Icon name="chat" size={20} color={colors.cream} />
            <AppText style={styles.unreadText} numberOfLines={1}>
              Counsellor ka {unread} naya message
            </AppText>
            <Icon name="arrow" size={18} color={colors.cream} />
          </Pressable>
        )}

        {/* Where they are on the journey, one line; the full railway lives on the Journey screen */}
        <Pressable onPress={() => router.push('/journey')} accessibilityRole="button" style={styles.next}>
          <View style={styles.nextDot}>
            <AppText style={styles.nextNum}>{step + 1}</AppText>
          </View>
          <AppText style={styles.nextText} numberOfLines={1}>
            {before}
            <Highlight>{marked}</Highlight>
            {after}
          </AppText>
          <Icon name="arrow" size={18} color={colors.teal} />
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.bleed}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f.key }}
              style={[styles.chip, filter === f.key && styles.chipOn]}>
              <AppText style={[styles.chipText, filter === f.key && { color: colors.cream }]}>{f.label}</AppText>
            </Pressable>
          ))}
        </ScrollView>

        {!data ? (
          <SkeletonGroup>
            <View style={{ gap: space.lg }}>
              <Skeleton height={300} radius={24} />
              <Skeleton height={150} radius={24} />
            </View>
          </SkeletonGroup>
        ) : blocks.length === 0 ? (
          <View style={[styles.card, { padding: space.lg, gap: 8 }]}>
            <AppText variant="bodyStrong">Abhi yahan kuch nahi hai</AppText>
            <AppText>Thodi der baad neeche kheench kar refresh karo.</AppText>
          </View>
        ) : (
          blocks.map((b, i) => <BlockView key={`${b.kind}-${i}`} block={b} />)
        )}

        {!!data && (
          <View style={styles.end}>
            <AppText variant="small">Aur dekhna hai?</AppText>
            <Button title="Search kholo" variant="secondary" size="sm" onPress={() => router.push('/search')} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'course':
      return <CourseCardBig course={block.course} />;
    case 'carousel':
      return <CourseCarousel courses={block.courses} />;
    case 'scholarship':
      return <ScholarshipFeedCard item={block.item} />;
    case 'event':
      return <EventCard item={block.item} />;
    case 'blog':
      return <BlogCard item={block.item} />;
    case 'poll':
      return <Poll />;
    case 'counsellor':
      return <CounsellorCard />;
  }
}

function openCourse(c: Course) {
  router.push({ pathname: '/course/[cfId]', params: { cfId: String(c.cfId) } });
}

function CourseCardBig({ course }: { course: Course }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(course.universityName);
  const country = COUNTRIES.find((c) => c.name.toLowerCase() === course.countryName?.toLowerCase());
  const fee = course.annualFee?.amount ? `${money(course.annualFee.amount, course.annualFee.currency)}/saal` : null;
  const pills = [fee, durationShort(course.duration), course.minIeltsScore ? `IELTS ${course.minIeltsScore}` : null].filter(Boolean) as string[];
  return (
    <View style={styles.card}>
      <View style={[styles.courseArt, { backgroundColor: country?.tint ?? colors.tint.teal }]}>
        <Image source={country?.image ?? require('@/assets/images/3d/map-pin.webp')} style={country ? { width: 180, height: 132 } : { width: 96, height: 96 }} contentFit="contain" />
        <View style={styles.courseTag}>
          <AppText style={styles.courseTagText}>COURSE · aapki profile se</AppText>
        </View>
      </View>
      <View style={{ padding: 14, gap: 8 }}>
        <AppText style={styles.cardTitle} numberOfLines={2}>
          {course.courseName}
        </AppText>
        <AppText variant="small" numberOfLines={1}>
          {[course.universityName, course.city].filter(Boolean).join(' · ')}
        </AppText>
        {pills.length > 0 && (
          <View style={styles.pills}>
            {pills.map((p, i) => (
              <View key={p} style={[styles.pill, { backgroundColor: i === 0 && fee ? colors.tint.mustard : colors.sand }]}>
                <AppText style={styles.pillText}>{p}</AppText>
              </View>
            ))}
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <Button title="Details dekho" size="sm" style={{ flex: 1, alignSelf: 'auto' }} onPress={() => openCourse(course)} />
          <Pressable
            onPress={() => toggle(course)}
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Saved se hatao' : 'Save karo'}
            accessibilityState={{ selected: saved }}
            style={styles.heartBtn}>
            <Icon name="heart" size={20} color={saved ? colors.teal : colors.ink} fill={saved ? colors.teal : 'none'} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function CourseCarousel({ courses }: { courses: Course[] }) {
  const country = courses[0]?.countryName;
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.sectionHead}>
        <AppText style={styles.sectionTitle}>
          {country ? `${country}: ` : ''}
          <Highlight>aur courses</Highlight>
        </AppText>
        <Pressable onPress={() => router.push('/search')} hitSlop={8} accessibilityRole="link">
          <AppText style={styles.link}>Sab dekho</AppText>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: space.xl }} style={styles.bleed}>
        {courses.map((c) => (
          <Pressable key={c._id} onPress={() => openCourse(c)} style={styles.mini} accessibilityRole="link">
            <AppText style={styles.miniName} numberOfLines={2}>
              {c.courseName}
            </AppText>
            <AppText variant="small" numberOfLines={1}>
              {c.universityName}
            </AppText>
            {!!c.annualFee?.amount && (
              <View style={[styles.pill, { backgroundColor: colors.tint.mustard, alignSelf: 'flex-start', marginTop: 'auto' }]}>
                <AppText style={styles.pillText}>{money(c.annualFee.amount, c.annualFee.currency)}/saal</AppText>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function ScholarshipFeedCard({ item }: { item: Scholarship }) {
  const { isSaved, toggle } = useSavedScholarships();
  const saved = isSaved(item._id);
  const url = item.urls?.informationUrl || item.urls?.applicationUrl;
  return (
    <Pressable onPress={() => url && WebBrowser.openBrowserAsync(url)} accessibilityRole="link" style={styles.sch}>
      <Image source={require('@/assets/images/3d/money-bag.webp')} style={styles.schArt} contentFit="contain" />
      <View style={styles.schTag}>
        <AppText style={styles.schTagText}>SCHOLARSHIP · {item.country}</AppText>
      </View>
      <AppText style={[styles.cardTitle, { maxWidth: 240 }]} numberOfLines={2}>
        {item.title}
      </AppText>
      {!!(item.amount?.display || item.awardCoverage) && (
        <AppText style={styles.schAmount} numberOfLines={2}>
          {item.amount?.display || item.awardCoverage}
        </AppText>
      )}
      <View style={styles.schBottom}>
        <AppText variant="small" numberOfLines={1} style={{ flex: 1 }}>
          {(item.eligibility?.degreeLevels ?? []).join(', ') || item.universityName}
        </AppText>
        <Pressable onPress={() => toggle(item)} accessibilityRole="button" accessibilityState={{ selected: saved }} style={styles.schBtn}>
          <AppText style={styles.schBtnText}>{saved ? 'Saved ✓' : 'Save karo'}</AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

function EventCard({ item }: { item: EventItem }) {
  const image = absolute(item.imageUrl);
  return (
    <View style={styles.event}>
      {!!image && <Image source={{ uri: image }} style={styles.eventImage} contentFit="cover" />}
      <View style={{ padding: 16, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.live}>
            <AppText style={styles.liveText}>LIVE · FREE</AppText>
          </View>
          <AppText style={{ fontFamily: fonts.body, fontSize: 12, color: colors.cream, opacity: 0.85 }}>{eventWhen(item.eventStart)}</AppText>
        </View>
        <AppText style={[styles.cardTitle, { color: colors.cream }]} numberOfLines={3}>
          {item.title}
        </AppText>
        {!!item.speaker && (
          <AppText style={{ fontFamily: fonts.body, fontSize: 13, color: colors.cream, opacity: 0.85 }} numberOfLines={1}>
            {item.speaker}
          </AppText>
        )}
        <Button title="Seat pakki karo" variant="light" size="sm" onPress={() => WebBrowser.openBrowserAsync(`${SITE}/events/${item.slug}`)} />
      </View>
    </View>
  );
}

function BlogCard({ item }: { item: BlogItem }) {
  return (
    <Pressable onPress={() => WebBrowser.openBrowserAsync(`${SITE}/blogs/${item.slug}`)} accessibilityRole="link" style={[styles.card, styles.blog]}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.blogImage} contentFit="cover" />
      ) : (
        <View style={[styles.blogImage, { backgroundColor: colors.peach, alignItems: 'center', justifyContent: 'center' }]}>
          <Image source={require('@/assets/images/3d/map-pin.webp')} style={{ width: 52, height: 52 }} contentFit="contain" />
        </View>
      )}
      <View style={{ flex: 1, gap: 4 }}>
        <AppText variant="kicker">Bahar ki khabar</AppText>
        <AppText style={styles.blogTitle} numberOfLines={3}>
          {item.title}
        </AppText>
      </View>
    </Pressable>
  );
}

// One-tap question: keeps the scroll lively and points to the next useful thing.
const POLL = [
  { label: 'Is mahine', reply: 'All the best! Counsellor se ek baar speaking ki tips le lo.' },
  { label: '2-3 mahine mein', reply: 'Sahi time hai. Pehle date book karo, slots jaldi bharte hain.' },
  { label: 'De diya', reply: 'Badhiya! Ab score ke hisaab se universities shortlist karo.' },
  { label: 'Pata nahi', reply: 'Koi baat nahi. Counsellor aapke intake ke hisaab se date bata dega.' },
];

function Poll() {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <View style={[styles.card, { padding: 16, gap: 10 }]}>
      <AppText variant="kicker">Ek sawaal</AppText>
      <AppText style={styles.sectionTitle}>IELTS kab de rahe ho?</AppText>
      <View style={styles.pollGrid}>
        {POLL.map((p, i) => (
          <Pressable
            key={p.label}
            onPress={() => setPicked(i)}
            accessibilityRole="radio"
            accessibilityState={{ checked: picked === i }}
            style={[styles.pollOpt, picked === i && styles.pollOn]}>
            <AppText style={[styles.chipText, { color: picked === i ? colors.tealDark : colors.ink }]}>{p.label}</AppText>
          </Pressable>
        ))}
      </View>
      {picked !== null && <AppText style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.tealDark }}>{POLL[picked].reply}</AppText>}
    </View>
  );
}

function CounsellorCard() {
  return (
    <Pressable onPress={() => WebBrowser.openBrowserAsync(BOOKING_URL)} accessibilityRole="button" style={styles.counsel}>
      <Image source={require('@/assets/images/counsellor.webp')} style={styles.counselImg} contentFit="cover" />
      <View style={{ flex: 1, gap: 3 }}>
        <AppText style={styles.blogTitle}>Confused ho? Counsellor se baat karo</AppText>
        <AppText variant="small">30 min · bilkul free</AppText>
      </View>
      <Icon name="arrow" size={20} color={colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: space.xl, paddingTop: space.md, gap: space.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  hello: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.ink },
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
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: border.width,
    borderColor: border.color,
  },
  nextDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.mustard, alignItems: 'center', justifyContent: 'center' },
  nextNum: { fontFamily: fonts.displayBlack, fontSize: 14, color: colors.ink },
  nextText: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink },
  bleed: { marginHorizontal: -space.xl },
  unread: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.red },
  unreadText: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 14, color: colors.cream },
  chips: { gap: 8, paddingHorizontal: space.xl },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.mutedDark },
  card: { borderRadius: 24, backgroundColor: colors.white, borderWidth: border.width, borderColor: border.color, overflow: 'hidden' },
  courseArt: { height: 150, alignItems: 'center', justifyContent: 'center' },
  courseTag: { position: 'absolute', left: 12, top: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.teal },
  courseTagText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.cream },
  cardTitle: { fontFamily: fonts.display, fontSize: 19, lineHeight: 24, color: colors.ink },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill },
  pillText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.ink },
  heartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: border.width,
    borderColor: border.color,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24, color: colors.ink },
  link: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.teal },
  mini: {
    width: 170,
    minHeight: 132,
    padding: 12,
    gap: 6,
    borderRadius: 20,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
  },
  miniName: { fontFamily: fonts.bodySemi, fontSize: 14, lineHeight: 19, color: colors.ink },
  sch: { borderRadius: 24, backgroundColor: colors.tint.mustard, padding: 16, gap: 8, overflow: 'hidden' },
  schArt: { position: 'absolute', right: 6, top: 6, width: 76, height: 76 },
  schTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.ink },
  schTagText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.mustard },
  schAmount: { fontFamily: fonts.bodySemi, fontSize: 14, lineHeight: 20, color: colors.ink, maxWidth: 260 },
  schBottom: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  schBtn: { height: 38, paddingHorizontal: 14, borderRadius: 19, backgroundColor: colors.ink, justifyContent: 'center' },
  schBtnText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.cream },
  event: { borderRadius: 24, backgroundColor: colors.teal, overflow: 'hidden' },
  eventImage: { width: '100%', height: 170 },
  live: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.red },
  liveText: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 0.6, color: colors.white },
  blog: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  blogImage: { width: 84, height: 84, borderRadius: 16 },
  blogTitle: { fontFamily: fonts.display, fontSize: 16, lineHeight: 21, color: colors.ink },
  pollGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pollOpt: {
    width: '48%',
    flexGrow: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: border.width,
    borderColor: border.color,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollOn: { backgroundColor: colors.tint.teal, borderColor: colors.teal },
  counsel: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 24, backgroundColor: colors.peach },
  counselImg: { width: 72, height: 72, borderRadius: 18 },
  end: { alignItems: 'center', gap: 8, paddingTop: space.sm },
});
