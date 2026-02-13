"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import SimulationForm from "../components/SimulationForm";
import ResultsCards from "../components/ResultsCards";
import ComparisonChart from "../components/ComparisonChart";
import TaxesTable from "../components/TaxesTable";
import HistoryList from "../components/HistoryList";
import SectionHeader from "../components/ui/SectionHeader";
import Badge from "../components/ui/Badge";

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [taxes, setTaxes] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  async function handleSubmit(data: any, key: string) {
    const res = await fetch("/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": key },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setResult(json.data?.result);
    setTaxes(json.data?.result?.taxesJson ? JSON.parse(json.data.result.taxesJson) : null);
    fetchHistory();
  }

  async function fetchHistory() {
    const res = await fetch("/api/simulations");
    const json = await res.json();
    setHistory(json.data || []);
  }

  async function handleSelect(id: string) {
    const res = await fetch(`/api/simulations/${id}`);
    const json = await res.json();
    setSelected(json.data?.result);
    setTaxes(json.data?.result?.taxesJson ? JSON.parse(json.data.result.taxesJson) : null);
  }

  useEffect(() => { fetchHistory(); }, []);

  const activeResult = result || selected;
  const meta = (() => {
    try {
      return activeResult?.metaJson ? JSON.parse(activeResult.metaJson) : null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionHeader
        title="Simulador"
        subtitle="Compare renda fixa vs renda variável e acompanhe o histórico."
        right={
          <Link
            href="/simulations"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
          >
            Ver simulações
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <SimulationForm onSubmit={handleSubmit} />
        </div>

        <div className="lg:col-span-12">
          <ResultsCards
            fixedNet={activeResult?.fixedFinalNet}
            variableMean={activeResult?.variableFinalMean}
            diffPercent={meta?.diffPercent ?? 0}
            p10={meta?.p10 ?? 0}
            p90={meta?.p90 ?? 0}
          />
        </div>

        <div className="lg:col-span-8 space-y-6">
          <ComparisonChart
            fixedSeries={activeResult?.fixedSeriesJson ? JSON.parse(activeResult.fixedSeriesJson) : []}
            variableSeries={activeResult?.variableSeriesJson ? JSON.parse(activeResult.variableSeriesJson) : []}
          />
          <HistoryList history={history} onSelect={handleSelect} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          {selected ? (
            <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Selecionado</div>
                  <div className="mt-1 text-xs text-gray-500">Você está vendo os dados do histórico.</div>
                </div>
                <Badge tone="gray">histórico</Badge>
              </div>
              <div className="mt-3 text-sm text-gray-700">Clique em outra simulação para alternar.</div>
            </div>
          ) : null}

          <TaxesTable taxes={taxes} />
        </div>
      </div>
    </div>
  );
}