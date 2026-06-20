import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Box,
  CheckCircle,
  ClipboardList,
  MapPin,
  Package,
  PackageCheck,
  TrendingUp,
  Truck,
  Warehouse,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MovementRow } from '../components/MovementRow';
import { EmptyState } from '../components/ui/EmptyState';
import { SectionTitle } from '../components/ui/Card';
import { colors, radius, spacing } from '../config/theme';
import { AppUser, CountTask, Location, Product, StockMovement } from '../types';

type DashboardScreenProps = {
  user: AppUser;
  products: Product[];
  movements: StockMovement[];
  tasks: CountTask[];
  locations: Location[];
  onNavigateToProducts: () => void;
};

type MetricCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  width?: 'full' | 'half' | 'third';
};

function MetricCard({ label, value, sublabel, color, bgColor, icon, width = 'half' }: MetricCardProps) {
  const widthStyles = {
    full: '100%',
    half: '48%',
    third: '31%',
  };

  return (
    <View style={[styles.metricCard, { borderColor: color + '30', width: widthStyles[width] as any }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={[styles.metricValue, { color }]}>{value}</Text>
          <Text style={styles.metricLabel}>{label}</Text>
        </View>
        <View style={[styles.metricIcon, { backgroundColor: bgColor }]}>{icon}</View>
      </View>
      {sublabel ? <Text style={styles.metricSub}>{sublabel}</Text> : null}
    </View>
  );
}

export function DashboardScreen({
  user,
  products,
  movements,
  tasks,
  locations,
  onNavigateToProducts,
  onSeedData,
}: DashboardScreenProps) {
  // Calculations
  const criticalProducts = products.filter((p) => p.currentStock <= p.minStock);
  const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);
  const shelfCount = locations.filter(l => l.type === 'shelf').length;
  const vehicleCount = locations.filter(l => l.type === 'vehicle').length;

  const todayMovements = movements.filter((m) => {
    try {
      const d = new Date(m.timestamp);
      const now = new Date();
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    } catch {
      return false;
    }
  });

  const todayIn = todayMovements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0);
  const todayOut = todayMovements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0);

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  const topProducts = [...products].sort((a, b) => b.currentStock - a.currentStock).slice(0, 5);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <View style={styles.avatarBox}>
            <PackageCheck color={colors.success} size={22} />
          </View>
        </View>

        {/* Critical products alert */}
        {criticalProducts.length > 0 && (
          <Pressable onPress={onNavigateToProducts} style={styles.alertBanner}>
            <AlertTriangle color={colors.warning} size={20} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Kritik Stok Uyarısı</Text>
              <Text style={styles.alertBody}>
                {criticalProducts.length} adet ürün kritik stok seviyesinde.
              </Text>
            </View>
            <ArrowRight color={colors.warning} size={16} />
          </Pressable>
        )}

        {/* Section: Genel Durum */}
        <SectionTitle title="Genel Durum" />
        <View style={styles.metricsGrid}>
          <MetricCard
            label="Kayıtlı Ürün"
            value={products.length}
            color={colors.info}
            bgColor={colors.infoBg}
            icon={<Package color={colors.info} size={18} />}
          />
          <MetricCard
            label="Toplam Stok"
            value={totalStock}
            color={colors.success}
            bgColor={colors.successBg}
            icon={<Box color={colors.success} size={18} />}
          />
          <MetricCard
            label="Raf Sayısı"
            value={shelfCount}
            color={colors.text}
            bgColor={colors.border}
            icon={<Warehouse color={colors.textSoft} size={18} />}
          />
          <MetricCard
            label="Araç Sayısı"
            value={vehicleCount}
            color={colors.warning}
            bgColor={colors.warningBg}
            icon={<Truck color={colors.warning} size={18} />}
          />
        </View>

        {/* Section: Bugünkü Hareketler */}
        <SectionTitle title="Bugünkü Hareketler" />
        <View style={styles.metricsGrid}>
          <MetricCard
            width="third"
            label="İşlem"
            value={todayMovements.length}
            color={colors.text}
            bgColor={colors.border}
            icon={<TrendingUp color={colors.textSoft} size={16} />}
          />
          <MetricCard
            width="third"
            label="Giren"
            value={todayIn}
            color={colors.success}
            bgColor={colors.successBg}
            icon={<ArrowDownToLine color={colors.success} size={16} />}
          />
          <MetricCard
            width="third"
            label="Çıkan"
            value={todayOut}
            color={colors.danger}
            bgColor={colors.dangerBg}
            icon={<ArrowUpFromLine color={colors.danger} size={16} />}
          />
        </View>

        {/* Section: Sayım Durumu */}
        <SectionTitle title="Sayım Durumu" />
        <View style={styles.metricsGrid}>
          <MetricCard
            label="Bekleyen Görevler"
            value={pendingTasks}
            sublabel="Aksiyon bekliyor"
            color={colors.warning}
            bgColor={colors.warningBg}
            icon={<ClipboardList color={colors.warning} size={18} />}
          />
          <MetricCard
            label="Tamamlananlar"
            value={completedTasks}
            sublabel="Tüm zamanlar"
            color={colors.info}
            bgColor={colors.infoBg}
            icon={<CheckCircle color={colors.info} size={18} />}
          />
        </View>

        {/* Section: En Yüksek Stoklu Ürünler */}
        <SectionTitle title="En Yüksek Stoklu Ürünler" />
        <View style={styles.card}>
          {topProducts.length === 0 ? (
            <Text style={styles.emptyText}>Henüz ürün yok.</Text>
          ) : (
            topProducts.map((p, index) => (
              <View key={p.id} style={[styles.topProductRow, index !== topProducts.length - 1 && styles.borderBottom]}>
                <View style={styles.topProductInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                  <View style={styles.productLocationBox}>
                    <MapPin color={colors.muted} size={12} />
                    <Text style={styles.productLocationText}>{p.locationCode}</Text>
                  </View>
                </View>
                <View style={styles.stockBadge}>
                  <Text style={styles.stockText}>{p.currentStock} {p.unit}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Section: Son İşlemler */}
        <SectionTitle title="Son İşlemler" subtitle={`${movements.length} kayıt`} />
        {movements.length === 0 ? (
          <EmptyState
            title="Henüz işlem yok"
            subtitle="Barkod okutarak stok hareketi başlatın."
          />
        ) : (
          <View style={styles.movementList}>
            {movements.slice(0, 10).map((m) => (
              <MovementRow key={m.id} movement={m} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, flex: 1 },
  scroll: { gap: spacing.md, padding: spacing.md, paddingBottom: 100 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  greeting: { color: colors.muted, fontSize: 14 },
  userName: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  avatarBox: {
    alignItems: 'center',
    backgroundColor: colors.successBg,
    borderColor: colors.success + '40',
    borderRadius: radius.full,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
    minHeight: 90,
    padding: spacing.md,
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  metricLabel: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  metricSub: {
    color: colors.mutedDark,
    fontSize: 11,
    marginTop: 4,
  },
  alertBanner: {
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderColor: colors.warning + '50',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  alertContent: { flex: 1, gap: 2 },
  alertTitle: { color: colors.warning, fontSize: 14, fontWeight: '800' },
  alertBody: { color: colors.textSoft, fontSize: 13 },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  emptyText: { color: colors.muted, fontStyle: 'italic', fontSize: 13 },
  topProductRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  borderBottom: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  topProductInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  productLocationBox: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  productLocationText: {
    color: colors.muted,
    fontSize: 12,
  },
  stockBadge: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stockText: {
    color: colors.info,
    fontSize: 13,
    fontWeight: '700',
  },
  movementList: { gap: 8 },
});
