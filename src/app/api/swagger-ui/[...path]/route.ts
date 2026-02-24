import path from "node:path";
import { promises as fs } from "node:fs";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
	".css": "text/css; charset=utf-8",
	".js": "application/javascript; charset=utf-8",
	".png": "image/png",
	".svg": "image/svg+xml",
 	".html": "text/html; charset=utf-8",
};

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path: segments } = await params;
	const rel = (segments || []).join("/");

	// Only allow serving files from swagger-ui-dist package.
	const root = path.join(process.cwd(), "node_modules", "swagger-ui-dist");
	const filePath = path.join(root, rel || "index.html");

	// Prevent path traversal.
	if (!filePath.startsWith(root)) {
		return new Response("Not found", { status: 404 });
	}

	let buf: Buffer;
	try {
		buf = await fs.readFile(filePath);
	} catch {
		return new Response("Not found", { status: 404 });
	}

	const ext = path.extname(filePath).toLowerCase();
	const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

	return new Response(new Uint8Array(buf), {
		headers: {
			"content-type": contentType,
			"cache-control": "public, max-age=3600",
		},
	});
}
