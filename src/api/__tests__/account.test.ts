import { noticeTarget } from '../account';

test('notification links: only our own site; app screens when the app has them', () => {
  expect(noticeTarget(null)).toBeNull();
  expect(noticeTarget('https://evil.example/x')).toBeNull();
  expect(noticeTarget('//evil.example')).toBeNull();
  expect(noticeTarget('/ads/123e4567-e89b-12d3-a456-426614174000')).toEqual({ app: { pathname: '/ads/[id]', params: { id: '123e4567-e89b-12d3-a456-426614174000' } } });
  expect(noticeTarget('/shops/amina-fashion-x1y2')).toEqual({ app: { pathname: '/shops/[slug]', params: { slug: 'amina-fashion-x1y2' } } });
  expect(noticeTarget('/dashboard?acct=1')).toEqual({ app: { pathname: '/dashboard', params: {} } });
  expect(noticeTarget('/wanted')).toEqual({ web: '/wanted' });
});
