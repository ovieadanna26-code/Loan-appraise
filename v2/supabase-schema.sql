-- LoanAppraise 2.0 core data model
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  nin text,
  bvn text,
  residential_address text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.loan_applications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  loan_officer_id uuid not null references auth.users(id),
  status text not null default 'draft' check (status in ('draft','submitted','under_review','returned','supervisor_approved','final_approved','approved_for_disbursement','disbursed','active','declined','closed')),
  requested_amount numeric(18,2) not null default 0,
  supervisor_approved_amount numeric(18,2),
  final_approved_amount numeric(18,2),
  disbursed_amount numeric(18,2),
  loan_product text,
  purpose text,
  tenure_months integer,
  annual_rate numeric(8,4),
  business_name text,
  business_type text,
  years_in_business numeric(8,2),
  average_daily_sales numeric(18,2) default 0,
  business_days numeric(8,2) default 0,
  monthly_sales numeric(18,2) generated always as (average_daily_sales * business_days) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loan_financials (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique not null references public.loan_applications(id) on delete cascade,
  monthly_purchases numeric(18,2) default 0,
  rent numeric(18,2) default 0,
  salaries numeric(18,2) default 0,
  utilities numeric(18,2) default 0,
  transport numeric(18,2) default 0,
  other_business_expenses numeric(18,2) default 0,
  equipment_value numeric(18,2) default 0,
  vehicle_value numeric(18,2) default 0,
  property_value numeric(18,2) default 0,
  other_assets numeric(18,2) default 0,
  cash_at_hand numeric(18,2) default 0,
  bank_balance numeric(18,2) default 0,
  accounts_receivable numeric(18,2) default 0,
  supplier_liabilities numeric(18,2) default 0,
  bank_loans numeric(18,2) default 0,
  other_borrowings numeric(18,2) default 0,
  other_liabilities numeric(18,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loan_products (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications(id) on delete cascade,
  name text,
  cost_price numeric(18,2) default 0,
  selling_price numeric(18,2) default 0,
  quantity numeric(18,2) default 0,
  gross_profit numeric(18,2) generated always as ((selling_price-cost_price)*quantity) stored,
  margin_percent numeric(10,4) generated always as (case when selling_price > 0 then ((selling_price-cost_price)/selling_price)*100 else 0 end) stored
);

create table if not exists public.loan_collateral (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique not null references public.loan_applications(id) on delete cascade,
  collateral_type text,
  owner_name text,
  description text,
  location text,
  market_value numeric(18,2) default 0,
  forced_sale_value numeric(18,2) default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.loan_decisions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.loan_applications(id) on delete cascade,
  actor_id uuid references auth.users(id),
  actor_role text not null,
  decision text not null,
  approved_amount numeric(18,2),
  comments text,
  created_at timestamptz not null default now()
);

create table if not exists public.loan_disbursements (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique not null references public.loan_applications(id),
  amount numeric(18,2) not null,
  disbursed_at timestamptz not null default now(),
  reference text,
  created_by uuid references auth.users(id)
);

create index if not exists loan_applications_officer_idx on public.loan_applications(loan_officer_id);
create index if not exists loan_applications_status_idx on public.loan_applications(status);
create index if not exists loan_applications_customer_idx on public.loan_applications(customer_id);

-- RLS is enabled now; policies should be added after confirming the project's existing auth/profile tables.
alter table public.customers enable row level security;
alter table public.loan_applications enable row level security;
alter table public.loan_financials enable row level security;
alter table public.loan_products enable row level security;
alter table public.loan_collateral enable row level security;
alter table public.loan_decisions enable row level security;
alter table public.loan_disbursements enable row level security;
