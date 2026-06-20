import { ArrowDownCircle, ArrowLeftRight, ArrowUpCircle, ClipboardList, LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../config/theme';
import { MovementType, StockMovement } from '../types';

type MovementRowProps = {
  movement: StockMovement;
};

const typeIconMap: Record<MovementType, LucideIcon> = {
  in: ArrowUpCircle,
  out: ArrowDownCircle,
  transfer: ArrowLeftRight,
  count: ClipboardList,
};


const typeColorMap: Record<MovementType, string> = {
  in: colors.success,
  out: colors.danger,
  transfer: colors.info,
  count: colors.warning,
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Az önce';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} dk önce`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} sa önce`;
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

export function MovementRow({ movement }: MovementRowProps) {
  const Icon = typeIconMap[movement.type] ?? ArrowLeftRight;
  const typeColor = typeColorMap[movement.type] ?? colors.muted;

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: `${typeColor}18` }]}>
        <Icon color={typeColor} size={18} />
      </View>
      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={1}>
          {movement.productName}
        </Text>
        <Text style={styles.route} numberOfLines={1}>
          {movement.fromLocation} → {movement.toLocation}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.quantity, { color: typeColor }]}>
          {movement.type === 'out' ? '-' : '+'}{movement.quantity}
        </Text>
        <Text style={styles.time}>{formatDate(movement.timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 64,
    padding: spacing.sm + 4,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  productName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  route: {
    color: colors.muted,
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '800',
  },
  time: {
    color: colors.mutedDark,
    fontSize: 11,
  },
});
