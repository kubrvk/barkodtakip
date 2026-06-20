import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../config/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  disabled = false,
  fullWidth = false,
  size = 'md',
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        (pressed || disabled) && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, textStyles[variant], textSizeStyles[size]]}>{label}</Text>
      {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primary: {
    backgroundColor: colors.success,
  },
  secondary: {
    backgroundColor: colors.panelMid,
    borderColor: colors.borderLight,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    borderWidth: 1,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRight: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

const sizeStyles = StyleSheet.create({
  sm: { minHeight: 38, paddingHorizontal: 12 },
  md: { minHeight: 50, paddingHorizontal: spacing.md },
  lg: { minHeight: 58, paddingHorizontal: spacing.lg },
});

const textStyles = StyleSheet.create({
  primary: { color: colors.bg },
  secondary: { color: colors.text },
  danger: { color: '#fff' },
  ghost: { color: colors.text },
});

const textSizeStyles = StyleSheet.create({
  sm: { fontSize: 13 },
  md: { fontSize: 15 },
  lg: { fontSize: 17 },
});
