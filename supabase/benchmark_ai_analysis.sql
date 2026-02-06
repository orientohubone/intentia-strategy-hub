-- Add ai_analysis jsonb column to benchmarks table
ALTER TABLE public.benchmarks ADD COLUMN IF NOT EXISTS ai_analysis jsonb;
