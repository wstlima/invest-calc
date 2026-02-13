import { NextResponse } from "next/server";
import { prisma } from "../../../server/db/prisma";
import { createSimulationIdempotent } from "../../../server/simulations/service";

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}));
		const key = req.headers.get("Idempotency-Key") || "";

		const { simulation, replay } = await createSimulationIdempotent(body, key);

		return NextResponse.json(
			{ success: true, data: simulation },
			{ status: replay ? 200 : 201 }
		);
	} catch (err: any) {
		const status = err?.status ?? 400;
		return NextResponse.json(
			{ success: false, error: err?.message ?? "Erro ao criar simulação" },
			{ status }
		);
	}
}

export async function GET() {
	try {
		const sims = await prisma.simulation.findMany({
			orderBy: { createdAt: "desc" },
			include: { result: true },
		});
		const resumo = sims.map((s: any) => ({
			id: s.id,
			name: s.name,
			createdAt: s.createdAt,
			fixedFinalNet: s.result?.fixedFinalNet,
			variableFinalMean: s.result?.variableFinalMean,
		}));
		return NextResponse.json({ success: true, data: resumo });
	} catch (err: any) {
		return NextResponse.json({ success: false, error: err?.message });
	}
}
