import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Button } from '@/components/ui';
import { PickerField } from '@/components/PickerField';
import { DAYS, niceTime, type DayKey, type Hours } from '@/core/hours';
import { colors, radius, space } from '@/theme/tokens';

// Half-hour steps (the website's time box allows any minute; a saved time not on this list is still shown and kept).
const STEPS = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);
const options = (cur: string) => (STEPS.includes(cur) ? STEPS : [cur, ...STEPS]).map((t) => ({ value: t, label: niceTime(t) }));

/** A compact time box that opens the picker list. (A render helper for PickerField, not a component.) */
// eslint-disable-next-line react/display-name
const timeBox = (label: string) => (open: () => void, text: string) => (
  <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${text}`} onPress={open} style={styles.time}>
    <AppText variant="body" numberOfLines={1}>{text}</AppText>
  </Pressable>
);

/** Opening hours, one row per day (website: components/HoursEditor.tsx). A day that is off = closed. */
export function HoursField({ value, onChange }: { value: Hours; onChange: (h: Hours) => void }) {
  const set = (k: DayKey, v: { open: string; close: string } | null) => {
    const n: Hours = { ...value };
    if (v) n[k] = v; else delete n[k];
    onChange(n);
  };
  const first = DAYS.map((d) => value[d.key]).find(Boolean);
  return (
    <View style={styles.box}>
      <AppText variant="label">Opening hours</AppText>
      <AppText variant="caption" tone="secondary">Buyers will see “Open now” or “Closed · opens 8:00 AM”. Leave every day off if you don’t want to show hours.</AppText>
      {DAYS.map((d) => {
        const x = value[d.key];
        return (
          <View key={d.key} style={styles.day}>
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: !!x }} accessibilityLabel={`${d.label} open`}
              onPress={() => set(d.key, x ? null : (first || { open: '08:00', close: '18:00' }))} style={styles.tick}>
              <View style={[styles.check, x && styles.checkOn]}>{x ? <AppText variant="label" tone="onGreen">✓</AppText> : null}</View>
              <AppText variant="label">{d.short}</AppText>
            </Pressable>
            {x ? (
              <View style={styles.times}>
                <View style={styles.flex}><PickerField label={`${d.label} opens`} value={x.open} options={options(x.open)} onChange={(t) => set(d.key, { ...x, open: t })} trigger={timeBox(`${d.label} opens`)} /></View>
                <AppText variant="bodySmall" tone="secondary">to</AppText>
                <View style={styles.flex}><PickerField label={`${d.label} closes`} value={x.close} options={options(x.close)} onChange={(t) => set(d.key, { ...x, close: t })} trigger={timeBox(`${d.label} closes`)} /></View>
              </View>
            ) : <AppText variant="bodySmall" tone="secondary" style={styles.flex}>Closed</AppText>}
          </View>
        );
      })}
      {first ? (
        <Button title="Use the first day’s time for all open days" variant="ghost" onPress={() => {
          const n: Hours = {}; for (const d of DAYS) if (value[d.key]) n[d.key] = first; onChange(n);
        }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: space.sm, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  day: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 52 },
  tick: { flexDirection: 'row', alignItems: 'center', gap: space.sm, width: 78, minHeight: 44 },
  check: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.green, borderColor: colors.green },
  times: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.xs },
  flex: { flex: 1 },
  time: { height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.sm },
});
