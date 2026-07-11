-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query)

create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  cat text not null check (cat in ('lightstick','phone','binocular','other')),
  icon text not null,
  label text not null,
  title text not null,
  description text,
  image_url text, -- reference photo of the device model, shown when no listing photo is set
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  region text not null,
  price integer not null,
  deposit integer not null,
  meta text,
  contact text not null,
  image_url text, -- real photo of the lender's actual item
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  name text not null,
  contact text not null,
  wanted_date date,
  message text,
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar text, -- public URL of the uploaded avatar image (see avatars storage bucket below)
  home_region text,
  birth_date date,
  gender text,
  bio text, -- optional self-introduction, shown on the public lender profile page
  is_admin boolean not null default false, -- can edit shared product catalog photos
  updated_at timestamptz not null default now()
);

alter table products enable row level security;
alter table listings enable row level security;
alter table inquiries enable row level security;
alter table profiles enable row level security;

create policy "read own profile" on profiles
  for select using (auth.uid() = id);

create policy "insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "update own profile" on profiles
  for update using (auth.uid() = id);

-- avatar image uploads: stored at avatars/<user_id>/avatar, public read, owner-only write
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar images are publicly readable" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "members can upload their own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "members can update their own avatar" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "members can delete their own avatar" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- product/listing photo uploads: stored at photos/<user_id>/products|listings/<name>, public read, owner-only write
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "photos are publicly readable" on storage.objects
  for select using (bucket_id = 'photos');

create policy "members can upload their own photos" on storage.objects
  for insert with check (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "members can update their own photos" on storage.objects
  for update using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "members can delete their own photos" on storage.objects
  for delete using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- anyone can browse; only logged-in members can list items or send inquiries
create policy "public read products" on products
  for select using (true);

create policy "insert products for members" on products
  for insert with check (auth.role() = 'authenticated' and created_by = auth.uid());

-- lets any member set/replace a reference photo for products no one has claimed
-- (created_by is null, e.g. the seed catalog), otherwise only the product's own creator can update it
-- product reference photos are a shared catalog asset, so only site admins may edit them
-- (regular members would otherwise be able to overwrite official product photos)
create policy "admin can update product photo" on products
  for update using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  ) with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

create policy "public read listings" on listings
  for select using (true);

create policy "insert listings for members" on listings
  for insert with check (auth.role() = 'authenticated' and created_by = auth.uid());

create policy "delete own listings" on listings
  for delete using (auth.uid() = created_by);

create policy "insert inquiries for members" on inquiries
  for insert with check (auth.role() = 'authenticated' and created_by = auth.uid());

-- a member can see inquiries they sent, and inquiries sent about their own listings
create policy "read own or received inquiries" on inquiries
  for select using (
    auth.uid() = created_by
    or auth.uid() = (select created_by from listings where listings.id = inquiries.listing_id)
  );

-- only the listing owner can move an inquiry through the conversion funnel
-- (pending → confirmed/cancelled → completed), so we can later measure conversion rate
create policy "listing owner can update inquiry status" on inquiries
  for update using (
    auth.uid() = (select created_by from listings where listings.id = inquiries.listing_id)
  ) with check (
    auth.uid() = (select created_by from listings where listings.id = inquiries.listing_id)
  );

-- seed sample data (same demo listings the site launched with)
insert into products (cat, icon, label, title, description) values
('lightstick','🩷','LIGHTSTICK','ARMY BOMB Ver.4 SE 官方手燈','BTS 官方應援手燈,支援中控連動。'),
('lightstick','🖤','LIGHTSTICK','BLACKPINK 官方手燈 Ver.2(槌槌棒)','BLACKPINK 官方應援手燈。'),
('lightstick','💚','LIGHTSTICK','NCT 官方手燈 Ver.2','NCT 官方應援手燈。'),
('phone','📱','PHONE','iPhone 16 Pro Max 256G(拍攝用)','高畫質演唱會拍攝用手機。'),
('phone','📱','PHONE','Galaxy S25 Ultra 10 倍光學變焦','長焦拍攝首選,適合遠距離座位。'),
('binocular','🔭','BINOCULAR','Nikon ACULON 10x21 演唱會望遠鏡','輕便型演唱會望遠鏡。'),
('binocular','🔭','BINOCULAR','Vixen 6x21 防手震 山頂位救星','防手震設計,適合山頂視角。'),
('other','📸','SUPPORT','GoPro 13 + 胸掛(場外應援記錄)','場外應援側錄裝備。');

