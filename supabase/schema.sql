-- =============================================
-- ExpertPro - Marketplace za radnike u Srbiji
-- Supabase SQL Schema
-- =============================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for search

-- =============================================
-- PROFILES (extended user data)
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  type text not null check (type in ('individual', 'company', 'agency')),
  name text not null,
  email text,
  phone text,
  city text,
  address text,
  bio text,
  avatar_url text,
  -- For individuals
  employment_status text check (employment_status in ('employed', 'student', 'unemployed', 'freelancer')),
  skills text[] default '{}',
  -- For companies/agencies
  company_name text,
  pib text, -- tax ID
  registration_number text,
  website text,
  -- Status
  is_verified boolean default false,     -- email+phone verified
  is_approved boolean default false,     -- admin approved (companies/agencies only)
  is_active boolean default true,
  -- Stats (updated via triggers)
  rating_avg numeric(3,2) default 0,
  rating_count integer default 0,
  completed_jobs integer default 0,
  -- Subscription
  subscription_tier text default 'free' check (subscription_tier in ('free', 'basic', 'pro', 'premium', 'agency_starter', 'agency_pro')),
  subscription_expires_at timestamptz,
  active_listing_count integer default 0,
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
create policy "Public profiles are viewable" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- =============================================
-- CATEGORIES
-- =============================================
create table public.categories (
  id serial primary key,
  name_sr text not null,  -- Serbian
  name_en text not null,  -- English
  icon text,
  slug text unique not null,
  parent_id integer references public.categories(id),
  sort_order integer default 0,
  is_active boolean default true
);

-- Insert default categories
insert into public.categories (name_sr, name_en, icon, slug) values
  ('Građevina i majstori', 'Construction & Handymen', '🏗️', 'gradevina'),
  ('Čišćenje i održavanje', 'Cleaning & Maintenance', '🧹', 'ciscenje'),
  ('Transport i selidbe', 'Transport & Moving', '🚛', 'transport'),
  ('Ugostiteljstvo', 'Hospitality', '🍽️', 'ugostiteljstvo'),
  ('Pomoćni radnici', 'General Labor', '👷', 'pomocni-radnici'),
  ('Magacin i logistika', 'Warehouse & Logistics', '📦', 'magacin'),
  ('Čuvanje i nega', 'Care & Babysitting', '👶', 'cuvanje'),
  ('IT i računari', 'IT & Computers', '💻', 'it'),
  ('Administracija', 'Administration', '📋', 'administracija'),
  ('Poljoprivreda', 'Agriculture', '🌾', 'poljoprivreda'),
  ('Događaji', 'Events', '🎪', 'dogadjaji'),
  ('Ostalo', 'Other', '📌', 'ostalo');

-- =============================================
-- LISTINGS (oglasi)
-- =============================================
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('offer', 'request', 'urgent')),
  -- offer = radnik nudi usluge
  -- request = firma/fizicko lice trazi radnika
  -- urgent = hitna berza (SOS)
  title text not null,
  description text,
  category_id integer references public.categories(id),
  -- Location
  city text not null,
  location_detail text, -- neighborhood, address hint
  lat numeric(10,7),
  lng numeric(10,7),
  -- Pricing
  price_type text check (price_type in ('hourly', 'daily', 'fixed', 'negotiable')),
  price_amount numeric(12,2),
  currency text default 'RSD',
  -- Availability
  available_from date,
  available_to date,
  duration_days integer, -- for urgent
  -- Status
  status text default 'active' check (status in ('active', 'filled', 'expired', 'cancelled', 'pending_review')),
  is_featured boolean default false,
  is_urgent boolean default false,
  -- Stats
  view_count integer default 0,
  application_count integer default 0,
  -- Timestamps
  expires_at timestamptz default (now() + interval '30 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.listings enable row level security;
create policy "Active listings viewable by all" on public.listings for select using (status = 'active' or auth.uid() = user_id);
create policy "Users can create listings" on public.listings for insert with check (auth.uid() = user_id);
create policy "Users can update own listings" on public.listings for update using (auth.uid() = user_id);
create policy "Users can delete own listings" on public.listings for delete using (auth.uid() = user_id);

-- Full text search index
create index listings_search_idx on public.listings using gin(to_tsvector('simple', title || ' ' || coalesce(description, '')));
create index listings_city_idx on public.listings(city);
create index listings_type_idx on public.listings(type);
create index listings_status_idx on public.listings(status);
create index listings_created_idx on public.listings(created_at desc);

-- =============================================
-- APPLICATIONS (prijave na oglas)
-- =============================================
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  applicant_id uuid references public.profiles(id) on delete cascade not null,
  message text,
  proposed_price numeric(12,2),
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz default now(),
  unique(listing_id, applicant_id)
);

alter table public.applications enable row level security;
create policy "View own applications" on public.applications for select using (
  auth.uid() = applicant_id or 
  auth.uid() = (select user_id from public.listings where id = listing_id)
);
create policy "Create applications" on public.applications for insert with check (auth.uid() = applicant_id);
create policy "Update own applications" on public.applications for update using (
  auth.uid() = applicant_id or 
  auth.uid() = (select user_id from public.listings where id = listing_id)
);

