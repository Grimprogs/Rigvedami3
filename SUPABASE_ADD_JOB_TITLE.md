# Add `job_title` column to Supabase `profiles` table

If your Supabase `profiles` table is missing a `job_title` column, the UI changes in this repo expect that field. Run one of the options below to add the column.

## Option A — Supabase UI (recommended)

1. Open your Supabase project.
2. Go to **Table Editor** → select the `public.profiles` table.
3. Click **Add column**.
4. Configure:
   - Name: `job_title`
   - Type: `text`
   - Nullable: **Yes**
   - Default: leave empty / NULL
5. Save.

## Option B — SQL Editor (run this query)

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS job_title text;
```

### Optional: backfill from `role` (only if your seeded data stored job titles in `role`)

```sql
UPDATE public.profiles
SET job_title = role
WHERE job_title IS NULL
  AND role NOT IN ('admin','employee');
```

## Notes

- If you have Row-Level Security (RLS) enabled on `profiles`, ensure your policies allow the service role or authenticated users to update/insert `job_title` as needed.
- Add the column before using the in-app "Add user" flow — otherwise triggers that expect `job_title` may fail.
- After adding the column, refresh the app and edit/save a user's profile to confirm the value shows in the UI.

## Need help applying this?

I can:
- Provide a one-line `psql` or `supabase` CLI command to run locally, or
- Walk you through running the SQL in the Supabase SQL Editor step-by-step.

Tell me which you'd prefer and I'll provide the command or guidance.
