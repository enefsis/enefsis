-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Enums
create type public.user_role as enum ('admin', 'manager', 'user');
create type public.plan_type as enum ('free', 'pro', 'enterprise');

-- Organizations table
create table public.organizations (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  name        text not null,
  slug        text not null unique,
  logo_url    text,
  plan        public.plan_type not null default 'free'
);

-- Profiles table (extends auth.users)
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  email           text not null unique,
  full_name       text,
  avatar_url      text,
  role            public.user_role not null default 'user',
  organization_id uuid references public.organizations(id) on delete set null
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
