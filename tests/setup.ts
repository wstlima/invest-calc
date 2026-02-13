import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { beforeAll, beforeEach } from "vitest";

// Test DB isolado
const TEST_DB = "/tmp/invest-calc.test.db";

beforeAll(() => {
	process.env.NODE_ENV = "test";
	process.env.DATABASE_URL = `file:${TEST_DB}`;

	// garante DB limpo
	try {
		rmSync(TEST_DB);
	} catch {
		// ignore
	}

	// aplica migrations
	execSync("npx prisma migrate deploy", {
		stdio: "inherit",
		env: { ...process.env, DATABASE_URL: `file:${TEST_DB}` },
	});
});

beforeEach(async () => {
	// limpa tabelas entre testes
	const { prisma } = await import("../src/server/db/prisma");
	await prisma.idempotencyKey.deleteMany();
	await prisma.simulationResult.deleteMany();
	await prisma.simulation.deleteMany();
});
