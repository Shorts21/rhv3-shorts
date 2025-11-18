/*
  # Desabilitar RLS em todas as tabelas - Sistema usa autenticação customizada

  ## Problema
  - Sistema inteiro usa autenticação customizada (localStorage)
  - RLS habilitado bloqueia operações porque auth.uid() retorna NULL
  - Todas as políticas usam 'public' role, permitindo tudo

  ## Solução
  - Desabilitar RLS em todas as tabelas do sistema
  - Controle de acesso gerenciado na camada da aplicação

  ## Tabelas Afetadas
  - audios_devolutiva
  - avaliacao_desempenho_supervisor
  - avaliacoes_desempenho
  - avaliacoes_desempenho_feedback
  - cargos
  - colaboradores
  - competencias
  - feedbacks
  - movimentacao_pessoal
  - setores
  - system_settings
  - unidades
  - usuarios
*/

-- Desabilitar RLS em todas as tabelas
ALTER TABLE audios_devolutiva DISABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacao_desempenho_supervisor DISABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_desempenho DISABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_desempenho_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE cargos DISABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores DISABLE ROW LEVEL SECURITY;
ALTER TABLE competencias DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacao_pessoal DISABLE ROW LEVEL SECURITY;
ALTER TABLE setores DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE unidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas RLS (já que não são mais necessárias)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'audios_devolutiva',
            'avaliacao_desempenho_supervisor',
            'avaliacoes_desempenho',
            'avaliacoes_desempenho_feedback',
            'cargos',
            'colaboradores',
            'competencias',
            'feedbacks',
            'movimentacao_pessoal',
            'setores',
            'system_settings',
            'unidades',
            'usuarios'
        )
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;
