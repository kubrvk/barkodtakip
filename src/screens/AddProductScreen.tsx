import { CameraView, useCameraPermissions } from 'expo-camera';
import { Barcode, ChevronDown, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { colors, radius, spacing } from '../config/theme';
import { Product, UNITS } from '../types';

type AddProductScreenProps = {
  product?: Product | null; // null = add mode, Product = edit mode
  onSave: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
};

export function AddProductScreen({
  product,
  onSave,
  onDelete,
  onClose,
}: AddProductScreenProps) {
  const isEdit = Boolean(product);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);

  const [name, setName] = useState(product?.name ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [barcode, setBarcode] = useState(product?.barcode ?? '');
  const [currentStock, setCurrentStock] = useState(String(product?.currentStock ?? '0'));
  const [minStock, setMinStock] = useState(String(product?.minStock ?? '5'));
  const [unit, setUnit] = useState(product?.unit ?? 'adet');
  const [locationCode, setLocationCode] = useState(product?.locationCode ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [showUnits, setShowUnits] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Ürün adı zorunludur.';
    if (!sku.trim()) e.sku = 'SKU kodu zorunludur.';
    if (!barcode.trim()) e.barcode = 'Barkod zorunludur.';
    if (isNaN(Number(currentStock))) e.currentStock = 'Geçerli bir sayı girin.';
    if (isNaN(Number(minStock))) e.minStock = 'Geçerli bir sayı girin.';
    if (!locationCode.trim()) e.locationCode = 'Konum zorunludur.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        sku: sku.trim(),
        barcode: barcode.trim(),
        currentStock: parseInt(currentStock, 10),
        minStock: parseInt(minStock, 10),
        unit,
        locationCode: locationCode.trim(),
        description: description.trim(),
      });
      onClose();
    } catch {
      Alert.alert('Hata', 'Kayıt sırasında hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`"${product?.name}" silinecek. Bu işlem geri alınamaz. Emin misiniz?`)) {
        setDeleting(true);
        if (onDelete) {
          onDelete()
            .then(() => onClose())
            .catch(() => Alert.alert('Hata', 'Silme işlemi başarısız.'))
            .finally(() => setDeleting(false));
        }
      }
    } else {
      Alert.alert(
        'Ürünü Sil',
        `"${product?.name}" silinecek. Bu işlem geri alınamaz.`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: async () => {
              setDeleting(true);
              try {
                await onDelete?.();
                onClose();
              } catch {
                Alert.alert('Hata', 'Silme işlemi başarısız.');
              } finally {
                setDeleting(false);
              }
            },
          },
        ],
      );
    }
  };

  const canUseCamera = Platform.OS !== 'web';

  if (scanning && canUseCamera) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'] }}
          onBarcodeScanned={({ data }) => {
            setBarcode(data);
            setScanning(false);
          }}
          style={StyleSheet.absoluteFill}
        />
        <Pressable onPress={() => setScanning(false)} style={styles.closeScan}>
          <X color="#fff" size={22} />
          <Text style={{ color: '#fff', fontWeight: '600' }}>Kapat</Text>
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
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={onClose} style={styles.closeIcon}>
            <X color={colors.text} size={22} />
          </Pressable>
          <Text style={styles.topTitle}>
            {isEdit ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
          </Text>
          {isEdit ? (
            <Pressable onPress={handleDelete} style={styles.deleteIcon}>
              <Trash2 color={colors.danger} size={22} />
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Ürün Adı *"
            placeholder="Ürün adını girin"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="SKU Kodu *"
                placeholder="SKU-001"
                value={sku}
                onChangeText={setSku}
                autoCapitalize="characters"
                error={errors.sku}
              />
            </View>
          </View>

          <Input
            label="Barkod *"
            placeholder="8690000000000"
            value={barcode}
            onChangeText={setBarcode}
            keyboardType="numeric"
            error={errors.barcode}
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
                  style={{ paddingHorizontal: 12 }}
                >
                  <Barcode color={colors.success} size={22} />
                </Pressable>
              ) : undefined
            }
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Mevcut Stok *"
                placeholder="0"
                value={currentStock}
                onChangeText={setCurrentStock}
                keyboardType="numeric"
                error={errors.currentStock}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Min. Stok *"
                placeholder="5"
                value={minStock}
                onChangeText={setMinStock}
                keyboardType="numeric"
                error={errors.minStock}
              />
            </View>
          </View>

          {/* Unit selector */}
          <View style={styles.unitSection}>
            <Text style={styles.fieldLabel}>Birim</Text>
            <Pressable
              onPress={() => setShowUnits(!showUnits)}
              style={styles.unitPicker}
            >
              <Text style={styles.unitValue}>{unit}</Text>
              <ChevronDown color={colors.muted} size={18} />
            </Pressable>
            {showUnits && (
              <View style={styles.unitDropdown}>
                {UNITS.map((u) => (
                  <Pressable
                    key={u}
                    onPress={() => { setUnit(u); setShowUnits(false); }}
                    style={[styles.unitOption, unit === u && styles.unitOptionActive]}
                  >
                    <Text style={[styles.unitOptionText, unit === u && styles.unitOptionTextActive]}>
                      {u}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <Input
            label="Konum Kodu *"
            placeholder="Raf (A1, B2) veya Araç (34 ABC 123, Araç 1)"
            value={locationCode}
            onChangeText={setLocationCode}
            autoCapitalize="characters"
            error={errors.locationCode}
          />

          <Input
            label="Açıklama (isteğe bağlı)"
            placeholder="Ürün hakkında not..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Button
            label={saving ? 'Kaydediliyor...' : isEdit ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}
            onPress={handleSave}
            disabled={saving || deleting}
            fullWidth
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, flex: 1 },
  topBar: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  closeIcon: { padding: 4 },
  deleteIcon: { padding: 4 },
  topTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  scroll: { gap: spacing.md, padding: spacing.md, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: spacing.sm },
  fieldLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  unitSection: { gap: 0 },
  unitPicker: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    height: 50,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  unitValue: { color: colors.text, fontSize: 15 },
  unitDropdown: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
  },
  unitOption: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    padding: spacing.md,
  },
  unitOptionActive: { backgroundColor: colors.successBg },
  unitOptionText: { color: colors.text, fontSize: 15 },
  unitOptionTextActive: { color: colors.success, fontWeight: '700' },
  closeScan: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: radius.full,
    bottom: 50,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    position: 'absolute',
  },
});
