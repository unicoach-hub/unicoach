import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR } from '@/theme/tokens';

// Bottom padding a tab screen needs so its last item scrolls clear of the floating tab bar.
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, 10) + 6 + TAB_BAR.height + TAB_BAR.gap;
}
