/*
  # Create Usuarios Table

  1. New Tables
    - `usuarios`
      - `id` (uuid, primary key)
      - `nome` (text, not null)
      - `telefone` (text, unique, not null) - used as password
      - `perfil` (text, check constraint for 'rh', 'gestor', 'colaborador')
      - `ativo` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `usuarios` table
    - Add policies for all CRUD operations
    - Custom auth uses this table to validate users

  3. Initial Data
    - Insert existing users (Claudia, Paloma, Marcos)
*/

-- Create usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text NOT NULL UNIQUE,
  perfil text NOT NULL CHECK (perfil IN ('rh', 'gestor', 'colaborador')),
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Permitir leitura para todos"
  ON usuarios
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção para todos"
  ON usuarios
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos"
  ON usuarios
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos"
  ON usuarios
  FOR DELETE
  USING (true);

-- Insert existing users
INSERT INTO usuarios (id, nome, telefone, perfil, ativo) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Claudia', '123456', 'rh', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Paloma', '654321', 'rh', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Marcos', '777777', 'gestor', true)
ON CONFLICT (id) DO NOTHING;
