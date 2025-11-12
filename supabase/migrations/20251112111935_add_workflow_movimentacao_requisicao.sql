/*
  # Adicionar Workflow de Aprovação - Movimentação/Requisição de Pessoal

  ## Objetivo
  Implementar fluxo de aprovação com BP_RH (Paloma/Claudia) podendo:
  - Aprovar requisições
  - Solicitar correções ao supervisor
  - Editar e excluir requisições
  - Adicionar comentários de aprovação

  ## Alterações na Tabela

  1. Novos Campos de Workflow
    - `aprovador_id` (uuid): ID do BP_RH que aprovou/rejeitou
    - `aprovador_nome` (text): Nome do aprovador
    - `data_aprovacao` (timestamp): Data da aprovação/rejeição
    - `comentario_aprovacao` (text): Comentário do BP_RH
    - `solicitacao_correcao` (text): Descrição das correções solicitadas
    - `data_correcao` (timestamp): Data da última correção pelo supervisor

  2. Atualização do Campo Status
    - `pendente`: Aguardando aprovação do BP_RH
    - `em_correcao`: BP_RH solicitou correções ao supervisor
    - `corrigida`: Supervisor fez correções, aguardando nova aprovação
    - `aprovada`: Aprovada pelo BP_RH
    - `rejeitada`: Rejeitada pelo BP_RH

  ## Segurança
  - RLS já está habilitado na tabela
  - Políticas serão ajustadas para permitir edição/exclusão por BP_RH
*/

-- Adicionar novos campos de workflow
ALTER TABLE movimentacao_requisicao_pessoal
  ADD COLUMN IF NOT EXISTS aprovador_id uuid REFERENCES usuarios(id),
  ADD COLUMN IF NOT EXISTS aprovador_nome text,
  ADD COLUMN IF NOT EXISTS data_aprovacao timestamptz,
  ADD COLUMN IF NOT EXISTS comentario_aprovacao text,
  ADD COLUMN IF NOT EXISTS solicitacao_correcao text,
  ADD COLUMN IF NOT EXISTS data_correcao timestamptz;

-- Atualizar comentário do campo status
COMMENT ON COLUMN movimentacao_requisicao_pessoal.status IS 
  'Status: pendente, em_correcao, corrigida, aprovada, rejeitada';

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_movimentacao_requisicao_aprovador 
  ON movimentacao_requisicao_pessoal(aprovador_id);

CREATE INDEX IF NOT EXISTS idx_movimentacao_requisicao_status 
  ON movimentacao_requisicao_pessoal(status);

-- Atualizar política de UPDATE para permitir BP_RH editar
DROP POLICY IF EXISTS "BP_RH pode editar requisições" ON movimentacao_requisicao_pessoal;

CREATE POLICY "BP_RH pode editar requisições"
  ON movimentacao_requisicao_pessoal
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.perfil IN ('rh', 'bp_rh')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.perfil IN ('rh', 'bp_rh')
    )
  );

-- Política de DELETE para BP_RH
DROP POLICY IF EXISTS "BP_RH pode excluir requisições" ON movimentacao_requisicao_pessoal;

CREATE POLICY "BP_RH pode excluir requisições"
  ON movimentacao_requisicao_pessoal
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.perfil IN ('rh', 'bp_rh')
    )
  );

-- Permitir supervisores atualizarem suas próprias requisições (para correções)
DROP POLICY IF EXISTS "Supervisor pode atualizar suas requisições" ON movimentacao_requisicao_pessoal;

CREATE POLICY "Supervisor pode atualizar suas requisições"
  ON movimentacao_requisicao_pessoal
  FOR UPDATE
  TO authenticated
  USING (requisitante_id = auth.uid())
  WITH CHECK (requisitante_id = auth.uid());
