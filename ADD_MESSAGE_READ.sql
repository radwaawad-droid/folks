-- Run once in Supabase → SQL Editor.
-- Lets a conversation's participants mark messages read (set read_at),
-- which is what clears the unread badge.

drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
  for update to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.borrower_id = auth.uid() or b.lender_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.borrower_id = auth.uid() or b.lender_id = auth.uid())
    )
  );
