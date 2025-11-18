/*
  # Correção: Desabilitar RLS para avaliacoes_experiencia

  ## Problema
  - Sistema usa autenticação customizada (localStorage)
  - RLS habilitado bloqueia INSERT/UPDATE porque auth.uid() retorna NULL
  - Já existem políticas public que permitem tudo

  ## Solução
  - Desabilitar RLS nesta tabela
  - Manter controle de acesso na camada da aplicação

  ## Nota
  Esta tabela usa autenticação customizada, não Supabase Auth
*/

-- Desabilitar RLS
ALTER TABLE avaliacoes_experiencia DISABLE ROW LEVEL SECURITY;

-- Remover políticas desnecessárias
DROP POLICY IF EXISTS "Permitir atualização para todos" ON avaliacoes_experiencia;
DROP POLICY IF EXISTS "Permitir exclusão para todos" ON avaliacoes_experiencia;
DROP POLICY IF EXISTS "Permitir inserção para todos" ON avaliacoes_experiencia;
DROP POLICY IF EXISTS "Permitir leitura para todos" ON avaliacoes_experiencia;
