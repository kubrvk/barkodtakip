import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import {
  BarChart2,
  ClipboardList,
  Package,
  ScanLine,
  Truck,
  User,
  Warehouse,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, View } from 'react-native';

import { AddProductScreen } from './src/screens/AddProductScreen';
import { BarcodeScreen } from './src/screens/BarcodeScreen';
import { CountScreen } from './src/screens/CountScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { LocationsScreen, VehiclesScreen } from './src/screens/LocationsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProductsScreen } from './src/screens/ProductsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { navigationTheme, colors } from './src/config/theme';
import { db } from './src/config/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './src/hooks/useAuth';
import { useCountTasks } from './src/hooks/useCountTasks';
import { useMovements } from './src/hooks/useMovements';
import { useProducts } from './src/hooks/useProducts';
import { Location, LocationType, Product, StockMovement } from './src/types';

const Tab = createBottomTabNavigator();

function iconForRoute(name: string) {
  switch (name) {
    case 'Barkod': return ScanLine;
    case 'Ürünler': return Package;
    case 'Raflar': return Warehouse;
    case 'Araçlar': return Truck;
    case 'Sayım': return ClipboardList;
    case 'Profil': return User;
    default: return BarChart2;
  }
}

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [addProductVisible, setAddProductVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const uid = user?.uid ?? '';
  const { products, addProduct, updateProduct, deleteProduct, updateStock } = useProducts(uid);
  const { movements, addMovement } = useMovements(uid);
  const { tasks, createTask, updateTask, deleteTask } = useCountTasks(uid);

  // Derive locations from products
  const locations = useMemo((): Location[] => {
    const seen = new Set<string>();
    const locs: Location[] = [];
    products.forEach((p) => {
      if (!seen.has(p.locationCode)) {
        seen.add(p.locationCode);
        const normalizedCode = p.locationCode.trim().toLowerCase();
        // A location is considered a vehicle if:
        // 1. It starts with two digits (e.g., 34 ABC 123, 34ABC)
        // 2. Contains vehicle-related keywords (araç, arac, kamyon, vb.)
        const isVehicle = 
          /^\d{2}/.test(normalizedCode) || 
          /(araç|arac|kamyon|tır|araba|kurye|plaka)/.test(normalizedCode);
        
        locs.push({
          id: p.locationCode,
          type: isVehicle ? 'vehicle' : 'shelf',
          code: p.locationCode,
          description: isVehicle ? 'Araç' : 'Raf bölgesi',
        });
      }
    });
    return locs;
  }, [products]);

  const shelfLocations = locations.filter((l) => l.type === 'shelf');
  const vehicleLocations = locations.filter((l) => l.type === 'vehicle');

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.success} size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen />
      </>
    );
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
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ color, size }) => {
            const Icon = iconForRoute(route.name);
            return <Icon color={color} size={size - 2} />;
          },
        })}
      >
        <Tab.Screen name="Ana Sayfa">
          {() => (
            <DashboardScreen
              user={user}
              products={products}
              movements={movements}
              tasks={tasks}
              locations={locations}
              onNavigateToProducts={() => {}}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Ürünler">
          {() => (
            <>
              <ProductsScreen
                products={products}
                onAddProduct={() => {
                  setEditProduct(null);
                  setAddProductVisible(true);
                }}
                onEditProduct={(p) => {
                  setEditProduct(p);
                  setAddProductVisible(true);
                }}
              />

              {/* Add/Edit Product Modal */}
              <Modal
                visible={addProductVisible}
                animationType="slide"
                onRequestClose={() => setAddProductVisible(false)}
              >
                <AddProductScreen
                  product={editProduct}
                  onSave={async (data) => {
                    if (editProduct) {
                      await updateProduct(editProduct.id, data);
                    } else {
                      await addProduct(data);
                    }
                  }}
                  onDelete={
                    editProduct
                      ? async () => {
                          await deleteProduct(editProduct.id);
                        }
                      : undefined
                  }
                  onClose={() => {
                    setAddProductVisible(false);
                    setEditProduct(null);
                  }}
                />
              </Modal>
            </>
          )}
        </Tab.Screen>

        <Tab.Screen name="Barkod">
          {() => (
            <BarcodeScreen
              user={user}
              products={products}
              locations={locations}
              onMovement={async (movement) => {
                await addMovement(movement);
              }}
              onStockChange={async (productId, quantityChange, locationCode) => {
                await updateStock(productId, quantityChange, locationCode);
              }}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Raflar">
          {() => (
            <LocationsScreen
              products={products}
              locations={shelfLocations}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Araçlar">
          {() => (
            <VehiclesScreen
              products={products}
              locations={vehicleLocations}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Sayım">
          {() => (
            <CountScreen
              tasks={tasks}
              products={products}
              onCreateTask={createTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Profil">
          {() => (
            <ProfileScreen
              user={user}
              products={products}
              movements={movements}
              onSignOut={signOut}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    flex: 1,
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: colors.panel,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'web' ? 65 : 70,
    paddingBottom: Platform.OS === 'web' ? 10 : 15,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