insert into listings (product_id, region, price, deposit, meta, contact)
select id, '台北市', 350, 1500, '台北面交/店到店・可解綁定', 'IG @fan_taipei' from products where title='ARMY BOMB Ver.4 SE 官方手燈'
union all
select id, '台中市', 330, 1400, '台中高鐵站面交・已解綁定', 'LINE ID: lightfan_tc' from products where title='ARMY BOMB Ver.4 SE 官方手燈'
union all
select id, '高雄市', 300, 1200, '高雄面交優先・附電池', 'IG @pink_lover_kh' from products where title='BLACKPINK 官方手燈 Ver.2(槌槌棒)'
union all
select id, '台中市', 320, 1300, '台中高鐵站面交', 'LINE ID: nct_zen' from products where title='NCT 官方手燈 Ver.2'
union all
select id, '台北市', 1200, 15000, '限雙證件・已重置', 'Email: phone.rental@example.com' from products where title='iPhone 16 Pro Max 256G(拍攝用)'
union all
select id, '高雄市', 1100, 15000, '高雄面交・附三腳架轉接', 'IG @s25_rental' from products where title='Galaxy S25 Ultra 10 倍光學變焦'
union all
select id, '高雄市', 150, 800, '可店到店・附收納袋', 'LINE ID: nikon_lover' from products where title='Nikon ACULON 10x21 演唱會望遠鏡'
union all
select id, '新北市', 400, 2000, '板橋面交', 'IG @vixen_binoc' from products where title='Vixen 6x21 防手震 山頂位救星'
union all
select id, '台中市', 600, 6000, '限面交', 'IG @gopro_support' from products where title='GoPro 13 + 胸掛(場外應援記錄)';

-- additional popular lightsticks (added later, run only this block on an already-seeded DB)
insert into products (cat, icon, label, title, description) values
('lightstick','💎','LIGHTSTICK','SEVENTEEN CARAT BONG Ver.4','SEVENTEEN 官方應援手燈,支援藍牙 App 連動。'),
('lightstick','⚡','LIGHTSTICK','Stray Kids 官方手燈 Ver.3','Stray Kids 官方應援手燈。'),
('lightstick','🍬','LIGHTSTICK','TWICE Candy Bong ▂','TWICE 官方應援手燈,糖果造型設計。');

insert into listings (product_id, region, price, deposit, meta, contact)
select id, '台北市', 340, 1500, '台北面交・已解綁定', 'IG @carat_rental' from products where title='SEVENTEEN CARAT BONG Ver.4'
union all
select id, '高雄市', 320, 1400, '高雄面交/店到店', 'LINE ID: stay_kh' from products where title='Stray Kids 官方手燈 Ver.3'
union all
select id, '台中市', 300, 1300, '台中高鐵站面交・附電池', 'IG @once_tc' from products where title='TWICE Candy Bong ▂';

-- more artists (added later, run only this block on an already-seeded DB)
insert into products (cat, icon, label, title, description) values
('lightstick','🕯️','LIGHTSTICK','IU UAENA BONG Ver.3','IU 官方應援手燈。'),
('lightstick','✨','LIGHTSTICK','NMIXX 官方手燈','NMIXX 官方應援手燈。'),
('lightstick','🍼','LIGHTSTICK','BABYMONSTER 官方手燈','BABYMONSTER 官方應援手燈。'),
('lightstick','🥂','LIGHTSTICK','GOT7 乾杯棒(官方手燈)','GOT7 官方應援手燈,杯型設計。');

