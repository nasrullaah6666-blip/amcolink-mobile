import { buildWanted, fetchWanted } from '../wanted';

const base = { title: 'Used fridge', details: '', category: 'Home & Appliances', budget: '', currency: 'KES', country: 'Kenya', city: 'Nairobi', whatsapp: '0712 345 678' };

test('Wanted form: website checks and messages', () => {
  const e = (d: Partial<typeof base>) => { const r = buildWanted({ ...base, ...d }, 'u1'); return r.ok ? null : r.error; };
  expect(e({ title: 'tv' })).toMatch(/at least 3 letters/);
  expect(e({ country: 'Atlantis' })).toMatch(/choose a country/);
  expect(e({ city: ' ' })).toMatch(/city or town/);
  expect(e({ whatsapp: '12' })).toMatch(/WhatsApp number looks wrong/);
  const ok = buildWanted(base, 'u1');
  expect(ok.ok && ok.row.whatsapp).toBe('+254712345678');
  expect(ok.ok && ok.row.budget).toBeNull();
});

test('visitors never ask for the WhatsApp column; members do', async () => {
  const selects: string[] = [];
  const chain: Record<string, unknown> = {};
  for (const m of ['from', 'order', 'range', 'eq', 'neq', 'gt', 'ilike']) chain[m] = () => chain;
  chain.select = (cols: string) => { selects.push(cols); return chain; };
  (chain as { then?: unknown }).then = (r: (v: unknown) => void) => r({ data: [], error: null });
  await fetchWanted({ signedIn: false }, chain as never);
  await fetchWanted({ signedIn: true }, chain as never);
  expect(selects[0]).not.toMatch(/whatsapp/);
  expect(selects[0]).not.toMatch(/user_id/);
  expect(selects[1]).toMatch(/whatsapp/);
});
