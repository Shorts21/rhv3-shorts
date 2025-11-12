/*
  # Corrigir Todas as Políticas RLS para Public

  1. Mudanças
    - Corrigir RLS de todas as tabelas principais
    - Alterar políticas de authenticated para public
    - Garantir que INSERT/UPDATE/DELETE funcionem

  2. Tabelas Afetadas
    - colaboradores
    - avaliacoes_desempenho
    - avaliacoes_experiencia
    - feedbacks
    - movimentacoes
    - movimentacao_requisicao_pessoal
    - cargos

  3. Segurança
    - Políticas permitem operações para public
    - RLS permanece ativado
*/

-- ========================================
-- COLABORADORES
-- ========================================
ALTER TABLE colaboradores DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users podem visualizar colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "Authenticated users podem inserir colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "Authenticated users podem atualizar colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "Authenticated users podem deletar colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "Usuários podem ver colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "Usuários podem inserir colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "Usuários podem atualizar colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "Usuários podem deletar colaboradores" ON colaboradores;

ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public pode visualizar colaboradores"
  ON colaboradores FOR SELECT TO public USING (true);

CREATE POLICY "Public pode inserir colaboradores"
  ON colaboradores FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public pode atualizar colaboradores"
  ON colaboradores FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public pode deletar colaboradores"
  ON colaboradores FOR DELETE TO public USING (true);

-- ========================================
-- AVALIACOES_DESEMPENHO
-- ========================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'avaliacoes_desempenho') THEN
    ALTER TABLE avaliacoes_desempenho DISABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Authenticated users podem visualizar avaliacoes" ON avaliacoes_desempenho;
    DROP POLICY IF EXISTS "Authenticated users podem inserir avaliacoes" ON avaliacoes_desempenho;
    DROP POLICY IF EXISTS "Authenticated users podem atualizar avaliacoes" ON avaliacoes_desempenho;
    DROP POLICY IF EXISTS "Authenticated users podem deletar avaliacoes" ON avaliacoes_desempenho;
    
    ALTER TABLE avaliacoes_desempenho ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Public pode visualizar avaliacoes"
      ON avaliacoes_desempenho FOR SELECT TO public USING (true);
    
    CREATE POLICY "Public pode inserir avaliacoes"
      ON avaliacoes_desempenho FOR INSERT TO public WITH CHECK (true);
    
    CREATE POLICY "Public pode atualizar avaliacoes"
      ON avaliacoes_desempenho FOR UPDATE TO public USING (true) WITH CHECK (true);
    
    CREATE POLICY "Public pode deletar avaliacoes"
      ON avaliacoes_desempenho FOR DELETE TO public USING (true);
  END IF;
END $$;

-- ========================================
-- AVALIACOES_EXPERIENCIA
-- ========================================
ALTER TABLE avaliacoes_experiencia DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users podem visualizar avaliacoes_experiencia" ON avaliacoes_experiencia;
DROP POLICY IF EXISTS "Authenticated users podem inserir avaliacoes_experiencia" ON avaliacoes_experiencia;
DROP POLICY IF EXISTS "Authenticated users podem atualizar avaliacoes_experiencia" ON avaliacoes_experiencia;
DROP POLICY IF EXISTS "Authenticated users podem deletar avaliacoes_experiencia" ON avaliacoes_experiencia;

ALTER TABLE avaliacoes_experiencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public pode visualizar avaliacoes_experiencia"
  ON avaliacoes_experiencia FOR SELECT TO public USING (true);

CREATE POLICY "Public pode inserir avaliacoes_experiencia"
  ON avaliacoes_experiencia FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public pode atualizar avaliacoes_experiencia"
  ON avaliacoes_experiencia FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public pode deletar avaliacoes_experiencia"
  ON avaliacoes_experiencia FOR DELETE TO public USING (true);

