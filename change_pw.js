const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) env[key.trim()] = val.join('=').trim();
});

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, updatePassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function changePassword() {
  try {
    console.log('Logging in with old password...');
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@barkodtakip.com', 'Admin2024!');
    console.log('Logged in successfully. Changing password...');
    
    await updatePassword(userCredential.user, 'admin1234');
    console.log('Password updated successfully to "admin1234".');
    process.exit(0);
  } catch (error) {
    console.error('Error changing password:', error.message);
    
    // Fallback: Maybe they already changed it or the old password is wrong?
    try {
      console.log('Trying to login with new password just to verify...');
      await signInWithEmailAndPassword(auth, 'admin@barkodtakip.com', 'admin1234');
      console.log('Already updated! Login with "admin1234" successful.');
      process.exit(0);
    } catch(e) {
      console.error('Fallback failed:', e.message);
      process.exit(1);
    }
  }
}

changePassword();
