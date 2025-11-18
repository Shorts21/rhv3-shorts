/*
  # Correção: Desabilitar RLS para movimentacao_requisicao_pessoal

  ## Problema
  - Sistema usa autenticação customizada (localStorage)
  - RLS habilitado bloqueia updates porque auth.uid() retorna NULL
  - Já existem políticas public que permitem tudo

  ## Solução
  - Desabilitar RLS nesta tabela
  - Manter controle de acesso na camada da aplicação

  ## Nota
  Esta tabela usa autenticação customizada, não Supabase Auth
*/

-- Desabilitar RLS
ALTER TABLE movimentacao_requisicao_pessoal DISABLE ROW LEVEL SECURITY;

-- Remover políticas desnecessárias
DROP POLICY IF EXISTS "BP_RH pode editar requisições" ON movimentacao_requisicao_pessoal;
DROP POLICY IF EXISTS "BP_RH pode excluir requisições" ON movimentacao_requisicao_pessoal;
DROP POLICY IF EXISTS "Supervisor pode atualizar suas requisições" ON movimentacao_requisicao_pessoal;
DROP POLICY IF EXISTS "Permitir atualização para todos" ON movimentacao_requisicao_pessoal;
DROP POLICY IF EXISTS "Permitir exclusão para todos" ON movimentacao_requisicao_pessoal;
DROP POLICY IF EXISTS "Permitir inserção para todos" ON movimentacao_requisicao_pessoal;
DROP POLICY IF EXISTS "Permitir leitura para todos" ON movimentacao_requisicao_pessoal;
