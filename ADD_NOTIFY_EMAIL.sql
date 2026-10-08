-- folks — notifications: store a real email so we can notify members.
-- Safe to run more than once.
alter table profiles add column if not exists notify_email text;
