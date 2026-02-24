import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { beforeAll, beforeEach } from "vitest";

// Test DB isolado
const TEST_DB = "/tmp/invest-calc.test.db";

// IMPORTANT: vitest `setupFiles` roda antes do carregamento dos arquivos de teste,
// mas `beforeAll` roda depois. O PrismaClient pode ser instanciado durante o import
// dos módulos (antes de `beforeAll`), então precisamos setar o DATABASE_URL aqui.
// process.env.NODE_ENV is read-only in some environments, so only set DATABASE_URL here.
process.env.DATABASE_URL = `file:${TEST_DB}`;

beforeAll(() => {
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
