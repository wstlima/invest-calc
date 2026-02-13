import React from "react";
import Badge from "./ui/Badge";
import { Card } from "./ui/Card";
import { formatBRL } from "../lib/money";

function StatCard({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-gray-600">{label}</div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">{value}</div>
    </Card>
  );
}

export default function ResultsCards({ fixedNet, variableMean, diffPercent, p10, p90 }: any) {
  const diff = typeof diffPercent === "number" ? diffPercent : 0;

  return (
    <section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Fixo (líquido)"
          value={formatBRL(fixedNet)}
          badge={<Badge tone="blue">Fixo</Badge>}
        />
        <StatCard
          label="Variável (média)"
          value={formatBRL(variableMean)}
          badge={<Badge tone="green">Variável</Badge>}
        />
        <StatCard
          label="Diferença"
          value={`${diff.toFixed(2)}%`}
          badge={<Badge tone={diff >= 0 ? "green" : "red"}>{diff >= 0 ? "↑" : "↓"}</Badge>}
        />
        <StatCard label="P10" value={formatBRL(p10)} badge={<Badge tone="orange">P10</Badge>} />
        <StatCard label="P90" value={formatBRL(p90)} badge={<Badge tone="orange">P90</Badge>} />
      </div>
    </section>
  );
}