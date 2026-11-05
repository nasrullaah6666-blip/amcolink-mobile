import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import { snap, type Point } from '@/core/distance';

export type Where = { state: 'idle' | 'asking' } | { state: 'denied' | 'failed'; message: string } | { state: 'ok'; point: Point };

/** Asks the phone for its location (only when called), rounded to ~0.5 km so the exact spot is never used (website rule). */
export function useNearPoint() {
  const [where, setWhere] = useState<Where>({ state: 'idle' });
  const locate = useCallback(async () => {
    setWhere({ state: 'asking' });
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) { setWhere({ state: 'denied', message: 'Location is off for Amcolink. Allow it in your phone settings to see what is near you.' }); return; }
      const pos = await Location.getLastKnownPositionAsync({ maxAge: 600_000 }) ?? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setWhere({ state: 'ok', point: { lat: snap(pos.coords.latitude), lng: snap(pos.coords.longitude) } });
    } catch {
      setWhere({ state: 'failed', message: 'Couldn’t find your location. Check that location is on, then try again.' });
    }
  }, []);
  const clear = useCallback(() => setWhere({ state: 'idle' }), []);
  return { where, locate, clear };
}
