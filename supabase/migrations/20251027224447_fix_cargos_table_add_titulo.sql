/*
  # Adicionar campo titulo à tabela cargos

  1. Mudanças
    - Adicionar coluna 'titulo' como alias/cópia de 'nome'
    - Criar trigger para manter sincronizado
    - Garantir compatibilidade com código existente

  2. Notas
    - Mantém campo 'nome' como principal
    - Campo 'titulo' criado para compatibilidade
*/

-- Adicionar coluna titulo se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cargos' AND column_name = 'titulo'
  ) THEN
    ALTER TABLE cargos ADD COLUMN titulo text;
    
    -- Copiar valores existentes de nome para titulo
    UPDATE cargos SET titulo = nome WHERE titulo IS NULL;
    
    -- Criar trigger para manter sincronizado
    CREATE OR REPLACE FUNCTION sync_cargo_titulo()
    RETURNS TRIGGER AS $func$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        NEW.titulo := COALESCE(NEW.titulo, NEW.nome);
        NEW.nome := COALESCE(NEW.nome, NEW.titulo);
      ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.nome IS DISTINCT FROM OLD.nome THEN
          NEW.titulo := NEW.nome;
        ELSIF NEW.titulo IS DISTINCT FROM OLD.titulo THEN
          NEW.nome := NEW.titulo;
        END IF;
      END IF;
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
    
    DROP TRIGGER IF EXISTS sync_cargo_titulo_trigger ON cargos;
    CREATE TRIGGER sync_cargo_titulo_trigger
      BEFORE INSERT OR UPDATE ON cargos
      FOR EACH ROW
      EXECUTE FUNCTION sync_cargo_titulo();
  END IF;
END $$;
