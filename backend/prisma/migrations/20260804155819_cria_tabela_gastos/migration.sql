-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('COMPRAS', 'SERVICOS', 'PARCELAMENTOS', 'TRANSPORTE');

-- CreateTable
CREATE TABLE "gastos" (
    "id" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "dividido" BOOLEAN,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);
