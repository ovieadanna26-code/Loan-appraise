-- LoanAppraise Supabase schema
create extension if not exists "uuid-ossp";

create type public.user_role as enum ('officer','supervisor','admin');
create type public.loan_status as enum ('draft','pending_supervisor','approved','declined','returned');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'officer',
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  date_of_birth date,
  gender text,
  marital_status text,
  phone text not null,
  email text,
  nin text,
  bvn text,
  residential_address text,
  employment_type text,
  employer_or_business text,
  job_or_business_type text,
  monthly_income numeric(18,2) default 0,
  monthly_expenses numeric(18,2) default 0,
  next_of_kin jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.loan_applications (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  loan_type text not null,
  product text not null,
  purpose text,
  amount numeric(18,2) not null,
  tenure integer not null,
  annual_rate numeric(8,3) not null,
  existing_monthly_debt numeric(18,2) default 0,
  collateral_description text,
  collateral_value numeric(18,2) default 0,
  guarantor_name text,
  guarantor_phone text,
  recommended_amount numeric(18,2) default 0,
  monthly_repayment numeric(18,2) default 0,
  available_cash_flow numeric(18,2) default 0,
  appraisal_score integer default 0,
  appraisal_decision text,
  appraisal_notes text,
  status public.loan_status not null default 'draft',
  created_by uuid not null references public.profiles(id),
  appraised_by uuid references public.profiles(id),
  supervisor_id uuid references public.profiles(id),
  supervisor_comment text,
  created_at timestamptz not null default now(),
  appraised_at timestamptz,
  final_decision_at timestamptz
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  application_id uuid references public.loan_applications(id) on delete cascade,
  action text not null,
  comment text,
  performed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.loan_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications(id) on delete cascade,
  document_type text not null,
  file_path text not null,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.loan_applications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.loan_documents enable row level security;

create policy "authenticated users read profiles" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid()=id);

create policy "authenticated read customers" on public.customers for select to authenticated using (true);
create policy "officers insert customers" on public.customers for insert to authenticated with check (auth.uid()=created_by);
create policy "creator updates customer" on public.customers for update to authenticated using (auth.uid()=created_by);

create policy "authenticated read applications" on public.loan_applications for select to authenticated using (true);
create policy "creator inserts applications" on public.loan_applications for insert to authenticated with check (auth.uid()=created_by);
create policy "creator updates draft returned" on public.loan_applications for update to authenticated using (auth.uid()=created_by and status in ('draft','returned'));

create policy "authenticated read audit" on public.audit_logs for select to authenticated using (true);
create policy "authenticated insert audit" on public.audit_logs for insert to authenticated with check (performed_by=auth.uid());

create policy "authenticated read documents" on public.loan_documents for select to authenticated using (true);
create policy "authenticated insert documents" on public.loan_documents for insert to authenticated with check (uploaded_by=auth.uid());

-- Create a private Storage bucket named loan-documents in the Supabase dashboard.
-- Add Storage policies so authenticated users can upload and read only documents permitted by your organisation's rules.
