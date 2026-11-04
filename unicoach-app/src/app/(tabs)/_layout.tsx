import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useUnread } from '@/lib/useUnread';
import { colors, fonts, softShadow, TAB_BAR } from '@/theme/tokens';

const TABS: { name: string; href: '/' | '/search' | '/match' | '/chat' | '/profile'; label: string; icon: IconName }[] = [
  { name: 'index', href: '/', label: 'Feed', icon: 'home' },
  { name: 'search', href: '/search', label: 'Search', icon: 'search' },
  { name: 'match', href: '/match', label: 'Match', icon: 'cards' },
  { name: 'chat', href: '/chat', label: 'Counsellor', icon: 'chat' },
  { name: 'profile', href: '/profile', label: 'Profile', icon: 'user' },
];

// Floating white pill over the content; the active tab opens into a teal pill with its label.
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const unread = useUnread();
  return (
    <>
      <Tabs style={styles.fill}>
        <TabSlot style={styles.fill} />
        <TabList asChild>
          <View style={StyleSheet.flatten([styles.bar, { bottom: Math.max(insets.bottom, 10) + 6 }])}>
            {TABS.map((t) => (
              <TabTrigger key={t.name} name={t.name} href={t.href} asChild>
                <TabButton label={t.label} icon={t.icon} badge={t.name === 'chat' ? unread : 0} />
              </TabTrigger>
            ))}
          </View>
        </TabList>
      </Tabs>
    </>
  );
}

// TabTrigger's slot props type `ref` against a function type, which no RN component accepts; the slot attaches the ref itself.
type TabButtonProps = Omit<TabTriggerSlotProps, 'ref'> & { label: string; icon: IconName; badge?: number };

function TabButton({ label, icon, badge = 0, isFocused, ...props }: TabButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      accessibilityLabel={label}
      style={[styles.tab, isFocused && styles.tabOn]}>
      <Icon name={icon} size={isFocused ? 20 : 22} color={isFocused ? colors.cream : colors.mutedDark} />
      {isFocused && <AppText style={styles.label}>{label}</AppText>}
      {badge > 0 && !isFocused && (
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>{badge > 9 ? '9+' : badge}</AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bar: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: TAB_BAR.height,
    borderRadius: TAB_BAR.height / 2,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    ...softShadow,
  },
  tab: { minWidth: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  tabOn: { backgroundColor: colors.teal, paddingHorizontal: 16 },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.cream },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.red,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.bodySemi, fontSize: 10, lineHeight: 12, color: colors.white },
});
