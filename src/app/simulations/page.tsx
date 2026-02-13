import Link from "next/link";
import SimulationsTable from "../../components/SimulationsTable";
import SectionHeader from "../../components/ui/SectionHeader";

export default function Simulations() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionHeader
        title="Simulações"
        subtitle="Tabela completa do histórico (com filtro, detalhe e exclusão)."
        right={
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
          >
            Voltar ao simulador
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        }
      />

      <SimulationsTable />
    </div>
  );
}