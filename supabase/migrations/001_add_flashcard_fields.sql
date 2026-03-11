-- Migration: Add alternativas and resposta_correta columns to flashcards table
-- Run this in the Supabase SQL Editor

-- Add alternativas column (array of strings)
ALTER TABLE flashcards 
ADD COLUMN IF NOT EXISTS alternativas TEXT[] DEFAULT '{}';

-- Add resposta_correta column
ALTER TABLE flashcards 
ADD COLUMN IF NOT EXISTS resposta_correta TEXT DEFAULT '';

-- Update existing records to set resposta_correta = resposta for old flashcards
UPDATE flashcards 
SET resposta_correta = resposta 
WHERE resposta_correta IS NULL OR resposta_correta = '';

-- Enable RLS (if not already enabled)
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access only their own flashcards
DROP POLICY IF EXISTS "Users can manage their own flashcards" ON flashcards;
CREATE POLICY "Users can manage their own flashcards" ON flashcards
  FOR ALL
  USING (auth.uid() = user_id);

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'flashcards' 
AND column_name IN ('alternativas', 'resposta_correta');
