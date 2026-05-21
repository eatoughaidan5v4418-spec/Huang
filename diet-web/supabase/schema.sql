create table if not exists public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  image_url text,
  user_description text,
  vision_text text,
  score_result jsonb,
  created_at timestamptz not null default now()
);

create index if not exists meal_entries_user_date_idx
  on public.meal_entries (user_id, meal_date desc, created_at desc);

create policy "Users can read their own meal entries"
  on public.meal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own meal entries"
  on public.meal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meal entries"
  on public.meal_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.meal_entries enable row level security;

insert into storage.buckets (id, name, public)
values ('meal-images', 'meal-images', true)
on conflict (id) do nothing;
