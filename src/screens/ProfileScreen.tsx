import { ArrowLeftRight, LogOut, Package, Shield, User } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/ui/Button';
import { Card, CardRow } from '../components/ui/Card';
import { colors, radius, spacing } from '../config/theme';
import { AppUser, Product, StockMovement } from '../types';

type ProfileScreenProps = {
  user: AppUser;
  products: Product[];
  movements: StockMovement[];
  onSignOut: () => void;
};

export function ProfileScreen({
  user,
  products,
  movements,
  onSignOut,
}: ProfileScreenProps) {
  const criticalCount = products.filter((p) => p.currentStock <= p.minStock).length;
  const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);

  const roleLabel = (role: AppUser['role']) => {
    if (role === 'admin') return 'Yönetici';
    if (role === 'driver') return 'Sürücü';
    return 'Depo Personeli';
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Hesabınızdan çıkmak istediğinizden emin misiniz?')) {
        onSignOut();
      }
    } else {
      Alert.alert(
        'Çıkış Yap',
        'Hesabınızdan çıkmak istediğinizden emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Çıkış Yap',
            style: 'destructive',
            onPress: onSignOut,
          },
        ],
      );
    }
  };

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Profil</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Shield color={colors.success} size={14} />
            <Text style={styles.roleText}>{roleLabel(user.role)}</Text>
          </View>
        </View>

        {/* Stats */}
        <Card>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Package color={colors.info} size={20} />
              <Text style={[styles.statValue, { color: colors.info }]}>
                {products.length}
              </Text>
              <Text style={styles.statLabel}>Toplam Ürün</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ArrowLeftRight color={colors.warning} size={20} />
              <Text style={[styles.statValue, { color: colors.warning }]}>
                {movements.length}
              </Text>
              <Text style={styles.statLabel}>İşlem</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Package color={colors.success} size={20} />
              <Text style={[styles.statValue, { color: colors.success }]}>
                {totalStock}
              </Text>
              <Text style={styles.statLabel}>Toplam Stok</Text>
            </View>
          </View>
        </Card>

        {/* Account info */}
        <Card>
          <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
          <CardRow label="Ad Soyad" value={user.name} />
          <CardRow label="E-posta" value={user.email} />
          <CardRow label="Rol" value={roleLabel(user.role)} />
          <CardRow label="Kritik Stok" value={criticalCount > 0 ? `${criticalCount} ürün` : 'Yok'} valueColor={criticalCount > 0 ? colors.danger : colors.success} />
        </Card>

        {/* App info */}
        <Card>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          <CardRow label="Versiyon" value="1.0.0" />
          <CardRow label="Platform" value="BarkodTakip" />
          <CardRow label="Veri Kaynağı" value="Firebase Firestore" valueColor={colors.info} />
        </Card>

        {/* Sign out */}
        <Button
          label="Çıkış Yap"
          onPress={handleSignOut}
          variant="danger"
          icon={<LogOut color="#fff" size={18} />}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, flex: 1 },
  scroll: { gap: spacing.md, padding: spacing.md, paddingBottom: 100 },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  avatarSection: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.successBg,
    borderColor: colors.success + '50',
    borderRadius: radius.full,
    borderWidth: 2,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarText: {
    color: colors.success,
    fontSize: 28,
    fontWeight: '800',
  },
  userName: { color: colors.text, fontSize: 20, fontWeight: '700' },
  userEmail: { color: colors.muted, fontSize: 14 },
  roleBadge: {
    alignItems: 'center',
    backgroundColor: colors.successBg,
    borderRadius: radius.full,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  roleText: { color: colors.success, fontSize: 13, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row',
    gap: 0,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    padding: spacing.sm,
  },
  statDivider: {
    backgroundColor: colors.border,
    width: 1,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 11 },
  sectionTitle: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
});
