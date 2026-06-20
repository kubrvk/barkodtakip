import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { Product } from '../types';

export function useProducts(userId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'products', userId, 'items'),
      orderBy('name', 'asc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Product[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Product, 'id'>),
        }));
        setProducts(data);
        setLoading(false);
      },
      (err) => {
        console.error('Products snapshot error:', err);
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!db) throw new Error('Veritabanı bağlantısı yok.');
    const docRef = await addDoc(collection(db, 'products', userId, 'items'), {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateProduct = async (
    productId: string,
    updates: Partial<Omit<Product, 'id' | 'createdAt'>>,
  ) => {
    if (!db) throw new Error('Veritabanı bağlantısı yok.');
    await updateDoc(doc(db, 'products', userId, 'items', productId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteProduct = async (productId: string) => {
    if (!db) throw new Error('Veritabanı bağlantısı yok.');
    await deleteDoc(doc(db, 'products', userId, 'items', productId));
  };

  const updateStock = async (
    productId: string,
    quantityChange: number,
    newLocationCode?: string,
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const newStock = Math.max(0, product.currentStock + quantityChange);
    await updateProduct(productId, {
      currentStock: newStock,
      ...(newLocationCode ? { locationCode: newLocationCode } : {}),
    });
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
  };
}
