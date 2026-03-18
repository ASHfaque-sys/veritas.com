-- ============================================================
-- UniLoan AI — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. assessments table
create table if not exists public.assessments (
  session_id       uuid primary key default gen_random_uuid(),
  loan_type        text not null check (loan_type in ('personal', 'business')),
  extracted_data   jsonb,
  probability_score integer,
  embedding        vector(1536),
  created_at       timestamptz default now()
);

-- Index for vector similarity search
create index on public.assessments
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 3. loan_outcomes table
create table if not exists public.loan_outcomes (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid references public.assessments(session_id) on delete cascade,
  bank_applied     text,
  outcome          text check (outcome in ('approved','rejected','pending','partial')),
  approved_amount  bigint,
  interest_rate    decimal(5,2),
  submitted_at     timestamptz default now()
);

-- 4. pgvector similarity search function (used by frontend)
create or replace function match_assessments (
  query_embedding  vector(1536),
  match_threshold  float,
  match_count      int
)
returns table (
  session_id       uuid,
  loan_type        text,
  probability_score integer,
  similarity       float
)
language sql stable
as $$
  select
    a.session_id,
    a.loan_type,
    a.probability_score,
    1 - (a.embedding <=> query_embedding) as similarity
  from public.assessments a
  where 1 - (a.embedding <=> query_embedding) > match_threshold
  order by a.embedding <=> query_embedding
  limit match_count;
$$;

-- 5. Row Level Security (recommended)
alter table public.assessments  enable row level security;
alter table public.loan_outcomes enable row level security;

-- Allow anonymous inserts (application uses anon key)
create policy "Allow anon inserts on assessments"
  on public.assessments for insert
  with check (true);

create policy "Allow anon inserts on loan_outcomes"
  on public.loan_outcomes for insert
  with check (true);

create policy "Allow anon select on assessments"
  on public.assessments for select
  using (true);

create policy "Allow anon select on loan_outcomes"
  on public.loan_outcomes for select
  using (true);
