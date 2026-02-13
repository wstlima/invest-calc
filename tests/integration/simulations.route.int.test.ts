import { describe, it, expect } from "vitest";

import { GET as listSimulations, POST as createSimulation } from "../../src/app/api/simulations/route";
import {
	GET as getSimulation,
	DELETE as deleteSimulation,
} from "../../src/app/api/simulations/[id]/route";

function reqJson(body: any, headers: Record<string, string> = {}) {
	return new Request("http://localhost/api/simulations", {
		method: "POST",
		headers: { "content-type": "application/json", ...headers },
		body: JSON.stringify(body),
	});
}

describe("API /api/simulations (integration)", () => {
	it("cria uma simulação e lista", async () => {
		const idKey = "test-key-1";
		const createRes = await createSimulation(
			reqJson(
				{
					name: "Teste",
					initialAmount: 1000,
					monthlyContribution: 100,
					months: 12,
					fixedAnnualRate: 0.12,
					variableAnnualReturn: 0.12,
					variableVolatility: 0.25,
				},
				{ "Idempotency-Key": idKey }
			)
		);
		expect(createRes.status).toBe(201);
		const created = await createRes.json();
		expect(created.success).toBe(true);
		expect(created.data.id).toBeTruthy();

		const listRes = await listSimulations();
		expect(listRes.status).toBe(200);
		const listed = await listRes.json();
		expect(listed.success).toBe(true);
		expect(listed.data.length).toBe(1);
	});

	it("idempotência: replay retorna 200", async () => {
		const idKey = "test-key-2";
		const payload = {
			name: "Idempotente",
			initialAmount: 1000,
			monthlyContribution: 100,
			months: 12,
			fixedAnnualRate: 0.12,
			variableAnnualReturn: 0.12,
			variableVolatility: 0.25,
		};

		const first = await createSimulation(reqJson(payload, { "Idempotency-Key": idKey }));
		expect(first.status).toBe(201);
		const firstJson = await first.json();

		const replay = await createSimulation(reqJson(payload, { "Idempotency-Key": idKey }));
		expect(replay.status).toBe(200);
		const replayJson = await replay.json();
		expect(replayJson.data.id).toBe(firstJson.data.id);
	});

	it("GET /api/simulations/:id retorna detalhe e DELETE remove", async () => {
		const createdRes = await createSimulation(
			reqJson(
				{ name: "Detalhe", initialAmount: 1000, monthlyContribution: 0, months: 6 },
				{ "Idempotency-Key": "test-key-3" }
			)
		);
		const created = await createdRes.json();
		const id = created.data.id as string;

		const detailRes = await getSimulation(
			new Request(`http://localhost/api/simulations/${id}`),
			{ params: Promise.resolve({ id }) } as any
		);
		expect(detailRes.status).toBe(200);
		const detail = await detailRes.json();
		expect(detail.success).toBe(true);
		expect(detail.data.id).toBe(id);

		const delRes = await deleteSimulation(
			new Request(`http://localhost/api/simulations/${id}`, { method: "DELETE" }),
			{ params: Promise.resolve({ id }) } as any
		);
		expect(delRes.status).toBe(200);

		const after = await getSimulation(
			new Request(`http://localhost/api/simulations/${id}`),
			{ params: Promise.resolve({ id }) } as any
		);
		expect(after.status).toBe(404);
	});
});
