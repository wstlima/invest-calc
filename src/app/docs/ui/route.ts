export const runtime = "nodejs";

/**
 * Swagger UI served as plain HTML, backed by swagger-ui-dist assets.
 * This avoids React peer-dependency issues with React 19.
 */
export async function GET() {
	const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Swagger UI</title>
    <link rel="stylesheet" href="/api/swagger-ui/swagger-ui.css" />
    <style>
      html, body { height: 100%; margin: 0; }
      #swagger-ui { height: 100%; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/api/swagger-ui/swagger-ui-bundle.js"></script>
    <script src="/api/swagger-ui/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        const ui = SwaggerUIBundle({
          url: '/api/openapi',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout'
        });
        window.ui = ui;
      }
    </script>
  </body>
</html>`;

	return new Response(html, {
		headers: {
			"content-type": "text/html; charset=utf-8",
			"cache-control": "no-store",
		},
	});
}
