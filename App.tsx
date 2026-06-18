import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  Barcode,
  ClipboardCheck,
  Home,
  PackageCheck,
  ScanLine,
  Truck,
  Warehouse,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
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

type Role = 'warehouse' | 'driver';
type LocationType = 'shelf' | 'vehicle';
type MovementType = 'in' | 'out' | 'transfer' | 'count';

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  currentStock: number;
  minStock: number;
  unit: string;
  locationCode: string;
};

type Location = {
  id: string;
  type: LocationType;
  code: string;
  description: string;
};

type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  type: MovementType;
  userName: string;
  note: string;
  timestamp: string;
};

type CountTask = {
  id: string;
  status: 'pending' | 'in_progress' | 'completed';
  locationCode: string;
  progress: number;
  total: number;
};

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyD7c0DE6ACWXoKGajkPPAXFKQChNClPwS0',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'barkodtakips.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'barkodtakips',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'barkodtakips.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '1001340472862',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:1001340472862:web:0c58316b7c0b7604cb680f',
};

const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
const firebaseApp = hasFirebaseConfig && getApps().length === 0 ? initializeApp(firebaseConfig) : null;
const auth = firebaseApp ? getAuth(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;
void db;

const demoUser: User = {
  id: 'demo-user',
  name: 'Mert Depo',
  email: 'demo@barkodtakip.local',
  role: 'warehouse',
};

const initialProducts: Product[] = [
  {
    id: 'p1',
    name: 'Bluetooth Kulaklik',
    sku: 'SKU-BT-100',
    barcode: '869000000001',
    currentStock: 42,
    minStock: 12,
    unit: 'adet',
    locationCode: 'A1',
  },
  {
    id: 'p2',
    name: 'Telefon Kilifi',
    sku: 'SKU-KLF-210',
    barcode: '869000000002',
    currentStock: 18,
    minStock: 20,
    unit: 'adet',
    locationCode: 'B2',
  },
  {
    id: 'p3',
    name: 'Termal Etiket',
    sku: 'SKU-ETK-330',
    barcode: '869000000003',
    currentStock: 120,
    minStock: 30,
    unit: 'rulo',
    locationCode: '34 ABC 123',
  },
];

const locations: Location[] = [
  { id: 'l1', type: 'shelf', code: 'A1', description: 'Elektronik raf bolgesi' },
  { id: 'l2', type: 'shelf', code: 'A2', description: 'Aksesuar raf bolgesi' },
  { id: 'l3', type: 'shelf', code: 'B2', description: 'Paketleme yani' },
  { id: 'v1', type: 'vehicle', code: '34 ABC 123', description: 'Istanbul ici dagitim' },
  { id: 'v2', type: 'vehicle', code: '06 BTK 456', description: 'Ankara sevkiyat araci' },
];

const countTasks: CountTask[] = [
  { id: 'c1', status: 'pending', locationCode: 'A1', progress: 0, total: 8 },
  { id: 'c2', status: 'in_progress', locationCode: 'B2', progress: 3, total: 10 },
];

const initialMovements: StockMovement[] = [
  {
    id: 'm1',
    productId: 'p1',
    productName: 'Bluetooth Kulaklik',
    fromLocation: 'Tedarik',
    toLocation: 'A1',
    quantity: 12,
    type: 'in',
    userName: demoUser.name,
    note: 'Sabah mal kabul',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'm2',
    productId: 'p3',
    productName: 'Termal Etiket',
    fromLocation: 'A2',
    toLocation: '34 ABC 123',
    quantity: 20,
    type: 'transfer',
    userName: demoUser.name,
    note: 'Araca yuklendi',
    timestamp: new Date().toISOString(),
  },
];

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements);

  const addMovement = async (movement: Omit<StockMovement, 'id' | 'timestamp' | 'userName'>) => {
    const nextMovement: StockMovement = {
      ...movement,
      id: `m-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName: user?.name ?? demoUser.name,
    };
    setMovements((current) => [nextMovement, ...current].slice(0, 20));
    await AsyncStorage.setItem('offline_stock_queue', JSON.stringify([nextMovement]));
  };

  const updateProductStock = (productId: string, quantityChange: number, locationCode?: string) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              currentStock: Math.max(0, product.currentStock + quantityChange),
              locationCode: locationCode ?? product.locationCode,
            }
          : product,
      ),
    );
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.success,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: styles.tabBar,
          tabBarIcon: ({ color, size }) => {
            const Icon = iconForRoute(route.name);
            return <Icon color={color} size={size} />;
          },
        })}
      >
        <Tab.Screen name="Ana Sayfa">
          {() => <DashboardScreen user={user} products={products} movements={movements} />}
        </Tab.Screen>
        <Tab.Screen name="Barkod">
          {() => (
            <BarcodeScreen
              products={products}
              locations={locations}
              onMovement={addMovement}
              onStockChange={updateProductStock}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Raflar">
          {() => <LocationsScreen products={products} locations={locations.filter((item) => item.type === 'shelf')} />}
        </Tab.Screen>
        <Tab.Screen name="Araçlar">
          {() => <VehiclesScreen products={products} locations={locations.filter((item) => item.type === 'vehicle')} />}
        </Tab.Screen>
        <Tab.Screen name="Sayım">
          {() => <CountScreen tasks={countTasks} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState(demoUser.email);
  const [password, setPassword] = useState('123456');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      if (auth && email !== demoUser.email) {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        onLogin({
          id: credential.user.uid,
          name: credential.user.displayName ?? 'Depo Personeli',
          email: credential.user.email ?? email,
          role: 'warehouse',
        });
      } else {
        await AsyncStorage.setItem('remember_login', JSON.stringify(remember));
        onLogin(demoUser);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Giris yapilamadi.';
      Alert.alert('Giris hatasi', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.loginWrap}>
        <View style={styles.brandMark}>
          <PackageCheck color={colors.success} size={44} />
        </View>
        <Text style={styles.logo}>BarkodTakip</Text>
        <Text style={styles.subtitle}>Depo ve sevkiyat personeli icin mobil stok takibi</Text>

        <View style={styles.form}>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={email}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Sifre"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
            value={password}
          />
          <Pressable accessibilityRole="checkbox" onPress={() => setRemember((value) => !value)} style={styles.rememberRow}>
            <View style={[styles.checkbox, remember && styles.checkboxOn]}>
              {remember ? <ClipboardCheck color={colors.bg} size={16} /> : null}
            </View>
            <Text style={styles.bodyText}>Beni hatirla</Text>
          </Pressable>
          <PrimaryButton label={loading ? 'Giris yapiliyor' : 'Giris Yap'} onPress={login} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DashboardScreen({
  user,
  products,
  movements,
}: {
  user: User;
  products: Product[];
  movements: StockMovement[];
}) {
  const criticalCount = products.filter((product) => product.currentStock <= product.minStock).length;
  return (
    <Screen title={`Merhaba, ${user.name}`}>
      <View style={styles.metricsGrid}>
        <MetricCard label="Bugunku Gorev" value="5" tone="green" />
        <MetricCard label="Bekleyen Sayim" value="2" tone="amber" />
        <MetricCard label="Kritik Stok" value={String(criticalCount)} tone="red" />
        <MetricCard label="Sevkiyat" value="1" tone="blue" />
      </View>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Yonetici mesaji</Text>
        <Text style={styles.bodyText}>A1 raf sayimi bugun kapanmadan tamamlanmali.</Text>
      </View>
      <SectionTitle title="Son islemler" />
      {movements.slice(0, 10).map((movement) => (
        <MovementRow key={movement.id} movement={movement} />
      ))}
    </Screen>
  );
}

function BarcodeScreen({
  products,
  locations,
  onMovement,
  onStockChange,
}: {
  products: Product[];
  locations: Location[];
  onMovement: (movement: Omit<StockMovement, 'id' | 'timestamp' | 'userName'>) => Promise<void>;
  onStockChange: (productId: string, quantityChange: number, locationCode?: string) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState(initialProducts[0].barcode);
  const [note, setNote] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('A1');
  const product = useMemo(
    () => products.find((item) => item.barcode === barcode || item.sku.toLowerCase() === barcode.toLowerCase()),
    [barcode, products],
  );

  const canUseCamera = Platform.OS !== 'web';

  const runAction = async (type: MovementType, quantityChange: number, toLocation = selectedLocation) => {
    if (!product) {
      Alert.alert('Urun bulunamadi', 'Once barkod veya SKU ile bir urun secin.');
      return;
    }
    onStockChange(product.id, quantityChange, toLocation);
    await onMovement({
      productId: product.id,
      productName: product.name,
      fromLocation: quantityChange < 0 ? product.locationCode : 'Depo girisi',
      toLocation,
      quantity: Math.abs(quantityChange || 1),
      type,
      note,
    });
    setNote('');
    Alert.alert('Islem kaydedildi', `${product.name} icin stok islemi tamamlandi.`);
  };

  if (scanning && canUseCamera) {
    return (
      <View style={styles.cameraScreen}>
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'] }}
          onBarcodeScanned={({ data }) => {
            setBarcode(data);
            setScanning(false);
          }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.scanFrame}>
          <ScanLine color={colors.success} size={96} />
          <Text style={styles.scanText}>Barkodu cerceveye hizalayin</Text>
        </View>
        <Pressable onPress={() => setScanning(false)} style={styles.closeScan}>
          <Text style={styles.buttonText}>Kapat</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Screen title="Barkod Islemi">
      <View style={styles.searchPanel}>
        <TextInput
          autoCapitalize="characters"
          onChangeText={setBarcode}
          placeholder="Barkod veya SKU"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={barcode}
        />
        <PrimaryButton
          icon={<Barcode color={colors.bg} size={20} />}
          label={canUseCamera ? 'Kamera ile Oku' : 'Webde Manuel Arama'}
          onPress={async () => {
            if (!canUseCamera) return;
            if (!permission?.granted) {
              const result = await requestPermission();
              if (!result.granted) return;
            }
            setScanning(true);
          }}
        />
      </View>

      {product ? <ProductCard product={product} /> : <EmptyState text="Bu barkodla eslesen urun yok." />}

      <TextInput
        onChangeText={setNote}
        placeholder="Islem notu"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.noteInput]}
        value={note}
      />
      <Text style={styles.label}>Hedef konum</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationChips}>
        {locations.map((location) => (
          <Pressable
            key={location.id}
            onPress={() => setSelectedLocation(location.code)}
            style={[styles.chip, selectedLocation === location.code && styles.chipActive]}
          >
            <Text style={[styles.chipText, selectedLocation === location.code && styles.chipTextActive]}>{location.code}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.actionGrid}>
        <PrimaryButton label="Stok Ekle +1" onPress={() => runAction('in', 1, product?.locationCode)} />
        <DangerButton label="Stok Cikar -1" onPress={() => runAction('out', -1, product?.locationCode)} />
        <SecondaryButton label="Rafa Tasi" onPress={() => runAction('transfer', 0, selectedLocation)} />
        <SecondaryButton label="Araca Yukle" onPress={() => runAction('transfer', 0, selectedLocation)} />
      </View>
    </Screen>
  );
}

function LocationsScreen({ products, locations }: { products: Product[]; locations: Location[] }) {
  return (
    <Screen title="Raf Takibi">
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LocationCard location={item} products={products.filter((product) => product.locationCode === item.code)} />}
        scrollEnabled={false}
      />
    </Screen>
  );
}

function VehiclesScreen({ products, locations }: { products: Product[]; locations: Location[] }) {
  return (
    <Screen title="Arac Takibi">
      {locations.map((location) => (
        <LocationCard key={location.id} location={location} products={products.filter((product) => product.locationCode === location.code)} />
      ))}
      <PrimaryButton label="Yukleme Tamamlandi" onPress={() => Alert.alert('Onaylandi', 'Arac yukleme onayi kaydedildi.')} />
    </Screen>
  );
}

function CountScreen({ tasks }: { tasks: CountTask[] }) {
  return (
    <Screen title="Sayim Gorevleri">
      {tasks.map((task) => (
        <View key={task.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{task.locationCode} raf sayimi</Text>
            <StatusPill label={statusLabel(task.status)} />
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(task.progress / task.total) * 100}%` }]} />
          </View>
          <Text style={styles.bodyText}>
            {task.progress} / {task.total} urun sayildi
          </Text>
          <SecondaryButton label={task.status === 'pending' ? 'Sayimi Baslat' : 'Devam Et'} onPress={() => Alert.alert('Demo', 'Barkod okutma akisi MVP sonrasi genisletilecek.')} />
        </View>
      ))}
    </Screen>
  );
}

