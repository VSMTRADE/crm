-- Create a table for users
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  email text unique not null,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.users enable row level security;

-- Create policies
create policy "Users can view their own data" on users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on users
  for update using (auth.uid() = id);

-- Create admin user if not exists
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@admin.com',
  crypt('123456', gen_salt('bf')),
  now(),
  'authenticated'
) ON CONFLICT DO NOTHING;

-- Insert admin user data
INSERT INTO public.users (id, name, email, role)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Admin',
  'admin@admin.com',
  'admin'
) ON CONFLICT DO NOTHING;
