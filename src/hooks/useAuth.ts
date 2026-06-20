import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, firebaseApp } from '../config/firebase';
import { AppUser } from '../types';

const REMEMBER_KEY = 'barkod_remember_login';
const CACHED_USER_KEY = 'barkod_cached_user';

function toAppUser(firebaseUser: FirebaseUser): AppUser {
  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName ?? 'Kullanıcı',
    email: firebaseUser.email ?? '',
    role: 'warehouse',
  };
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = toAppUser(firebaseUser);
        setUser(appUser);
        await AsyncStorage.setItem(CACHED_USER_KEY, JSON.stringify(appUser));
      } else {
        setUser(null);
        await AsyncStorage.removeItem(CACHED_USER_KEY);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string, remember: boolean) => {
    setError(null);
    if (!auth) throw new Error('Firebase yapılandırması eksik.');
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem(REMEMBER_KEY, String(remember));
      return toAppUser(credential.user);
    } catch (err: unknown) {
      const message = mapAuthError(err);
      setError(message);
      throw new Error(message);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setError(null);
    if (!auth) throw new Error('Firebase yapılandırması eksik.');
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });

      // Firestore'a kullanıcı profili kaydet
      if (firebaseApp) {
        const db = getFirestore(firebaseApp);
        await setDoc(doc(db, 'users', credential.user.uid), {
          name,
          email,
          role: 'warehouse',
          createdAt: serverTimestamp(),
        });
      }

      return toAppUser(credential.user);
    } catch (err: unknown) {
      const message = mapAuthError(err);
      setError(message);
      throw new Error(message);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    await AsyncStorage.removeItem(CACHED_USER_KEY);
    await AsyncStorage.removeItem(REMEMBER_KEY);
  };

  return { user, loading, error, signIn, signUp, signOut };
}

function mapAuthError(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code ?? '';
    if (code === 'auth/user-not-found') return 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.';
    if (code === 'auth/wrong-password') return 'Şifre hatalı.';
    if (code === 'auth/invalid-email') return 'Geçersiz e-posta adresi.';
    if (code === 'auth/email-already-in-use') return 'Bu e-posta zaten kullanımda.';
    if (code === 'auth/weak-password') return 'Şifre en az 6 karakter olmalı.';
    if (code === 'auth/too-many-requests') return 'Çok fazla deneme. Lütfen bekleyin.';
    if (code === 'auth/invalid-credential') return 'Hatalı e-posta veya şifre.';
    return err.message;
  }
  return 'Bilinmeyen hata oluştu.';
}
