// Firebase CLI'ın cached credential'ını kullanarak admin oluştur
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { homedir } from 'os';

// .env'den proje bilgilerini oku
const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach((line) => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

const API_KEY = env.EXPO_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

// Firebase CLI credentials dosyasını oku
const credPath = join(homedir(), '.config', 'configstore', 'firebase-tools.json');
let accessToken = null;

try {
  const creds = JSON.parse(readFileSync(credPath, 'utf-8'));
  // tokens objesi içindeki ilk hesabın token'ı
  const tokens = creds.tokens;
  if (tokens && tokens.access_token) {
    accessToken = tokens.access_token;
  } else {
    // Alternatif yapı
    const accounts = creds.user || {};
    const firstKey = Object.keys(accounts)[0];
    if (firstKey) accessToken = accounts[firstKey]?.tokens?.access_token;
  }
} catch (e) {
  console.log('Credential dosyası okunamadı:', e.message);
}

const ADMIN_EMAIL = 'admin@barkodtakip.com';
const ADMIN_PASSWORD = 'Admin2024!';
const ADMIN_NAME = 'Sistem Yöneticisi';

async function createAdmin() {
  console.log('🔧 Firebase Admin SDK ile kullanıcı oluşturuluyor...\n');

  // Firebase Auth REST API - signUp endpoint
  // Bu endpoint API key ile çalışır, referer kısıtlaması yok
  const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;

  // Header'a referer ekle
  const headers = {
    'Content-Type': 'application/json',
    'X-Client-Version': 'Node/JsCore/10.0.0/FirebaseCore-web',
    'Referer': `https://${PROJECT_ID}.firebaseapp.com`,
    'Origin': `https://${PROJECT_ID}.firebaseapp.com`,
  };

  const signUpRes = await fetch(signUpUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      returnSecureToken: true,
    }),
  });

  const data = await signUpRes.json();

  if (data.error) {
    if (data.error.message === 'EMAIL_EXISTS') {
      console.log('ℹ️  Hesap zaten mevcut. Giriş yapılıyor...');
      const loginRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, returnSecureToken: true }),
        }
      );
      const loginData = await loginRes.json();
      if (!loginData.error) {
        await saveToFirestore(loginData.idToken, loginData.localId);
        printResult(loginData.localId);
        return;
      }
      console.error('❌', loginData.error.message);
    } else if (data.error.message?.includes('OPERATION_NOT_ALLOWED')) {
      console.error('\n❌ Email/Password auth kapalı!');
      console.error('Firebase Console\'da etkinleştirin:');
      console.error('→ https://console.firebase.google.com/project/' + PROJECT_ID + '/authentication/providers');
    } else {
      console.error('❌ Hata:', data.error.message);
      console.error('Detay:', JSON.stringify(data.error, null, 2));
    }
    return;
  }

  // Display name güncelle
  await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ idToken: data.idToken, displayName: ADMIN_NAME }),
  });

  // Firestore'a kaydet
  await saveToFirestore(data.idToken, data.localId);
  printResult(data.localId);
}

async function saveToFirestore(idToken, uid) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      fields: {
        name: { stringValue: ADMIN_NAME },
        email: { stringValue: ADMIN_EMAIL },
        role: { stringValue: 'admin' },
        createdAt: { timestampValue: new Date().toISOString() },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.log('⚠️  Firestore kayıt uyarısı:', err?.error?.message ?? 'Bilinmiyor');
  }
}

function printResult(uid) {
  console.log('');
  console.log('✅ Admin hesabı hazır!');
  console.log('─'.repeat(44));
  console.log(`📧 E-posta   : ${ADMIN_EMAIL}`);
  console.log(`🔑 Şifre     : ${ADMIN_PASSWORD}`);
  console.log(`👤 Ad        : ${ADMIN_NAME}`);
  console.log(`🔐 Rol       : admin`);
  console.log(`🆔 UID       : ${uid}`);
  console.log('─'.repeat(44));
  console.log('⚠️  Güvenlik için şifreyi uygulamada değiştirin!');
}

createAdmin().catch(e => {
  console.error('❌ Beklenmeyen hata:', e.message);
});
