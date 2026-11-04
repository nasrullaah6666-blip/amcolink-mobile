-- AMCOLINK STAGING TEST DATA — run on the STAGING project ONLY (ckhoycpsjftavuqxxnss).
-- Adds 3 test seller profiles and 12 test listings so the app's lists, listing pages and shop pages can be tested.
-- Owner of the test data: the existing staging test account nasrullaah6666@gmail.com.
-- Safe: it stops by itself if the project already has real data (more than 20 shops), and everything it adds
-- has "[TEST]" in the name so it is easy to find. Remove it later with docs/staging-seed-remove.sql.
-- Photos are random sample pictures from picsum.photos (staging only, never on production).

begin;

do $guard$
declare n int;
begin
  select count(*) into n from public.shops;
  if n > 20 then
    raise exception 'STOP: this project has % shops. This script is for the empty STAGING project only.', n;
  end if;
  if not exists (select 1 from auth.users where email = 'nasrullaah6666@gmail.com') then
    raise exception 'STOP: the staging test account nasrullaah6666@gmail.com was not found.';
  end if;
end
$guard$;

-- Lets this one transaction add test rows directly (the same switch the database's own functions use).
select set_config('soko.system', 'on', true);

with owner as (select id from auth.users where email = 'nasrullaah6666@gmail.com' limit 1),
new_shops as (
  insert into public.shops (owner_id, slug, name, description, country, region, city, address, landmark, phone, whatsapp, status, is_verified, hours, kind, property_role)
  select owner.id, s.slug, s.name, s.descr, s.country, s.region, s.city, s.address, s.landmark, s.phone, s.phone, 'approved', s.verified, s.hours::jsonb,
         case when s.slug = 'test-hodan-homes' then 'property' else 'shop' end, case when s.slug = 'test-hodan-homes' then 'owner' else null end
  from owner, (values
    ('test-amina-fashion', '[TEST] Amina Fashion', 'Dresses, abayas and shoes for women and kids.', 'Kenya', 'Nairobi', 'Nairobi', 'Eastleigh, 1st Avenue', 'Next to Garissa Lodge', '+254712345678', true,
      '{"mon":{"open":"08:00","close":"19:00"},"tue":{"open":"08:00","close":"19:00"},"wed":{"open":"08:00","close":"19:00"},"thu":{"open":"08:00","close":"19:00"},"fri":{"open":"14:00","close":"19:00"},"sat":{"open":"08:00","close":"19:00"}}'),
    ('test-juma-electronics', '[TEST] Juma Electronics', 'Phones, laptops and TVs. Repairs too.', 'Kenya', 'Mombasa', 'Mombasa', 'Biashara Street', null, '+254723456789', false, '{}'),
    ('test-hodan-homes', '[TEST] Hodan Homes', 'Houses and apartments for rent and sale in Mogadishu.', 'Somalia', 'Banadir', 'Mogadishu', 'Hodan district', 'Near KM4', '+252615123456', false, '{}')
  ) as s(slug, name, descr, country, region, city, address, landmark, phone, verified, hours)
  on conflict (slug) do nothing
  returning id, slug, owner_id
)
insert into public.ads (shop_id, owner_id, title, description, price, currency, category, subcategory, condition, photo_urls, availability,
                        status, confirmed_at, previous_price, price_dropped_at, transaction_type, rental, price_from)
select sh.id, sh.owner_id, a.title, a.descr, a.price, a.cur, a.cat, a.sub, a.cond,
       array['https://picsum.photos/seed/' || a.pic || '/1200/900', 'https://picsum.photos/seed/' || a.pic || 'b/1200/900'],
       a.avail, 'published', now() - (a.age || ' days')::interval, a.prev, case when a.prev is null then null else now() - interval '1 day' end,
       a.deal, a.rental::jsonb, a.pfrom
from new_shops sh
join (values
  ('test-amina-fashion', '[TEST] Black abaya, size M', 'Soft black abaya, size M, worn twice. Clean, no marks.', 2500, 'KES', 'Fashion', 'Women', 'used', 'amc1', 'available', 1, null, null, null, false),
  ('test-amina-fashion', '[TEST] Kids school shoes', 'Brand new black school shoes, sizes 28 to 35 in stock.', 1200, 'KES', 'Fashion', 'Kids', 'new', 'amc2', 'available', 0, 1800, null, null, false),
  ('test-amina-fashion', '[TEST] Baby clothes bundle (free)', 'Bag of baby clothes 0–6 months, clean. Free to a family that needs them.', 0, 'KES', 'Fashion', 'Kids', 'used', 'amc3', 'available', 2, null, null, null, false),
  ('test-amina-fashion', '[TEST] Henna and hair styling', 'Bridal henna, hair braiding and styling. Home visits in Eastleigh.', 1500, 'KES', 'Services', 'Beauty & hair', null, 'amc4', 'available', 1, null, null, null, true),
  ('test-juma-electronics', '[TEST] Samsung Galaxy A15, 128 GB', 'Samsung A15, 128 GB, 6 months old, with box and charger. No scratches.', 15000, 'KES', 'Phones & Tablets', 'Phones', 'used', 'amc5', 'available', 0, null, null, null, false),
  ('test-juma-electronics', '[TEST] HP laptop, Core i5, 8 GB', 'HP ProBook, Core i5, 8 GB RAM, 256 GB SSD. Refurbished, 3 months warranty.', 32000, 'KES', 'Electronics', 'Laptops & computers', 'refurbished', 'amc6', 'reserved', 3, null, null, null, false),
  ('test-juma-electronics', '[TEST] 43 inch Smart TV', 'New 43 inch smart TV with Netflix and YouTube. Delivery in Mombasa town.', 28000, 'KES', 'Electronics', 'TVs', 'new', 'amc7', 'available', 0, 42000, null, null, false),
  ('test-juma-electronics', '[TEST] Phone screen repair', 'Screen replacement for Samsung, Tecno, Infinix and iPhone. Same day.', 2000, 'KES', 'Services', 'Repairs & technicians', null, 'amc8', 'available', 0, null, null, null, true),
  ('test-hodan-homes', '[TEST] 2 bedroom apartment for rent, Hodan', 'Clean 2 bedroom apartment, water and electricity included, 3rd floor, secure compound.', 450, 'USD', 'Houses & Rentals', null, null, 'amc9', 'available', 1, null, 'rent',
     '{"type":"apartment","bedrooms":2,"bathrooms":2,"period":"month","furnished":"no","area":"Hodan","agent_fee":"none","lister":"owner"}', false),
  ('test-hodan-homes', '[TEST] Single room for rent near KM4', 'Single room with shared bathroom, near KM4. Good for a student or worker.', 120, 'USD', 'Houses & Rentals', null, null, 'amc10', 'available', 2, null, 'rent',
     '{"type":"room","bedrooms":1,"bathrooms":1,"period":"month","furnished":"partly","area":"KM4","agent_fee":"none","lister":"owner"}', false),
  ('test-hodan-homes', '[TEST] Villa for sale, Wadajir', '4 bedroom villa with garden and parking. Title deed available for checking.', 180000, 'USD', 'Houses & Rentals', null, null, 'amc11', 'available', 0, null, 'sale',
     '{"type":"house","bedrooms":4,"bathrooms":3,"size_sqm":450,"area":"Wadajir","lister":"owner"}', false),
  ('test-hodan-homes', '[TEST] Plot of land for sale, Daynile', '20 by 20 metre plot in Daynile, near the main road.', 25000, 'USD', 'Houses & Rentals', null, null, 'amc12', 'available', 4, null, 'sale',
     '{"type":"land","size_sqm":400,"area":"Daynile","lister":"owner"}', false)
) as a(slug, title, descr, price, cur, cat, sub, cond, pic, avail, age, prev, deal, rental, pfrom) on a.slug = sh.slug;

select set_config('soko.system', 'off', true);

-- Expected result: 3 shops, 12 ads.
select (select count(*) from public.shops where name like '[TEST]%') as test_shops,
       (select count(*) from public.ads where title like '[TEST]%') as test_ads;

commit;
