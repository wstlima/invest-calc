"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { formatBRL } from "../lib/money";

type Point = { month: number; fixed: number; variable: number };

export default function ComparisonChart({ fixedSeries, variableSeries }: { fixedSeries: any[]; variableSeries: any[] }) {
  // Monta dados para o gráfico: um ponto por mês
  const data: Point[] = (fixedSeries || []).map((f, i) => ({
    month: i,
    fixed: f.balance,
    variable: variableSeries?.[i]?.balance ?? null,
  }));

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Evolução dos saldos</CardTitle>
        </CardHeader>
        <CardContent>
          {/*
            O ResponsiveContainer pode calcular largura/altura negativas quando o parent
            não tem dimensões estáveis (flex/grid). Forçamos uma altura fixa e min-w-0.
          */}
          <div className="relative h-[320px] min-h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} label={{ value: "Mês", position: "insideBottom", offset: -4 }} />
                <YAxis tick={{ fontSize: 12 }} label={{ value: "Saldo", angle: -90, position: "insideLeft", offset: 10 }} />
                <Tooltip formatter={(v: number) => formatBRL(v)} />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="fixed" name="Fixo" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="variable" name="Variável" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}