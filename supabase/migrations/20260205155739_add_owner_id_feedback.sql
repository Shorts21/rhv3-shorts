/*
  # Add owner_id field to feedback table

  1. Changes
    - Add `owner_id` column (uuid, nullable initially)
    - Populate `owner_id` from `usuario_id` for existing records
    - Make `owner_id` NOT NULL after migration
  
  2. Purpose
    - Simplify permission system using single field
    - Source of truth for feedback ownership
    - Enable proper edit/delete permissions
*/

-- Add owner_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'avaliacoes_desempenho_feedback' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE avaliacoes_desempenho_feedback ADD COLUMN owner_id uuid;
  END IF;
END $$;

-- Populate owner_id from usuario_id for existing records
UPDATE avaliacoes_desempenho_feedback
SET owner_id = usuario_id
WHERE owner_id IS NULL AND usuario_id IS NOT NULL;

-- For records with no usuario_id, use a default system user (if needed)
-- This ensures no gaps in ownership
UPDATE avaliacoes_desempenho_feedback
SET owner_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
WHERE owner_id IS NULL;

-- Make owner_id NOT NULL
ALTER TABLE avaliacoes_desempenho_feedback
ALTER COLUMN owner_id SET NOT NULL;
