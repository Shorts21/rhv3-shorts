/*
  # Criar Tabela de Movimentacao/Requisicao de Pessoal

  1. Nova Tabela: movimentacao_requisicao_pessoal
    - Sistema completo de gestao de movimentacoes e requisicoes
    - Codigo: GPFR-G&G-MP01-2025
    - Campos:
      - `id` (uuid, primary key)
      - `requisitante_id` (uuid, not null) - ID do usuario requisitante
      - `requisitante_nome` (text)
      - `area_requisitante` (text)
      - `data_requisicao` (date)
      - `previsao_fechamento` (date)
      - `unidade` (text) - Unidade da movimentacao
      - `motivo` (text) - Motivo da movimentacao
      - `cargo` (text)
      - `sexo` (text)
      - `area_setor` (text)
      - `centro_custo` (text)
      - `horario_trabalho` (text)
      - `candidato_pcd` (boolean)
      - `nome_colaborador` (text)
      - `equipamentos_acessos` (text)
      - `justificativa` (text)
      - Campos de Desligamento:
        - `desligamento_nome_colaborador` (text)
        - `desligamento_tipo_rescisao` (text)
        - `desligamento_aviso` (text)
        - `desligamento_periodo_experiencia` (text)
        - `desligamento_recontratacao` (text)
        - `desligamento_justificativa` (text)
      - Campos de Promocao:
        - `promocao_unidade_atual` (text)
        - `promocao_unidade_proposta` (text)
        - `promocao_setor_atual` (text)
        - `promocao_setor_proposto` (text)
        - `promocao_centro_custo_atual` (text)
        - `promocao_centro_custo_proposto` (text)
        - `promocao_cargo_atual` (text)
        - `promocao_cargo_proposto` (text)
        - `promocao_salario_base_atual` (numeric)
        - `promocao_salario_base_proposto` (numeric)
        - `promocao_gratificacao_atual` (numeric)
        - `promocao_gratificacao_proposta` (numeric)
        - `promocao_total_mes_atual` (numeric)
        - `promocao_total_mes_proposto` (numeric)
        - `promocao_reajuste_valor` (numeric)
        - `promocao_reajuste_percentual` (numeric)
      - Recursos Necessarios:
        - `recurso_mesa` (boolean)
        - `recurso_cadeira` (boolean)
        - `recurso_apoio_pes` (boolean)
        - `recurso_epi_bota` (boolean)
      - `status` (text) - pendente, aprovada, rejeitada
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguranca
    - RLS habilitado
    - Politicas abertas para autenticacao customizada

  3. Validacoes
    - Unidades: lista especifica de 7 unidades
    - Motivos: lista especifica de 9 motivos
    - Status: pendente, aprovada, rejeitada
*/

CREATE TABLE IF NOT EXISTS movimentacao_requisicao_pessoal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requisitante_id uuid NOT NULL,
  requisitante_nome text,
  area_requisitante text,
  data_requisicao date NOT NULL DEFAULT CURRENT_DATE,
  previsao_fechamento date,
  
  unidade text CHECK (unidade IN ('Cristalina', 'Correntina', 'Corporativo', 'Ibicoara', 'Papanduva', 'Sao Gabriel', 'Uberlandia')),
  motivo text CHECK (motivo IN (
    'Aumento de Quadro',
    'Substituicao',
    'Transferencia - Area',
    'Promocao',
    'Demissao',
    'Estagio',
    'Prestador de Servico',
    'Transferencia - Unidade',
    'Aprendiz'
  )),
  
  cargo text,
  sexo text CHECK (sexo IN ('Feminino', 'Masculino')),
  area_setor text,
  centro_custo text,
  horario_trabalho text,
  candidato_pcd boolean DEFAULT false,
  nome_colaborador text,
  equipamentos_acessos text,
  justificativa text,
  
  desligamento_nome_colaborador text,
  desligamento_tipo_rescisao text CHECK (desligamento_tipo_rescisao IN ('Iniciativa da Empresa', 'Pedido de Demissao', 'Termino de Contrato') OR desligamento_tipo_rescisao IS NULL),
  desligamento_aviso text CHECK (desligamento_aviso IN ('Indenizado', 'Trabalhado', 'Justa Causa') OR desligamento_aviso IS NULL),
  desligamento_periodo_experiencia text CHECK (desligamento_periodo_experiencia IN ('45 dias', '90 dias') OR desligamento_periodo_experiencia IS NULL),
  desligamento_recontratacao text CHECK (desligamento_recontratacao IN ('Podera retornar', 'Nao podera retornar') OR desligamento_recontratacao IS NULL),
  desligamento_justificativa text,
  
  promocao_unidade_atual text,
  promocao_unidade_proposta text,
  promocao_setor_atual text,
  promocao_setor_proposto text,
  promocao_centro_custo_atual text,
  promocao_centro_custo_proposto text,
  promocao_cargo_atual text,
  promocao_cargo_proposto text,
  promocao_salario_base_atual numeric(10,2),
  promocao_salario_base_proposto numeric(10,2),
  promocao_gratificacao_atual numeric(10,2),
  promocao_gratificacao_proposta numeric(10,2),
  promocao_total_mes_atual numeric(10,2),
  promocao_total_mes_proposto numeric(10,2),
  promocao_reajuste_valor numeric(10,2),
  promocao_reajuste_percentual numeric(5,2),
  
  recurso_mesa boolean DEFAULT false,
  recurso_cadeira boolean DEFAULT false,
  recurso_apoio_pes boolean DEFAULT false,
  recurso_epi_bota boolean DEFAULT false,
  
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE movimentacao_requisicao_pessoal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos"
  ON movimentacao_requisicao_pessoal FOR SELECT USING (true);

CREATE POLICY "Permitir insercao para todos"
  ON movimentacao_requisicao_pessoal FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualizacao para todos"
  ON movimentacao_requisicao_pessoal FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusao para todos"
  ON movimentacao_requisicao_pessoal FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_movimentacao_requisicao_requisitante ON movimentacao_requisicao_pessoal(requisitante_id);
CREATE INDEX IF NOT EXISTS idx_movimentacao_requisicao_unidade ON movimentacao_requisicao_pessoal(unidade);
CREATE INDEX IF NOT EXISTS idx_movimentacao_requisicao_motivo ON movimentacao_requisicao_pessoal(motivo);
CREATE INDEX IF NOT EXISTS idx_movimentacao_requisicao_status ON movimentacao_requisicao_pessoal(status);

DROP TRIGGER IF EXISTS update_movimentacao_requisicao_updated_at ON movimentacao_requisicao_pessoal;
CREATE TRIGGER update_movimentacao_requisicao_updated_at
  BEFORE UPDATE ON movimentacao_requisicao_pessoal
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();