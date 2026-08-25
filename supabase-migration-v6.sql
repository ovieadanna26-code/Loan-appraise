-- Customer live photo + signature capture
alter table public.customers add column if not exists photo_path text;
alter table public.customers add column if not exists signature_path text;
alter table public.customers add column if not exists identity_captured_at timestamptz;
alter table public.customers add column if not exists identity_captured_by uuid references auth.users(id);

-- Private storage bucket. Create it if absent.
insert into storage.buckets (id, name, public)
values ('customer-identity', 'customer-identity', false)
on conflict (id) do update set public=false;

-- Staff can upload identity evidence into customer-specific folders.
drop policy if exists "staff upload customer identity" on storage.objects;
create policy "staff upload customer identity"
on storage.objects for insert to authenticated
with check (
  bucket_id='customer-identity'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Staff can read identity evidence for customers they created; supervisors/admins can read all.
drop policy if exists "staff read customer identity" on storage.objects;
create policy "staff read customer identity"
on storage.objects for select to authenticated
using (
  bucket_id='customer-identity'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('supervisor','admin'))
  )
);

-- Staff can replace their own customer's identity files.
drop policy if exists "staff update customer identity" on storage.objects;
create policy "staff update customer identity"
on storage.objects for update to authenticated
using (bucket_id='customer-identity' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id='customer-identity' and (storage.foldername(name))[1] = auth.uid()::text);

-- Customers: officers can update customers they created; supervisors/admins can view.
drop policy if exists "customer creator updates" on public.customers;
create policy "customer creator updates"
on public.customers for update to authenticated
using (created_by=auth.uid())
with check (created_by=auth.uid());
