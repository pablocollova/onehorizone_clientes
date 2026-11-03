-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('INVOICE', 'PAYMENT', 'CONTRACT', 'OTHER');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "category" "DocumentCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "checksum" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "folder" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "originalName" TEXT,
ADD COLUMN     "receiptId" TEXT,
ADD COLUMN     "storageKind" TEXT NOT NULL DEFAULT 'LEGACY',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "uploadKey" TEXT;

-- CreateTable
CREATE TABLE "DocumentEvent" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentEvent_clientId_documentId_createdAt_idx" ON "DocumentEvent"("clientId", "documentId", "createdAt");

-- CreateIndex
CREATE INDEX "Document_clientId_category_createdAt_idx" ON "Document"("clientId", "category", "createdAt");

-- CreateIndex
CREATE INDEX "Document_receiptId_idx" ON "Document"("receiptId");

-- CreateIndex
CREATE INDEX "Document_invoiceId_idx" ON "Document"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_clientId_uploadKey_key" ON "Document"("clientId", "uploadKey");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "PaymentReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentEvent" ADD CONSTRAINT "DocumentEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentEvent" ADD CONSTRAINT "DocumentEvent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
