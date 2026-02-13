// Utilidades para valores monetários

export function formatBRL(value: number | null | undefined) {
  const v = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

