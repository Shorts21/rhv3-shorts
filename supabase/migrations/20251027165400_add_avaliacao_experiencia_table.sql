/*
  # Adicionar Tabela de Avaliação de Período de Experiência

  1. Nova Tabela: avaliacoes_experiencia
    - Sistema completo de avaliação de período de experiência (45/90 dias)
    - 6 competências com 24 questões no total
    - Sistema de pontuação de 4.0 a 10.0
    - Campos:
      - `id` (uuid, primary key)
      - `colaborador_id` (uuid, foreign key)
      - `avaliador_id` (uuid, not null)
      - `matricula` (text)
      - `area_setor` (text)
      - `data_admissao` (date)
      - `periodo_avaliacao` (text) - 45 dias ou 90 dias
      - `data_avaliacao` (date)
      - Competência 1: Adaptação/Sociabilidade (3 questões)
      - Competência 2: Conhecimento Técnico (7 questões)
      - Competência 3: Iniciativa e Criatividade (3 questões)
      - Competência 4: Disciplina e Responsabilidade (4 questões)
      - Competência 5: Assiduidade e Apresentação (3 questões)
      - Competência 6: Desenvolvimento Pessoal (4 questões)
      - `nota_final` (numeric) - Média das notas
      - `comentarios_colaborador` (text)
      - `comentarios_superior` (text)
      - `observacoes_gerais` (text)
      - `resultado` (text) - Permanece ou Desligado
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - RLS habilitado
    - Políticas abertas para autenticação customizada

  3. Validações
    - Notas entre 4.0 e 10.0
    - Período de avaliação: 45 dias ou 90 dias
    - Resultado: Permanece ou Desligado
*/

-- Criar tabela de avaliações de período de experiência
CREATE TABLE IF NOT EXISTS avaliacoes_experiencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  avaliador_id uuid NOT NULL,
  matricula text,
  area_setor text,
  data_admissao date,
  periodo_avaliacao text CHECK (periodo_avaliacao IN ('45 dias', '90 dias')),
  data_avaliacao date NOT NULL DEFAULT CURRENT_DATE,
  
  -- Competência 1: Adaptação/Sociabilidade e Trabalho em Equipe (3 questões)
  adaptacao_q1 numeric(3,1) CHECK (adaptacao_q1 >= 4.0 AND adaptacao_q1 <= 10.0),
  adaptacao_q2 numeric(3,1) CHECK (adaptacao_q2 >= 4.0 AND adaptacao_q2 <= 10.0),
  adaptacao_q3 numeric(3,1) CHECK (adaptacao_q3 >= 4.0 AND adaptacao_q3 <= 10.0),
  
  -- Competência 2: Conhecimento Técnico e Cumprimento das Tarefas (7 questões)
  conhecimento_q4 numeric(3,1) CHECK (conhecimento_q4 >= 4.0 AND conhecimento_q4 <= 10.0),
  conhecimento_q5 numeric(3,1) CHECK (conhecimento_q5 >= 4.0 AND conhecimento_q5 <= 10.0),
  conhecimento_q6 numeric(3,1) CHECK (conhecimento_q6 >= 4.0 AND conhecimento_q6 <= 10.0),
  conhecimento_q7 numeric(3,1) CHECK (conhecimento_q7 >= 4.0 AND conhecimento_q7 <= 10.0),
  conhecimento_q8 numeric(3,1) CHECK (conhecimento_q8 >= 4.0 AND conhecimento_q8 <= 10.0),
  conhecimento_q9 numeric(3,1) CHECK (conhecimento_q9 >= 4.0 AND conhecimento_q9 <= 10.0),
  conhecimento_q10 numeric(3,1) CHECK (conhecimento_q10 >= 4.0 AND conhecimento_q10 <= 10.0),
  
  -- Competência 3: Iniciativa e Criatividade (3 questões)
  iniciativa_q11 numeric(3,1) CHECK (iniciativa_q11 >= 4.0 AND iniciativa_q11 <= 10.0),
  iniciativa_q12 numeric(3,1) CHECK (iniciativa_q12 >= 4.0 AND iniciativa_q12 <= 10.0),
  iniciativa_q13 numeric(3,1) CHECK (iniciativa_q13 >= 4.0 AND iniciativa_q13 <= 10.0),
  
  -- Competência 4: Disciplina e Responsabilidade (4 questões)
  disciplina_q14 numeric(3,1) CHECK (disciplina_q14 >= 4.0 AND disciplina_q14 <= 10.0),
  disciplina_q15 numeric(3,1) CHECK (disciplina_q15 >= 4.0 AND disciplina_q15 <= 10.0),
  disciplina_q16 numeric(3,1) CHECK (disciplina_q16 >= 4.0 AND disciplina_q16 <= 10.0),
  disciplina_q17 numeric(3,1) CHECK (disciplina_q17 >= 4.0 AND disciplina_q17 <= 10.0),
  
  -- Competência 5: Assiduidade e Apresentação Pessoal (3 questões)
  assiduidade_q18 numeric(3,1) CHECK (assiduidade_q18 >= 4.0 AND assiduidade_q18 <= 10.0),
  assiduidade_q19 numeric(3,1) CHECK (assiduidade_q19 >= 4.0 AND assiduidade_q19 <= 10.0),
  assiduidade_q20 numeric(3,1) CHECK (assiduidade_q20 >= 4.0 AND assiduidade_q20 <= 10.0),
  
  -- Competência 6: Desenvolvimento Pessoal (4 questões)
  desenvolvimento_q21 numeric(3,1) CHECK (desenvolvimento_q21 >= 4.0 AND desenvolvimento_q21 <= 10.0),
  desenvolvimento_q22 numeric(3,1) CHECK (desenvolvimento_q22 >= 4.0 AND desenvolvimento_q22 <= 10.0),
  desenvolvimento_q23 numeric(3,1) CHECK (desenvolvimento_q23 >= 4.0 AND desenvolvimento_q23 <= 10.0),
  desenvolvimento_q24 numeric(3,1) CHECK (desenvolvimento_q24 >= 4.0 AND desenvolvimento_q24 <= 10.0),
  
  -- Resultado final
  nota_final numeric(4,2),
  comentarios_colaborador text,
  comentarios_superior text,
  observacoes_gerais text,
  resultado text CHECK (resultado IN ('Permanece na empresa', 'Desligado durante o período de experiência')),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE avaliacoes_experiencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos"
  ON avaliacoes_experiencia FOR SELECT USING (true);

CREATE POLICY "Permitir inserção para todos"
  ON avaliacoes_experiencia FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos"
  ON avaliacoes_experiencia FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos"
  ON avaliacoes_experiencia FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_experiencia_colaborador_id ON avaliacoes_experiencia(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_experiencia_avaliador_id ON avaliacoes_experiencia(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_experiencia_periodo ON avaliacoes_experiencia(periodo_avaliacao);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_avaliacoes_experiencia_updated_at ON avaliacoes_experiencia;
CREATE TRIGGER update_avaliacoes_experiencia_updated_at 
  BEFORE UPDATE ON avaliacoes_experiencia
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();