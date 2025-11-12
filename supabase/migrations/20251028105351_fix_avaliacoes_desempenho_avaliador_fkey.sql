/*
  # Corrigir Foreign Key do Avaliador

  1. Problema
    - avaliador_id aponta para colaboradores, mas deveria aceitar usuarios (gestores)
    - Gestores estão na tabela usuarios, não em colaboradores

  2. Solução
    - Remover constraint de foreign key do avaliador_id
    - Permitir UUID livre para avaliador_id (gestores/RH da tabela usuarios)
    - Manter apenas foreign key de colaborador_id (esse sim está em colaboradores)

  3. Resultado
    - Sistema pode salvar avaliações com gestores da tabela usuarios
    - Joins no SELECT ainda funcionam (via left join)
*/

-- Drop da constraint de foreign key do avaliador_id
ALTER TABLE avaliacoes_desempenho
DROP CONSTRAINT IF EXISTS avaliacoes_desempenho_avaliador_id_fkey;

-- Recriar a coluna sem constraint (apenas NOT NULL)
-- A coluna já existe, então não precisa recriar

-- Adicionar comentário explicativo
COMMENT ON COLUMN avaliacoes_desempenho.avaliador_id IS 
'UUID do avaliador (pode ser de usuarios.id ou colaboradores.id)';
