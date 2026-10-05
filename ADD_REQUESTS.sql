-- Run once in Supabase → SQL Editor.
-- "Wanted" board: a neighbour posts what they're looking for; others reply.

create table if not exists public.item_requests (
  id            uuid primary key default gen_random_uuid(),
  requester_id  uuid not null references public.profiles(id) on delete cascade,
  community_id  uuid references public.communities(id),
  title         text not null,
  description   text,
  category      item_category,
  days_needed   int,
  status        text not null default 'open' check (status in ('open','closed')),
  created_at    timestamptz not null default now()
);
create index if not exists item_requests_community_idx on public.item_requests(community_id, status);

create table if not exists public.request_replies (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null references public.item_requests(id) on delete cascade,
  responder_id  uuid not null references public.profiles(id) on delete cascade,
  body          text not null,
  created_at    timestamptz not null default now()
);
create index if not exists request_replies_request_idx on public.request_replies(request_id, created_at);

alter table public.item_requests  enable row level security;
alter table public.request_replies enable row level security;

-- Requests: anyone signed in can read; you manage your own.
drop policy if exists item_requests_read on public.item_requests;
create policy item_requests_read on public.item_requests
  for select to anon, authenticated using (true);
drop policy if exists item_requests_insert on public.item_requests;
create policy item_requests_insert on public.item_requests
  for insert to authenticated with check (requester_id = auth.uid());
drop policy if exists item_requests_update on public.item_requests;
create policy item_requests_update on public.item_requests
  for update to authenticated using (requester_id = auth.uid()) with check (requester_id = auth.uid());
drop policy if exists item_requests_delete on public.item_requests;
create policy item_requests_delete on public.item_requests
  for delete to authenticated using (requester_id = auth.uid());

-- Replies: anyone signed in can read; you write your own.
drop policy if exists request_replies_read on public.request_replies;
create policy request_replies_read on public.request_replies
  for select to anon, authenticated using (true);
drop policy if exists request_replies_insert on public.request_replies;
create policy request_replies_insert on public.request_replies
  for insert to authenticated with check (responder_id = auth.uid());
