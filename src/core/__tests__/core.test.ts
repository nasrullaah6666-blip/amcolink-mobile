// Spot checks that the rules copied from the website still behave like the website.
import { MAIN_CATEGORIES, normalizeCategory, RENTAL_CATEGORY } from '../categories';

test('10 main categories, Services included, like the website', () => {
  expect(MAIN_CATEGORIES).toHaveLength(10);
  expect(MAIN_CATEGORIES.map((c) => c.name)).toContain('Services');
  expect(RENTAL_CATEGORY).toBe('Houses & Rentals');
});

test('old category names map to the new ones', () => {
  expect(normalizeCategory("Men's Clothing")).toEqual({ category: 'Fashion', sub: 'Men' });
  expect(normalizeCategory('Phones & Accessories')).toEqual({ category: 'Phones & Tablets', sub: '' });
  expect(normalizeCategory('Not a category')).toBeNull();
});

test('every category slug is unique', () => {
  const slugs = MAIN_CATEGORIES.map((c) => c.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
});

import { SHARED_SUBS, subsOf } from '../categories';

test('categories match the website (Nov 2026): new sub-categories and shared tiles point at real ones', () => {
  expect(subsOf('Vehicles')).toContain('Trucks & buses');
  expect(subsOf('Services')).toEqual(expect.arrayContaining(['Printing & branding', 'Catering & food', 'Car services']));
  for (const list of Object.values(SHARED_SUBS)) for (const x of list) expect(subsOf(x.category)).toContain(x.sub);
});
