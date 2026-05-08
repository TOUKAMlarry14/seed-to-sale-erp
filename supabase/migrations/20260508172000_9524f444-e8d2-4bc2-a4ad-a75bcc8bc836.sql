SELECT cron.schedule(
  'notify-bonus-expiry-daily',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://qrhlcodcpmgejtesklsm.supabase.co/functions/v1/notify-bonus-expiry',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyaGxjb2RjcG1nZWp0ZXNrbHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTYxMTEsImV4cCI6MjA5MDI5MjExMX0.toK00Eq8MxYynPf0TzT6nNTasS_9JRlgY0VBVnDp55k"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);