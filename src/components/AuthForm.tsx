import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { AppText, Button, TextField } from '@/components/ui';
import { HumanCheck } from '@/components/HumanCheck';
import { db } from '@/api/db';
import { friendlyAuthError } from '@/core/authErrors';
import { checkPassword, passwordError } from '@/core/password';
import { SITE_URL } from '@/lib/site';
import { colors, radius, size, space } from '@/theme/tokens';

const WAIT_CHECK = 'Please wait a moment for the security check, then try again.';
// The email link opens the website, which confirms the address (same link as the website's sign-up).
const confirmRedirect = () => `${SITE_URL}/auth/callback?next=/account`;
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** Sign in and create account (website: components/AuthForm.tsx — same checks, messages and order). */
export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const isSignup = mode === 'signup';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resendNote, setResendNote] = useState('');
  const [resendWait, setResendWait] = useState(0);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const passwordRef = useRef<TextInput>(null);
  const freshCaptcha = () => { setCaptcha(null); setCaptchaKey((k) => k + 1); };

  useEffect(() => {
    if (resendWait <= 0) return;
    const t = setTimeout(() => setResendWait((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendWait]);

  async function resend(address: string) {
    if (!address || resendWait > 0) return;
    setResendNote('');
    if (!captcha) { setResendNote(WAIT_CHECK); return; }
    const { error } = await db().auth.resend({ type: 'signup', email: address, options: { emailRedirectTo: confirmRedirect(), captchaToken: captcha } });
    freshCaptcha();
    if (error) { setResendNote(friendlyAuthError(error)); return; }
    setResendNote('Sent again. Check your inbox and spam folder.');
    setResendWait(60);
  }

  async function submit() {
    setMessage(''); setFailed(false); setNeedsConfirm(false);
    const cleanEmail = email.trim().toLowerCase();
    if (isSignup && !fullName.trim()) { setFailed(true); setMessage('Please enter your full name.'); return; }
    if (!isEmail(cleanEmail)) { setFailed(true); setMessage('Please enter a valid email address.'); return; }
    if (!password) { setFailed(true); setMessage('Please enter your password.'); return; }
    setBusy(true);
    let usedCaptcha = false;
    try {
      if (!captcha) throw new Error(WAIT_CHECK);
      if (isSignup) {
        const weak = passwordError(password, cleanEmail);
        if (weak) throw new Error(weak);
        if (password !== confirm) throw new Error('Passwords do not match.');
        if (!agreed) throw new Error('Please tick the box to agree to the Terms of Use.');
        usedCaptcha = true;
        const { data, error } = await db().auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName.trim(), terms_accepted_at: new Date().toISOString() },
            emailRedirectTo: confirmRedirect(),
            captchaToken: captcha,
          },
        });
        if (error) throw error;
        if (data.session) { router.replace('/account'); return; }
        // Supabase hides whether an email is already registered: it returns a user with no identities.
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          setMessage('This email may already have an account. Please sign in, or use “Forgot password?”.');
          return;
        }
        setSentTo(cleanEmail);
      } else {
        usedCaptcha = true;
        const { error } = await db().auth.signInWithPassword({ email: cleanEmail, password, options: { captchaToken: captcha } });
        if (error) throw error;
        router.replace('/account');
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message.toLowerCase() : '';
      const notConfirmed = !isSignup && raw.includes('email not confirmed');
      if (notConfirmed) setNeedsConfirm(true);
      setMessage(friendlyAuthError(err));
      setFailed(true);
      if (!isSignup && !notConfirmed) { setPassword(''); setTimeout(() => passwordRef.current?.focus(), 50); }
    } finally {
      if (usedCaptcha) freshCaptcha();
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.card} accessibilityLiveRegion="polite">
          <AppText variant="title" style={styles.center}>Check your email</AppText>
          <AppText variant="body" tone="secondary" style={styles.center}>Your account is almost ready. We sent a confirmation link to</AppText>
          <AppText variant="label" style={styles.center}>{sentTo}</AppText>
          <View style={styles.steps}>
            <AppText variant="bodySmall">1. Open the email from Amcolink (check Spam or Promotions too).</AppText>
            <AppText variant="bodySmall">2. Tap Confirm your email.</AppText>
            <AppText variant="bodySmall">3. Come back and sign in with your email and password.</AppText>
          </View>
          <Button title="I've confirmed — sign in" size="lg" onPress={() => router.replace('/sign-in')} />
          <HumanCheck key={`r${captchaKey}`} action="resend" onToken={setCaptcha} />
          <Button title={resendWait > 0 ? `Resend available in ${resendWait}s` : "Didn't get it? Resend email"} variant="outline" disabled={resendWait > 0} onPress={() => resend(sentTo)} />
          {resendNote ? <AppText variant="bodySmall" tone="secondary">{resendNote}</AppText> : null}
          <Button title="Wrong email? Go back" variant="ghost" onPress={() => { setSentTo(null); setResendNote(''); }} />
        </View>
      </ScrollView>
    );
  }

  const pw = isSignup && password ? checkPassword(password, email) : null;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <AppText variant="title" tone="green" style={styles.center}>Amcolink</AppText>
          <AppText variant="title" style={styles.center} accessibilityRole="header">{isSignup ? 'Create an account' : 'Sign in'}</AppText>
          <AppText variant="bodySmall" tone="secondary" style={styles.center}>{isSignup ? 'Join Amcolink for free.' : 'Welcome back to Amcolink.'}</AppText>

          {isSignup ? (
            <TextField label="Full name" value={fullName} onChangeText={setFullName} maxLength={80} autoComplete="name" textContentType="name" placeholder="Full name" />
          ) : null}
          <TextField label="Email" value={email} onChangeText={setEmail} maxLength={254} autoComplete="email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="emailAddress" placeholder="Email address" />
          <TextField
            ref={passwordRef}
            label="Password"
            password
            value={password}
            onChangeText={setPassword}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            textContentType={isSignup ? 'newPassword' : 'password'}
            placeholder={isSignup ? 'At least 8 characters' : 'Password'}
            error={failed && !isSignup ? message : null}
            hint={pw && !pw.ok ? passwordError(password, email) ?? undefined : undefined}
          />
          {!isSignup ? (
            <Pressable accessibilityRole="link" onPress={() => router.push('/forgot-password')} style={styles.link}>
              <AppText variant="label" tone="green">Forgot password?</AppText>
            </Pressable>
          ) : null}
          {isSignup ? (
            <>
              <TextField label="Confirm password" password value={confirm} onChangeText={setConfirm} autoComplete="new-password" textContentType="newPassword" placeholder="Confirm password" />
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => setAgreed((a) => !a)} style={styles.agree}>
                <View style={[styles.box, agreed && styles.boxOn]}>{agreed ? <AppText variant="label" tone="onGreen">✓</AppText> : null}</View>
                <AppText variant="bodySmall" style={styles.flex}>
                  I am 18 or older and agree to the{' '}
                  <AppText variant="bodySmall" tone="green" onPress={() => Linking.openURL(`${SITE_URL}/terms`)}>Terms of Use</AppText> and{' '}
                  <AppText variant="bodySmall" tone="green" onPress={() => Linking.openURL(`${SITE_URL}/privacy`)}>Privacy Policy</AppText>. I will not post scams, illegal or offensive content.
                </AppText>
              </Pressable>
              {failed && message ? <AppText variant="bodySmall" tone="error" accessibilityRole="alert">{message}</AppText> : null}
            </>
          ) : null}

          <HumanCheck key={`f${captchaKey}`} action={isSignup ? 'signup' : 'login'} onToken={setCaptcha} />
          <Button title={busy ? (isSignup ? 'Creating your account…' : 'Signing in…') : isSignup ? 'Create account' : 'Sign in'} size="lg" loading={busy} onPress={submit} />

          {message && !failed ? <View style={styles.note}><AppText variant="bodySmall">{message}</AppText></View> : null}
          {needsConfirm ? (
            <View style={styles.gap}>
              <Button title={resendWait > 0 ? `Resend available in ${resendWait}s` : 'Send the confirmation email again'} variant="outline" disabled={resendWait > 0} onPress={() => resend(email.trim().toLowerCase())} />
              {resendNote ? <AppText variant="bodySmall" tone="secondary">{resendNote}</AppText> : null}
            </View>
          ) : null}

          <Pressable accessibilityRole="link" onPress={() => router.replace(isSignup ? '/sign-in' : '/sign-up')} style={styles.switch}>
            <AppText variant="bodySmall" tone="secondary">
              {isSignup ? 'Already have an account? ' : 'New to Amcolink? '}
              <AppText variant="label" tone="green">{isSignup ? 'Sign in' : 'Create account'}</AppText>
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { padding: space.lg, paddingBottom: space.xxl * 2 },
  card: { gap: space.md, padding: space.xl, borderRadius: radius.tile, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  center: { textAlign: 'center' },
  steps: { gap: space.xs, padding: space.md, borderRadius: radius.md, backgroundColor: colors.background },
  link: { alignSelf: 'flex-end', minHeight: size.touch, justifyContent: 'center' },
  agree: { flexDirection: 'row', gap: space.sm + 2, alignItems: 'flex-start', paddingVertical: space.xs },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  boxOn: { backgroundColor: colors.green, borderColor: colors.green },
  note: { padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint },
  gap: { gap: space.xs },
  switch: { alignItems: 'center', minHeight: size.touch, justifyContent: 'center' },
});
