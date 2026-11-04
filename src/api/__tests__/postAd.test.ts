import { buildAd, type AdDraft } from '../postAd';

const base: AdDraft = {
  shopId: 's1', group: 'shop', title: 'Samsung A15', description: 'Very clean phone, 128 GB, box and charger included.', price: '15000', currency: 'KES',
  category: 'Phones & Tablets', subcategory: 'Phones', condition: 'used', free: false, priceMode: 'from', expiryDate: '', noExpiry: false,
  availability: 'available', rulesOk: true, photos: ['https://x/ad-photos/u1/a.jpg'],
};
const err = (d: Partial<AdDraft>) => { const r = buildAd({ ...base, ...d }, 'u1'); return r.ok ? null : r.error; };

test('a complete phone listing gives the same row the website saves', () => {
  const r = buildAd(base, 'u1');
  expect(r.ok).toBe(true);
  if (r.ok) expect(r.row).toEqual({
    shop_id: 's1', owner_id: 'u1', title: 'Samsung A15', description: base.description, price: 15000, currency: 'KES',
    category: 'Phones & Tablets', subcategory: 'Phones', photo_urls: base.photos, availability: 'available', condition: 'used',
  });
});

test('website messages, in the website order', () => {
  expect(err({ photos: [] })).toBe('Add at least one real photo of the item.');
  expect(err({ description: 'short' })).toMatch(/at least 20 characters/);
  expect(err({ rulesOk: false })).toMatch(/Tick the box/);
  expect(err({ subcategory: '' })).toMatch(/what kind of item/);
  expect(err({ condition: '' })).toMatch(/Choose the condition/);
});

test('free item saves price 0; empty price = price on request', () => {
  const free = buildAd({ ...base, free: true }, 'u1');
  expect(free.ok && free.row.price).toBe(0);
  const ask = buildAd({ ...base, price: '' }, 'u1');
  expect(ask.ok && ask.row.price).toBeNull();
});

test('services: "Ask me" saves no price; "From" saves price_from', () => {
  const svc = { group: 'service' as const, category: 'Services', subcategory: 'Cleaning', condition: '' };
  expect(err({ ...svc, price: '' })).toMatch(/Add the price/);
  const ask = buildAd({ ...base, ...svc, price: '', priceMode: 'ask' }, 'u1');
  expect(ask.ok && ask.row.price).toBeNull();
  const from = buildAd({ ...base, ...svc, price: '1500', priceMode: 'from' }, 'u1');
  expect(from.ok && from.row.price_from).toBe(true);
  expect(from.ok && from.row.condition).toBeNull();
});

test('food needs an expiry date or "no expiry"', () => {
  const food = { category: 'Food & Farming', subcategory: 'Food', condition: '' };
  expect(err(food)).toMatch(/expiry date/);
  expect(err({ ...food, expiryDate: '2001-01-01' })).toMatch(/expired/);
  const ok = buildAd({ ...base, ...food, noExpiry: true }, 'u1');
  expect(ok.ok && ok.row.no_expiry).toBe(true);
});
