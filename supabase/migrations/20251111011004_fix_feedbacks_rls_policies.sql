/*
  # Corrigir Políticas RLS da Tabela Feedbacks

  1. Mudanças
    - Dropar política atual que requer autenticação Supabase
    - Criar políticas abertas para autenticação customizada
    - Permitir todas operações (SELECT, INSERT, UPDATE, DELETE)

  2. Segurança
    - RLS habilitado
    - Políticas abertas para permitir sistema de autenticação customizado
*/

-- Dropar política existente
DROP POLICY IF EXISTS "Permitir todas operações para usuários autenticados" ON feedbacks;

-- Criar políticas abertas
CREATE POLICY "Permitir leitura para todos"
  ON feedbacks FOR SELECT 
  USING (true);

CREATE POLICY "Permitir inserção para todos"
  ON feedbacks FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos"
  ON feedbacks FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos"
  ON feedbacks FOR DELETE 
  USING (true);