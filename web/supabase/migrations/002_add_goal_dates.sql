-- Adds start_date / end_date / description to goals.
-- start_date and end_date are nullable at DB level (for legacy rows) but
-- the client + server actions require them for new goals.

alter table goals
  add column start_date date,
  add column end_date date,
  add column description text;

alter table goals
  add constraint goals_date_order
  check (end_date is null or start_date is null or end_date >= start_date);
