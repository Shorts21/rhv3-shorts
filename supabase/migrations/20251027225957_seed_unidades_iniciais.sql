/*
  # Cadastrar Unidades Iniciais

  1. Dados
    - Inserir unidades base da empresa
    - Todas ativas por padrão
    - Evitar duplicatas

  2. Unidades
    - Cristalina
    - Correntina
    - Corporativo
    - Papaduva
    - São Gabriel
    - Uberlândia
*/

-- Inserir unidades apenas se não existirem
INSERT INTO unidades (nome, descricao, ativo)
SELECT * FROM (
  VALUES
    ('Cristalina', 'Unidade Cristalina', true),
    ('Correntina', 'Unidade Correntina', true),
    ('Corporativo', 'Unidade Corporativa', true),
    ('Papaduva', 'Unidade Papaduva', true),
    ('São Gabriel', 'Unidade São Gabriel', true),
    ('Uberlândia', 'Unidade Uberlândia', true)
) AS v(nome, descricao, ativo)
WHERE NOT EXISTS (
  SELECT 1 FROM unidades WHERE unidades.nome = v.nome
);
