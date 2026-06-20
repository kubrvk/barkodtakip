import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { StockMovement } from '../types';

export function useMovements(userId: string) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'movements', userId, 'log'),
      orderBy('timestamp', 'desc'),
      limit(50),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: StockMovement[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<StockMovement, 'id'>),
        }));
        setMovements(data);
        setLoading(false);
      },
      (err) => {
        console.error('Movements snapshot error:', err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  const addMovement = async (
    movement: Omit<StockMovement, 'id' | 'timestamp'>,
  ) => {
    if (!db) throw new Error('Veritabanı bağlantısı yok.');
    const timestamp = new Date().toISOString();
    await addDoc(collection(db, 'movements', userId, 'log'), {
      ...movement,
      timestamp,
      _serverTimestamp: serverTimestamp(),
    });
  };

  return { movements, loading, addMovement };
}
