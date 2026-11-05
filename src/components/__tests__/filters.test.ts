import { filterCount, filtersFromParams, NO_FILTERS } from '@/components/FiltersButton';

test('filters from a saved search; unknown values ignored; count of active filters', () => {
  const f = filtersFromParams({ city: 'Nairobi', min: '1,000', max: '5000x', condition: 'used', verified: '1' });
  expect(f).toEqual({ city: 'Nairobi', min: '1000', max: '5000', condition: 'used', verified: true });
  expect(filterCount(f)).toBe(4);
  expect(filtersFromParams({ condition: 'broken' }).condition).toBe('');
  expect(filterCount(NO_FILTERS)).toBe(0);
});
