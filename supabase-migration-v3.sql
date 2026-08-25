-- Supervisor complete-file review + return/resubmission permissions
alter table public.loan_applications enable row level security;

-- Supervisors/admins may review all loan applications and make final decisions.
drop policy if exists "supervisors can review applications" on public.loan_applications;
create policy "supervisors can review applications"
on public.loan_applications
for update to authenticated
using (
  exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('supervisor','admin'))
)
with check (
  exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('supervisor','admin'))
);

-- Officers can read their own customer/application records, including returned files.
drop policy if exists "authenticated users can read applications" on public.loan_applications;
drop policy if exists "authenticated read applications" on public.loan_applications;
create policy "staff can read applications"
on public.loan_applications
for select to authenticated
using (
  created_by=auth.uid()
  or exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('supervisor','admin'))
);

-- Audit trail: all authenticated staff may read, and each user may write their own audit event.
drop policy if exists "authenticated read audit" on public.audit_logs;
create policy "staff can read audit"
on public.audit_logs
for select to authenticated using (true);

drop policy if exists "authenticated insert audit" on public.audit_logs;
create policy "staff can insert audit"
on public.audit_logs
for insert to authenticated
with check (performed_by=auth.uid());