insert into listings (product_id, region, price, deposit, meta, contact)
select id, '台北市', 330, 1500, '台北面交・已解綁定', 'IG @uaena_rental' from products where title='IU UAENA BONG Ver.3'
union all
select id, '新北市', 310, 1300, '新北面交', 'LINE ID: nswer_nb' from products where title='NMIXX 官方手燈'
union all
select id, '高雄市', 300, 1300, '高雄面交/店到店', 'IG @monstiez_kh' from products where title='BABYMONSTER 官方手燈'
union all
select id, '台中市', 320, 1400, '台中高鐵站面交・附電池', 'IG @igot7_tc' from products where title='GOT7 乾杯棒(官方手燈)';

-- ---------- lender public profile page support ----------
-- profiles has RLS restricting select to "own row only", so a public lender profile
-- page can't read another member's row directly. These views expose only the
-- safe-to-show subset (never birth_date/gender/is_admin), and being plain views
-- owned by the migration-running role, they read the base tables with that
-- role's privileges rather than the querying visitor's — bypassing RLS by design,
-- while only ever surfacing columns explicitly listed here.
create or replace view public_profiles as
  select id, display_name, avatar, home_region, bio from profiles;

create or replace view lender_completed_counts as
  select l.created_by as lender_id, count(*) as completed_count
  from inquiries i
  join listings l on l.id = i.listing_id
  where i.status = 'completed' and l.created_by is not null
  group by l.created_by;

grant select on public_profiles to anon, authenticated;
grant select on lender_completed_counts to anon, authenticated;

-- ---------- inquiry email notification ----------
-- Fires when a new inquiry is created; emails the listing owner via Resend
-- (https://resend.com) so they don't have to manually check /mine.html.
-- Uses pg_net for outbound HTTP from Postgres (async, doesn't block the insert).
-- The Resend API key is embedded directly in the function body — acceptable here
-- since only the project owner has SQL Editor access; nothing client-facing
-- ever sees it. Sender is the Resend sandbox domain onboarding@resend.dev,
-- which works without domain verification (note: NOT onboarding@resend.com —
-- that's Resend's own domain and returns 403 "domain not verified").
create extension if not exists pg_net;

create or replace function notify_new_inquiry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lender_email text;
  v_lender_id uuid;
  v_product_title text;
  v_region text;
begin
  select l.created_by, p.title, l.region
    into v_lender_id, v_product_title, v_region
  from listings l
  join products p on p.id = l.product_id
  where l.id = new.listing_id;

  if v_lender_id is null then
    return new;
  end if;

  select email into v_lender_email from auth.users where id = v_lender_id;

  if v_lender_email is null then
    return new;
  end if;

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer RESEND_API_KEY_HERE',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'LUMEET 光遇 <onboarding@resend.dev>',
      'to', jsonb_build_array(v_lender_email),
      'subject', '你的刊登「' || v_product_title || '」收到新的租借詢問',
      'html',
        '<p>哈囉,你在 LUMEET 光遇刊登的「' || v_product_title || '」(' || v_region || ')收到一筆新的租借詢問。</p>' ||
        '<p>詢問人:' || new.name || '<br>聯絡方式:' || new.contact ||
        case when new.wanted_date is not null then '<br>想租日期:' || new.wanted_date::text else '' end ||
        case when new.message is not null and new.message <> '' then '<br>留言:' || new.message else '' end ||
        '</p><p><a href="https://lumeet.vercel.app/mine.html">前往查看並回覆</a></p>'
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_new_inquiry on inquiries;
create trigger trg_notify_new_inquiry
  after insert on inquiries
  for each row
  execute function notify_new_inquiry();
