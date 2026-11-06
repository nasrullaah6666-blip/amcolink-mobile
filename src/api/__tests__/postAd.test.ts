import { buildAd, type AdDraft, buildAdEdit, type EditableAd } from '../postAd';

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


const saved: EditableAd = {
  id: 'a1', shop_id: 's1', title: 'Samsung A15', description: base.description, price: 15000, currency: 'KES', category: 'Phones & Tablets',
  subcategory: 'Phones', condition: 'used', photo_urls: ['https://x/storage/v1/object/public/ad-photos/u1/a.jpg', 'https://x/storage/v1/object/public/ad-photos/u1/b.jpg'],
  availability: 'available',
};
const draft = { title: saved.title, description: saved.description, price: '15000', currency: 'KES', category: saved.category, subcategory: 'Phones',
  condition: 'used', free: false, priceMode: 'from' as const, expiryDate: '', noExpiry: false, availability: 'available' as const, photos: saved.photo_urls };

test('edit: a price drop saves the new price; removed photos are listed for deletion', () => {
  const r = buildAdEdit({ ...draft, price: '12000', photos: [saved.photo_urls[0]] }, saved);
  expect(r.ok).toBe(true);
  if (r.ok) {
    expect(r.values.price).toBe(12000);
    expect(r.values.rental).toBeNull();
    expect(r.removedPhotos).toEqual([saved.photo_urls[1]]);
  }
});

test('edit: an old expiry date that was not changed is still allowed (website rule)', () => {
  const food = { ...saved, category: 'Food & Farming', subcategory: 'Food', condition: null, expiry_date: '2020-01-01' };
  const ok = buildAdEdit({ ...draft, category: 'Food & Farming', subcategory: 'Food', condition: '', expiryDate: '2020-01-01' }, food);
  expect(ok.ok).toBe(true);
  const bad = buildAdEdit({ ...draft, category: 'Food & Farming', subcategory: 'Food', condition: '', expiryDate: '2021-01-01' }, food);
  expect(bad.ok ? null : bad.error).toMatch(/expired/);
});

test('edit: at least one photo stays', () => {
  const r = buildAdEdit({ ...draft, photos: [] }, saved);
  expect(r.ok ? null : r.error).toMatch(/photo/);
});

import { buildPropertyAd } from '../postAd';

const home = { shopId: 's1', title: '2 bedroom flat in Hodan', description: 'Clean 2 bedroom flat, water included, secure compound.', price: '450', currency: 'USD', availability: 'available' as const, rulesOk: true, photos: ['https://x/p.jpg'] };
const rent = { r_type: 'apartment', r_area: 'Hodan', r_period: 'month', r_bedrooms: '2', r_furnished: 'no', r_includes_list: 'water,security' };

test('property for rent: website parseRental details, rent + deal saved', () => {
  const r = buildPropertyAd(home, 'rent', rent, 'owner', '', 'u1');
  expect(r.ok).toBe(true);
  if (r.ok) {
    expect(r.row.category).toBe('Houses & Rentals');
    expect(r.row.transaction_type).toBe('rent');
    expect(r.row.rental).toEqual({ type: 'apartment', period: 'month', bedrooms: 2, furnished: 'no', area: 'Hodan', includes: ['water', 'security'] });
    expect(r.saveRole).toBeNull();
  }
});

test('property: deal never defaulted; owner/agent asked once; land needs a size', () => {
  const e = (...a: Parameters<typeof buildPropertyAd>) => { const r = buildPropertyAd(...a); return r.ok ? null : r.error; };
  expect(e(home, '', rent, 'owner', '', 'u1')).toMatch(/For rent or For sale/);
  expect(e(home, 'rent', rent, null, '', 'u1')).toMatch(/owner or an agent/);
  const first = buildPropertyAd(home, 'rent', rent, null, 'agent', 'u1');
  expect(first.ok && first.saveRole).toBe('agent');
  expect(e(home, 'sale', { r_type: 'land', r_area: 'Daynile' }, 'owner', '', 'u1')).toMatch(/size of the plot/);
  expect(e({ ...home, price: '' }, 'sale', { r_type: 'land', r_area: 'Daynile', r_size_sqm: '400' }, 'owner', '', 'u1')).toMatch(/sale price/);
});
