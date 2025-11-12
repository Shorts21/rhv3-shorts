/*
  # Remove Foreign Key Constraint on gestor_id

  1. Changes
    - Remove the foreign key constraint on colaboradores.gestor_id
    - This allows gestor_id to reference users from the application's auth system
    - The application uses custom authentication, not database-stored users

  2. Notes
    - gestor_id can now be any valid UUID
    - Application-level validation ensures gestor_id corresponds to valid users
    - This prevents the chicken-and-egg problem where gestors must be colaboradores
*/

-- Remove the foreign key constraint
ALTER TABLE colaboradores DROP CONSTRAINT IF EXISTS colaboradores_gestor_id_fkey;
