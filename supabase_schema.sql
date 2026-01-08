
-- Create a table for storing audit submissions
-- If the table already exists and you want to update it, run the alter commands below instead of the create table.

create table if not exists audit_submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Survey Answers
  breaks text,
  manual text,
  tried text,
  outcome text,
  help text,

  -- User Details
  name text,
  company_name text,
  position text,
  mobile_number text
);

-- If you simply need to add columns to an existing table:
-- alter table audit_submissions add column if not exists name text;
-- alter table audit_submissions add column if not exists company_name text;
-- alter table audit_submissions add column if not exists position text;
-- alter table audit_submissions add column if not exists mobile_number text;

-- Enable Row Level Security (RLS)
alter table audit_submissions enable row level security;

-- Create a policy to allow anyone to insert data (since it's a public form)
-- drop policy if exists "Enable insert for everyone" on audit_submissions;
create policy "Enable insert for everyone" on audit_submissions for insert with check (true);

-- Create a policy to allow only authenticated users (admins) to select/read data
create policy "Enable select for users based on user_id" on audit_submissions for select using (auth.role() = 'authenticated');
