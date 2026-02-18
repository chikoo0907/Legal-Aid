-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "data" BYTEA,
ALTER COLUMN "path" DROP NOT NULL;
