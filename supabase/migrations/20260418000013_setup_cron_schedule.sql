-- ============================================================
-- Migration: 20260418000013_setup_cron_schedule
-- Purpose: Schedule daily-habit-check to run every hour
--          (it internally filters users by timezone to process 
--           those at 23:xx local time)
-- ============================================================

-- The Edge Function runs every hour and filters users whose local timezone is at 23:xx
-- This ensures all timezones are covered without needing per-timezone cron entries
SELECT cron.schedule(
  'daily-habit-check-hourly',
  '0 * * * *',  -- Every hour at :00
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url') || '/functions/v1/daily-habit-check',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
