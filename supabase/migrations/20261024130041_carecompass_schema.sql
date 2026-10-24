
-- ==========================================
-- CareCompass: Initial Database Schema
-- ==========================================

create extension if not exists pgcrypto;

-- 1. User profiles (authentication managed by Supabase Auth)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    phone text,
    preferred_language text not null default 'auto'
        check (preferred_language in ('auto', 'en', 'hi', 'hinglish')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. Caregivers
create table public.caregivers (
    id uuid primary key default gen_random_uuid(),
    caregiver_code text unique not null,
    full_name text not null,
    phone text,
    care_types text[] not null default '{}',
    languages text[] not null default '{}',
    latitude double precision,
    longitude double precision,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- 3. Caregiver availability
create table public.caregiver_availability (
    id uuid primary key default gen_random_uuid(),
    caregiver_id uuid not null
        references public.caregivers(id) on delete cascade,
    start_time timestamptz not null,
    end_time timestamptz not null,
    status text not null default 'available'
        check (status in ('available', 'booked', 'unavailable')),
    created_at timestamptz not null default now(),
    check (end_time > start_time)
);

-- 4. Triage sessions
create table public.triage_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    user_input text not null,
    detected_language text,
    latitude double precision,
    longitude double precision,
    conversation_history jsonb not null default '[]'::jsonb,
    follow_up_question text,
    status text not null default 'in_progress'
        check (status in ('in_progress', 'completed', 'cancelled')),
    created_at timestamptz not null default now()
);

-- 5. Triage decisions
create table public.triage_decisions (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null unique
        references public.triage_sessions(id) on delete cascade,
    care_type text not null
        check (care_type in (
            'paramedic_home_visit',
            'nurse',
            'gp_teleconsult',
            'specialist',
            'emergency_referral'
        )),
    urgency text not null
        check (urgency in ('routine', 'same_day', 'immediate')),
    red_flags jsonb not null default '[]'::jsonb,
    reasoning text not null,
    requires_emergency_path boolean not null default false,
    created_at timestamptz not null default now()
);

-- 6. Caregiver matches
create table public.triage_matches (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null
        references public.triage_sessions(id) on delete cascade,
    caregiver_id uuid not null
        references public.caregivers(id) on delete cascade,
    score numeric(5,4) not null check (score between 0 and 1),
    reason text,
    created_at timestamptz not null default now(),
    unique (session_id, caregiver_id)
);

-- 7. Bookings
create table public.bookings (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null
        references public.triage_sessions(id),
    caregiver_id uuid not null
        references public.caregivers(id),
    availability_id uuid
        references public.caregiver_availability(id),
    user_id uuid references auth.users(id) on delete set null,
    status text not null default 'pending'
        check (status in (
            'pending', 'confirmed', 'completed', 'cancelled'
        )),
    scheduled_at timestamptz,
    created_at timestamptz not null default now()
);

-- 8. Audit records
create table public.decision_audit (
    id uuid primary key default gen_random_uuid(),
    session_id uuid references public.triage_sessions(id) on delete set null,
    event_type text not null,
    details jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);


-- ==========================================
-- 9. Members: Family / Dependant Medical Profiles
-- ==========================================

create table public.members (
    id uuid primary key default gen_random_uuid(),

    -- The registered account holder who manages this member
    account_owner_id uuid not null
        references auth.users(id) on delete cascade,

    full_name text not null,
    relationship text not null default 'self',

    date_of_birth date,
    gender text,

    blood_group text,
    allergies text,
    existing_conditions text,
    current_medications text,
    medical_notes text,

    emergency_contact_name text,
    emergency_contact_phone text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- Needed to ensure a triage session belongs to
    -- a member managed by the same account holder.
    unique (id, account_owner_id)
);

alter table public.members enable row level security;

-- Account holders can view their own members.
create policy "Owners can view their members"
on public.members for select
to authenticated
using ((select auth.uid()) = account_owner_id);

-- Account holders can add members to their account.
create policy "Owners can add members"
on public.members for insert
to authenticated
with check ((select auth.uid()) = account_owner_id);

-- Account holders can update their own members.
create policy "Owners can update their members"
on public.members for update
to authenticated
using ((select auth.uid()) = account_owner_id)
with check ((select auth.uid()) = account_owner_id);

-- Account holders can remove members they manage.
create policy "Owners can delete their members"
on public.members for delete
to authenticated
using ((select auth.uid()) = account_owner_id);


-- ==========================================
-- Row Level Security
-- ==========================================

alter table public.profiles enable row level security;
alter table public.caregivers enable row level security;
alter table public.caregiver_availability enable row level security;
alter table public.triage_sessions enable row level security;
alter table public.triage_decisions enable row level security;
alter table public.triage_matches enable row level security;
alter table public.bookings enable row level security;
alter table public.decision_audit enable row level security;

-- Users can read and update their own profiles.
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Users can create and view their own triage sessions.
create policy "Users can create own triage sessions"
on public.triage_sessions for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can view own triage sessions"
on public.triage_sessions for select
to authenticated
using ((select auth.uid()) = user_id);

-- Users can view their own bookings.
create policy "Users can view own bookings"
on public.bookings for select
to authenticated
using ((select auth.uid()) = user_id);

-- Note:
-- Caregiver data, triage decisions, matches, bookings writes,
-- and audit writes should be managed through trusted backend
-- endpoints using the server-side service role key.
-- Never expose that key in frontend code.
