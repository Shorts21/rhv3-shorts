/*
  # Corrigir Políticas RLS para Unidades e Setores

  1. Mudanças
    - Remover políticas antigas que limitam visualização apenas a ativos
    - Criar novas políticas que permitem RH visualizar TODOS os registros
    - Manter permissões de insert, update e delete apenas para RH

  2. Segurança
    - RH pode visualizar, criar, editar e deletar
    - Apenas registros ativos ficam disponíveis para outros usuários
*/

-- Remover políticas antigas de SELECT
DROP POLICY IF EXISTS "Todos podem visualizar unidades ativas" ON unidades;
DROP POLICY IF EXISTS "Todos podem visualizar setores ativos" ON setores;

-- Criar novas políticas de SELECT para RH (todos os registros)
CREATE POLICY "RH pode visualizar todas unidades"
  ON unidades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.perfil = 'rh'
    )
  );

CREATE POLICY "RH pode visualizar todos setores"
  ON setores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.perfil = 'rh'
    )
  );

-- Criar políticas de SELECT para outros usuários (apenas ativos)
CREATE POLICY "Outros podem visualizar unidades ativas"
  ON unidades FOR SELECT
  TO authenticated
  USING (
    ativo = true 
    AND NOT EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.perfil = 'rh'
    )
  );

CREATE POLICY "Outros podem visualizar setores ativos"
  ON setores FOR SELECT
  TO authenticated
  USING (
    ativo = true 
    AND NOT EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.perfil = 'rh'
    )
  );
