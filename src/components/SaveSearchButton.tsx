import React, { useState } from 'react';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui';
import { useAuth } from '@/auth/session';
import { saveSearch } from '@/api/me';
import { askForPush } from '@/lib/push';
import { describeSearch, parseSearch, searchParamsOf } from '@/core/search';

/** "Save search" (website: SaveSearchButton): saves the search the way the website does, so it opens on both. */
export function SaveSearchButton({ params }: { params: Record<string, string | undefined> }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [state, setState] = useState<'idle' | 'busy' | 'saved' | 'error'>('idle');
  const s = parseSearch(params);
  if (!user) return <Button title="Save search" variant="outline" onPress={() => router.push('/sign-in')} />;
  const save = async () => {
    setState('busy');
    try { await saveSearch(describeSearch(s), searchParamsOf({ ...s, sort: '' })); setState('saved'); askForPush(user.id); qc.invalidateQueries({ queryKey: ['saved-searches', user.id] }); }
    catch { setState('error'); }
  };
  return (
    <Button title={state === 'saved' ? 'Saved — find it under Saved' : state === 'error' ? 'Could not save. Try again' : state === 'busy' ? 'Saving…' : 'Save search'}
      variant="outline" loading={state === 'busy'} disabled={state === 'saved'} onPress={save} />
  );
}
