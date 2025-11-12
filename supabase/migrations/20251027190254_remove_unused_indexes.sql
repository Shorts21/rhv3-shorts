/*
  # Remover Índices Não Utilizados

  1. Problema
    - Vários índices criados mas nunca utilizados nas queries
    - Índices não utilizados ocupam espaço e reduzem performance de writes

  2. Índices a Remover
    - avaliacoes: idx_avaliacoes_colaborador_id, idx_avaliacoes_avaliador_id, idx_avaliacoes_data
    - feedbacks: idx_feedbacks_colaborador_id, idx_feedbacks_gestor_id
    - movimentacoes_pessoal: idx_movimentacoes_colaborador_id
    - audio_devolutivas: idx_audio_devolutivas_colaborador_id
    - avaliacoes_experiencia: idx_avaliacoes_experiencia_colaborador_id, idx_avaliacoes_experiencia_avaliador_id, idx_avaliacoes_experiencia_periodo
    - movimentacao_requisicao_pessoal: idx_movimentacao_requisicao_requisitante, idx_movimentacao_requisicao_unidade, idx_movimentacao_requisicao_motivo, idx_movimentacao_requisicao_status
    - avaliacoes_desempenho_feedback: idx_avaliacoes_feedback_colaborador_id, idx_avaliacoes_feedback_avaliador_id, idx_avaliacoes_feedback_trimestre

  3. Impacto
    - Reduz overhead em operações INSERT/UPDATE/DELETE
    - Libera espaço em disco
    - Mantém performance de leitura (índices não eram usados)
*/

DROP INDEX IF EXISTS idx_avaliacoes_colaborador_id;
DROP INDEX IF EXISTS idx_avaliacoes_avaliador_id;
DROP INDEX IF EXISTS idx_avaliacoes_data;

DROP INDEX IF EXISTS idx_feedbacks_colaborador_id;
DROP INDEX IF EXISTS idx_feedbacks_gestor_id;

DROP INDEX IF EXISTS idx_movimentacoes_colaborador_id;

DROP INDEX IF EXISTS idx_audio_devolutivas_colaborador_id;

DROP INDEX IF EXISTS idx_avaliacoes_experiencia_colaborador_id;
DROP INDEX IF EXISTS idx_avaliacoes_experiencia_avaliador_id;
DROP INDEX IF EXISTS idx_avaliacoes_experiencia_periodo;

DROP INDEX IF EXISTS idx_movimentacao_requisicao_requisitante;
DROP INDEX IF EXISTS idx_movimentacao_requisicao_unidade;
DROP INDEX IF EXISTS idx_movimentacao_requisicao_motivo;
DROP INDEX IF EXISTS idx_movimentacao_requisicao_status;

DROP INDEX IF EXISTS idx_avaliacoes_feedback_colaborador_id;
DROP INDEX IF EXISTS idx_avaliacoes_feedback_avaliador_id;
DROP INDEX IF EXISTS idx_avaliacoes_feedback_trimestre;
