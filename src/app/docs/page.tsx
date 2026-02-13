import SectionHeader from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default function DocsPage() {
	return (
		<div className="space-y-4">
			<SectionHeader
				title="Documentação da API"
				subtitle="Swagger UI (OpenAPI) — protegida por Basic Auth"
			/>

			<Card>
				<div className="text-sm text-gray-600">
					Use <span className="font-mono">BASIC_AUTH_USER</span> e <span className="font-mono">BASIC_AUTH_PASS</span> para autenticar.
				</div>
			</Card>

			<Card>
				<div className="h-[75vh] w-full overflow-hidden rounded-2xl border border-gray-200/70">
					<iframe
						title="Swagger UI"
						src="/docs/ui"
						className="h-full w-full"
					/>
				</div>
			</Card>
		</div>
	);
}
