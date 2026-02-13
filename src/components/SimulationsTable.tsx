"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Button from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import Input from "./ui/Input";
import Badge from "./ui/Badge";
import { formatBRL } from "../lib/money";

type Row = {
  id: string;
  name: string;
  createdAt: string;
  fixedFinalNet?: number | null;
  variableFinalMean?: number | null;
};

export default function SimulationsTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchRows() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/simulations", { cache: "no-store" as any });
      const json = await res.json();
      setRows(Array.isArray(json?.data) ? json.data : []);
    } catch (e: any) {
      setError(e?.message ?? "Falha ao carregar simulações");
    } finally {
      setLoading(false);
    }
  }

  async function deleteRow(id: string) {
    try {
      setDeletingId(id);
      await fetch(`/api/simulations/${id}`, { method: "DELETE" });
      await fetchRows();
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    fetchRows();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.id].some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [rows, query]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Todas as simulações</CardTitle>
          <div className="mt-1 text-sm text-gray-500">
            Consulta via <span className="font-mono">/api/simulations</span>.
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-72">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar por nome ou ID..."
              aria-label="Filtrar"
            />
          </div>
          <Button variant="secondary" onClick={fetchRows} loading={loading}>
            Atualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        {error ? (
          <div className="px-6 pb-6 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Fixo</th>
                <th className="px-6 py-3">Variável (média)</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/70">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    Nenhum resultado.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/simulations/${r.id}`} className="font-semibold text-gray-900 hover:underline">
                          {r.name || "(sem nome)"}
                        </Link>
                        <Badge tone="gray" className="hidden md:inline-flex">
                          {String(r.id).slice(0, 8)}…
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(r.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {formatBRL(r.fixedFinalNet)}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {formatBRL(r.variableFinalMean)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/simulations/${r.id}`}
                          className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-200"
                        >
                          Ver
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={deletingId === r.id}
                          onClick={() => deleteRow(r.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
