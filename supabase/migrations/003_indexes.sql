-- Performance indexes
create index idx_profiles_organization_id on public.profiles(organization_id);
create index idx_profiles_email            on public.profiles(email);
create index idx_profiles_role             on public.profiles(role);
create index idx_organizations_slug        on public.organizations(slug);
