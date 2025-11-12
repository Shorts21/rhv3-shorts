/*
  # Criar Views para Indicadores de Turnover (Versão 2)

  1. Nova View: indicadores_turnover_mensal
    - Agregação mensal usando colaboradores e movimentacoes_pessoal
    - Cálculos de turnover geral, voluntário, involuntário e retenção
    - Suporta filtros por período

  2. Nova View: indicadores_turnover_unidade
    - Agregação por unidade organizacional
    - Ranking de turnover por unidade
    - Métricas comparativas entre unidades

  3. Benefícios
    - Queries mais rápidas com dados pré-calculados
    - Facilita análise temporal e comparativa
    - Suporta filtros dinâmicos no frontend
*/

CREATE OR REPLACE VIEW indicadores_turnover_mensal AS
WITH desligamentos_mes AS (
  SELECT 
    DATE_TRUNC('month', COALESCE(c.data_desligamento, mp.data_desligamento))::date as mes_referencia,
    c.id as colaborador_id,
    COALESCE(c.tipo_rescisao, mp.tipo_rescisao) as tipo_rescisao,
    c.unidade,
    c.setor
  FROM colaboradores c
  LEFT JOIN movimentacoes_pessoal mp ON mp.colaborador_id = c.id AND mp.tipo_movimentacao = 'desligamento'
  WHERE c.data_desligamento IS NOT NULL OR mp.data_desligamento IS NOT NULL
),
ativos_por_mes AS (
  SELECT 
    DATE_TRUNC('month', CURRENT_DATE)::date as mes_referencia,
    COUNT(*) as total_ativos
  FROM colaboradores
  WHERE status = 'ativo'
)
SELECT 
  d.mes_referencia,
  COUNT(DISTINCT d.colaborador_id) as total_desligamentos,
  COUNT(DISTINCT CASE WHEN d.tipo_rescisao = 'Pedido de Demissão' THEN d.colaborador_id END) as desligamentos_voluntarios,
  COUNT(DISTINCT CASE WHEN d.tipo_rescisao IN ('Iniciativa da Empresa', 'Justa Causa') THEN d.colaborador_id END) as desligamentos_involuntarios,
  COALESCE(a.total_ativos, 1) as total_ativos,
  ROUND(
    (COUNT(DISTINCT d.colaborador_id)::numeric / NULLIF(COALESCE(a.total_ativos, 1), 0) * 100), 1
  ) as turnover_geral,
  ROUND(
    (COUNT(DISTINCT CASE WHEN d.tipo_rescisao = 'Pedido de Demissão' THEN d.colaborador_id END)::numeric / 
    NULLIF(COUNT(DISTINCT d.colaborador_id), 0) * 100), 1
  ) as turnover_voluntario,
  ROUND(
    (COUNT(DISTINCT CASE WHEN d.tipo_rescisao IN ('Iniciativa da Empresa', 'Justa Causa') THEN d.colaborador_id END)::numeric / 
    NULLIF(COUNT(DISTINCT d.colaborador_id), 0) * 100), 1
  ) as turnover_involuntario,
  ROUND(
    100 - (COUNT(DISTINCT d.colaborador_id)::numeric / NULLIF(COALESCE(a.total_ativos, 1), 0) * 100), 1
  ) as retencao,
  0.0 as turnover_experiencia
FROM desligamentos_mes d
LEFT JOIN ativos_por_mes a ON TRUE
GROUP BY d.mes_referencia, a.total_ativos
ORDER BY d.mes_referencia DESC;

CREATE OR REPLACE VIEW indicadores_turnover_unidade AS
WITH desligamentos_unidade AS (
  SELECT 
    COALESCE(c.unidade, mp.unidade_atual) as unidade,
    c.id as colaborador_id,
    COALESCE(c.tipo_rescisao, mp.tipo_rescisao) as tipo_rescisao
  FROM colaboradores c
  LEFT JOIN movimentacoes_pessoal mp ON mp.colaborador_id = c.id AND mp.tipo_movimentacao = 'desligamento'
  WHERE (c.data_desligamento IS NOT NULL OR mp.data_desligamento IS NOT NULL)
    AND COALESCE(c.unidade, mp.unidade_atual) IS NOT NULL
),
ativos_unidade AS (
  SELECT 
    unidade,
    COUNT(*) as total_ativos
  FROM colaboradores
  WHERE status = 'ativo' AND unidade IS NOT NULL
  GROUP BY unidade
)
SELECT 
  d.unidade,
  COUNT(DISTINCT d.colaborador_id) as total_desligamentos,
  COUNT(DISTINCT CASE WHEN d.tipo_rescisao = 'Pedido de Demissão' THEN d.colaborador_id END) as desligamentos_voluntarios,
  COUNT(DISTINCT CASE WHEN d.tipo_rescisao IN ('Iniciativa da Empresa', 'Justa Causa') THEN d.colaborador_id END) as desligamentos_involuntarios,
  COALESCE(a.total_ativos, 0) as total_ativos_unidade,
  ROUND(
    (COUNT(DISTINCT d.colaborador_id)::numeric / NULLIF(COALESCE(a.total_ativos, 1), 0) * 100), 1
  ) as turnover_geral,
  ROUND(
    (COUNT(DISTINCT CASE WHEN d.tipo_rescisao = 'Pedido de Demissão' THEN d.colaborador_id END)::numeric / 
    NULLIF(COUNT(DISTINCT d.colaborador_id), 0) * 100), 1
  ) as turnover_voluntario,
  ROUND(
    (COUNT(DISTINCT CASE WHEN d.tipo_rescisao IN ('Iniciativa da Empresa', 'Justa Causa') THEN d.colaborador_id END)::numeric / 
    NULLIF(COUNT(DISTINCT d.colaborador_id), 0) * 100), 1
  ) as turnover_involuntario
FROM desligamentos_unidade d
LEFT JOIN ativos_unidade a ON a.unidade = d.unidade
GROUP BY d.unidade, a.total_ativos
ORDER BY turnover_geral DESC NULLS LAST;

GRANT SELECT ON indicadores_turnover_mensal TO authenticated;
GRANT SELECT ON indicadores_turnover_unidade TO authenticated;
