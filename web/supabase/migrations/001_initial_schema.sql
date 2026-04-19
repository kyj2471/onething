-- ============================================================
-- 1. PROFILES (auth.users 확장)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  locale text default 'en',
  timezone text default 'UTC',
  subscription_status text default 'trial'
    check (subscription_status in ('trial', 'active', 'cancelled', 'expired', 'free')),
  trial_ends_at timestamptz,
  lemon_squeezy_customer_id text,
  reminder_time time default '09:00',
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_profiles_subscription_status on profiles(subscription_status);
create index idx_profiles_trial_ends_at on profiles(trial_ends_at)
  where subscription_status = 'trial';

-- ============================================================
-- 2. GOALS (유저당 active 1개 제약)
-- ============================================================
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  status text default 'active'
    check (status in ('active', 'completed', 'archived')),
  created_at timestamptz default now(),
  completed_at timestamptz
);

create unique index one_active_goal_per_user
  on goals(user_id)
  where status = 'active';

create index idx_goals_user_id on goals(user_id);
create index idx_goals_user_status on goals(user_id, status);

-- ============================================================
-- 3. TARGETS (수치 필수)
-- ============================================================
create table targets (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals(id) on delete cascade not null,
  title text not null,
  target_value numeric not null check (target_value > 0),
  current_value numeric default 0 check (current_value >= 0),
  unit text,
  order_index integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_targets_goal_id on targets(goal_id);
create index idx_targets_goal_order on targets(goal_id, order_index);

-- ============================================================
-- 4. ACTIONS
-- ============================================================
create table actions (
  id uuid primary key default gen_random_uuid(),
  target_id uuid references targets(id) on delete cascade not null,
  title text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index idx_actions_target_id on actions(target_id);
create index idx_actions_active on actions(target_id)
  where is_active = true;

-- ============================================================
-- 5. ACTION_LOGS
-- ============================================================
create table action_logs (
  id uuid primary key default gen_random_uuid(),
  action_id uuid references actions(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  completed_date date not null,
  completed_at timestamptz default now()
);

create unique index idx_action_logs_unique
  on action_logs(action_id, completed_date);

create index idx_action_logs_user_date
  on action_logs(user_id, completed_date desc);

create index idx_action_logs_date_user
  on action_logs(completed_date desc, user_id);

-- ============================================================
-- 6. SUBSCRIPTIONS
-- ============================================================
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  source text not null default 'web'
    check (source in ('web', 'ios', 'android')),
  lemon_squeezy_subscription_id text unique,
  plan text check (plan in ('monthly', 'annual')),
  status text check (status in ('trialing', 'active', 'cancelled', 'expired', 'past_due')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_subscriptions_user on subscriptions(user_id);
create index idx_subscriptions_status on subscriptions(user_id, status);
create index idx_subscriptions_lemon on subscriptions(lemon_squeezy_subscription_id);

-- ============================================================
-- 7. DELETION_REQUESTS (GDPR)
-- ============================================================
create table deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  email text not null,
  status text default 'pending'
    check (status in ('pending', 'processing', 'completed')),
  requested_at timestamptz default now(),
  completed_at timestamptz
);

-- ============================================================
-- 8. updated_at 트리거
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger targets_updated_at
  before update on targets
  for each row execute function update_updated_at();

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_updated_at();

-- ============================================================
-- 9. 프로필 자동 생성
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, trial_ends_at)
  values (new.id, new.email, now() + interval '14 days');
  return new;
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant insert, select on public.profiles to supabase_auth_admin;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 10. RLS
-- ============================================================
alter table profiles enable row level security;
alter table goals enable row level security;
alter table targets enable row level security;
alter table actions enable row level security;
alter table action_logs enable row level security;
alter table subscriptions enable row level security;
alter table deletion_requests enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can CRUD own goals"
  on goals for all using (auth.uid() = user_id);

create policy "Users can CRUD own targets"
  on targets for all using (
    goal_id in (select id from goals where user_id = auth.uid())
  );

create policy "Users can CRUD own actions"
  on actions for all using (
    target_id in (
      select t.id from targets t
      join goals g on t.goal_id = g.id
      where g.user_id = auth.uid()
    )
  );

create policy "Users can CRUD own action_logs"
  on action_logs for all using (auth.uid() = user_id);

create policy "Users can view own subscriptions"
  on subscriptions for select using (auth.uid() = user_id);

create policy "Users can create own deletion requests"
  on deletion_requests for insert with check (auth.uid() = user_id);
create policy "Users can view own deletion requests"
  on deletion_requests for select using (auth.uid() = user_id);

-- ============================================================
-- 11. RPC 함수
-- ============================================================

-- 잔디 데이터
create or replace function get_heatmap_data(
  p_user_id uuid,
  p_days integer default 365
)
returns table (
  completed_date date,
  completed_count bigint,
  total_actions bigint,
  completion_rate numeric
) as $$
begin
  return query
  with date_range as (
    select generate_series(
      current_date - (p_days - 1),
      current_date,
      '1 day'::interval
    )::date as d
  ),
  daily_totals as (
    select count(*) as total
    from actions a
    join targets t on a.target_id = t.id
    join goals g on t.goal_id = g.id
    where g.user_id = p_user_id
      and g.status = 'active'
      and a.is_active = true
  ),
  daily_completions as (
    select
      al.completed_date as d,
      count(*) as cnt
    from action_logs al
    where al.user_id = p_user_id
      and al.completed_date >= current_date - (p_days - 1)
    group by al.completed_date
  )
  select
    dr.d,
    coalesce(dc.cnt, 0),
    dt.total,
    case when dt.total > 0
      then round(coalesce(dc.cnt, 0)::numeric / dt.total * 100, 1)
      else 0
    end
  from date_range dr
  cross join daily_totals dt
  left join daily_completions dc on dr.d = dc.d
  order by dr.d;
end;
$$ language plpgsql security definer;

-- streak
create or replace function get_streak(p_user_id uuid)
returns integer as $$
declare
  streak integer := 0;
  check_date date := current_date;
  has_log boolean;
begin
  loop
    select exists(
      select 1 from action_logs
      where user_id = p_user_id and completed_date = check_date
    ) into has_log;

    if not has_log then
      if check_date = current_date then
        check_date := check_date - 1;
        continue;
      else
        exit;
      end if;
    end if;

    streak := streak + 1;
    check_date := check_date - 1;
  end loop;

  return streak;
end;
$$ language plpgsql security definer;

-- Goal 진행률
create or replace function get_goal_progress(p_goal_id uuid)
returns numeric as $$
declare
  avg_progress numeric;
begin
  select coalesce(
    avg(
      least(
        case when target_value > 0
          then (current_value / target_value) * 100
          else 0
        end,
        100
      )
    ),
    0
  ) into avg_progress
  from targets
  where goal_id = p_goal_id;

  return round(avg_progress, 1);
end;
$$ language plpgsql security definer;
