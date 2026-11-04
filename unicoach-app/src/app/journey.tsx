import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import { StationBoard } from '@/components/desi/StationBoard';
import { AppText, Highlight } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/lib/auth';
import { currentStation, STATIONS } from '@/lib/plan';
import { levelLabelFor } from '@/lib/profile';
import { useSaved } from '@/lib/saved';
import { border, colors, fonts, radius, space } from '@/theme/tokens';

const BOOKING_URL = 'https://www.unicoach.com/book-consultation';

// "Mera safar": the six stations as a railway line, the current one as a yellow station board.
export default function Journey() {
  const { user } = useAuth();
  const { saved } = useSaved();
  const count = saved?.length ?? 0;
  const step = currentStation({ savedCount: count, profileCompleted: user?.profileCompleted, journeyStage: user?.journeyStage });
  const route = [user?.dreamCountry, levelLabelFor(user?.highestEducation), user?.preferredIntake].filter(Boolean).join(' · ');
  const now = STATIONS[step];

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} style={styles.back}>
          <Icon name="back" size={20} />
        </Pressable>
        <View style={styles.header}>
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="kicker">{route || 'Shortlist se visa tak'}</AppText>
            <AppText style={styles.title}>
              Mera <Highlight>safar</Highlight>
            </AppText>
          </View>
          <ProgressRing done={step + 1} total={STATIONS.length} />
        </View>

        <View style={styles.helper}>
          <Image source={require('@/assets/images/3d/calendar.webp')} style={{ width: 34, height: 34 }} contentFit="contain" />
          <View style={{ flex: 1, gap: 1 }}>
            <AppText variant="kicker">Deadlines ka tension?</AppText>
            <AppText variant="label" style={{ fontSize: 14 }}>
              Counsellor ke saath dates fix karo
            </AppText>
          </View>
          <Button title="Free call" variant="dark" size="sm" style={styles.helperBtn} onPress={() => WebBrowser.openBrowserAsync(BOOKING_URL)} />
        </View>

        <View>
          <Track />
          {STATIONS.map((s, i) => {
            if (i < step) {
              return (
                <View key={s.key} style={styles.row}>
                  <View style={styles.node}>
                    <View style={styles.dotDone}>
                      <Icon name="check" size={13} color={colors.cream} strokeWidth={3} />
                    </View>
                  </View>
                  <View style={[styles.plate, styles.plateDone]}>
                    <AppText style={styles.plateName}>{s.board}</AppText>
                    <AppText variant="small">{s.done}</AppText>
                  </View>
                </View>
              );
            }
            if (i === step) {
              return (
                <View key={s.key} style={[styles.row, { alignItems: 'flex-start' }]}>
                  <View style={[styles.node, { paddingTop: 14 }]}>
                    <View style={styles.dotNow} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ zIndex: 1 }}>
                      <StationBoard name={s.board} left={`PF ${i + 1}`} right="ABHI YAHAN HO" />
                    </View>
                    <View style={styles.nowCard}>
                      <AppText style={styles.nowText}>
                        {now.detail}
                        {s.key === 'shortlist' && saved ? ` Abhi ${count} saved ${count === 1 ? 'hai' : 'hain'}.` : ''}
                      </AppText>
                      {s.key === 'shortlist' && count > 0 && (
                        <View style={styles.savedChips}>
                          {saved!.slice(0, 4).map((u) => (
                            <View key={u._id} style={styles.savedChip}>
                              <AppText style={styles.savedChipText} numberOfLines={1}>
                                {u.name.replace(/^University of /, '')}
                              </AppText>
                            </View>
                          ))}
                        </View>
                      )}
                      <Button
                        title={s.key === 'shortlist' ? 'Shortlist banao' : now.cta}
                        variant="light"
                        size="sm"
                        icon={<Icon name="arrow" size={18} />}
                        onPress={() => (s.key === 'shortlist' ? router.push('/search') : WebBrowser.openBrowserAsync(BOOKING_URL))}
                      />
                    </View>
                  </View>
                </View>
              );
            }
            return (
              <View key={s.key} style={styles.row}>
                <View style={styles.node}>
                  <View style={styles.dotNext} />
                </View>
                <View style={[styles.plate, styles.plateNext]}>
                  <AppText style={[styles.plateName, { color: colors.mutedDark }]}>{s.board}</AppText>
                  <AppText variant="small">{s.todo}</AppText>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  return (
    <Svg width={58} height={58} viewBox="0 0 58 58" accessibilityLabel={`Step ${done} of ${total}`}>
      <Circle cx={29} cy={29} r={r} fill="none" stroke={colors.divider} strokeWidth={6} />
      <Circle
        cx={29}
        cy={29}
        r={r}
        fill="none"
        stroke={colors.teal}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${(c * done) / total} ${c}`}
        transform="rotate(-90 29 29)"
      />
      <SvgText x={29} y={34} textAnchor="middle" fontFamily={fonts.display} fontSize={14} fill={colors.ink}>
        {`${done}/${total}`}
      </SvgText>
    </Svg>
  );
}

// Two rails and wooden sleepers running behind the station dots.
function Track() {
  return (
    <View style={styles.track} pointerEvents="none">
      <View style={styles.sleepers}>
        {Array.from({ length: 60 }).map((_, i) => (
          <View key={i} style={styles.sleeper} />
        ))}
      </View>
      <View style={[styles.rail, { left: 3 }]} />
      <View style={[styles.rail, { right: 3 }]} />
    </View>
  );
}

const NODE = 40;

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.xxxl, gap: 14 },
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
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: colors.ink },
  helper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
  },
  helperBtn: { height: 36, paddingHorizontal: 14 },
  track: { position: 'absolute', left: 10, width: 20, top: 10, bottom: 10, overflow: 'hidden' },
  sleepers: { gap: 8, paddingTop: 4 },
  sleeper: { height: 3, backgroundColor: colors.dashed },
  rail: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  node: { width: NODE, alignItems: 'center' },
  dotDone: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.teal,
    borderWidth: 3,
    borderColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotNow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.mustard,
    borderWidth: 3,
    borderColor: colors.ink,
    shadowColor: colors.mustard,
    shadowOpacity: 0.6,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  dotNext: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.cream, borderWidth: 2.5, borderColor: colors.muted },
  plate: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.sm,
    borderWidth: border.width,
  },
  plateDone: { backgroundColor: colors.white, borderColor: border.color },
  plateNext: { backgroundColor: colors.creamDeep, borderColor: colors.dashed, borderStyle: 'dashed' },
  plateName: { fontFamily: fonts.displayBlack, fontSize: 15, letterSpacing: 0.4, color: colors.ink },
  nowCard: { marginTop: -10, borderRadius: 20, backgroundColor: colors.teal, paddingTop: 22, paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  nowText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.cream },
  savedChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  savedChip: { maxWidth: '100%', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(255,246,229,0.16)' },
  savedChipText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.cream },
});