-- ========================================
-- FEEDBACKS
-- ========================================
ALTER TABLE feedbacks DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users podem visualizar feedbacks" ON feedbacks;
DROP POLICY IF EXISTS "Authenticated users podem inserir feedbacks" ON feedbacks;
DROP POLICY IF EXISTS "Authenticated users podem atualizar feedbacks" ON feedbacks;
DROP POLICY IF EXISTS "Authenticated users podem deletar feedbacks" ON feedbacks;

ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public pode visualizar feedbacks"
  ON feedbacks FOR SELECT TO public USING (true);

CREATE POLICY "Public pode inserir feedbacks"
  ON feedbacks FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public pode atualizar feedbacks"
  ON feedbacks FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public pode deletar feedbacks"
  ON feedbacks FOR DELETE TO public USING (true);

-- ========================================
-- MOVIMENTACOES
-- ========================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'movimentacoes') THEN
    ALTER TABLE movimentacoes DISABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Authenticated users podem visualizar movimentacoes" ON movimentacoes;
    DROP POLICY IF EXISTS "Authenticated users podem inserir movimentacoes" ON movimentacoes;
    DROP POLICY IF EXISTS "Authenticated users podem atualizar movimentacoes" ON movimentacoes;
    DROP POLICY IF EXISTS "Authenticated users podem deletar movimentacoes" ON movimentacoes;
    
    ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Public pode visualizar movimentacoes"
      ON movimentacoes FOR SELECT TO public USING (true);
    
    CREATE POLICY "Public pode inserir movimentacoes"
      ON movimentacoes FOR INSERT TO public WITH CHECK (true);
    
    CREATE POLICY "Public pode atualizar movimentacoes"
      ON movimentacoes FOR UPDATE TO public USING (true) WITH CHECK (true);
    
    CREATE POLICY "Public pode deletar movimentacoes"
      ON movimentacoes FOR DELETE TO public USING (true);
  END IF;
END $$;

-- ========================================
-- MOVIMENTACAO_REQUISICAO_PESSOAL
-- ========================================
ALTER TABLE movimentacao_requisicao_pessoal DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users podem visualizar requisicoes" ON movimentacao_requisicao_pessoal;
DROP POLICY IF EXISTS "Authenticated users podem inserir requisicoes" ON movimentacao_requisicao_pessoal;
DROP POLICY IF EXISTS "Authenticated users podem atualizar requisicoes" ON movimentacao_requisicao_pessoal;
DROP POLICY IF EXISTS "Authenticated users podem deletar requisicoes" ON movimentacao_requisicao_pessoal;

ALTER TABLE movimentacao_requisicao_pessoal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public pode visualizar requisicoes"
  ON movimentacao_requisicao_pessoal FOR SELECT TO public USING (true);

CREATE POLICY "Public pode inserir requisicoes"
  ON movimentacao_requisicao_pessoal FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public pode atualizar requisicoes"
  ON movimentacao_requisicao_pessoal FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public pode deletar requisicoes"
  ON movimentacao_requisicao_pessoal FOR DELETE TO public USING (true);

-- ========================================
-- CARGOS (já tinha políticas public, mas garantir)
-- ========================================
DO $$
BEGIN
  -- Verificar se já não tem políticas public
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cargos' 
    AND policyname LIKE 'Public pode%'
  ) THEN
    ALTER TABLE cargos DISABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Permitir leitura para todos" ON cargos;
    DROP POLICY IF EXISTS "Permitir inserção para todos" ON cargos;
    DROP POLICY IF EXISTS "Permitir atualização para todos" ON cargos;
    DROP POLICY IF EXISTS "Permitir exclusão para todos" ON cargos;
    
    ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Public pode visualizar cargos"
      ON cargos FOR SELECT TO public USING (true);
    
    CREATE POLICY "Public pode inserir cargos"
      ON cargos FOR INSERT TO public WITH CHECK (true);
    
    CREATE POLICY "Public pode atualizar cargos"
      ON cargos FOR UPDATE TO public USING (true) WITH CHECK (true);
    
    CREATE POLICY "Public pode deletar cargos"
      ON cargos FOR DELETE TO public USING (true);
  END IF;
END $$;
