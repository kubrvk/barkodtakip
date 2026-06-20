import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../config/theme';
import { Product } from '../types';
import { Badge } from './ui/Badge';

type ProductCardProps = {
  product: Product;
  onPress?: () => void;
  compact?: boolean;
};

export function ProductCard({ product, onPress, compact = false }: ProductCardProps) {
  const isCritical = product.currentStock <= product.minStock;
  const stockPercent =
    product.minStock > 0
      ? Math.min(1, product.currentStock / (product.minStock * 3))
      : 1;

  const content = (
    <View style={[styles.card, compact && styles.compact]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.sku}>{product.sku}</Text>
        </View>
        <Badge
          label={isCritical ? 'Kritik' : 'Normal'}
          variant={isCritical ? 'danger' : 'success'}
          size="sm"
        />
      </View>

      {!compact && (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, isCritical ? { color: colors.danger } : { color: colors.success }]}>
                {product.currentStock}
              </Text>
              <Text style={styles.statLabel}>Stok</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{product.minStock}</Text>
              <Text style={styles.statLabel}>Min.</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{product.locationCode}</Text>
              <Text style={styles.statLabel}>Konum</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${stockPercent * 100}%`,
                  backgroundColor: isCritical ? colors.danger : colors.success,
                },
              ]}
            />
          </View>
        </>
      )}

      {compact && (
        <View style={styles.compactRow}>
          <Text style={styles.compactValue}>
            {product.currentStock} {product.unit}
          </Text>
          <Text style={styles.sku}>{product.locationCode}</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  compact: {
    gap: 6,
    padding: 10,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sku: {
    color: colors.muted,
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    flex: 1,
    padding: 8,
  },
  statValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  progressTrack: {
    backgroundColor: colors.bg,
    borderRadius: radius.full,
    height: 5,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radius.full,
    height: 5,
  },
  compactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
