-- CreateEnum
CREATE TYPE "SentidoViagem" AS ENUM ('IDA', 'VOLTA');

-- AlterTable
ALTER TABLE "gastos" ADD COLUMN     "sentido" "SentidoViagem";
