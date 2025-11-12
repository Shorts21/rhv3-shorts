/*
  # Adicionar tabela de configurações do sistema

  1. Nova Tabela
    - `system_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Chave da configuração
      - `value` (text) - Valor da configuração
      - `description` (text) - Descrição da configuração
      - `created_at` (timestamptz) - Data de criação
      - `updated_at` (timestamptz) - Data de atualização

  2. Segurança
    - Enable RLS on `system_settings` table
    - Add policy for authenticated users to read settings
    - Add policy for RH users to update settings

  3. Dados Iniciais
    - Inserir URL do logo da Igarashi
    - Inserir nome do sistema
*/

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read system settings"
  ON system_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Only RH can update system settings"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.perfil = 'rh'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.perfil = 'rh'
    )
  );

INSERT INTO system_settings (key, value, description)
VALUES 
  ('logo_url', '/Black and White Modern Personal Brand Logo.png', 'URL do logo da empresa exibido no sistema'),
  ('system_name', 'Sistema Luiza', 'Nome do sistema de RH'),
  ('company_name', 'Igarashi', 'Nome da empresa')
ON CONFLICT (key) DO NOTHING;
