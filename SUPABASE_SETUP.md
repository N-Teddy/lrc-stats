# Supabase Cloud Setup for LRC Stats

To enable secure cloud synchronization and multi-user consistency, follow these steps to set up your Supabase backend.

## 1. Create Your Project
1. Go to [supabase.com](https://supabase.com/) and sign in.
2. Click **New Project** and select your organization.
3. **Database Password**: Choose a strong password and save it.
4. **Region**: Select the region closest to your community (e.g., EU West for Europe).
5. Click **Create new project**.

## 2. Get Your API Credentials
Once the project is ready:
1. Go to **Project Settings** (Gear icon at the bottom left).
2. Click on **API**.
3. Copy the **Project URL**.
4. Copy the **anon public** Key.
*You will need to paste these into the "Settings" module of the LRC Stats app.*

## 3. Initialize the Database Schema
1. Click on the **SQL Editor** in the left sidebar (looks like `>_`).
2. Click **New Query**.
3. Paste the following SQL code and click **Run**:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PEOPLE TABLE
create table people (
  id uuid primary key,
  name text not null,
  status text,
  phone text,
  dob date,
  date_integration date,
  date_departure date,
  vitality text,
  vitality_color text,
  image text,
  is_jrs boolean default false,
  is_archived boolean default false,
  is_deleted boolean default false,
  deleted_at timestamp with time zone,
  updated_at timestamp with time zone default now(),
  synced_at timestamp with time zone
);

-- ACTIVITIES TABLE
create table activities (
  id uuid primary key,
  name text not null,
  type text,
  date date,
  notes text,
  is_deleted boolean default false,
  deleted_at timestamp with time zone,
  updated_at timestamp with time zone default now(),
  synced_at timestamp with time zone
);

-- ATTENDANCE TABLE
create table attendance (
  id uuid primary key default uuid_generate_v4(),
  activity_id uuid,
  activity_name text,
  date date,
  person_ids jsonb default '[]'::jsonb,
  count integer default 0,
  is_locked boolean default false,
  updated_at timestamp with time zone default now(),
  synced_at timestamp with time zone
);

-- AUDIT LOGS TABLE
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  action text not null, -- CREATE, UPDATE, DELETE, PDF_GEN, LOGIN
  entity_type text,     -- PERSON, ACTIVITY, SYSTEM, ATTENDANCE
  entity_name text,
  timestamp timestamp with time zone default now(),
  user_name text,
  user_email text,
  device_id text
);

-- Enable Realtime for collaborative feel
alter publication supabase_realtime add table people, activities, attendance;
```

## 4. Security (Row Level Security)
To protect your data while allowing the community to sync:
1. Go to **Authentication** -> **Policies**.
2. For each table (`people`, `activities`, `attendance`, `audit_logs`):
   - Click **Enable RLS**.
   - Create a **New Policy**.
   - Search for **"Enable access to authenticated users only"** (if you want logins) or **"Enable read/write access for all users"** (if using only the Anon Key in a trusted circle).
   - For a community app, the simplest is to allow all `INSERT`, `UPDATE`, `SELECT` operations for the `anon` role.

## 5. First Sync
1. In LRC Stats, go to **Settings**.
2. Paste your **Project URL** and **API Key**.
3. Click **Save Config**.
4. Click **Cloud Sync**.
   - Local records will be pushed to the vault.
   - Any changes from other devices will be pulled.
