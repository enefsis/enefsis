-- Enable Row Level Security
alter table public.profiles      enable row level security;
alter table public.organizations enable row level security;

-- ── Profiles ──────────────────────────────────────────────────────────────────

-- Users can read their own profile
create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins can read all profiles in their org
create policy "profiles: admin read org"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.organization_id = profiles.organization_id
    )
  );

-- Users can update their own profile
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── Organizations ─────────────────────────────────────────────────────────────

-- Org members can read their organization
create policy "organizations: read own org"
  on public.organizations for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.organization_id = organizations.id
    )
  );

-- Only admins can update their organization
create policy "organizations: admin update"
  on public.organizations for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.organization_id = organizations.id
    )
  );
