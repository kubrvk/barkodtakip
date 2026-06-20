import { CameraView, useCameraPermissions } from 'expo-camera';
import { CheckCircle, ClipboardList, Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { colors, radius, spacing } from '../config/theme';
import { CountTask, Product } from '../types';

type CountScreenProps = {
  tasks: CountTask[];
  products: Product[];
  onCreateTask: (locationCode: string, total: number) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<Omit<CountTask, 'id'>>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onBarcodeScanned?: (barcode: string) => void;
};

type ActiveScanState = {
  taskId: string;
  locationCode: string;
} | null;

export function CountScreen({
  tasks,
  products,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: CountScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [activeScan, setActiveScan] = useState<ActiveScanState>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [creating, setCreating] = useState(false);

  const canUseCamera = true; // Camera is always attempted on native

  const handleStartScan = async (taskId: string, locationCode: string) => {
    try {
      if (Platform.OS !== 'web' && !permission?.granted) {
        const r = await requestPermission();
        if (!r.granted) {
          Alert.alert('Kamera izni gerekli', 'Sayım için kamera erişimi gereklidir.');
          return;
        }
      }
      setActiveScan({ taskId, locationCode });
    } catch (error) {
      console.warn("Kamera başlatılamadı:", error);
      // Kamera izni hatası alınsa bile açmayı deneyebiliriz, veya sadece uyarı verebiliriz.
      setActiveScan({ taskId, locationCode });
    }
  };

  const handleBarcode = async (data: string) => {
    if (!activeScan) return;
    const task = tasks.find((t) => t.id === activeScan.taskId);
    if (!task) return;

    const product = products.find(
      (p) => p.barcode === data || p.sku === data,
    );

    if (!product) {
      Alert.alert(
        'Ürün bulunamadı',
        `Barkod: ${data}\nBu barkoda ait ürün sistemde kayıtlı değil.`,
        [{ text: 'Tamam' }],
      );
      return;
    }

    const newProgress = Math.min(task.total, task.progress + 1);
    const isComplete = newProgress >= task.total;

    await onUpdateTask(activeScan.taskId, {
      progress: newProgress,
      status: isComplete ? 'completed' : 'in_progress',
    });

    if (isComplete) {
      setActiveScan(null);
      Alert.alert('✓ Sayım Tamamlandı', `${activeScan.locationCode} sayımı başarıyla tamamlandı!`);
    }
  };

  const handleCreateTask = async () => {
    if (!newLocation.trim()) {
      Alert.alert('Hata', 'Konum kodu zorunludur.');
      return;
    }
    const locationProducts = products.filter(
      (p) => p.locationCode === newLocation.trim(),
    );
    setCreating(true);
    try {
      await onCreateTask(newLocation.trim(), Math.max(1, locationProducts.length));
      setNewLocation('');
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  };

  const handleCancelTask = (taskId: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Sayım görevi iptal edilecek. Emin misiniz?')) {
        onUpdateTask(taskId, { status: 'cancelled' });
      }
    } else {
      Alert.alert('Emin misiniz?', 'Sayım görevi iptal edilecek.', [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'İptal Et', style: 'destructive', onPress: () => onUpdateTask(taskId, { status: 'cancelled' }) }
      ]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Bu sayım görevi listeden tamamen silinecek. Emin misiniz?')) {
        onDeleteTask(taskId);
      }
    } else {
      Alert.alert('Emin misiniz?', 'Sayım görevi tamamen silinecek.', [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Kaldır', style: 'destructive', onPress: () => onDeleteTask(taskId) }
      ]);
    }
  };

  const statusLabel = (s: CountTask['status']) => {
    if (s === 'in_progress') return 'Devam Ediyor';
    if (s === 'completed') return 'Tamamlandı';
    if (s === 'cancelled') return 'İptal Edildi';
    return 'Bekliyor';
  };

  const statusColor = (s: CountTask['status']) => {
    if (s === 'in_progress') return colors.warning;
    if (s === 'completed') return colors.success;
    if (s === 'cancelled') return colors.danger;
    return colors.muted;
  };

  if (activeScan) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'] }}
          onBarcodeScanned={({ data }) => handleBarcode(data)}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.scanInfo}>
          <Text style={styles.scanLocation}>{activeScan.locationCode} sayımı</Text>
          <Text style={styles.scanHint}>Ürün barkodunu tarayın</Text>
        </View>
        <Pressable onPress={() => setActiveScan(null)} style={styles.closeBtn}>
          <X color="#fff" size={20} />
          <Text style={styles.closeBtnText}>Kapat</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Sayım Görevleri</Text>
            <Text style={styles.subtitle}>{tasks.length} görev</Text>
          </View>
          <Pressable onPress={() => setShowCreate(!showCreate)} style={styles.addBtn}>
            <Plus color={colors.bg} size={20} />
          </Pressable>
        </View>

        {/* Create task panel */}
        {showCreate && (
          <View style={styles.createPanel}>
            <Text style={styles.panelTitle}>Yeni Sayım Görevi</Text>
            <TextInput
              placeholder="Konum kodu (örn: A1, B2)"
              placeholderTextColor={colors.muted}
              value={newLocation}
              onChangeText={setNewLocation}
              autoCapitalize="characters"
              style={styles.panelInput}
            />
            <View style={styles.panelRow}>
              <Button
                label="İptal"
                onPress={() => setShowCreate(false)}
                variant="ghost"
                size="sm"
              />
              <Button
                label={creating ? 'Oluşturuluyor...' : 'Oluştur'}
                onPress={handleCreateTask}
                disabled={creating}
                size="sm"
              />
            </View>
          </View>
        )}

        {tasks.length === 0 ? (
          <EmptyState
            icon={<ClipboardList color={colors.muted} size={36} />}
            title="Sayım görevi yok"
            subtitle="+ butonuna dokunarak yeni sayım görevi oluşturun."
          />
        ) : (
          tasks.map((task) => {
            const percent =
              task.total > 0 ? Math.round((task.progress / task.total) * 100) : 0;
            const color = statusColor(task.status);
            return (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View>
                    <Text style={styles.taskLocation}>{task.locationCode} rafı</Text>
                    <Text style={[styles.taskStatus, { color }]}>
                      {statusLabel(task.status)}
                    </Text>
                  </View>
                  {task.status === 'completed' ? (
                    <CheckCircle color={colors.success} size={26} />
                  ) : (
                    <Text style={styles.taskPercent}>{percent}%</Text>
                  )}
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percent}%`, backgroundColor: color },
                    ]}
                  />
                </View>

                <Text style={styles.taskCount}>
                  {task.progress} / {task.total} ürün sayıldı
                </Text>

                {task.status !== 'completed' && task.status !== 'cancelled' && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Button
                        label="İptal Et"
                        onPress={() => handleCancelTask(task.id)}
                        variant="ghost"
                        size="sm"
                        fullWidth
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        label={task.status === 'pending' ? 'Sayımı Başlat' : 'Devam Et'}
                        onPress={() => handleStartScan(task.id, task.locationCode)}
                        variant={task.status === 'pending' ? 'primary' : 'secondary'}
                        size="sm"
                        fullWidth
                      />
                    </View>
                  </View>
                )}

                {(task.status === 'completed' || task.status === 'cancelled') && (
                  <Button
                    label="Listeden Kaldır"
                    onPress={() => handleDeleteTask(task.id)}
                    variant="ghost"
                    size="sm"
                    fullWidth
                  />
                )}
              </View>
            );
          })
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
  },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 2 },
  addBtn: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: radius.full,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  createPanel: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  panelTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  panelInput: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    height: 46,
    paddingHorizontal: 12,
  },
  panelRow: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  taskCard: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  taskHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskLocation: { color: colors.text, fontSize: 17, fontWeight: '700' },
  taskStatus: { fontSize: 13, marginTop: 2 },
  taskPercent: { color: colors.text, fontSize: 22, fontWeight: '800' },
  progressTrack: {
    backgroundColor: colors.bg,
    borderRadius: radius.full,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radius.full,
    height: 8,
  },
  taskCount: { color: colors.muted, fontSize: 13 },
  scanInfo: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.md,
    left: 20,
    padding: 16,
    position: 'absolute',
    right: 20,
    top: 60,
  },
  scanLocation: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scanHint: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  closeBtn: {
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
  closeBtnText: { color: '#fff', fontWeight: '600' },
});
