-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "initialAmount" REAL NOT NULL,
    "monthlyContribution" REAL,
    "months" INTEGER NOT NULL,
    "fixedAnnualRate" REAL,
    "variableAnnualReturn" REAL,
    "variableVolatility" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SimulationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "simulationId" TEXT NOT NULL,
    "fixedSeriesJson" TEXT NOT NULL,
    "variableSeriesJson" TEXT NOT NULL,
    "fixedFinalGross" REAL NOT NULL,
    "fixedFinalNet" REAL NOT NULL,
    "variableFinalMean" REAL NOT NULL,
    "taxesJson" TEXT NOT NULL,
    "metaJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SimulationResult_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "SimulationResult_simulationId_key" ON "SimulationResult"("simulationId");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_key_key" ON "IdempotencyKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_simulationId_key" ON "IdempotencyKey"("simulationId");
