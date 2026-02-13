import { NextResponse } from "next/server";

// OpenAPI bem simples, suficiente para Swagger UI.
export async function GET() {
	const spec = {
		openapi: "3.0.3",
		info: {
			title: "Invest Calc API",
			version: "1.0.0",
			description: "API da Calculadora de Investimentos (Next.js Route Handlers + Prisma/SQLite).",
		},
		servers: [{ url: "/" }],
		paths: {
			"/api/simulations": {
				get: {
					summary: "Listar simulações (resumo)",
					responses: {
						"200": {
							description: "OK",
						},
					},
				},
				post: {
					summary: "Criar simulação (idempotente)",
					parameters: [
						{
							name: "Idempotency-Key",
							in: "header",
							required: true,
							schema: { type: "string" },
						},
					],
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["name", "initialAmount", "months"],
									properties: {
										name: { type: "string" },
										initialAmount: { type: "number" },
										monthlyContribution: { type: "number" },
										months: { type: "integer" },
										fixedAnnualRate: { type: "number" },
										variableAnnualReturn: { type: "number" },
										variableVolatility: { type: "number" },
									},
								},
							},
						},
					},
					responses: {
						"201": { description: "Criada" },
						"200": { description: "Replay (idempotência)" },
						"400": { description: "Erro de validação" },
						"409": { description: "Idempotency-Key conflitante" },
					},
				},
			},
			"/api/simulations/{id}": {
				get: {
					summary: "Detalhe de uma simulação",
					parameters: [
						{
							name: "id",
							in: "path",
							required: true,
							schema: { type: "string" },
						},
					],
					responses: {
						"200": { description: "OK" },
						"404": { description: "Não encontrada" },
					},
				},
				delete: {
					summary: "Excluir simulação",
					parameters: [
						{
							name: "id",
							in: "path",
							required: true,
							schema: { type: "string" },
						},
					],
					responses: {
						"200": { description: "Excluída" },
						"404": { description: "Não encontrada" },
					},
				},
			},
		},
		components: {
			securitySchemes: {
				basicAuth: {
					type: "http",
					scheme: "basic",
				},
			},
		},
		security: [{ basicAuth: [] }],
	} as const;

	return NextResponse.json(spec);
}
