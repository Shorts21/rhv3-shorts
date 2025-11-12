/*
  # Atualizar Estrutura da Avaliaçao de Desempenho Supervisor
  
  1. Mudanças
    - Remover colunas antigas (estrutura anterior de 145 pontos)
    - Adicionar nova estrutura conforme PDF (100 pontos)
    - Adicionar campo unidade
    - Ajustar sistema de pontuaçao
  
  2. Nova Estrutura (100 pontos total)
    - Assiduidade (25 pts): Faltas (20) + Atestados (5)
    - Disciplina (25 pts): Advertencias (15) + Suspensoes (10)
    - Saude e Segurança (10 pts): Restriçoes SESMT
    - Resultados (25 pts): Desempenho tecnico
    - Desenvolvimento (15 pts): Participaçao em treinamentos
*/

-- Adicionar coluna unidade
ALTER TABLE avaliacao_desempenho_supervisor 
ADD COLUMN IF NOT EXISTS unidade text;

-- Adicionar novas colunas conforme PDF
-- 1. Assiduidade (25 pontos)
ALTER TABLE avaliacao_desempenho_supervisor 
ADD COLUMN IF NOT EXISTS assiduidade_faltas_injustificadas integer DEFAULT 0 CHECK (assiduidade_faltas_injustificadas >= 0 AND assiduidade_faltas_injustificadas <= 20);

ALTER TABLE avaliacao_desempenho_supervisor 
ADD COLUMN IF NOT EXISTS assiduidade_atestados_medicos integer DEFAULT 0 CHECK (assiduidade_atestados_medicos >= 0 AND assiduidade_atestados_medicos <= 5);

-- 2. Disciplina (25 pontos)
ALTER TABLE avaliacao_desempenho_supervisor 
ADD COLUMN IF NOT EXISTS disciplina_advertencias_pontos integer DEFAULT 0 CHECK (disciplina_advertencias_pontos >= 0 AND disciplina_advertencias_pontos <= 15);

ALTER TABLE avaliacao_desempenho_supervisor 
ADD COLUMN IF NOT EXISTS disciplina_suspensoes integer DEFAULT 0 CHECK (disciplina_suspensoes >= 0 AND disciplina_suspensoes <= 10);

-- 3. Saude e Segurança (10 pontos)
ALTER TABLE avaliacao_desempenho_supervisor 
ADD COLUMN IF NOT EXISTS saude_restricoes_sesmt integer DEFAULT 0 CHECK (saude_restricoes_sesmt >= 0 AND saude_restricoes_sesmt <= 10);

ALTER TABLE avaliacao_desempenho_supervisor 
ADD COLUMN IF NOT EXISTS saude_obs text;

-- 4. Resultados na Area (25 pontos)
ALTER TABLE avaliacao_desempenho_supervisor 
ADD COLUMN IF NOT EXISTS resultados_desempenho_tecnico integer DEFAULT 0 CHECK (resultados_desempenho_tecnico >= 0 AND resultados_desempenho_tecnico <= 25);

ALTER TABLE avaliacao_desempenho_supervisor 
ADD COLUMN IF NOT EXISTS resultados_obs text;

-- 5. Desenvolvimento (15 pontos)
ALTER TABLE avaliacao_desempenho_supervisor 
ADD COLUMN IF NOT EXISTS desenvolvimento_treinamentos integer DEFAULT 0 CHECK (desenvolvimento_treinamentos >= 0 AND desenvolvimento_treinamentos <= 15);

ALTER TABLE avaliacao_desempenho_supervisor 
ADD COLUMN IF NOT EXISTS desenvolvimento_obs text;

-- Comentario: Mantemos as colunas antigas por compatibilidade, mas o sistema usara as novas