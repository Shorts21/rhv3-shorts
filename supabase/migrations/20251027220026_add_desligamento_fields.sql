/*
  # Adicionar Campos de Desligamento

  1. Alterações na Tabela colaboradores
    - `data_desligamento` (date) - Data do desligamento do colaborador
    - `tipo_rescisao` (text) - Tipo de rescisão do contrato
    - `motivo_desligamento` (text) - Motivo detalhado do desligamento

  2. Alterações na Tabela movimentacoes_pessoal
    - `data_desligamento` (date) - Data do desligamento (para histórico)

  3. Índices
    - Adicionar índice em data_desligamento para queries otimizadas
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'data_desligamento'
  ) THEN
    ALTER TABLE colaboradores ADD COLUMN data_desligamento date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'tipo_rescisao'
  ) THEN
    ALTER TABLE colaboradores ADD COLUMN tipo_rescisao text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'motivo_desligamento'
  ) THEN
    ALTER TABLE colaboradores ADD COLUMN motivo_desligamento text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentacoes_pessoal' AND column_name = 'data_desligamento'
  ) THEN
    ALTER TABLE movimentacoes_pessoal ADD COLUMN data_desligamento date;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_colaboradores_data_desligamento 
ON colaboradores(data_desligamento) 
WHERE data_desligamento IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_movimentacoes_data_desligamento 
ON movimentacoes_pessoal(data_desligamento) 
WHERE data_desligamento IS NOT NULL;
