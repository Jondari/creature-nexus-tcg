import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ThemeColors } from '@/constants/Colors';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };
type StyleCreator<T extends NamedStyles<T>> = (colors: ThemeColors, isDark: boolean) => T;

/**
 * Hook to create theme-aware styles
 * Usage:
 * const styles = useThemedStyles((colors, isDark) => StyleSheet.create({
 *   container: { backgroundColor: colors.background.primary },
 *   text: { color: colors.text.primary },
 * }));
 */
export function useThemedStyles<T extends NamedStyles<T>>(
  styleCreator: StyleCreator<T>
): T {
  const { colors, isDark } = useTheme();

  return useMemo(() => {
    return styleCreator(colors, isDark);
  }, [colors, isDark, styleCreator]);
}

/**
 * Hook to get common themed style values
 * Useful for inline styles or dynamic style props
 */
export function useCommonStyles() {
  const { colors, isDark } = useTheme();

  return useMemo(() => ({
    // Backgrounds
    containerBg: { backgroundColor: colors.background.primary },
    cardBg: { backgroundColor: colors.background.card },
    secondaryBg: { backgroundColor: colors.background.secondary },
    elevatedBg: { backgroundColor: colors.background.elevated },
    inputBg: { backgroundColor: colors.surface.input },

    // Text colors
    primaryText: { color: colors.text.primary },
    secondaryText: { color: colors.text.secondary },
    mutedText: { color: colors.text.muted },

    // Borders
    cardBorder: {
      borderColor: colors.border.card,
      borderWidth: isDark ? 0 : 1,
    },
    subtleBorder: { borderColor: colors.border.subtle },

    // Common card style
    card: {
      backgroundColor: colors.background.card,
      borderColor: colors.border.card,
      borderWidth: isDark ? 0 : 1,
      borderRadius: 12,
    },

    // Input style
    input: {
      backgroundColor: colors.surface.input,
      borderColor: colors.border.subtle,
      borderWidth: 1,
      color: colors.text.primary,
    },
  }), [colors, isDark]);
}

export default useThemedStyles;
