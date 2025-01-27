/*
  Warnings:

  - A unique constraint covering the columns `[cardId,ipAddress]` on the table `Request` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Request_cardId_ipAddress_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Request_cardId_ipAddress_key" ON "Request"("cardId", "ipAddress");
