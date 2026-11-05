import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { AppText, Button } from '@/components/ui';
import { snap } from '@/core/distance';
import { colors, radius, space } from '@/theme/tokens';

/**
 * Optional "Show my shop in Near me" (website: components/ShopLocationField.tsx): stand at the shop and tap.
 * Saved rounded to about 0.5 km; buyers only ever see a rough distance, never the point.
 */
export function LocationField({ lat, lng, property, onChange }: { lat: number | null; lng: number | null; property?: boolean; onChange: (lat: number | null, lng: number | null) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = lat !== null && lng !== null;
  const locate = async () => {
    setError(''); setBusy(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) { setError('Location is off for Amcolink. Allow it in your phone settings and try again.'); return; }
      const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      onChange(snap(p.coords.latitude), snap(p.coords.longitude));
    } catch {
      setError('Couldn’t get your location. Try again outdoors or near a window.');
    } finally { setBusy(false); }
  };
  return (
    <View style={styles.box}>
      <AppText variant="label">{property ? 'Show me in “Near me”' : 'Show my shop in “Near me”'}</AppText>
      <AppText variant="caption" tone="secondary">
        {property ? 'Stand at your office and tap the button.' : 'Stand at your shop and tap the button. Buyers nearby will see your items first.'} We round it to about 0.5 km and never show the exact spot.
      </AppText>
      <Button title={busy ? 'Finding location…' : set ? 'Update location' : 'Use my current location'} variant="outline" loading={busy} onPress={locate} />
      {set ? (
        <View style={styles.row}>
          <AppText variant="label" tone="green" style={styles.flex}>✓ Location added</AppText>
          <Button title="Remove" variant="ghost" onPress={() => onChange(null, null)} />
        </View>
      ) : null}
      {error ? <AppText variant="caption" tone="error">{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: space.sm, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
});
