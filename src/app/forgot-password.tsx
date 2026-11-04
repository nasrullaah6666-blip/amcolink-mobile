import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText, Button, TextField } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { HumanCheck } from '@/components/HumanCheck';
import { db } from '@/api/db';
import { friendlyAuthError } from '@/core/authErrors';
import { SITE_URL } from '@/lib/site';
import { colors, radius, space } from '@/theme/tokens';

/** Website: components/ForgotPasswordForm.tsx. The link in the email opens the website to choose a new password. */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  async function submit() {
    setMessage('');
    if (!captcha) { setMessage('Please wait a moment for the security check, then try again.'); return; }
    setBusy(true);
    try {
      const { error } = await db().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
        captchaToken: captcha,
      });
      if (error) throw error;
      setMessage('If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.');
    } catch (err) {
      setMessage(friendlyAuthError(err));
    } finally {
      setCaptcha(null);
      setCaptchaKey((k) => k + 1);
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <AppText variant="title" accessibilityRole="header">Reset your password</AppText>
          <AppText variant="bodySmall" tone="secondary">Enter your email and we will send you a link to choose a new password.</AppText>
          <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" maxLength={254} placeholder="Email address" />
          <HumanCheck key={captchaKey} action="reset" onToken={setCaptcha} />
          <Button title={busy ? 'Sending…' : 'Send reset link'} size="lg" loading={busy} onPress={submit} />
          {message ? <View style={styles.note} accessibilityLiveRegion="polite"><AppText variant="bodySmall">{message}</AppText></View> : null}
          <Button title="Back to sign in" variant="ghost" onPress={() => router.replace('/sign-in')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  body: { padding: space.lg },
  card: { gap: space.md, padding: space.xl, borderRadius: radius.tile, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  note: { padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint },
});
