/*
  # Tornar gestor_id opcional na tabela feedbacks

  1. Alterações
    - Modificar coluna `gestor_id` para permitir valores NULL
    - Isso permite salvar feedbacks mesmo quando não há um colaborador correspondente ao usuário logado

  2. Razão
    - O campo `gestor_id` estava como NOT NULL, causando erro ao tentar inserir feedback
    - Nem todo usuário supervisor tem um registro correspondente na tabela colaboradores
    - Tornando opcional, o sistema salva o feedback independentemente
*/

-- Tornar gestor_id opcional (permitir NULL)
ALTER TABLE feedbacks
ALTER COLUMN gestor_id DROP NOT NULL;
