import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../config/theme';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'accent';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
};

export function Badge({ label, variant = 'neutral', size = 'md' }: BadgeProps) {
  return (
    <View style={[styles.base, variantStyles[variant], size === 'sm' ? styles.sm : null]}>
      <Text style={[styles.text, textStyles[variant], size === 'sm' ? styles.textSm : null]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 5,
  },
  sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 11,
  },
});

const variantStyles = StyleSheet.create({
  success: { backgroundColor: colors.successBg },
  danger: { backgroundColor: colors.dangerBg },
  warning: { backgroundColor: colors.warningBg },
  info: { backgroundColor: colors.infoBg },
  neutral: { backgroundColor: colors.panelMid },
  accent: { backgroundColor: colors.accentBg },
});

const textStyles = StyleSheet.create({
  success: { color: colors.success },
  danger: { color: colors.danger },
  warning: { color: colors.warning },
  info: { color: colors.info },
  neutral: { color: colors.textSoft },
  accent: { color: colors.accent },
});
