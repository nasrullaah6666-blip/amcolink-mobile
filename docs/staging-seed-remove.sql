-- Removes the STAGING test data added by docs/staging-seed.sql (the 3 "[TEST]" profiles and their listings).
-- STAGING ONLY. Listings are removed with their profiles.
begin;
select set_config('soko.system', 'on', true);
delete from public.shops where slug in ('test-amina-fashion', 'test-juma-electronics', 'test-hodan-homes') and name like '[TEST]%';
select set_config('soko.system', 'off', true);
select (select count(*) from public.shops where name like '[TEST]%') as test_shops_left,
       (select count(*) from public.ads where title like '[TEST]%') as test_ads_left;
commit;
