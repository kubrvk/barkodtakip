import { Eye, EyeOff, Lock, Mail, PackageCheck, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { colors, radius, spacing } from '../config/theme';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

type Mode = 'login' | 'register';

export function LoginScreen() {
  const { signIn, signUp, error } = useAuth();
  
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validate = () => {
    if (!email.trim()) { setLocalError('E-posta adresi zorunludur.'); return false; }
    if (!password) { setLocalError('Şifre zorunludur.'); return false; }
    if (mode === 'register') {
      if (!name.trim()) { setLocalError('Ad Soyad zorunludur.'); return false; }
      if (password !== confirmPassword) { setLocalError('Şifreler eşleşmiyor.'); return false; }
      if (password.length < 6) { setLocalError('Şifre en az 6 karakter olmalı.'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    setLocalError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password, true);
      } else {
        await signUp(name.trim(), email.trim(), password);
      }
    } catch {
      // error is handled in hook
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError ?? error;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={{ width: 64, height: 64, borderRadius: 12 }} 
                resizeMode="contain" 
              />
            </View>
            <Text style={styles.brandName}>BarkodTakip</Text>
            <Text style={styles.brandSub}>
              {mode === 'login'
                ? 'Hesabınıza giriş yapın'
                : 'Yeni hesap oluşturun'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'register' && (
              <Input
                label="Ad Soyad"
                placeholder="Adınız Soyadınız"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                leftIcon={<User color={colors.muted} size={18} />}
              />
            )}

            <Input
              label="E-posta"
              placeholder="ornek@mail.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<Mail color={colors.muted} size={18} />}
            />

            <Input
              label="Şifre"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              leftIcon={<Lock color={colors.muted} size={18} />}
              rightIcon={
                <Pressable onPress={() => setShowPass(!showPass)}>
                  {showPass
                    ? <EyeOff color={colors.muted} size={18} />
                    : <Eye color={colors.muted} size={18} />}
                </Pressable>
              }
            />

            {mode === 'register' && (
              <Input
                label="Şifre Tekrar"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPass}
                leftIcon={<Lock color={colors.muted} size={18} />}
              />
            )}

            {displayError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            ) : null}

            <Button
              label={loading ? 'Lütfen bekleyin...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              onPress={handleSubmit}
              disabled={loading}
              fullWidth
              size="lg"
            />
            
            {mode === 'login' && (
              <Text style={{ textAlign: 'center', color: colors.muted, fontSize: 13, marginTop: 4 }}>
                mail:<br/>
                admin@barkodtakip.com<br/>
                şifre:<br/>
                admin1234
              </Text>
            )}
          </View>

          {/* Switch mode */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {mode === 'login'
                ? 'Hesabınız yok mu?'
                : 'Zaten hesabınız var mı?'}
            </Text>
            <Pressable
              onPress={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setLocalError(null);
              }}
            >
              <Text style={styles.switchLink}>
                {mode === 'login' ? 'Kayıt Ol' : 'Giriş Yap'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandIcon: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  brandName: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  brandSub: {
    color: colors.muted,
    fontSize: 15,
  },
  form: {
    gap: spacing.md,
  },
  errorBanner: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: spacing.sm + 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '500',
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  switchText: {
    color: colors.muted,
    fontSize: 14,
  },
  switchLink: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
});
