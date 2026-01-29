/*
  Warnings:

  - Added the required column `entryNumber` to the `vehicle_entries` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_vehicle_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryNumber" INTEGER NOT NULL DEFAULT 0,
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
INSERT INTO "new_vehicle_entries" ("createdAt", "entryTime", "exitTime", "id", "observations", "operatorId", "spotNumber", "status", "totalPrice", "updatedAt", "vehicleId") SELECT "createdAt", "entryTime", "exitTime", "id", "observations", "operatorId", "spotNumber", "status", "totalPrice", "updatedAt", "vehicleId" FROM "vehicle_entries";
DROP TABLE "vehicle_entries";
ALTER TABLE "new_vehicle_entries" RENAME TO "vehicle_entries";
-- Preencher entryNumber incremental para registros existentes
UPDATE "vehicle_entries"
SET "entryNumber" = (
  SELECT COUNT(*) FROM "vehicle_entries" AS ve2
  WHERE ve2."entryTime" <= "vehicle_entries"."entryTime"
);
CREATE INDEX "vehicle_entries_entryNumber_idx" ON "vehicle_entries"("entryNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
