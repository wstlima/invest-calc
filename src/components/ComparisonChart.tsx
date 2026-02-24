"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";


import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { formatBRL } from "../lib/money";
import { useState } from "react";

// Função utilitária para alinhar e validar as séries
function alignSeries(fixedSeries: any[], variableSeries: any[]) {
  const maxLength = Math.max(fixedSeries?.length || 0, variableSeries?.length || 0);
  const safeFixed = Array.isArray(fixedSeries) ? fixedSeries : [];
  const safeVariable = Array.isArray(variableSeries) ? variableSeries : [];
  const aligned = [];
  for (let i = 0; i < maxLength; i++) {
    const fixed = safeFixed[i] && typeof safeFixed[i].balance === 'number' ? safeFixed[i] : { balance: null };
    const variable = safeVariable[i] && typeof safeVariable[i].balance === 'number' ? safeVariable[i] : { balance: null };
    aligned.push({
      month: i,
      fixed: fixed.balance,
      variable: variable.balance,
    });
  }
  return aligned;
}


type Point = { month: number; fixed: number; variable: number };

type ComparisonChartProps = {
  fixedSeries: any[];
  variableSeries: any[];
};

export default function ComparisonChart({ fixedSeries, variableSeries }: ComparisonChartProps) {
  // Valida e alinha as séries antes de montar os dados para o gráfico
  const data: Point[] = alignSeries(fixedSeries, variableSeries);

  // Estado para seleção das linhas
  const [showFixed, setShowFixed] = useState(true);
  const [showVariable, setShowVariable] = useState(true);

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Evolução dos saldos</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Seleção de linhas */}
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={showFixed} onChange={() => setShowFixed(v => !v)} />
              <span className="text-blue-600">Fixo</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={showVariable} onChange={() => setShowVariable(v => !v)} />
              <span className="text-green-600">Variável</span>
            </label>
          </div>
          {/*
            O ResponsiveContainer pode calcular largura/altura negativas quando o parent
            não tem dimensões estáveis (flex/grid). Forçamos uma altura fixa e min-w-0.
          */}
          <div className="relative h-80 min-h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} label={{ value: "Mês", position: "insideBottom", offset: -4 }} />
                <YAxis tick={{ fontSize: 12 }} label={{ value: "Saldo", angle: -90, position: "insideLeft", offset: 10 }} />
                <Tooltip formatter={(v: number) => formatBRL(v)} />
                <Legend verticalAlign="top" height={36} />
                {showFixed && (
                  <Line type="monotone" dataKey="fixed" name="Fixo" stroke="#2563eb" strokeWidth={2} dot={false} strokeDasharray="6 3" />
                )}
                {showVariable && (
                  <Line type="monotone" dataKey="variable" name="Variável" stroke="#22c55e" strokeWidth={2} dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}