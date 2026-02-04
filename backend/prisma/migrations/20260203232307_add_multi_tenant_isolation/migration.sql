/*
  Warnings:

  - Added the required column `valetClientId` to the `vehicle_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valetClientId` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_vehicle_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryNumber" INTEGER,
    "vehicleId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "valetClientId" TEXT NOT NULL,
    "entryTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitTime" DATETIME,
    "spotNumber" TEXT,
    "observations" TEXT,
    "totalPrice" REAL,
    "status" TEXT NOT NULL DEFAULT 'parked',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "vehicle_entries_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "vehicle_entries_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "vehicle_entries_valetClientId_fkey" FOREIGN KEY ("valetClientId") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_vehicle_entries" ("createdAt", "entryTime", "exitTime", "id", "observations", "operatorId", "spotNumber", "status", "totalPrice", "updatedAt", "vehicleId") SELECT "createdAt", "entryTime", "exitTime", "id", "observations", "operatorId", "spotNumber", "status", "totalPrice", "updatedAt", "vehicleId" FROM "vehicle_entries";
DROP TABLE "vehicle_entries";
ALTER TABLE "new_vehicle_entries" RENAME TO "vehicle_entries";
CREATE TABLE "new_vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleNumber" INTEGER,
    "plate" TEXT NOT NULL,
    "model" TEXT,
    "color" TEXT,
    "year" INTEGER,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT,
    "clientPhone" TEXT,
    "notes" TEXT,
    "valetClientId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "vehicles_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "vehicles_valetClientId_fkey" FOREIGN KEY ("valetClientId") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_vehicles" ("clientId", "clientName", "clientPhone", "color", "createdAt", "id", "model", "notes", "plate", "updatedAt", "year") SELECT "clientId", "clientName", "clientPhone", "color", "createdAt", "id", "model", "notes", "plate", "updatedAt", "year" FROM "vehicles";
DROP TABLE "vehicles";
ALTER TABLE "new_vehicles" RENAME TO "vehicles";
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
