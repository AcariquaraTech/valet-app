/*
  Warnings:

  - Added the required column `clientId` to the `access_keys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN "email" TEXT;

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "companyName" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "document" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_UserAccessKeys" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserAccessKeys_A_fkey" FOREIGN KEY ("A") REFERENCES "access_keys" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserAccessKeys_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_access_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "companyName" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "observations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "revokedReason" TEXT,
    "lastValidatedAt" DATETIME,
    "deviceId" TEXT,
    CONSTRAINT "access_keys_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_access_keys" ("clientEmail", "clientName", "clientPhone", "code", "companyName", "createdAt", "deviceId", "expiresAt", "id", "lastValidatedAt", "revokedAt", "revokedReason", "status", "updatedAt") SELECT "clientEmail", "clientName", "clientPhone", "code", "companyName", "createdAt", "deviceId", "expiresAt", "id", "lastValidatedAt", "revokedAt", "revokedReason", "status", "updatedAt" FROM "access_keys";
DROP TABLE "access_keys";
ALTER TABLE "new_access_keys" RENAME TO "access_keys";
CREATE UNIQUE INDEX "access_keys_code_key" ON "access_keys"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_UserAccessKeys_AB_unique" ON "_UserAccessKeys"("A", "B");

-- CreateIndex
CREATE INDEX "_UserAccessKeys_B_index" ON "_UserAccessKeys"("B");
