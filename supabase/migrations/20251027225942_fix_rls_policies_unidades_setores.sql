/*
  # Corrigir Políticas RLS para Unidades e Setores

  1. Mudanças
    - Simplificar políticas para permitir operações de RH
    - Criar política mais permissiva para authenticated users
    - Remover dependência complexa da tabela usuarios

  2. Segurança
    - Authenticated users podem criar/editar/deletar
    - Mantém controle de acesso básico
*/

-- UNIDADES: Remover todas as políticas antigas
DROP POLICY IF EXISTS "RH pode visualizar todas unidades" ON unidades;
DROP POLICY IF EXISTS "Outros podem visualizar unidades ativas" ON unidades;
DROP POLICY IF EXISTS "RH pode inserir unidades" ON unidades;
DROP POLICY IF EXISTS "RH pode atualizar unidades" ON unidades;
DROP POLICY IF EXISTS "RH pode deletar unidades" ON unidades;
DROP POLICY IF EXISTS "Todos podem visualizar unidades ativas" ON unidades;

-- Criar novas políticas simplificadas para unidades
CREATE POLICY "Authenticated users podem visualizar unidades"
  ON unidades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users podem inserir unidades"
  ON unidades FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users podem atualizar unidades"
  ON unidades FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users podem deletar unidades"
  ON unidades FOR DELETE
  TO authenticated
  USING (true);

-- SETORES: Remover todas as políticas antigas
DROP POLICY IF EXISTS "RH pode visualizar todos setores" ON setores;
DROP POLICY IF EXISTS "Outros podem visualizar setores ativos" ON setores;
DROP POLICY IF EXISTS "RH pode inserir setores" ON setores;
DROP POLICY IF EXISTS "RH pode atualizar setores" ON setores;
DROP POLICY IF EXISTS "RH pode deletar setores" ON setores;
DROP POLICY IF EXISTS "Todos podem visualizar setores ativos" ON setores;

-- Criar novas políticas simplificadas para setores
CREATE POLICY "Authenticated users podem visualizar setores"
  ON setores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users podem inserir setores"
  ON setores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users podem atualizar setores"
  ON setores FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users podem deletar setores"
  ON setores FOR DELETE
  TO authenticated
  USING (true);
