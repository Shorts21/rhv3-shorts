/*
  # Corrigir Performance da RLS Policy

  1. Problema
    - Policy "Only RH can update system settings" reavalia auth.uid() para cada linha
    - Causa problemas de performance em escala

  2. Solução
    - Substituir auth.uid() direto por (select auth.uid())
    - Força avaliação única da função em vez de por linha

  3. Segurança
    - Mantém mesma lógica de segurança
    - Melhora performance significativamente
*/

DROP POLICY IF EXISTS "Only RH can update system settings" ON system_settings;

CREATE POLICY "Only RH can update system settings"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.perfil = 'rh'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = (select auth.uid())
      AND usuarios.perfil = 'rh'
    )
  );
