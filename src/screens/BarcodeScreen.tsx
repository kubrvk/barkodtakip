import { CameraView, useCameraPermissions } from 'expo-camera';
import { Barcode, Minus, Plus, ScanLine, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { colors, radius, spacing } from '../config/theme';
import { AppUser, Location, MovementType, Product, StockMovement } from '../types';

type BarcodeScreenProps = {
  user: AppUser;
  products: Product[];
  locations: Location[];
  onMovement: (movement: Omit<StockMovement, 'id' | 'timestamp'>) => Promise<void>;
  onStockChange: (productId: string, quantityChange: number, locationCode?: string) => Promise<void>;
};

export function BarcodeScreen({
  user,
  products,
  locations,
  onMovement,
  onStockChange,
}: BarcodeScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [selectedLocation, setSelectedLocation] = useState(
    locations[0]?.code ?? '',
  );
  const [loading, setLoading] = useState(false);

  // expo-camera web tarayıcılarda da çalışır
  const canUseCamera = true;

  const product = useMemo(() => {
    if (!barcode.trim()) return null;
    return (
      products.find(
        (p) =>
          p.barcode === barcode.trim() ||
          p.sku.toLowerCase() === barcode.trim().toLowerCase(),
      ) ?? null
    );
  }, [barcode, products]);

  const qty = Math.max(1, parseInt(quantity, 10) || 1);

  const runAction = async (type: MovementType, sign: number) => {
    if (!product) {
      Alert.alert('Ürün bulunamadı', 'Önce barkod veya SKU ile bir ürün seçin.');
      return;
    }
    const toLocation =
      type === 'in' || type === 'out' ? product.locationCode : selectedLocation;

    setLoading(true);
    try {
      await onStockChange(product.id, sign * qty, toLocation);
      await onMovement({
        productId: product.id,
        productName: product.name,
        fromLocation: sign < 0 ? product.locationCode : 'Depo Girişi',
        toLocation,
        quantity: qty,
        type,
        userName: user.name,
        note,
      });
      setNote('');
      Alert.alert(
        '✓ İşlem kaydedildi',
        `${product.name} için ${type === 'in' ? 'giriş' : type === 'out' ? 'çıkış' : 'transfer'} işlemi tamamlandı.`,
      );
    } catch (e) {
      Alert.alert('Hata', 'İşlem kaydedilemedi. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Camera view (web + native)
  if (scanning) {
    return (
      <View style={styles.cameraScreen}>
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'] }}
          onBarcodeScanned={({ data }) => {
            setBarcode(data);
            setScanning(false);
          }}
          style={StyleSheet.absoluteFill}
          facing="back"
        />
        <View style={styles.scanOverlay}>
          <View style={styles.scanCorners}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <ScanLine color={colors.success} size={80} />
          <Text style={styles.scanHint}>Barkodu çerçeveye hizalayın</Text>
          {Platform.OS === 'web' && (
            <Text style={styles.scanHintSub}>
              Tarayıcı kamera izni isteyecektir
            </Text>
          )}
        </View>
        <Pressable onPress={() => setScanning(false)} style={styles.closeBtn}>
          <X color="#fff" size={22} />
          <Text style={styles.closeBtnText}>Kapat</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Barkod İşlemi</Text>

          {/* Search panel */}
          <View style={styles.searchPanel}>
            <Input
              label="Barkod veya SKU"
              placeholder="Okut veya yazın..."
              value={barcode}
              onChangeText={setBarcode}
              autoCapitalize="characters"
              rightIcon={
                canUseCamera ? (
                  <Pressable
                    onPress={async () => {
                      if (!permission?.granted) {
                        const r = await requestPermission();
                        if (!r.granted) return;
                      }
                      setScanning(true);
                    }}
                    style={styles.cameraBtn}
                  >
                    <Barcode color={colors.success} size={22} />
                  </Pressable>
                ) : undefined
              }
            />
          </View>

          {/* Product card */}
          {product ? (
            <ProductCard product={product} />
          ) : barcode.trim() ? (
            <EmptyState
              title="Ürün bulunamadı"
              subtitle="Bu barkod/SKU ile eşleşen ürün yok. Yeni ürün ekleyebilirsiniz."
            />
          ) : (
            <EmptyState
              icon={<Barcode color={colors.muted} size={36} />}
              title="Barkod bekleniyor"
              subtitle="Kamera ile okutun veya barkod/SKU yazın."
            />
          )}

          {product && (
            <>
              {/* Quantity selector */}
              <View style={styles.qtySection}>
                <Text style={styles.sectionLabel}>Miktar</Text>
                <View style={styles.qtyRow}>
                  <Pressable
                    onPress={() => setQuantity(String(Math.max(1, qty - 1)))}
                    style={styles.qtyBtn}
                  >
                    <Minus color={colors.text} size={18} />
                  </Pressable>
                  <TextInput
                    keyboardType="numeric"
                    onChangeText={setQuantity}
                    style={styles.qtyInput}
                    value={quantity}
                  />
                  <Pressable
                    onPress={() => setQuantity(String(qty + 1))}
                    style={styles.qtyBtn}
                  >
                    <Plus color={colors.text} size={18} />
                  </Pressable>
                </View>
              </View>

              {/* Location picker */}
              <View style={styles.locationSection}>
                <Text style={styles.sectionLabel}>Hedef Konum</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chips}>
                    {locations.map((loc) => (
                      <Pressable
                        key={loc.id}
                        onPress={() => setSelectedLocation(loc.code)}
                        style={[
                          styles.chip,
                          selectedLocation === loc.code && styles.chipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedLocation === loc.code && styles.chipTextActive,
                          ]}
                        >
                          {loc.code}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Note */}
              <Input
                label="İşlem Notu (isteğe bağlı)"
                placeholder="Not ekleyin..."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={2}
              />

              {/* Actions */}
              <View style={styles.actionGrid}>
                <Button
                  label={`Stok Ekle +${qty}`}
                  onPress={() => runAction('in', 1)}
                  disabled={loading}
                  fullWidth
                />
                <Button
                  label={`Stok Çıkar -${qty}`}
                  onPress={() => runAction('out', -1)}
                  variant="danger"
                  disabled={loading || product.currentStock < qty}
                  fullWidth
                />
                <Button
                  label="Rafa Taşı"
                  onPress={() => runAction('transfer', 0)}
                  variant="secondary"
                  disabled={loading}
                  fullWidth
                />
                <Button
                  label="Araca Yükle"
                  onPress={() => runAction('transfer', 0)}
                  variant="secondary"
                  disabled={loading}
                  fullWidth
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, flex: 1 },
  scroll: { gap: spacing.md, padding: spacing.md, paddingBottom: 100 },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  searchPanel: { gap: spacing.sm },
  sectionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  qtySection: { gap: 8 },
  qtyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  qtyBtn: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  qtyInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    height: 48,
    textAlign: 'center',
  },
  locationSection: { gap: 8 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.bg },
  actionGrid: { gap: 10 },
  cameraScreen: { backgroundColor: '#000', flex: 1 },
  scanOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  scanCorners: {
    height: 220,
    position: 'absolute',
    width: 220,
  },
  corner: {
    borderColor: colors.success,
    height: 30,
    position: 'absolute',
    width: 30,
  },
  cornerTL: { borderLeftWidth: 3, borderTopWidth: 3, left: 0, top: 0 },
  cornerTR: { borderRightWidth: 3, borderTopWidth: 3, right: 0, top: 0 },
  cornerBL: { borderBottomWidth: 3, borderLeftWidth: 3, bottom: 0, left: 0 },
  cornerBR: { borderBottomWidth: 3, borderRightWidth: 3, bottom: 0, right: 0 },
  scanHint: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scanHintSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },

  closeBtn: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    bottom: 50,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    position: 'absolute',
  },
  closeBtnText: { color: '#fff', fontWeight: '600' },
  cameraBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
