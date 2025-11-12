/*
  # Corrigir Perfis de Usuários e Adicionar BP RH

  1. Mudanças
    - Remover constraint temporariamente
    - Atualizar perfil 'gestor' para 'supervisor'
    - Recriar constraint com novos perfis
    - Adicionar usuárias Paloma e Claudia como BP RH

  2. Novos Perfis
    - rh: RH administrativo
    - supervisor: Supervisor de equipe (anteriormente 'gestor')
    - colaborador: Colaborador comum
    - bp_rh: Business Partner RH (acesso administrativo total)
*/

-- 1. Remover constraint temporariamente
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_perfil_check;

-- 2. Atualizar os perfis existentes 'gestor' para 'supervisor'
UPDATE usuarios
SET perfil = 'supervisor', updated_at = now()
WHERE perfil = 'gestor';

-- 3. Recriar constraint com todos os perfis
ALTER TABLE usuarios ADD CONSTRAINT usuarios_perfil_check 
  CHECK (perfil IN ('rh', 'supervisor', 'colaborador', 'bp_rh'));

-- 4. Inserir Paloma como Business Partner RH
INSERT INTO usuarios (id, nome, telefone, perfil, ativo, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Paloma',
  '111111',
  'bp_rh',
  true,
  now(),
  now()
)
ON CONFLICT (telefone) DO UPDATE
SET perfil = 'bp_rh', ativo = true, updated_at = now();

-- 5. Inserir Claudia como Business Partner RH
INSERT INTO usuarios (id, nome, telefone, perfil, ativo, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Claudia',
  '222222',
  'bp_rh',
  true,
  now(),
  now()
)
ON CONFLICT (telefone) DO UPDATE
SET perfil = 'bp_rh', ativo = true, updated_at = now();