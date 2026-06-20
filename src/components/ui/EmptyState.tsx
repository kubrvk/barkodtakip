import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../config/theme';

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
};

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function LoadingState({ message = 'Yükleniyor...' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 100,
    padding: spacing.lg,
  },
  iconWrap: {
    marginBottom: 4,
    opacity: 0.5,
  },
  title: {
    color: colors.textSoft,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
});
