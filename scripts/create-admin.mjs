// Admin hesabı oluşturma scripti
// Çalıştırmak için: node scripts/create-admin.mjs

import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// .env dosyasını manuel oku
const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach((line) => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const ADMIN_EMAIL = 'admin@barkodtakip.com';
const ADMIN_PASSWORD = 'Admin2024!';
const ADMIN_NAME = 'Sistem Yöneticisi';

async function createAdmin() {
  console.log('🔧 Firebase başlatılıyor...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log(`📧 Admin hesabı oluşturuluyor: ${ADMIN_EMAIL}`);

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    );

    await updateProfile(credential.user, { displayName: ADMIN_NAME });

    await setDoc(doc(db, 'users', credential.user.uid), {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: 'admin',
      createdAt: serverTimestamp(),
    });

    console.log('');
    console.log('✅ Admin hesabı başarıyla oluşturuldu!');
    console.log('─'.repeat(40));
    console.log(`📧 E-posta   : ${ADMIN_EMAIL}`);
    console.log(`🔑 Şifre     : ${ADMIN_PASSWORD}`);
    console.log(`👤 Ad        : ${ADMIN_NAME}`);
    console.log(`🔐 Rol       : admin`);
    console.log(`🆔 UID       : ${credential.user.uid}`);
    console.log('─'.repeat(40));
    console.log('');
    console.log('⚠️  Şifreyi uygulamaya girdikten sonra değiştirmeyi unutmayın!');
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Bu e-posta zaten kayıtlı. Admin hesabı zaten mevcut.');
      console.log(`📧 E-posta: ${ADMIN_EMAIL}`);
      console.log(`🔑 Şifre  : ${ADMIN_PASSWORD}`);
    } else if (error.code === 'auth/operation-not-allowed') {
      console.error('❌ HATA: Firebase Console\'da Email/Şifre authentication etkinleştirilmemiş!');
      console.error('   → Firebase Console → Authentication → Sign-in method → Email/Password → Etkinleştir');
    } else {
      console.error('❌ Hata:', error.message);
    }
  }

  process.exit(0);
}

createAdmin();
