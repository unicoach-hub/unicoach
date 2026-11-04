import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius } from '@/theme/tokens';

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.box} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <AppText variant="label" color={colors.red}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.red,
    backgroundColor: colors.tint.red,
  },
});
