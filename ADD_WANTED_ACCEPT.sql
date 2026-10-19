-- Run once in Supabase → SQL Editor (after ADD_WANTED_CHAT.sql).
-- Lets a requester accept ONE offer on their Wanted post, which auto-declines
-- the rest. The accepted neighbour's private chat stays open to arrange pickup;
-- declined chats go read-only.

alter table public.request_replies
  add column if not exists status text not null default 'pending'
  check (status in ('pending','accepted','declined'));

-- The requester (owner of the request) can update replies on their own request
-- to accept / decline them. (Replies had no update policy before.)
drop policy if exists request_replies_update on public.request_replies;
create policy request_replies_update on public.request_replies
  for update to authenticated
  using (
    exists (
      select 1 from public.item_requests ir
      where ir.id = request_replies.request_id
        and ir.requester_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.item_requests ir
      where ir.id = request_replies.request_id
        and ir.requester_id = auth.uid()
    )
  );
