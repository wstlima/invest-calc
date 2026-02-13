"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ResultsCards from "./ResultsCards";
import ComparisonChart from "./ComparisonChart";
import TaxesTable from "./TaxesTable";
import SectionHeader from "./ui/SectionHeader";
import Badge from "./ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";

export default function SimulationDetailView({ id }: { id: string }) {
  const [sim, setSim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSim() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/simulations/${id}`, { cache: "no-store" as any });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || "Não encontrado");
      setSim(json.data);
    } catch (e: any) {
      setError(e?.message ?? "Falha ao carregar simulação");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSim();
  }, [id]);

  const result = sim?.result ?? null;
  const meta = useMemo(() => {
    try {
      return result?.metaJson ? JSON.parse(result.metaJson) : null;
    } catch {
      return null;
    }
  }, [result?.metaJson]);

  const taxes = useMemo(() => {
    try {
      return result?.taxesJson ? JSON.parse(result.taxesJson) : null;
    } catch {
      return null;
    }
  }, [result?.taxesJson]);

  const fixedSeries = useMemo(() => {
    try {
      return result?.fixedSeriesJson ? JSON.parse(result.fixedSeriesJson) : [];
    } catch {
      return [];
    }
  }, [result?.fixedSeriesJson]);

  const variableSeries = useMemo(() => {
    try {
      return result?.variableSeriesJson ? JSON.parse(result.variableSeriesJson) : [];
    } catch {
      return [];
    }
  }, [result?.variableSeriesJson]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionHeader
        title="Detalhe da simulação"
        subtitle={id}
        right={
          <div className="flex items-center gap-2">
            <Link
              href="/simulations"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
            >
              Voltar
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
            <button
              onClick={fetchSim}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Atualizar
            </button>
          </div>
        }
      />

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-red-700">{error}</div>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Carregando...</div>
          </CardContent>
        </Card>
      ) : null}

      {!loading && sim ? (
        <>
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{sim.name || "(sem nome)"}</CardTitle>
                <div className="mt-1 text-sm text-gray-500">
                  {new Date(sim.createdAt).toLocaleString("pt-BR")}
                </div>
              </div>
              <Badge tone="gray">ID: {String(sim.id).slice(0, 8)}…</Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-xs font-semibold text-gray-500">Aporte inicial</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{sim.initialAmount}</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-xs font-semibold text-gray-500">Aporte mensal</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{sim.monthlyContribution}</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-xs font-semibold text-gray-500">Meses</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{sim.months}</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-xs font-semibold text-gray-500">Taxa fixa</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{sim.fixedAnnualRate}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <ResultsCards
            fixedNet={result?.fixedFinalNet}
            variableMean={result?.variableFinalMean}
            diffPercent={meta?.diffPercent ?? 0}
            p10={meta?.p10 ?? 0}
            p90={meta?.p90 ?? 0}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-6">
              <ComparisonChart fixedSeries={fixedSeries} variableSeries={variableSeries} />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <TaxesTable taxes={taxes} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
