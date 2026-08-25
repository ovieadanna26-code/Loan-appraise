-- LoanAppraise v4: officer grade + in-app notifications
alter table public.profiles add column if not exists staff_grade text;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid references public.loan_applications(id) on delete cascade,
  title text not null,
  message text not null,
  notification_type text not null default 'info',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications" on public.notifications
for select to authenticated using (user_id = auth.uid());

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications" on public.notifications
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Notify the Loan Officer whenever a Supervisor changes the application status.
create or replace function public.notify_loan_officer_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status and new.status in ('returned','approved','declined') then
    insert into public.notifications (user_id, application_id, title, message, notification_type)
    values (
      new.created_by,
      new.id,
      case new.status
        when 'returned' then 'Loan returned for correction'
        when 'approved' then 'Loan approved'
        when 'declined' then 'Loan application declined'
      end,
      case new.status
        when 'returned' then 'Application ' || new.reference || ' was returned for correction. ' || coalesce(new.supervisor_comment,'Please review the Supervisor comment.')
        when 'approved' then 'Application ' || new.reference || ' has been approved by the Supervisor.'
        when 'declined' then 'Application ' || new.reference || ' has been declined by the Supervisor. ' || coalesce(new.supervisor_comment,'See the application for details.')
      end,
      new.status::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists loan_officer_status_notification on public.loan_applications;
create trigger loan_officer_status_notification
after update of status on public.loan_applications
for each row execute function public.notify_loan_officer_status_change();
