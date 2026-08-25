-- Fix officer resubmission of returned applications
-- Loan officers may edit their own draft/returned files and change them to pending_supervisor when resubmitting.
alter table public.loan_applications enable row level security;

drop policy if exists "creator updates draft returned" on public.loan_applications;
drop policy if exists "loan officers can update their applications" on public.loan_applications;

create policy "loan officers can edit and resubmit applications"
on public.loan_applications
for update to authenticated
using (
  created_by = auth.uid()
  and status in ('draft','returned')
)
with check (
  created_by = auth.uid()
  and status in ('draft','returned','pending_supervisor')
);

-- Ensure officers can create new applications.
drop policy if exists "creator inserts applications" on public.loan_applications;
drop policy if exists "loan officers can create applications" on public.loan_applications;
create policy "loan officers can create applications"
on public.loan_applications
for insert to authenticated
with check (
  created_by = auth.uid()
);

-- Officers may update their own customer KYC during correction.
alter table public.customers enable row level security;
drop policy if exists "creator updates customer" on public.customers;
drop policy if exists "customer creator can update" on public.customers;
create policy "officers can update their customers"
on public.customers
for update to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- Keep a clear audit record of resubmission.
-- The application UI already writes the audit event as the authenticated officer.
