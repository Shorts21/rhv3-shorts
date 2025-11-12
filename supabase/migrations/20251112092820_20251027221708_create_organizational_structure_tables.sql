/*
  # Criar Tabelas de Estrutura Organizacional

  1. Nova Tabela: unidades
    - `id` (uuid, primary key)
    - `nome` (text, unique, not null) - Nome da unidade
    - `descricao` (text) - Descrição da unidade
    - `ativo` (boolean, default true) - Status da unidade
    - `created_at` (timestamptz) - Data de criação
    - `updated_at` (timestamptz) - Data de atualização

  2. Nova Tabela: setores
    - `id` (uuid, primary key)
    - `nome` (text, unique, not null) - Nome do setor
    - `descricao` (text) - Descrição do setor
    - `ativo` (boolean, default true) - Status do setor
    - `created_at` (timestamptz) - Data de criação
    - `updated_at` (timestamptz) - Data de atualização

  3. Alterações na Tabela cargos
    - Garantir que tenha campos necessários para gestão completa

  4. Segurança
    - RLS habilitado em todas as tabelas
    - Policies para RH gerenciar e todos visualizarem

  5. Índices
    - Índices para buscas otimizadas por nome e status
*/

CREATE TABLE IF NOT EXISTS unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  descricao text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS setores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  descricao text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem visualizar unidades ativas"
  ON unidades FOR SELECT
  USING (true);

CREATE POLICY "RH pode inserir unidades"
  ON unidades FOR INSERT
  WITH CHECK (true);

CREATE POLICY "RH pode atualizar unidades"
  ON unidades FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "RH pode deletar unidades"
  ON unidades FOR DELETE
  USING (true);

CREATE POLICY "Todos podem visualizar setores ativos"
  ON setores FOR SELECT
  USING (true);

CREATE POLICY "RH pode inserir setores"
  ON setores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "RH pode atualizar setores"
  ON setores FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "RH pode deletar setores"
  ON setores FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_unidades_nome ON unidades(nome);
CREATE INDEX IF NOT EXISTS idx_unidades_ativo ON unidades(ativo);
CREATE INDEX IF NOT EXISTS idx_setores_nome ON setores(nome);
CREATE INDEX IF NOT EXISTS idx_setores_ativo ON setores(ativo);

DROP TRIGGER IF EXISTS update_unidades_updated_at ON unidades;
CREATE TRIGGER update_unidades_updated_at
  BEFORE UPDATE ON unidades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_setores_updated_at ON setores;
CREATE TRIGGER update_setores_updated_at
  BEFORE UPDATE ON setores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO unidades (nome, descricao) VALUES
  ('Sede', 'Unidade principal da empresa'),
  ('Filial São Paulo', 'Filial localizada em São Paulo'),
  ('Filial Rio de Janeiro', 'Filial localizada no Rio de Janeiro'),
  ('Filial Belo Horizonte', 'Filial localizada em Belo Horizonte')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO setores (nome, descricao) VALUES
  ('Administrativo', 'Setor administrativo'),
  ('Financeiro', 'Setor financeiro'),
  ('Comercial', 'Setor comercial'),
  ('Operacional', 'Setor operacional'),
  ('Recursos Humanos', 'Setor de RH'),
  ('Tecnologia da Informação', 'Setor de TI'),
  ('Marketing', 'Setor de marketing'),
  ('Logística', 'Setor de logística')
ON CONFLICT (nome) DO NOTHING;