function Screen({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenContent}>
        <Text style={styles.screenTitle}>{title}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: 'green' | 'amber' | 'red' | 'blue' }) {
  return (
    <View style={styles.metricCard}>
      <Text style={[styles.metricValue, { color: toneColor(tone) }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ProductCard({ product }: { product: Product }) {
  const isCritical = product.currentStock <= product.minStock;
  return (
    <View style={styles.productCard}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.cardTitle}>{product.name}</Text>
          <Text style={styles.mutedText}>{product.sku}</Text>
        </View>
        <StatusPill label={isCritical ? 'Kritik' : 'Normal'} danger={isCritical} />
      </View>
      <View style={styles.productFacts}>
        <Fact label="Stok" value={`${product.currentStock} ${product.unit}`} />
        <Fact label="Konum" value={product.locationCode} />
        <Fact label="Barkod" value={product.barcode} />
      </View>
    </View>
  );
}

function LocationCard({ location, products }: { location: Location; products: Product[] }) {
  const total = products.reduce((sum, product) => sum + product.currentStock, 0);
  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.cardTitle}>{location.code}</Text>
          <Text style={styles.mutedText}>{location.description}</Text>
        </View>
        <Text style={styles.stockBadge}>{total}</Text>
      </View>
      {products.length === 0 ? (
        <Text style={styles.mutedText}>Bu konumda urun yok.</Text>
      ) : (
        products.map((product) => (
          <View key={product.id} style={styles.inlineProduct}>
            <Text style={styles.bodyText}>{product.name}</Text>
            <Text style={styles.mutedText}>
              {product.currentStock} {product.unit}
            </Text>
          </View>
        ))
      )}
      <SecondaryButton label="Sayim Baslat" onPress={() => Alert.alert('Sayim', `${location.code} icin sayim baslatildi.`)} />
    </View>
  );
}

function MovementRow({ movement }: { movement: StockMovement }) {
  return (
    <View style={styles.movementRow}>
      <View>
        <Text style={styles.bodyText}>{movement.productName}</Text>
        <Text style={styles.mutedText}>
          {movement.fromLocation} {'->'} {movement.toLocation}
        </Text>
      </View>
      <Text style={styles.quantityText}>{movement.quantity}</Text>
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.mutedText}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.mutedText}>{text}</Text>
    </View>
  );
}

