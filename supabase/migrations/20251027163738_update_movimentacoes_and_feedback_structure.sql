/*
  # Atualizacao de Movimentacoes e Feedback - Sistema Completo

  1. Alteracoes na Tabela movimentacoes_pessoal
    - Adicionar campos detalhados do formulario de movimentacao
    - Campos adicionados:
      - `requisitante` (text) - Nome do requisitante
      - `area_requisitante` (text) - Area do requisitante
      - `data_requisicao` (date) - Data da requisicao
      - `previsao_fechamento` (date) - Previsao de fechamento
      - `unidade_origem` (text) - Unidade de origem (Cristalina, Correntina, etc.)
      - `unidade_destino` (text) - Unidade de destino
      - `sexo` (text) - Sexo do colaborador (F/M)
      - `area_setor` (text) - Area/Setor
      - `centro_custo` (text) - Centro de custo
      - `horario_trabalho` (text) - Horario de trabalho
      - `candidato_pcd` (boolean) - Se e candidato PCD
      - `equipamentos_acessos` (text) - Equipamentos e acessos necessarios
      - `justificativa` (text) - Justificativa da movimentacao
      - `tipo_rescisao` (text) - Tipo de rescisao (Iniciativa da Empresa, Pedido de Demissao, Termino de Contrato)
      - `aviso_tipo` (text) - Tipo de aviso (Indenizado, Trabalhado, Justa causa)
      - `aviso_prazo` (text) - Prazo do aviso (45 dias, 90 dias)
      - `pode_retornar` (boolean) - Se pode retornar a empresa
      - `justificativa_desligamento` (text) - Justificativa do desligamento
      - `unidade_atual` (text) - Unidade atual (promocao)
      - `setor_atual` (text) - Setor atual (promocao)
      - `centro_custo_atual` (text) - Centro de custo atual (promocao)
      - `cargo_atual` (text) - Cargo atual (promocao)
      - `salario_base_atual` (numeric) - Salario base atual
      - `gratificacao_atual` (numeric) - Gratificacao atual
      - `total_mes_atual` (numeric) - Total mes atual
      - `unidade_proposta` (text) - Unidade proposta (promocao)
      - `setor_proposto` (text) - Setor proposto (promocao)
      - `centro_custo_proposto` (text) - Centro de custo proposto (promocao)
      - `cargo_proposto` (text) - Cargo proposto (promocao)
      - `salario_base_proposto` (numeric) - Salario base proposto
      - `gratificacao_proposta` (numeric) - Gratificacao proposta
      - `total_mes_proposto` (numeric) - Total mes proposto
      - `reajuste` (numeric) - Valor do reajuste
      - `recursos_necessarios` (text[]) - Array de recursos (Mesa, Cadeira, Apoio de Pe, EPI)

  2. Nova Tabela: avaliacoes_desempenho_feedback
    - Sistema completo de avaliacao de desempenho por ciclo de feedback
    - 5 fatores de competencia com multiplas questoes
    - Sistema de pontuacao de 1 a 5
    - Campos:
      - `id` (uuid, primary key)
      - `colaborador_id` (uuid, foreign key)
      - `avaliador_id` (uuid, not null)
      - `trimestre` (integer, 1-4)
      - `cargo_atual` (text)
      - `email` (text)
      - `data_avaliacao` (date)
      - `observacoes` (text)
      - Fator 1: Produtividade (5 questoes: a-e)
      - Fator 2: Conhecimento e Habilidades Tecnicas (3 questoes: a-c)
      - Fator 3: Trabalho em equipe (5 questoes: a-e)
      - Fator 4: Comprometimento com o trabalho (3 questoes: a-c)
      - Fator 5: Cumprimento das normas (4 questoes: a-d)
      - `total_pontos` (integer) - Total de pontos obtidos
      - `percentual_idi` (numeric) - Percentual IDI
      - `concordancia_colaborador` (boolean) - Se colaborador concorda
      - `assinatura_lider` (text)
      - `assinatura_colaborador` (text)
      - `data_assinatura_lider` (date)
      - `data_assinatura_colaborador` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Seguranca
    - RLS habilitado em todas as tabelas
    - Politicas abertas (usando true) pois o app usa autenticacao customizada

  4. Validacoes
    - Enum para unidades: Cristalina, Correntina, Corporativo, Ibicoara, Papanduva, Sao Gabriel, Uberlandia
    - Pontuacoes entre 1-5
    - Trimestre entre 1-4
    - Total de pontos maximo 100
*/

