create table if not exists public.vocabulary (
  id bigserial primary key,
  word text not null,
  definition text not null
);

create table if not exists public.symbols (
  id bigserial primary key,
  symbol text not null,
  value text not null
);
