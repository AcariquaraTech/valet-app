/*
  Warnings:

  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `entryNumber` on the `vehicle_entries` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("active", "createdAt", "id", "name", "nickname", "password", "phone", "role", "updatedAt") SELECT "active", "createdAt", "id", "name", "nickname", "password", "phone", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");
CREATE TABLE "new_vehicle_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
