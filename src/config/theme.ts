import { DarkTheme } from '@react-navigation/native';

export const colors = {
  bg: '#080d12',
  panel: '#0f1923',
  panelSoft: '#141f2b',
  panelMid: '#1a2838',
  border: '#1e3040',
  borderLight: '#243a50',
  text: '#eef3f7',
  textSoft: '#c8d6e0',
  muted: '#7b9aae',
  mutedDark: '#4a6272',
  success: '#3ecf72',
  successDark: '#2ba854',
  successBg: 'rgba(62, 207, 114, 0.12)',
  danger: '#ff4d55',
  dangerDark: '#d93a42',
  dangerBg: 'rgba(255, 77, 85, 0.12)',
  warning: '#f5a623',
  warningBg: 'rgba(245, 166, 35, 0.12)',
  info: '#3d9eff',
  infoBg: 'rgba(61, 158, 255, 0.12)',
  accent: '#7c5cfc',
  accentBg: 'rgba(124, 92, 252, 0.12)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
};

export const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.panel,
    text: colors.text,
    border: colors.border,
    primary: colors.success,
  },
};
