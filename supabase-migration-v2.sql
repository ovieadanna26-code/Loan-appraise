-- Run this once AFTER supabase-schema.sql
-- Allows supervisors to review and decide applications and read customer/appraisal data.
create policy "supervisors update applications" on public.loan_applications
for update to authenticated
using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('supervisor','admin')))
with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('supervisor','admin')));

create policy "officers read own applications" on public.loan_applications
for select to authenticated
using (created_by=auth.uid() or exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('supervisor','admin')));

create policy "officers read own customers" on public.customers
for select to authenticated
using (created_by=auth.uid() or exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('supervisor','admin')));

create policy "supervisors read all audit" on public.audit_logs
for select to authenticated
using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('supervisor','admin')));
