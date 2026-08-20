/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  const light = {
    background: Colors.white,
    backgroundElement: Colors.neutral[50],
    backgroundSelected: Colors.brand[50],
    text: Colors.neutral[900],
    textSecondary: Colors.neutral[600],
    border: Colors.neutral[200],
    primary: Colors.brand[500],
    muted: Colors.neutral[300],
  };

  const dark = {
    background: Colors.neutral[900],
    backgroundElement: Colors.neutral[800],
    backgroundSelected: Colors.brand[950] ?? Colors.brand[800],
    text: Colors.white,
    textSecondary: Colors.neutral[400],
    border: Colors.neutral[700],
    primary: Colors.brand[400] ?? Colors.brand[500],
    muted: Colors.neutral[600],
  };

  return theme === 'dark' ? dark : light;
}
