-- Run once in Supabase → SQL Editor.
-- Adds: (1) a "last seen the Wanted board" marker so we can show a dot when
-- new requests arrive, and (2) a private 1:1 chat per reply so a requester and
-- a neighbour who offered can agree on specs, cost and pickup.

-- 1) When did this member last open the Wanted board?
alter table public.profiles
  add column if not exists wanted_seen_at timestamptz;

-- 2) Private messages attached to a reply (the "I have this" offer).
--    Participants = the reply's responder + the request's requester.
create table if not exists public.request_messages (
  id          uuid primary key default gen_random_uuid(),
  reply_id    uuid not null references public.request_replies(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists request_messages_reply_idx
  on public.request_messages(reply_id, created_at);

alter table public.request_messages enable row level security;

-- Only the two people in the conversation can read / write it.
-- (the responder on the reply, or the requester who posted the request)
drop policy if exists request_messages_select on public.request_messages;
create policy request_messages_select on public.request_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.request_replies rr
      join public.item_requests ir on ir.id = rr.request_id
      where rr.id = request_messages.reply_id
        and (rr.responder_id = auth.uid() or ir.requester_id = auth.uid())
    )
  );

drop policy if exists request_messages_insert on public.request_messages;
create policy request_messages_insert on public.request_messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.request_replies rr
      join public.item_requests ir on ir.id = rr.request_id
      where rr.id = request_messages.reply_id
        and (rr.responder_id = auth.uid() or ir.requester_id = auth.uid())
    )
  );

drop policy if exists request_messages_update on public.request_messages;
create policy request_messages_update on public.request_messages
  for update to authenticated
  using (
    exists (
      select 1 from public.request_replies rr
      join public.item_requests ir on ir.id = rr.request_id
      where rr.id = request_messages.reply_id
        and (rr.responder_id = auth.uid() or ir.requester_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.request_replies rr
      join public.item_requests ir on ir.id = rr.request_id
      where rr.id = request_messages.reply_id
        and (rr.responder_id = auth.uid() or ir.requester_id = auth.uid())
    )
  );
