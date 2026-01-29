/*
  Warnings:

  - Added the required column `nickname` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
-- Preencher nickname para usuários existentes (exemplo: admin -> 'admin')
INSERT INTO "new_users" ("id", "name", "nickname", "email", "password", "phone", "role", "active", "createdAt", "updatedAt")
SELECT "id", "name", 
  CASE 
    WHEN "role" = 'admin' THEN 'admin'
    ELSE lower(replace("name", ' ', ''))
  END as "nickname",
  "email", "password", "phone", "role", "active", "createdAt", "updatedAt"
FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE TABLE "new_vehicle_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryNumber" INTEGER NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "entryTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitTime" DATETIME,
    "spotNumber" TEXT,
    "observations" TEXT,
    "totalPrice" REAL,
    "status" TEXT NOT NULL DEFAULT 'parked',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "vehicle_entries_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "vehicle_entries_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_vehicle_entries" ("createdAt", "entryNumber", "entryTime", "exitTime", "id", "observations", "operatorId", "spotNumber", "status", "totalPrice", "updatedAt", "vehicleId") SELECT "createdAt", "entryNumber", "entryTime", "exitTime", "id", "observations", "operatorId", "spotNumber", "status", "totalPrice", "updatedAt", "vehicleId" FROM "vehicle_entries";
DROP TABLE "vehicle_entries";
ALTER TABLE "new_vehicle_entries" RENAME TO "vehicle_entries";
CREATE INDEX "vehicle_entries_entryNumber_idx" ON "vehicle_entries"("entryNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
