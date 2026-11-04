import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBlockedIds, fetchSavedIds, setBlocked, toggleFavorite } from '@/api/me';
import { useAuth } from './session';

const EMPTY = { ads: new Set<string>(), shops: new Set<string>() };

/** What the signed-in person has saved. Signed out: nothing. */
export function useSaved() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['saved-ids', user?.id], queryFn: () => fetchSavedIds(user!.id), enabled: !!user });
  const toggle = useMutation({
    mutationFn: (t: { adId?: string; shopId?: string }) => toggleFavorite(user!.id, t),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-ids', user?.id] });
      qc.invalidateQueries({ queryKey: ['saved-items', user?.id] });
    },
  });
  return { signedIn: !!user, saved: q.data ?? EMPTY, toggle };
}

/** Shops the signed-in person blocked: hidden from their lists (as on the website). */
export function useBlocked() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['blocked-ids', user?.id], queryFn: () => fetchBlockedIds(user!.id), enabled: !!user });
  const change = useMutation({
    mutationFn: ({ shopId, block }: { shopId: string; block: boolean }) => setBlocked(user!.id, shopId, block),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blocked-ids', user?.id] });
      qc.invalidateQueries({ queryKey: ['blocked-shops', user?.id] });
    },
  });
  return { signedIn: !!user, blocked: q.data ?? new Set<string>(), change };
}
