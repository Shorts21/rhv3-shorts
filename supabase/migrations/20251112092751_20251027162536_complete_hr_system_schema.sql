/*
  # Sistema Completo de RH - Schema Inicial

  1. Novas Tabelas
    - `usuarios`
      - `id` (uuid, primary key)
      - `nome` (text, not null)
      - `telefone` (text, unique, not null) - usado como senha
      - `perfil` (text, check: 'rh', 'gestor', 'colaborador')
      - `ativo` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `colaboradores`
      - `id` (uuid, primary key)
      - `nome` (text, not null)
      - `email` (text)
      - `setor` (text, not null)
      - `data_admissao` (date, not null)
      - `status` (text, check: 'ativo', 'experiencia', 'desligado')
      - `gestor_id` (uuid)
      - `foto_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `cargos`
      - `id` (uuid, primary key)
      - `codigo` (text, unique, not null)
      - `nome` (text, not null)
      - `descricao` (text)
      - `competencias_tecnicas` (text array)
      - `competencias_comportamentais` (text array)
      - `salario_base` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `avaliacoes`
      - `id` (uuid, primary key)
      - `colaborador_id` (uuid, foreign key)
      - `avaliador_id` (uuid)
      - `tipo_avaliacao` (text, check: 'experiencia', 'periodica', 'desempenho')
      - `trabalho_equipe` (integer, 1-5)
      - `comunicacao` (integer, 1-5)
      - `responsabilidade` (integer, 1-5)
      - `pontualidade` (integer, 1-5)
      - `proatividade` (integer, 1-5)
      - `qualidade_trabalho` (integer, 1-5)
      - `media_geral` (numeric)
      - `classificacao` (text)
      - `comentarios` (text)
      - `plano_acao` (text)
      - `data_avaliacao` (date, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `feedbacks`
      - `id` (uuid, primary key)
      - `colaborador_id` (uuid, foreign key)
      - `gestor_id` (uuid, not null)
      - `pauta` (text, not null)
      - `posicionamento_colaborador` (text)
      - `observacoes` (text)
      - `plano_acao` (text)
      - `data_feedback` (date, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `movimentacoes_pessoal`
      - `id` (uuid, primary key)
      - `colaborador_id` (uuid, foreign key)
      - `tipo_movimentacao` (text, not null)
      - `cargo_anterior_id` (uuid)
      - `cargo_novo_id` (uuid)
      - `setor_anterior` (text)
      - `setor_novo` (text)
      - `data_movimentacao` (date, not null)
      - `motivo` (text)
      - `observacoes` (text)
      - `created_at` (timestamptz)

    - `audio_devolutivas`
      - `id` (uuid, primary key)
      - `colaborador_id` (uuid, foreign key)
      - `tipo_avaliacao` (text, check: 'experiencia', 'periodica', 'desempenho')
      - `referencia_id` (uuid, not null)
      - `texto_devolutiva` (text, not null)
      - `audio_url` (text)
      - `elevenlabs_request_id` (text)
      - `status` (text, default 'pendente')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas abertas (usando true) pois o app usa autenticação customizada
    - Em produção, considerar migrar para Supabase Auth para RLS adequado

  3. Dados Iniciais
    - Usuários: Claudia (RH), Paloma (RH), Marcos (Gestor)

  4. Índices
    - Índices em foreign keys para melhor performance
    - Índices em campos frequentemente consultados

  5. Triggers
    - Trigger para atualizar `updated_at` automaticamente
*/

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text NOT NULL UNIQUE,
  perfil text NOT NULL CHECK (perfil IN ('rh', 'gestor', 'colaborador')),
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos"
  ON usuarios FOR SELECT USING (true);

CREATE POLICY "Permitir inserção para todos"
  ON usuarios FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos"
  ON usuarios FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos"
  ON usuarios FOR DELETE USING (true);

-- Tabela de colaboradores
CREATE TABLE IF NOT EXISTS colaboradores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text,
  setor text NOT NULL,
  data_admissao date NOT NULL,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'experiencia', 'desligado')),
  gestor_id uuid,
  foto_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos"
  ON colaboradores FOR SELECT USING (true);

