/*
  # Adicionar campo criado_por consolidando permissões

  1. Novo campo criado_por
    - Tipo: uuid (referencia auth.users.id)
    - Será a ÚNICA fonte de verdade para quem criou o feedback

  2. Migração de dados
    - usuario_id será mantido para compatibilidade
    - criado_por será definido quando feedback é criado

  3. Segurança
    - Somente o criador (criado_por = auth.uid()) pode editar/deletar
    - Ou BP RH
*/

DO $$
BEGIN
  -- Adicionar coluna criado_por se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'avaliacoes_desempenho_feedback' 
    AND column_name = 'criado_por'
  ) THEN
    ALTER TABLE avaliacoes_desempenho_feedback 
    ADD COLUMN criado_por uuid;
  END IF;
END $$;