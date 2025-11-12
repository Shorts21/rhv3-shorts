/*
  # Criar Tabela de Avaliações de Desempenho

  1. Nova Tabela
    - `avaliacoes_desempenho`
      - `id` (uuid, primary key)
      - `colaborador_id` (uuid, foreign key para colaboradores)
      - `avaliador_id` (uuid, foreign key para colaboradores)
      - `trabalho_equipe` (numeric, nota de 1-10)
      - `comunicacao` (numeric, nota de 1-10)
      - `responsabilidade` (numeric, nota de 1-10)
      - `pontualidade` (numeric, nota de 1-10)
      - `proatividade` (numeric, nota de 1-10)
      - `qualidade_trabalho` (numeric, nota de 1-10)
      - `media_geral` (numeric, calculada automaticamente)
      - `comentarios` (text, opcional)
      - `plano_acao` (text, opcional)
      - `data_avaliacao` (date, obrigatório)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Enable RLS on `avaliacoes_desempenho` table
    - Add policies for public access (internal app)

  3. Notas Importantes
    - Esta tabela é para avaliações comportamentais simples (6 perguntas)
    - Diferente de `avaliacoes_experiencia` (24 questões)
    - Diferente de `avaliacoes_desempenho_feedback` (20 questões IDI)
*/

-- Criar tabela avaliacoes_desempenho
CREATE TABLE IF NOT EXISTS avaliacoes_desempenho (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  avaliador_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  trabalho_equipe numeric CHECK (trabalho_equipe >= 1 AND trabalho_equipe <= 10),
  comunicacao numeric CHECK (comunicacao >= 1 AND comunicacao <= 10),
  responsabilidade numeric CHECK (responsabilidade >= 1 AND responsabilidade <= 10),
  pontualidade numeric CHECK (pontualidade >= 1 AND pontualidade <= 10),
  proatividade numeric CHECK (proatividade >= 1 AND proatividade <= 10),
  qualidade_trabalho numeric CHECK (qualidade_trabalho >= 1 AND qualidade_trabalho <= 10),
  media_geral numeric GENERATED ALWAYS AS (
    (COALESCE(trabalho_equipe, 0) + 
     COALESCE(comunicacao, 0) + 
     COALESCE(responsabilidade, 0) + 
     COALESCE(pontualidade, 0) + 
     COALESCE(proatividade, 0) + 
     COALESCE(qualidade_trabalho, 0)) / 6.0
  ) STORED,
  comentarios text,
  plano_acao text,
  data_avaliacao date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_avaliacoes_desempenho_colaborador ON avaliacoes_desempenho(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_desempenho_avaliador ON avaliacoes_desempenho(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_desempenho_data ON avaliacoes_desempenho(data_avaliacao DESC);

-- Enable Row Level Security
ALTER TABLE avaliacoes_desempenho ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para public (app interno)
CREATE POLICY "Public pode visualizar avaliacoes_desempenho"
  ON avaliacoes_desempenho FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Public pode inserir avaliacoes_desempenho"
  ON avaliacoes_desempenho FOR INSERT 
  TO public 
  WITH CHECK (true);

CREATE POLICY "Public pode atualizar avaliacoes_desempenho"
  ON avaliacoes_desempenho FOR UPDATE 
  TO public 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Public pode deletar avaliacoes_desempenho"
  ON avaliacoes_desempenho FOR DELETE 
  TO public 
  USING (true);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_avaliacoes_desempenho_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_avaliacoes_desempenho_updated_at ON avaliacoes_desempenho;

CREATE TRIGGER trigger_update_avaliacoes_desempenho_updated_at
  BEFORE UPDATE ON avaliacoes_desempenho
  FOR EACH ROW
  EXECUTE FUNCTION update_avaliacoes_desempenho_updated_at();
