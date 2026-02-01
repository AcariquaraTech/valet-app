-- CreateTable
CREATE TABLE "access_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "revokedReason" TEXT,
    "lastValidatedAt" DATETIME,
    "deviceId" TEXT
);

-- CreateTable
CREATE TABLE "access_validation_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessKeyId" TEXT NOT NULL,
    "deviceId" TEXT,
    "ipAddress" TEXT,
    "status" TEXT NOT NULL,
    "appVersion" TEXT,
    "osVersion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "access_keys_code_key" ON "access_keys"("code");
