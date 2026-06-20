import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { CountTask } from '../types';

export function useCountTasks(userId: string) {
  const [tasks, setTasks] = useState<CountTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'countTasks', userId, 'tasks'),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: CountTask[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<CountTask, 'id'>),
        }));
        setTasks(data);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, [userId]);

  const createTask = async (locationCode: string, total: number) => {
    if (!db) return;
    await addDoc(collection(db, 'countTasks', userId, 'tasks'), {
      status: 'pending',
      locationCode,
      progress: 0,
      total,
      createdAt: serverTimestamp(),
    });
  };

  const updateTask = async (
    taskId: string,
    updates: Partial<Omit<CountTask, 'id'>>,
  ) => {
    if (!db) return;
    await updateDoc(doc(db, 'countTasks', userId, 'tasks', taskId), updates);
  };

  const deleteTask = async (taskId: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'countTasks', userId, 'tasks', taskId));
  };

  return { tasks, loading, createTask, updateTask, deleteTask };
}
