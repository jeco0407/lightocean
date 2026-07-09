-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query)

create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  cat text not null check (cat in ('lightstick','phone','binocular','other')),
  icon text not null,
  label text not null,
  title text not null,
  description text,
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
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table products enable row level security;
alter table listings enable row level security;
alter table inquiries enable row level security;

-- only logged-in members can browse or list items
create policy "read products for members" on products
  for select using (auth.role() = 'authenticated');

create policy "insert products for members" on products
  for insert with check (auth.role() = 'authenticated');

create policy "read listings for members" on listings
  for select using (auth.role() = 'authenticated');

create policy "insert listings for members" on listings
  for insert with check (auth.role() = 'authenticated');

create policy "insert inquiries for members" on inquiries
  for insert with check (auth.role() = 'authenticated');

create policy "read own inquiries" on inquiries
  for select using (auth.uid() = created_by);

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
