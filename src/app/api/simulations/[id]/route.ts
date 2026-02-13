import { NextResponse } from "next/server";
import { prisma } from "../../../../server/db/prisma";

export async function GET(req: Request, { params }: { params: any }) {
	try {
		const resolvedParams = await params;
		const sim = await prisma.simulation.findUnique({
			where: { id: resolvedParams.id },
			include: { result: true },
		});
		if (!sim) return NextResponse.json({ success: false, error: "Não encontrado" }, { status: 404 });
		return NextResponse.json({ success: true, data: sim });
	} catch (err: any) {
		return NextResponse.json({ success: false, error: err?.message });
	}
}

export async function DELETE(req: Request, { params }: { params: any }) {
	try {
		const resolvedParams = await params;
		await prisma.simulation.delete({ where: { id: resolvedParams.id } });
		return NextResponse.json({ success: true }, { status: 200 });
	} catch (err: any) {
		return NextResponse.json({ success: false, error: err?.message }, { status: 404 });
	}
}
