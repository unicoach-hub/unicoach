import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { durationShort, money, type Course } from '@/lib/courses';
import { border, colors, fonts, radius } from '@/theme/tokens';

type Props = { course: Course; saved: boolean; onToggleSave: (course: Course) => void };

// Initials tile colours, picked by university id so a university keeps its colour across lists.
const TILES = [
  { bg: colors.teal, fg: colors.cream },
  { bg: colors.tint.magenta, fg: colors.magenta },
  { bg: colors.tint.mustard, fg: colors.ink },
  { bg: colors.peach, fg: colors.orangeDeep },
];

const SKIP = new Set(['of', 'the', 'and', 'for', 'de', 'der', 'fur', 'für', 'in', 'at']);

function initials(name: string) {
  const words = name.replace(/[()–-]/g, ' ').split(/\s+/).filter((w) => w && !SKIP.has(w.toLowerCase()));
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 4)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function openDetail(cfId: number) {
  router.push({ pathname: '/course/[cfId]', params: { cfId: String(cfId) } });
}

export const CourseCard = memo(function CourseCard({ course, saved, onToggleSave }: Props) {
  const fee = course.annualFee?.amount ? `${money(course.annualFee.amount, course.annualFee.currency)}/saal` : null;
  const place = [course.universityName, course.city].filter(Boolean).join(' · ');
  const tile = TILES[Math.abs(course.cfUniversityId ?? 0) % TILES.length];
  // GRE and scholarship flags are on most results, so the sticker is kept for the rarer win.
  const sticker = course.applicationFee?.isWaived ? 'APP FREE' : null;
  const pills = [fee, durationShort(course.duration)].filter(Boolean) as string[];

  return (
    <Pressable
      onPress={() => openDetail(course.cfId)}
      accessibilityRole="link"
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={[styles.tile, { backgroundColor: tile.bg }]}>
        <AppText style={[styles.tileText, { color: tile.fg }]} numberOfLines={1} adjustsFontSizeToFit>
          {initials(course.universityName)}
        </AppText>
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <AppText style={styles.name} numberOfLines={2}>
          {course.courseName}
        </AppText>
        <AppText variant="small" numberOfLines={1}>
          {place}
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
      </View>

      <Pressable
        onPress={() => onToggleSave(course)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={saved ? `Remove ${course.universityName} from saved` : `Save ${course.universityName}`}
        accessibilityState={{ selected: saved }}
        style={styles.heart}>
        <Icon name="heart" size={22} color={saved ? colors.teal : colors.mutedDark} fill={saved ? colors.teal : 'none'} />
      </Pressable>

      {sticker && (
        <View style={styles.sticker}>
          <AppText style={styles.stickerText}>{sticker}</AppText>
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
  },
  tile: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tileText: { fontFamily: fonts.displayBlack, fontSize: 15 },
  name: { fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 20, color: colors.ink },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 3 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  pillText: { fontFamily: fonts.bodySemi, fontSize: 11, color: colors.ink },
  heart: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  sticker: {
    position: 'absolute',
    right: 44,
    top: -9,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.red,
    transform: [{ rotate: '3deg' }],
  },
  stickerText: { fontFamily: fonts.bodySemi, fontSize: 10, letterSpacing: 0.6, color: colors.white },
});
