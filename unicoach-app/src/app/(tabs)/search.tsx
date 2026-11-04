import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CourseFinder } from '@/components/finder/CourseFinder';
import { ScholarshipFinder } from '@/components/finder/ScholarshipFinder';
import { AppText } from '@/components/ui/AppText';
import { colors, fonts, radius } from '@/theme/tokens';

type Mode = 'courses' | 'scholarships';

// One Search tab for both finders; the Feed can open it on either side with ?mode=scholarships
export default function Search() {
  const params = useLocalSearchParams<{ mode?: Mode }>();
  const [picked, setPicked] = useState<Mode | null>(null);
  const mode: Mode = picked ?? (params.mode === 'scholarships' ? 'scholarships' : 'courses');

  const toggle = (
    <View style={styles.switch} accessibilityRole="tablist">
      {(['courses', 'scholarships'] as const).map((m) => (
        <Pressable key={m} onPress={() => setPicked(m)} accessibilityRole="tab" accessibilityState={{ selected: mode === m }} style={[styles.half, mode === m && styles.halfOn]}>
          <AppText style={[styles.label, mode === m && styles.labelOn]}>{m === 'courses' ? 'Courses' : 'Scholarships'}</AppText>
        </Pressable>
      ))}
    </View>
  );

  return mode === 'courses' ? <CourseFinder top={toggle} /> : <ScholarshipFinder top={toggle} />;
}

const styles = StyleSheet.create({
  switch: { flexDirection: 'row', padding: 4, borderRadius: radius.pill, backgroundColor: colors.sand },
  half: { flex: 1, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  halfOn: { backgroundColor: colors.white },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.mutedDark },
  labelOn: { color: colors.ink },
});
