import { Card } from "./ui/Card";
import Badge from "./ui/Badge";
import Link from "next/link";

export default function HistoryList({
  history,
  onSelect,
}: {
  history: any[];
  onSelect: (id: string) => void;
}) {
  const items = (history || []).slice(0, 8);

  return (
    <section>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200/70 px-6 py-4">
          <div>
            <div className="text-sm font-semibold text-gray-900">Histórico</div>
            <div className="text-xs text-gray-500">Últimas simulações executadas</div>
          </div>
          <Link
            href="/simulations"
            className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-200"
          >
            Ver todas
          </Link>
        </div>

        <ul className="divide-y divide-gray-200/70">
          {items.length === 0 ? (
            <li className="px-6 py-8 text-sm text-gray-500">Nenhuma simulação ainda.</li>
          ) : (
            items.map((h) => (
              <li key={h.id}>
                <button
                  onClick={() => onSelect(h.id)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900">
                      {h.name || "(sem nome)"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {new Date(h.createdAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="gray" className="hidden sm:inline-flex">
                      ID: {String(h.id).slice(0, 8)}…
                    </Badge>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      </Card>
    </section>
  );
}