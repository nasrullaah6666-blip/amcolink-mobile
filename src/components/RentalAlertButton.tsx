import React, { useState } from 'react';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppText, Button } from '@/components/ui';
import { useAuth } from '@/auth/session';
import { saveSearch } from '@/api/me';
import { askForPush } from '@/lib/push';

/**
 * Property: "Alert me" (website: components/RentalAlertButton.tsx) saves the current property search
 * (query.page = "rentals") — the database then sends an alert when a matching place is posted.
 */
export function RentalAlertButton({ label, query }: { label: string; query: Record<string, string> }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [state, setState] = useState<'idle' | 'busy' | 'saved' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const hasFilters = Object.keys(query).some((k) => k !== 'page' && k !== 'deal' && query[k]);
  if (!user) return <Button title="🔔 Alert me" variant="outline" onPress={() => router.push('/sign-in')} />;
  const save = async () => {
    if (!hasFilters) { setState('error'); setMsg('First choose an area, a type or a filter. Then tap Alert me.'); return; }
    setState('busy');
    try {
      await saveSearch(label, query);
      setState('saved'); setMsg('Saved. We’ll tell you when a matching place is posted. Find it under Saved.');
      askForPush(user.id);
      qc.invalidateQueries({ queryKey: ['saved-searches', user.id] });
    } catch (e) { setState('error'); setMsg((e as Error).message || 'Could not save. Try again.'); }
  };
  return (
    <>
      <Button title={state === 'saved' ? '🔔 Alert on' : state === 'busy' ? 'Saving…' : '🔔 Alert me'} variant="outline"
        loading={state === 'busy'} disabled={state === 'saved'} onPress={save} />
      {msg ? <AppText variant="caption" tone={state === 'error' ? 'error' : 'secondary'}>{msg}</AppText> : null}
    </>
  );
}
