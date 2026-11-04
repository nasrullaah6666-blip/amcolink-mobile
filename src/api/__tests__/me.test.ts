import { reportText, sendReport, toggleFavorite, setBlocked } from '../me';

function fake(existing: unknown, insertError: unknown = null) {
  const calls: unknown[][] = [];
  const chain: Record<string, unknown> = {};
  for (const m of ['from', 'select', 'eq', 'is', 'delete']) chain[m] = (...a: unknown[]) => { calls.push([m, ...a]); return chain; };
  chain.maybeSingle = () => Promise.resolve({ data: existing, error: null });
  chain.insert = (row: unknown) => { calls.push(['insert', row]); return Promise.resolve({ error: insertError }); };
  return { c: chain as never, calls };
}

test('report text: reason first, then the note; Other needs a note (website rule)', () => {
  expect(reportText('', 'x')).toBeNull();
  expect(reportText('Scam', '')).toBe('Scam');
  expect(reportText('Scam', ' asked for money first ')).toBe('Scam: asked for money first');
  expect(reportText('Other', 'no')).toBeNull();
  expect(reportText('Other', 'wrong photos')).toBe('wrong photos');
  expect(reportText('Scam', 'x'.repeat(900))!.length).toBe(500);
});

test('saving a listing that is not saved yet inserts one row for this person', async () => {
  const { c, calls } = fake(null);
  await expect(toggleFavorite('u1', { adId: 'a1' }, c)).resolves.toBe(true);
  expect(calls).toContainEqual(['insert', { user_id: 'u1', shop_id: null, ad_id: 'a1' }]);
});

test('reporting twice gives the friendly "already reported" answer', async () => {
  const { c } = fake(null, { code: '23505', message: 'duplicate' });
  await expect(sendReport('u1', { adId: 'a1' }, 'Scam', c)).resolves.toBe('already');
});

test('blocking inserts the shop for this person', async () => {
  const { c, calls } = fake(null);
  await setBlocked('u1', 's1', true, c);
  expect(calls).toContainEqual(['insert', { user_id: 'u1', shop_id: 's1' }]);
});
