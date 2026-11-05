import { cleanHours } from '../hours';
import { shopLinks } from '../links';
import { formOf, parseShopForm } from '../shop';

test('Edit profile keeps hours, links and map pin that the app does not edit', () => {
  const shop = {
    links: [{ type: 'instagram', url: 'https://instagram.com/amina' }], social_links: {}, telegram: null,
    hours: { mon: { open: '08:00', close: '19:00' } }, lat: -1.28, lng: 36.82, opening_hours: 'Closed Friday 12–2',
  };
  const r = parseShopForm(formOf({
    name: 'Amina Fashion', country: 'Kenya', region: 'Nairobi', city: 'Nairobi', phone: '0712345678', whatsapp: '',
    announcement: '', address: 'Eastleigh', building: '', floor: '', unit: '', landmark: '', description: '',
    links: JSON.stringify(shopLinks(shop)), hours: JSON.stringify(cleanHours(shop.hours)),
    opening_hours: shop.opening_hours, lat: String(shop.lat), lng: String(shop.lng),
  }));
  expect(r.ok).toBe(true);
  if (!r.ok) return;
  expect(r.values.links).toEqual(shop.links);
  expect(r.values.hours).toEqual(shop.hours);
  expect(r.values.lat).toBe(-1.28);
  expect(r.values.lng).toBe(36.82);
  expect(r.values.opening_hours).toBe('Closed Friday 12–2');
  expect(r.values.phone).toBe('+254712345678');
  expect(r.values.announcement).toBeNull();
});
