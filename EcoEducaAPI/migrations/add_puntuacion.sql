-- Migración: Añadir columna puntuacion a tabla usuarios
-- Fecha: 2025-12-26
-- Descripción: Añade la columna puntuacion a la tabla usuarios para acumular puntos del juego

BEGIN;

-- Añadir columna puntuacion si no existe
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS puntuacion INTEGER NOT NULL DEFAULT 0;

-- Asegurar que no hay valores NULL en filas existentes
UPDATE usuarios SET puntuacion = 0 WHERE puntuacion IS NULL;

-- Crear restricción para evitar valores negativos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'usuarios' AND c.conname = 'puntuacion_no_negativa'
  ) THEN
    ALTER TABLE usuarios
      ADD CONSTRAINT puntuacion_no_negativa CHECK (puntuacion >= 0);
  END IF;
END$$;

COMMIT;
