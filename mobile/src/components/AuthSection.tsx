import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  signUp,
  signIn,
  signInWithGoogle,
  signOut,
  resetPassword,
  getUser,
  isLoggedIn,
  onAuthChange,
  initAuth,
} from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { fullSync } from '../lib/sync';
import { useStore } from '../store/useStore';
import { useToast } from '../hooks/useToast';
import { colors, fonts, radii, spacing } from '../constants/theme';
import Input from './Input';
import Button from './Button';

type AuthView = 'login' | 'signup' | 'forgot';

export default function AuthSection() {
  const { showToast } = useToast();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    initAuth();
    const unsubscribe = onAuthChange(async (user) => {
      setLoggedIn(isLoggedIn());
      if (user) {
        try {
          await fullSync();
        } catch (_e) {
          // silent — manual sync still available
        }
      } else {
        useStore.getState().resetToDefaults();
      }
    });
    return unsubscribe;
  }, []);

  function clearForm() {
    setEmail('');
    setPassword('');
    setUsername('');
  }

  async function handleSubmit() {
    if (!email.trim()) {
      showToast('Enter your email');
      return;
    }
    setLoading(true);
    try {
      if (authView === 'signup') {
        if (!password || password.length < 6) {
          showToast('Password must be 6+ chars');
          setLoading(false);
          return;
        }
        await signUp(email, password, username || 'User');
        showToast('Check your email to confirm');
        setAuthView('login');
        clearForm();
      } else if (authView === 'login') {
        if (!password) {
          showToast('Enter your password');
          setLoading(false);
          return;
        }
        await signIn(email, password);
        showToast('Logged in');
        clearForm();
      } else if (authView === 'forgot') {
        await resetPassword(email);
        showToast('Reset link sent');
        setAuthView('login');
        clearForm();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Auth error';
      showToast(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      showToast(message);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      useStore.getState().resetToDefaults();
      showToast('Signed out');
    } catch (_err) {
      showToast('Sign out failed');
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      await fullSync();
      showToast('Synced');
    } catch (_err) {
      showToast('Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.card}>
          <Text style={styles.offlineLabel}>OFFLINE MODE</Text>
          <Text style={styles.offlineDetail}>Data stored locally on this device</Text>
        </View>
      </View>
    );
  }

  if (loggedIn) {
    const user = getUser();
    const emailStr = user?.email || 'Unknown';
    const usernameStr = user?.user_metadata?.username || emailStr.split('@')[0];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.card}>
          <View style={styles.accountRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{usernameStr[0].toUpperCase()}</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{usernameStr}</Text>
              <Text style={styles.accountEmail}>{emailStr}</Text>
              <Text style={styles.syncedBadge}>SYNCED</Text>
            </View>
          </View>
        </View>
        <Button
          title={syncing ? 'Syncing...' : '\u21BB Sync Now'}
          variant="secondary"
          onPress={handleSync}
          disabled={syncing}
          style={styles.actionBtn}
        />
        <Button
          title="Sign Out"
          variant="outline"
          onPress={handleSignOut}
          style={styles.actionBtn}
        />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ACCOUNT</Text>
      <View style={styles.card}>
        <Text style={styles.authTitle}>
          {authView === 'signup' ? 'CREATE ACCOUNT' : authView === 'forgot' ? 'RESET PASSWORD' : 'LOG IN'}
        </Text>
        <Text style={styles.authSubtitle}>
          {authView === 'forgot'
            ? "We'll send a reset link to your email"
            : 'Access your workouts anywhere'}
        </Text>

        {authView === 'signup' && (
          <Input
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            maxLength={30}
            style={styles.input}
          />
        )}
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        {authView !== 'forgot' && (
          <View style={styles.passwordWrapper}>
            <Input
              placeholder={authView === 'signup' ? 'Password (min 6 chars)' : 'Password'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={[styles.input, styles.passwordInput]}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              hitSlop={8}
            >
              <Feather
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.muted}
              />
            </Pressable>
          </View>
        )}

        <Button
          title={
            loading
              ? 'Loading...'
              : authView === 'signup'
                ? 'Sign Up'
                : authView === 'forgot'
                  ? 'Send Reset Link'
                  : 'Log In'
          }
          onPress={handleSubmit}
          disabled={loading}
          style={styles.submitBtn}
        />

        {authView !== 'forgot' && (
          <Pressable onPress={handleGoogleSignIn} style={styles.googleBtn}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>CONTINUE WITH GOOGLE</Text>
          </Pressable>
        )}

        <View style={styles.switchRow}>
          {authView === 'login' && (
            <>
              <Pressable onPress={() => { setAuthView('forgot'); clearForm(); }}>
                <Text style={styles.link}>Forgot password?</Text>
              </Pressable>
              <Text style={styles.dot}> {'\u00B7'} </Text>
              <Pressable onPress={() => { setAuthView('signup'); clearForm(); }}>
                <Text style={styles.link}>SIGN UP</Text>
              </Pressable>
            </>
          )}
          {authView === 'signup' && (
            <Pressable onPress={() => { setAuthView('login'); clearForm(); }}>
              <Text style={styles.link}>Already have an account? LOG IN</Text>
            </Pressable>
          )}
          {authView === 'forgot' && (
            <Pressable onPress={() => { setAuthView('login'); clearForm(); }}>
              <Text style={styles.link}>BACK TO LOGIN</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  offlineLabel: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.text,
    letterSpacing: 1,
  },
  offlineDetail: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.white,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  accountEmail: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  syncedBadge: {
    fontFamily: fonts.monoMedium,
    fontSize: 9,
    color: colors.white,
    backgroundColor: colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    marginTop: 4,
    letterSpacing: 1,
  },
  actionBtn: {
    marginTop: spacing.sm,
  },
  authTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    marginBottom: 4,
  },
  authSubtitle: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.sm,
  },
  passwordWrapper: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 14,
    marginTop: spacing.sm,
  },
  googleG: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.accent,
  },
  googleText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: colors.text,
    letterSpacing: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  link: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.accent,
  },
  dot: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.muted,
  },
});
