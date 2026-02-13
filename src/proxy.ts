import { NextRequest, NextResponse } from "next/server";

/**
 * Autenticação simples (HTTP Basic) sem cadastro.
 *
 * Configure no .env:
 *  - BASIC_AUTH_USER
 *  - BASIC_AUTH_PASS
 */
function unauthorized() {
	return new NextResponse("Unauthorized", {
		status: 401,
		headers: {
			"WWW-Authenticate": 'Basic realm="Invest Calc"',
		},
	});
}

function parseBasicAuth(authHeader: string | null) {
	if (!authHeader?.startsWith("Basic ")) return null;
	const b64 = authHeader.slice("Basic ".length).trim();
	let decoded = "";
	try {
		decoded = Buffer.from(b64, "base64").toString("utf8");
	} catch {
		return null;
	}
	const idx = decoded.indexOf(":");
	if (idx < 0) return null;
	return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
}

// Next.js 16: o arquivo proxy.ts deve exportar uma função `proxy` (ou default).
export function proxy(req: NextRequest) {
	const url = req.nextUrl;

	// Permite assets e next internals sem auth.
	if (
		url.pathname.startsWith("/_next") ||
		url.pathname.startsWith("/favicon") ||
		url.pathname.startsWith("/assets")
	) {
		return NextResponse.next();
	}

	// Swagger/OpenAPI pode ficar protegido junto do restante.
	const expectedUser = process.env.BASIC_AUTH_USER || "admin";
	const expectedPass = process.env.BASIC_AUTH_PASS || "admin";

	const creds = parseBasicAuth(req.headers.get("authorization"));
	if (!creds) return unauthorized();
	if (creds.user !== expectedUser || creds.pass !== expectedPass) return unauthorized();

	return NextResponse.next();
}

export const config = {
	// Protege páginas e API, mas evita interceptar arquivos estáticos.
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
