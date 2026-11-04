import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { AppText } from '@/components/ui';
import { config } from '@/lib/config';
import { colors, radius, space } from '@/theme/tokens';

/**
 * Cloudflare "I'm human" check (same as the website). Each token works once: the form remounts this
 * (change its `key`) after every attempt, exactly like the website's AuthForm.
 * The page only shows the check and posts the token back; it cannot open other sites.
 */
export function HumanCheck({ action, onToken }: { action: 'login' | 'signup' | 'resend' | 'reset'; onToken: (token: string | null) => void }) {
  const [note, setNote] = useState('');
  if (!config.captchaReady) {
    return <AppText variant="bodySmall" tone="error">The security check is not set up in this build, so sign-in is turned off.</AppText>;
  }
  const page = `${config.captchaPage}${config.captchaPage.includes('?') ? '&' : '?'}sitekey=${encodeURIComponent(config.turnstileSiteKey)}&action=${action}`;
  const pageHost = new URL(config.captchaPage).host;
  const onMessage = (e: WebViewMessageEvent) => {
    let m: { type?: string; token?: string } = {};
    try { m = JSON.parse(e.nativeEvent.data); } catch { /* ignore */ }
    if (m.type === 'token' && m.token) { setNote(''); onToken(m.token); }
    else if (m.type === 'expired') { onToken(null); setNote('The check expired. It will refresh by itself.'); }
    else if (m.type === 'error') { onToken(null); setNote('The security check could not finish. Check your internet and try again.'); }
  };
  return (
    <View style={styles.wrap} accessibilityLabel="Security check">
      <WebView
        source={{ uri: page }}
        onMessage={onMessage}
        style={styles.web}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        // Only the check page and Cloudflare's challenge may load inside this box.
        onShouldStartLoadWithRequest={(r) => {
          try {
            const h = new URL(r.url).host;
            return h === pageHost || h === 'challenges.cloudflare.com' || r.url === 'about:blank';
          } catch { return false; }
        }}
        onError={() => setNote('The security check could not load. Check your internet and try again.')}
      />
      {note ? <AppText variant="caption" tone="secondary">{note}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  web: { height: 80, borderRadius: radius.md, backgroundColor: colors.background },
});