CREATE POLICY "Permitir inserção para todos"
  ON colaboradores FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos"
  ON colaboradores FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos"
  ON colaboradores FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_colaboradores_gestor_id ON colaboradores(gestor_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_status ON colaboradores(status);

-- Tabela de cargos
CREATE TABLE IF NOT EXISTS cargos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nome text NOT NULL,
  descricao text,
  competencias_tecnicas text[] DEFAULT '{}',
  competencias_comportamentais text[] DEFAULT '{}',
  salario_base numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos"
  ON cargos FOR SELECT USING (true);

CREATE POLICY "Permitir inserção para todos"
  ON cargos FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos"
  ON cargos FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos"
  ON cargos FOR DELETE USING (true);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  avaliador_id uuid NOT NULL,
  tipo_avaliacao text NOT NULL CHECK (tipo_avaliacao IN ('experiencia', 'periodica', 'desempenho')),
  trabalho_equipe integer CHECK (trabalho_equipe BETWEEN 1 AND 5),
  comunicacao integer CHECK (comunicacao BETWEEN 1 AND 5),
  responsabilidade integer CHECK (responsabilidade BETWEEN 1 AND 5),
  pontualidade integer CHECK (pontualidade BETWEEN 1 AND 5),
  proatividade integer CHECK (proatividade BETWEEN 1 AND 5),
  qualidade_trabalho integer CHECK (qualidade_trabalho BETWEEN 1 AND 5),
  media_geral numeric(3,2),
  classificacao text,
  comentarios text,
  plano_acao text,
  data_avaliacao date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos"
  ON avaliacoes FOR SELECT USING (true);

CREATE POLICY "Permitir inserção para todos"
  ON avaliacoes FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos"
  ON avaliacoes FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos"
  ON avaliacoes FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_colaborador_id ON avaliacoes(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_avaliador_id ON avaliacoes(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_data ON avaliacoes(data_avaliacao);

-- Tabela de feedbacks
CREATE TABLE IF NOT EXISTS feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  gestor_id uuid NOT NULL,
  pauta text NOT NULL,
  posicionamento_colaborador text,
  observacoes text,
  plano_acao text,
  data_feedback date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos"
  ON feedbacks FOR SELECT USING (true);

CREATE POLICY "Permitir inserção para todos"
  ON feedbacks FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos"
  ON feedbacks FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos"
  ON feedbacks FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_feedbacks_colaborador_id ON feedbacks(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_gestor_id ON feedbacks(gestor_id);

-- Tabela de movimentações pessoal
CREATE TABLE IF NOT EXISTS movimentacoes_pessoal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo_movimentacao text NOT NULL,
  cargo_anterior_id uuid,
  cargo_novo_id uuid,
  setor_anterior text,
  setor_novo text,
  data_movimentacao date NOT NULL DEFAULT CURRENT_DATE,
  motivo text,
  observacoes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE movimentacoes_pessoal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos"
  ON movimentacoes_pessoal FOR SELECT USING (true);

CREATE POLICY "Permitir inserção para todos"
  ON movimentacoes_pessoal FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos"
  ON movimentacoes_pessoal FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos"
  ON movimentacoes_pessoal FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_colaborador_id ON movimentacoes_pessoal(colaborador_id);

-- Tabela de áudio devolutivas
CREATE TABLE IF NOT EXISTS audio_devolutivas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo_avaliacao text NOT NULL CHECK (tipo_avaliacao IN ('experiencia', 'periodica', 'desempenho')),
  referencia_id uuid NOT NULL,
  texto_devolutiva text NOT NULL,
  audio_url text,
  elevenlabs_request_id text,
  status text DEFAULT 'pendente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE audio_devolutivas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos"
  ON audio_devolutivas FOR SELECT USING (true);

CREATE POLICY "Permitir inserção para todos"
  ON audio_devolutivas FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos"
  ON audio_devolutivas FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos"
  ON audio_devolutivas FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_audio_devolutivas_colaborador_id ON audio_devolutivas(colaborador_id);

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_colaboradores_updated_at ON colaboradores;
CREATE TRIGGER update_colaboradores_updated_at BEFORE UPDATE ON colaboradores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cargos_updated_at ON cargos;
CREATE TRIGGER update_cargos_updated_at BEFORE UPDATE ON cargos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_avaliacoes_updated_at ON avaliacoes;
CREATE TRIGGER update_avaliacoes_updated_at BEFORE UPDATE ON avaliacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feedbacks_updated_at ON feedbacks;
CREATE TRIGGER update_feedbacks_updated_at BEFORE UPDATE ON feedbacks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_audio_devolutivas_updated_at ON audio_devolutivas;
CREATE TRIGGER update_audio_devolutivas_updated_at BEFORE UPDATE ON audio_devolutivas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuários iniciais
INSERT INTO usuarios (id, nome, telefone, perfil, ativo) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Claudia', '123456', 'rh', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Paloma', '654321', 'rh', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Marcos', '777777', 'gestor', true)
ON CONFLICT (id) DO NOTHING;