-- =============================================
-- CONVERSATIONS & MESSAGES (chat)
-- =============================================
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  participant_1_id uuid references public.profiles(id) on delete cascade not null,
  participant_2_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete set null,
  last_message_at timestamptz default now(),
  last_message_preview text,
  unread_count_1 integer default 0, -- unread for participant_1
  unread_count_2 integer default 0, -- unread for participant_2
  created_at timestamptz default now(),
  unique(participant_1_id, participant_2_id, listing_id)
);

alter table public.conversations enable row level security;
create policy "View own conversations" on public.conversations for select using (
  auth.uid() = participant_1_id or auth.uid() = participant_2_id
);
create policy "Create conversations" on public.conversations for insert with check (
  auth.uid() = participant_1_id or auth.uid() = participant_2_id
);
create policy "Update own conversations" on public.conversations for update using (
  auth.uid() = participant_1_id or auth.uid() = participant_2_id
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  -- Auto-flag potential contact info sharing (phone/email in message)
  flagged_contact_share boolean default false,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;
create policy "View messages in own conversations" on public.messages for select using (
  auth.uid() in (
    select participant_1_id from public.conversations where id = conversation_id
    union
    select participant_2_id from public.conversations where id = conversation_id
  )
);
create policy "Send messages in own conversations" on public.messages for insert with check (
  auth.uid() = sender_id and
  auth.uid() in (
    select participant_1_id from public.conversations where id = conversation_id
    union
    select participant_2_id from public.conversations where id = conversation_id
  )
);

-- =============================================
-- REVIEWS (ocene)
-- =============================================
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  reviewee_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(reviewer_id, reviewee_id, listing_id)
);

alter table public.reviews enable row level security;
create policy "Reviews are public" on public.reviews for select using (true);
create policy "Create own reviews" on public.reviews for insert with check (auth.uid() = reviewer_id);

-- Update rating on profile after review
create or replace function update_profile_rating()
returns trigger as $$
begin
  update public.profiles
  set 
    rating_avg = (select round(avg(rating)::numeric, 2) from public.reviews where reviewee_id = new.reviewee_id),
    rating_count = (select count(*) from public.reviews where reviewee_id = new.reviewee_id)
  where id = new.reviewee_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure update_profile_rating();

-- =============================================
-- NOTIFICATIONS
-- =============================================
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in (
    'new_application', 'application_accepted', 'application_rejected',
    'new_message', 'new_review', 'listing_expired', 'account_approved',
    'urgent_nearby' -- for urgent listings
  )),
  title text not null,
  body text,
  data jsonb, -- extra data like listing_id, user_id etc
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "View own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- =============================================
-- SAVED LISTINGS (sacuvani oglasi)
-- =============================================
create table public.saved_listings (
  user_id uuid references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, listing_id)
);

alter table public.saved_listings enable row level security;
create policy "Manage own saved listings" on public.saved_listings using (auth.uid() = user_id);

-- =============================================
-- ADMIN AUDIT LOG
-- =============================================
create table public.admin_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.profiles(id),
  action text not null,
  target_type text, -- 'profile', 'listing', 'message', etc
  target_id text,
  details jsonb,
  created_at timestamptz default now()
);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, type, is_approved)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'type', 'individual'),
    case 
      when coalesce(new.raw_user_meta_data->>'type', 'individual') = 'individual' then true
      else false
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-detect phone/email in messages (flag for admin review)
create or replace function flag_contact_in_message()
returns trigger as $$
begin
  if new.content ~* '\+?[0-9]{8,15}' or new.content ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' then
    new.flagged_contact_share := true;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger check_message_content
  before insert on public.messages
  for each row execute procedure flag_contact_in_message();

-- Update listing view count
create or replace function increment_view_count(listing_id uuid)
returns void as $$
  update public.listings set view_count = view_count + 1 where id = listing_id;
$$ language sql security definer;

-- =============================================
-- STORAGE BUCKETS (run these in Supabase dashboard)
-- =============================================
-- create bucket: avatars (public)
-- create bucket: documents (private - for company verification docs)

-- =============================================
-- ENABLE REALTIME (run in Supabase dashboard)
-- =============================================
-- alter publication supabase_realtime add table public.messages;
-- alter publication supabase_realtime add table public.notifications;
-- alter publication supabase_realtime add table public.conversations;

-- =============================================
-- EXTRA COLUMNS (add after initial schema creation)
-- =============================================

-- Profiles: extra fields for UI features
alter table public.profiles
  add column if not exists available boolean default true,
  add column if not exists experience_years integer,
  add column if not exists languages text[] default '{"Srpski"}',
  add column if not exists review_count integer default 0;

-- Listings: extra fields
alter table public.listings
  add column if not exists category_slug text,
  add column if not exists workers_needed integer default 1,
  add column if not exists paused boolean default false;

-- Listings: 'paused' status support (extend check constraint)
-- Note: update status check to include 'paused':
-- alter table public.listings drop constraint listings_status_check;
-- alter table public.listings add constraint listings_status_check
--   check (status in ('active', 'filled', 'expired', 'cancelled', 'pending_review', 'paused'));

-- Update rating trigger to also set review_count on profiles
create or replace function update_profile_rating()
returns trigger as $$
begin
  update public.profiles
  set
    rating_avg = (select coalesce(avg(rating), 0) from public.reviews where reviewee_id = new.reviewee_id),
    rating_count = (select count(*) from public.reviews where reviewee_id = new.reviewee_id),
    review_count = (select count(*) from public.reviews where reviewee_id = new.reviewee_id)
  where id = new.reviewee_id;
  return new;
end;
$$ language plpgsql security definer;

