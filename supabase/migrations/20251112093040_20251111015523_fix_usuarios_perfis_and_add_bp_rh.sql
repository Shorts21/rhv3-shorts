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

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_perfil_check;

UPDATE usuarios
SET perfil = 'supervisor', updated_at = now()
WHERE perfil = 'gestor';

ALTER TABLE usuarios ADD CONSTRAINT usuarios_perfil_check 
  CHECK (perfil IN ('rh', 'supervisor', 'colaborador', 'bp_rh'));

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