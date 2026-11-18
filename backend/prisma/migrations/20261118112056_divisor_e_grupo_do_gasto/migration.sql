-- CreateEnum
CREATE TYPE "GrupoGasto" AS ENUM ('IGREJA_MAZE');

-- AlterTable
ALTER TABLE "gastos" ADD COLUMN     "divisor" INTEGER,
ADD COLUMN     "grupo" "GrupoGasto";

-- Gastos já divididos viram "dividido por 2" no grupo da igreja
-- (até aqui, todo gasto dividido era exibido na seção da igreja)
UPDATE "gastos"
SET "divisor" = 2, "grupo" = 'IGREJA_MAZE'
WHERE "dividido" = true;