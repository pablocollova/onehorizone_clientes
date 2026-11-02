-- CreateEnum
CREATE TYPE "ReceiptStatus" AS ENUM ('PROCESSING', 'REVIEW', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "PaymentRecipient" AS ENUM ('ONE_HORIZON', 'VENDOR');

-- CreateTable
CREATE TABLE "PaymentReceipt" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "recipient" "PaymentRecipient" NOT NULL,
    "vendorId" TEXT,
    "status" "ReceiptStatus" NOT NULL DEFAULT 'PROCESSING',
    "paidAt" TIMESTAMP(3) NOT NULL,
    "reference" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "confirmedBy" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAllocation" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "requestKey" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorAdvance" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorAdvance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "eurMicros" INTEGER NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceEvent" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentReceipt_clientId_createdAt_idx" ON "PaymentReceipt"("clientId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReceipt_clientId_requestKey_key" ON "PaymentReceipt"("clientId", "requestKey");

-- CreateIndex
CREATE INDEX "PaymentAllocation_invoiceId_idx" ON "PaymentAllocation"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAllocation_receiptId_requestKey_key" ON "PaymentAllocation"("receiptId", "requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "VendorAdvance_invoiceId_key" ON "VendorAdvance"("invoiceId");

-- CreateIndex
CREATE INDEX "ExchangeRate_clientId_currency_effectiveAt_idx" ON "ExchangeRate"("clientId", "currency", "effectiveAt");

-- CreateIndex
CREATE INDEX "FinanceEvent_clientId_createdAt_idx" ON "FinanceEvent"("clientId", "createdAt");

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "PaymentReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorAdvance" ADD CONSTRAINT "VendorAdvance_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceEvent" ADD CONSTRAINT "FinanceEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Application invariants also enforced for malformed direct inserts.
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "receipt_amount_positive" CHECK ("amountCents" > 0), ADD CONSTRAINT "receipt_currency_supported" CHECK ("currency" IN ('EUR','GBP','USD')), ADD CONSTRAINT "receipt_recipient_vendor" CHECK (("recipient" = 'ONE_HORIZON' AND "vendorId" IS NULL) OR ("recipient" = 'VENDOR' AND "vendorId" IS NOT NULL)), ADD CONSTRAINT "receipt_confirmation_metadata" CHECK (("status" = 'CONFIRMED' AND "confirmedBy" IS NOT NULL AND "confirmedAt" IS NOT NULL) OR ("status" <> 'CONFIRMED' AND "confirmedBy" IS NULL AND "confirmedAt" IS NULL));
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "allocation_amount_positive" CHECK ("amountCents" > 0);
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "rate_positive" CHECK ("eurMicros" > 0), ADD CONSTRAINT "rate_currency_supported" CHECK ("currency" IN ('GBP','USD'));
