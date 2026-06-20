import { Package, Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { colors, radius, spacing } from '../config/theme';
import { Product } from '../types';

type ProductsScreenProps = {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
};

type FilterType = 'all' | 'critical' | 'ok';

export function ProductsScreen({
  products,
  onAddProduct,
  onEditProduct,
}: ProductsScreenProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.locationCode.toLowerCase().includes(q),
      );
    }
    if (filter === 'critical') {
      list = list.filter((p) => p.currentStock <= p.minStock);
    } else if (filter === 'ok') {
      list = list.filter((p) => p.currentStock > p.minStock);
    }
    return list;
  }, [products, search, filter]);

  const criticalCount = products.filter((p) => p.currentStock <= p.minStock).length;

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: `Tümü (${products.length})` },
    { key: 'critical', label: `Kritik (${criticalCount})` },
    { key: 'ok', label: 'Normal' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ürünler</Text>
          <Text style={styles.subtitle}>{products.length} kayıtlı ürün</Text>
        </View>
        <Pressable onPress={onAddProduct} style={styles.addBtn}>
          <Plus color={colors.bg} size={22} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Search color={colors.muted} size={18} style={styles.searchIcon} />
        <TextInput
          placeholder="Ürün, barkod veya konum ara..."
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {filterOptions.map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => setFilter(opt.key)}
            style={[styles.filterChip, filter === opt.key && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === opt.key && styles.filterChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => onEditProduct(item)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={<Package color={colors.muted} size={36} />}
            title={search ? 'Sonuç bulunamadı' : 'Henüz ürün yok'}
            subtitle={search ? 'Farklı bir arama terimi deneyin.' : 'Sağ üstteki + butonuna dokunarak ürün ekleyin.'}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingBottom: 8,
  },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 2 },
  addBtn: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: radius.full,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginVertical: 8,
    paddingHorizontal: spacing.md,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    height: 48,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingBottom: 8,
  },
  filterChip: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  filterChipText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: colors.bg },
  list: {
    gap: 0,
    padding: spacing.md,
    paddingBottom: 100,
  },
});
