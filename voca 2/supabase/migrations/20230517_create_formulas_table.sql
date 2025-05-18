-- Create a table for storing formulas
create table if not exists public.formulas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  formula text not null,
  description text,
  subject text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.formulas enable row level security;

-- Create policies for RLS
create policy "Users can view their own formulas"
  on public.formulas for select
  using (auth.uid() = user_id);

create policy "Users can insert their own formulas"
  on public.formulas for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own formulas"
  on public.formulas for update
  using (auth.uid() = user_id);

create policy "Users can delete their own formulas"
  on public.formulas for delete
  using (auth.uid() = user_id);

-- Create a function to update the updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create a trigger to update the updated_at column
create trigger handle_formula_updated_at
  before update on public.formulas
  for each row
  execute function public.handle_updated_at();

-- Create an index for faster queries
create index if not exists idx_formulas_user_id on public.formulas(user_id);
create index if not exists idx_formulas_subject on public.formulas(subject);
