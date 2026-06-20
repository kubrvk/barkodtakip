import { MapPin, Package, Warehouse } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { colors, radius, spacing } from '../config/theme';
import { Location, Product } from '../types';

type LocationsScreenProps = {
  products: Product[];
  locations: Location[];
  onStartCount?: (locationCode: string) => void;
};

function LocationCard({
  location,
  products,
  onStartCount,
}: {
  location: Location;
  products: Product[];
  onStartCount?: () => void;
}) {
  const total = products.reduce((sum, p) => sum + p.currentStock, 0);
  const critical = products.filter((p) => p.currentStock <= p.minStock).length;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.locationBadge}>
          {location.type === 'vehicle' ? (
            <MapPin color={colors.info} size={16} />
          ) : (
            <Warehouse color={colors.success} size={16} />
          )}
          <Text style={styles.locationCode}>{location.code}</Text>
        </View>
        <Text style={[styles.totalStock, total > 0 ? { color: colors.success } : { color: colors.muted }]}>
          {total}
        </Text>
      </View>
      <Text style={styles.description}>{location.description}</Text>

      {critical > 0 && (
        <View style={styles.criticalWarn}>
          <Text style={styles.criticalText}>
            ⚠ {critical} ürün kritik stok seviyesinde
          </Text>
        </View>
      )}

      {products.length > 0 ? (
        <View style={styles.productList}>
          {products.map((p) => (
            <View key={p.id} style={styles.productItem}>
              <Text style={styles.productName} numberOfLines={1}>
                {p.name}
              </Text>
              <Text
                style={[
                  styles.productStock,
                  p.currentStock <= p.minStock ? { color: colors.danger } : { color: colors.success },
                ]}
              >
                {p.currentStock} {p.unit}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Bu konumda ürün yok.</Text>
      )}

      {onStartCount && (
        <Button
          label="Sayım Başlat"
          onPress={onStartCount}
          variant="secondary"
          size="sm"
          fullWidth
        />
      )}
    </View>
  );
}

export function LocationsScreen({
  products,
  locations,
  onStartCount,
}: LocationsScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Raf Takibi</Text>
          <Text style={styles.subtitle}>{locations.length} konum</Text>
        </View>

        {locations.length === 0 ? (
          <EmptyState
            icon={<Warehouse color={colors.muted} size={36} />}
            title="Raf kaydı yok"
            subtitle="Ürünlere konum atadıkça burada görünür."
          />
        ) : (
          locations.map((loc) => (
            <LocationCard
              key={loc.id}
              location={loc}
              products={products.filter((p) => p.locationCode === loc.code)}
              onStartCount={onStartCount ? () => onStartCount(loc.code) : undefined}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export function VehiclesScreen({
  products,
  locations,
}: {
  products: Product[];
  locations: Location[];
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Araç Takibi</Text>
          <Text style={styles.subtitle}>{locations.length} araç</Text>
        </View>

        {locations.length === 0 ? (
          <EmptyState
            icon={<Package color={colors.muted} size={36} />}
            title="Araç kaydı yok"
            subtitle="Ürünlere araç kodu atadıkça burada görünür."
          />
        ) : (
          locations.map((loc) => (
            <LocationCard
              key={loc.id}
              location={loc}
              products={products.filter((p) => p.locationCode === loc.code)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, flex: 1 },
  scroll: { gap: spacing.md, padding: spacing.md, paddingBottom: 100 },
  header: { gap: 2 },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.muted, fontSize: 13 },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  locationCode: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  totalStock: {
    fontSize: 26,
    fontWeight: '800',
  },
  description: { color: colors.muted, fontSize: 13 },
  criticalWarn: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.sm,
    padding: 8,
  },
  criticalText: { color: colors.danger, fontSize: 12, fontWeight: '600' },
  productList: { gap: 6 },
  productItem: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  productName: { color: colors.text, flex: 1, fontSize: 14 },
  productStock: { fontSize: 14, fontWeight: '700' },
  emptyText: { color: colors.mutedDark, fontSize: 13, fontStyle: 'italic' },
});
