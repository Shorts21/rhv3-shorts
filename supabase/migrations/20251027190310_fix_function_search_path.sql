/*
  # Corrigir Search Path da Função

  1. Problema
    - Função update_updated_at_column tem search_path mutável por role
    - Pode causar vulnerabilidades de segurança (search path injection)

  2. Solução
    - Recriar função com search_path imutável
    - Usar schema-qualified names (pg_catalog)
    - Adicionar SECURITY DEFINER com SET search_path

  3. Segurança
    - Previne ataques de search path injection
    - Garante que função sempre usa schema correto
    - Melhora segurança geral do banco
*/

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
