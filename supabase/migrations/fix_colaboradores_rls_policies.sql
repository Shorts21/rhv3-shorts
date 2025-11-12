/*
  # Fix RLS Policies for Colaboradores Table

  1. Security Updates
    - Replace authenticated-only policies with open policies
    - This is necessary because the app uses custom authentication (not Supabase Auth)
    - RLS is still enabled to maintain security structure

  2. Notes
    - All CRUD operations are now allowed without Supabase Auth session
    - The app handles authentication at the application level
    - Consider implementing Supabase Auth in the future for proper RLS
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON colaboradores;
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON colaboradores;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON colaboradores;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON colaboradores;

-- Create new policies that work without Supabase Auth
CREATE POLICY "Permitir leitura para todos"
  ON colaboradores
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção para todos"
  ON colaboradores
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos"
  ON colaboradores
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos"
  ON colaboradores
  FOR DELETE
  USING (true);
