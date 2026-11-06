// Spot checks that the rules copied from the website still behave like the website.
import { MAIN_CATEGORIES, normalizeCategory, RENTAL_CATEGORY, SHARED_SUBS, subsOf } from '../categories';

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


test('categories match the website (Nov 2026): new sub-categories and shared tiles point at real ones', () => {
  expect(subsOf('Vehicles')).toContain('Trucks & buses');
  expect(subsOf('Services')).toEqual(expect.arrayContaining(['Printing & branding', 'Catering & food', 'Car services']));
  for (const list of Object.values(SHARED_SUBS)) for (const x of list) expect(subsOf(x.category)).toContain(x.sub);
});

import { awayDateProblem, isAway } from '@/core/away';
test('away mode: on until the return date, typed date checks', () => {
  const now = new Date('2026-11-05T12:00:00');
  expect(isAway({ away_since: '2026-11-01T00:00:00Z', away_until: null })).toBe(true);
  expect(isAway({ away_since: null, away_until: null })).toBe(false);
  expect(isAway({ away_since: '2026-01-01T00:00:00Z', away_until: '2026-01-02T00:00:00Z' })).toBe(false);
  expect(awayDateProblem('', now)).toBeNull();
  expect(awayDateProblem('2026-11-20', now)).toBeNull();
  expect(awayDateProblem('20-11-2026', now)).toMatch(/2027-03-31/);
  expect(awayDateProblem('2026-11-01', now)).toMatch(/tomorrow/);
  expect(awayDateProblem('2028-01-01', now)).toMatch(/one year/);
});

import { distanceKm, formatKm, snap } from '@/core/distance';
test('near me: distance, rounding to ~0.5 km, labels (website rules)', () => {
  expect(Math.round(distanceKm({ lat: -1.286, lng: 36.817 }, { lat: -4.043, lng: 39.668 }))).toBeGreaterThan(400);
  expect(snap(-1.28634)).toBe(-1.285);
  expect(formatKm(0.2)).toBe('under 0.5 km away');
  expect(formatKm(2.3)).toBe('about 2.5 km away');
  expect(formatKm(12.6)).toBe('about 13 km away');
});

import { freshDaysFor, nudgeDaysFor } from '../freshness';

describe('freshness (same rule as the website)', () => {
  it('keeps property 30 days and everything else 14, nudging a week before', () => {
    expect(freshDaysFor('Houses & Rentals')).toBe(30);
    expect(freshDaysFor('Fashion')).toBe(14);
    expect(nudgeDaysFor('Houses & Rentals')).toBe(23);
    expect(nudgeDaysFor('Fashion')).toBe(7);
  });
});