-- Criar tipo enum para unidades
DO $$ BEGIN
  CREATE TYPE unidade_tipo AS ENUM (
    'Cristalina', 
    'Correntina', 
    'Corporativo', 
    'Ibicoara', 
    'Papanduva', 
    'Sao Gabriel', 
    'Uberlandia'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Adicionar novos campos a tabela movimentacoes_pessoal
ALTER TABLE movimentacoes_pessoal
  ADD COLUMN IF NOT EXISTS requisitante text,
  ADD COLUMN IF NOT EXISTS area_requisitante text,
  ADD COLUMN IF NOT EXISTS data_requisicao date,
  ADD COLUMN IF NOT EXISTS previsao_fechamento date,
  ADD COLUMN IF NOT EXISTS unidade_origem text,
  ADD COLUMN IF NOT EXISTS unidade_destino text,
  ADD COLUMN IF NOT EXISTS sexo text CHECK (sexo IN ('F', 'M')),
  ADD COLUMN IF NOT EXISTS area_setor text,
  ADD COLUMN IF NOT EXISTS centro_custo text,
  ADD COLUMN IF NOT EXISTS horario_trabalho text,
  ADD COLUMN IF NOT EXISTS candidato_pcd boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS equipamentos_acessos text,
  ADD COLUMN IF NOT EXISTS justificativa text,
  ADD COLUMN IF NOT EXISTS tipo_rescisao text CHECK (tipo_rescisao IN ('Iniciativa da Empresa', 'Pedido de Demissao', 'Termino de Contrato')),
  ADD COLUMN IF NOT EXISTS aviso_tipo text CHECK (aviso_tipo IN ('Indenizado', 'Trabalhado', 'Justa causa')),
  ADD COLUMN IF NOT EXISTS aviso_prazo text CHECK (aviso_prazo IN ('45 dias', '90 dias')),
  ADD COLUMN IF NOT EXISTS pode_retornar boolean,
  ADD COLUMN IF NOT EXISTS justificativa_desligamento text,
  ADD COLUMN IF NOT EXISTS unidade_atual text,
  ADD COLUMN IF NOT EXISTS setor_atual text,
  ADD COLUMN IF NOT EXISTS centro_custo_atual text,
  ADD COLUMN IF NOT EXISTS cargo_atual text,
  ADD COLUMN IF NOT EXISTS salario_base_atual numeric(10,2),
  ADD COLUMN IF NOT EXISTS gratificacao_atual numeric(10,2),
  ADD COLUMN IF NOT EXISTS total_mes_atual numeric(10,2),
  ADD COLUMN IF NOT EXISTS unidade_proposta text,
  ADD COLUMN IF NOT EXISTS setor_proposto text,
  ADD COLUMN IF NOT EXISTS centro_custo_proposto text,
  ADD COLUMN IF NOT EXISTS cargo_proposto text,
  ADD COLUMN IF NOT EXISTS salario_base_proposto numeric(10,2),
  ADD COLUMN IF NOT EXISTS gratificacao_proposta numeric(10,2),
  ADD COLUMN IF NOT EXISTS total_mes_proposto numeric(10,2),
  ADD COLUMN IF NOT EXISTS reajuste numeric(10,2),
  ADD COLUMN IF NOT EXISTS recursos_necessarios text[] DEFAULT '{}';

-- Criar tabela de avaliacoes de desempenho - Ciclo de Feedback
CREATE TABLE IF NOT EXISTS avaliacoes_desempenho_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  avaliador_id uuid NOT NULL,
  trimestre integer NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
  cargo_atual text,
  email text,
  data_avaliacao date NOT NULL DEFAULT CURRENT_DATE,
  observacoes text,
  
  -- Fator 1: Produtividade (5 questoes)
  produtividade_1a integer CHECK (produtividade_1a BETWEEN 1 AND 5),
  produtividade_1b integer CHECK (produtividade_1b BETWEEN 1 AND 5),
  produtividade_1c integer CHECK (produtividade_1c BETWEEN 1 AND 5),
  produtividade_1d integer CHECK (produtividade_1d BETWEEN 1 AND 5),
  produtividade_1e integer CHECK (produtividade_1e BETWEEN 1 AND 5),
  
  -- Fator 2: Conhecimento e Habilidades Tecnicas (3 questoes)
  conhecimento_2a integer CHECK (conhecimento_2a BETWEEN 1 AND 5),
  conhecimento_2b integer CHECK (conhecimento_2b BETWEEN 1 AND 5),
  conhecimento_2c integer CHECK (conhecimento_2c BETWEEN 1 AND 5),
  
  -- Fator 3: Trabalho em equipe (5 questoes)
  trabalho_equipe_3a integer CHECK (trabalho_equipe_3a BETWEEN 1 AND 5),
  trabalho_equipe_3b integer CHECK (trabalho_equipe_3b BETWEEN 1 AND 5),
  trabalho_equipe_3c integer CHECK (trabalho_equipe_3c BETWEEN 1 AND 5),
  trabalho_equipe_3d integer CHECK (trabalho_equipe_3d BETWEEN 1 AND 5),
  trabalho_equipe_3e integer CHECK (trabalho_equipe_3e BETWEEN 1 AND 5),
  
  -- Fator 4: Comprometimento com o trabalho (3 questoes)
  comprometimento_4a integer CHECK (comprometimento_4a BETWEEN 1 AND 5),
  comprometimento_4b integer CHECK (comprometimento_4b BETWEEN 1 AND 5),
  comprometimento_4c integer CHECK (comprometimento_4c BETWEEN 1 AND 5),
  
  -- Fator 5: Cumprimento das normas (4 questoes)
  cumprimento_normas_5a integer CHECK (cumprimento_normas_5a BETWEEN 1 AND 5),
  cumprimento_normas_5b integer CHECK (cumprimento_normas_5b BETWEEN 1 AND 5),
  cumprimento_normas_5c integer CHECK (cumprimento_normas_5c BETWEEN 1 AND 5),
  cumprimento_normas_5d integer CHECK (cumprimento_normas_5d BETWEEN 1 AND 5),
  
  -- Totalizadores
  total_pontos integer CHECK (total_pontos BETWEEN 0 AND 100),
  percentual_idi numeric(5,2),
  
  -- Concordancia e assinaturas
  concordancia_colaborador boolean,
  assinatura_lider text,
  assinatura_colaborador text,
  data_assinatura_lider date,
  data_assinatura_colaborador date,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE avaliacoes_desempenho_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos"
  ON avaliacoes_desempenho_feedback FOR SELECT USING (true);

CREATE POLICY "Permitir insercao para todos"
  ON avaliacoes_desempenho_feedback FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualizacao para todos"
  ON avaliacoes_desempenho_feedback FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusao para todos"
  ON avaliacoes_desempenho_feedback FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_feedback_colaborador_id ON avaliacoes_desempenho_feedback(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_feedback_avaliador_id ON avaliacoes_desempenho_feedback(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_feedback_trimestre ON avaliacoes_desempenho_feedback(trimestre);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_avaliacoes_desempenho_feedback_updated_at ON avaliacoes_desempenho_feedback;
CREATE TRIGGER update_avaliacoes_desempenho_feedback_updated_at BEFORE UPDATE ON avaliacoes_desempenho_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Adicionar campo unidade na tabela colaboradores
ALTER TABLE colaboradores
  ADD COLUMN IF NOT EXISTS unidade text;