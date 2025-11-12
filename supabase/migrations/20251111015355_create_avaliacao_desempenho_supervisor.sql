/*
  # Criar Tabela de Avaliação de Desempenho (Supervisor)

  1. Nova Tabela
    - `avaliacao_desempenho_supervisor`
      - `id` (uuid, primary key)
      - `colaborador_id` (uuid, FK para colaboradores)
      - `supervisor_id` (uuid, FK para colaboradores - quem avalia)
      - `periodo_avaliacao` (text - ex: "1º Trimestre 2024")
      - `data_avaliacao` (date)
      
      ## Assiduidade
      - `assiduidade_faltas` (integer, 0-10)
      - `assiduidade_atestados` (integer, 0-10)
      - `assiduidade_obs` (text)
      
      ## Disciplina
      - `disciplina_advertencias` (integer, 0-10)
      - `disciplina_comportamento` (integer, 0-10)
      - `disciplina_obs` (text)
      
      ## Produtividade
      - `produtividade_qualidade` (integer, 0-20)
      - `produtividade_quantidade` (integer, 0-15)
      - `produtividade_prazos` (integer, 0-10)
      - `produtividade_obs` (text)
      
      ## Relacionamento Interpessoal
      - `relacionamento_equipe` (integer, 0-10)
      - `relacionamento_clientes` (integer, 0-10)
      - `relacionamento_obs` (text)
      
      ## Postura Profissional
      - `postura_apresentacao` (integer, 0-10)
      - `postura_comunicacao` (integer, 0-10)
      - `postura_obs` (text)
      
      ## Engajamento
      - `engajamento_iniciativa` (integer, 0-10)
      - `engajamento_comprometimento` (integer, 0-10)
      - `engajamento_obs` (text)
      
      ## Totais e Classificação
      - `total_pontos` (integer, calculado)
      - `percentual_final` (numeric, calculado)
      - `classificacao` (text - Excelente/Satisfatório/Regular/Insatisfatório)
      
      ## Assinaturas e Confirmações
      - `nome_supervisor` (text)
      - `nome_bp_rh` (text)
      - `nome_colaborador_avaliado` (text)
      - `confirmacao_supervisor` (boolean)
      - `confirmacao_bp_rh` (boolean)
      - `confirmacao_colaborador` (boolean)
      - `data_confirmacao_supervisor` (timestamptz)
      - `data_confirmacao_bp_rh` (timestamptz)
      - `data_confirmacao_colaborador` (timestamptz)
      
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Enable RLS
    - Políticas abertas para autenticação customizada
*/

CREATE TABLE IF NOT EXISTS avaliacao_desempenho_supervisor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid REFERENCES colaboradores(id) ON DELETE CASCADE NOT NULL,
  supervisor_id uuid REFERENCES colaboradores(id) ON DELETE SET NULL,
  periodo_avaliacao text NOT NULL,
  data_avaliacao date DEFAULT CURRENT_DATE NOT NULL,
  
  -- Assiduidade (20 pontos)
  assiduidade_faltas integer DEFAULT 0 CHECK (assiduidade_faltas >= 0 AND assiduidade_faltas <= 10),
  assiduidade_atestados integer DEFAULT 0 CHECK (assiduidade_atestados >= 0 AND assiduidade_atestados <= 10),
  assiduidade_obs text,
  
  -- Disciplina (20 pontos)
  disciplina_advertencias integer DEFAULT 0 CHECK (disciplina_advertencias >= 0 AND disciplina_advertencias <= 10),
  disciplina_comportamento integer DEFAULT 0 CHECK (disciplina_comportamento >= 0 AND disciplina_comportamento <= 10),
  disciplina_obs text,
  
  -- Produtividade (45 pontos)
  produtividade_qualidade integer DEFAULT 0 CHECK (produtividade_qualidade >= 0 AND produtividade_qualidade <= 20),
  produtividade_quantidade integer DEFAULT 0 CHECK (produtividade_quantidade >= 0 AND produtividade_quantidade <= 15),
  produtividade_prazos integer DEFAULT 0 CHECK (produtividade_prazos >= 0 AND produtividade_prazos <= 10),
  produtividade_obs text,
  
  -- Relacionamento Interpessoal (20 pontos)
  relacionamento_equipe integer DEFAULT 0 CHECK (relacionamento_equipe >= 0 AND relacionamento_equipe <= 10),
  relacionamento_clientes integer DEFAULT 0 CHECK (relacionamento_clientes >= 0 AND relacionamento_clientes <= 10),
  relacionamento_obs text,
  
  -- Postura Profissional (20 pontos)
  postura_apresentacao integer DEFAULT 0 CHECK (postura_apresentacao >= 0 AND postura_apresentacao <= 10),
  postura_comunicacao integer DEFAULT 0 CHECK (postura_comunicacao >= 0 AND postura_comunicacao <= 10),
  postura_obs text,
  
  -- Engajamento (20 pontos)
  engajamento_iniciativa integer DEFAULT 0 CHECK (engajamento_iniciativa >= 0 AND engajamento_iniciativa <= 10),
  engajamento_comprometimento integer DEFAULT 0 CHECK (engajamento_comprometimento >= 0 AND engajamento_comprometimento <= 10),
  engajamento_obs text,
  
  -- Totais (145 pontos máximo)
  total_pontos integer DEFAULT 0,
  percentual_final numeric(5,2) DEFAULT 0,
  classificacao text,
  
  -- Assinaturas e confirmações
  nome_supervisor text,
  nome_bp_rh text,
  nome_colaborador_avaliado text,
  confirmacao_supervisor boolean DEFAULT false,
  confirmacao_bp_rh boolean DEFAULT false,
  confirmacao_colaborador boolean DEFAULT false,
  data_confirmacao_supervisor timestamptz,
  data_confirmacao_bp_rh timestamptz,
  data_confirmacao_colaborador timestamptz,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE avaliacao_desempenho_supervisor ENABLE ROW LEVEL SECURITY;

-- Criar políticas abertas
CREATE POLICY "Permitir leitura para todos"
  ON avaliacao_desempenho_supervisor FOR SELECT 
  USING (true);

CREATE POLICY "Permitir inserção para todos"
  ON avaliacao_desempenho_supervisor FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos"
  ON avaliacao_desempenho_supervisor FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos"
  ON avaliacao_desempenho_supervisor FOR DELETE 
  USING (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_avaliacao_desemp_super_colaborador 
  ON avaliacao_desempenho_supervisor(colaborador_id);
  
CREATE INDEX IF NOT EXISTS idx_avaliacao_desemp_super_supervisor 
  ON avaliacao_desempenho_supervisor(supervisor_id);
  
CREATE INDEX IF NOT EXISTS idx_avaliacao_desemp_super_data 
  ON avaliacao_desempenho_supervisor(data_avaliacao DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_avaliacao_desempenho_supervisor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_avaliacao_desempenho_supervisor_updated_at
  BEFORE UPDATE ON avaliacao_desempenho_supervisor
  FOR EACH ROW
  EXECUTE FUNCTION update_avaliacao_desempenho_supervisor_updated_at();