function StatusPill({ label, danger = false }: { label: string; danger?: boolean }) {
  return (
    <View style={[styles.statusPill, danger && styles.statusPillDanger]}>
      <Text style={[styles.statusText, danger && styles.statusTextDanger]}>{label}</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
      {icon}
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function DangerButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function iconForRoute(routeName: string) {
  switch (routeName) {
    case 'Barkod':
      return ScanLine;
    case 'Raflar':
      return Warehouse;
    case 'Araçlar':
      return Truck;
    case 'Sayım':
      return ClipboardCheck;
    default:
      return Home;
  }
}

function statusLabel(status: CountTask['status']) {
  if (status === 'in_progress') return 'Devam';
  if (status === 'completed') return 'Bitti';
  return 'Bekliyor';
}

function toneColor(tone: 'green' | 'amber' | 'red' | 'blue') {
  const map = {
    green: colors.success,
    amber: colors.warning,
    red: colors.danger,
    blue: colors.info,
  };
  return map[tone];
}

const colors = {
  bg: '#0b1014',
  panel: '#121a20',
  panelSoft: '#17232b',
  border: '#273742',
  text: '#f4f7f8',
  muted: '#9aa8b2',
  success: '#45d483',
  danger: '#ff5f66',
  warning: '#f3b746',
  info: '#5db7ff',
};

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.panel,
    text: colors.text,
    border: colors.border,
    primary: colors.success,
  },
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loginWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 80,
    justifyContent: 'center',
    marginBottom: 18,
    width: 80,
  },
  logo: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 28,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    gap: 14,
  },
  input: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  noteInput: {
    marginTop: 14,
  },
  rememberRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxOn: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  screenContent: {
    gap: 14,
    padding: 18,
    paddingBottom: 110,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 4,
  },
  tabBar: {
    backgroundColor: colors.panel,
    borderTopColor: colors.border,
    minHeight: 64,
    paddingBottom: 8,
    paddingTop: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 92,
    padding: 14,
    width: '48%',
  },
  metricValue: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6,
  },
  notice: {
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  noticeTitle: {
    color: colors.warning,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
    padding: 14,
  },
  productCard: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 14,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0,
  },
  bodyText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  mutedText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  productFacts: {
    flexDirection: 'row',
    gap: 10,
  },
  fact: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    flex: 1,
    minHeight: 68,
    padding: 10,
  },
  factValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  statusPill: {
    backgroundColor: 'rgba(69, 212, 131, 0.13)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillDanger: {
    backgroundColor: 'rgba(255, 95, 102, 0.15)',
  },
  statusText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  statusTextDanger: {
    color: colors.danger,
  },
  movementRow: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 68,
    padding: 14,
  },
  quantityText: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '800',
  },
  searchPanel: {
    gap: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 150,
    paddingHorizontal: 14,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 150,
    paddingHorizontal: 14,
  },
  dangerButton: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 150,
    paddingHorizontal: 14,
  },
  buttonText: {
    color: colors.bg,
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.78,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  locationChips: {
    flexGrow: 0,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    marginRight: 8,
    minHeight: 44,
    paddingHorizontal: 16,
  },
  chipActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  chipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.bg,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 90,
    justifyContent: 'center',
    padding: 14,
  },
  stockBadge: {
    color: colors.success,
    fontSize: 26,
    fontWeight: '800',
  },
  inlineProduct: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  progressTrack: {
    backgroundColor: colors.bg,
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.success,
    height: 10,
  },
  cameraScreen: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  scanFrame: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  scanText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 18,
  },
  closeScan: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.success,
    borderRadius: 8,
    bottom: 42,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 28,
    position: 'absolute',
  },
});
