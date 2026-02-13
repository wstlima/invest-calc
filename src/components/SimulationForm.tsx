import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Button from "./ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card";
import Input from "./ui/Input";
import Label from "./ui/Label";

export default function SimulationForm({ onSubmit }: { onSubmit: (data: any, key: string) => void }) {
  const [form, setForm] = useState({
    name: "",
    initialAmount: 1000,
    monthlyContribution: 100,
    months: 12,
    fixedAnnualRate: 0.12,
    variableAnnualReturn: 0.12,
    variableVolatility: 0.25,
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: Number(e.target.value) || e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const key = uuidv4();
    await onSubmit(form, key);
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Simulação</CardTitle>
          <CardDescription>Preencha os parâmetros e gere uma nova simulação.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label>Nome</Label>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Ex: Aporte 12 meses" />
          </div>
          <div>
            <Label>Valor inicial</Label>
            <Input name="initialAmount" type="number" value={form.initialAmount} onChange={handleChange} placeholder="1000" />
          </div>
          <div>
            <Label>Aporte mensal</Label>
            <Input name="monthlyContribution" type="number" value={form.monthlyContribution} onChange={handleChange} placeholder="100" />
          </div>
          <div>
            <Label>Meses</Label>
            <Input name="months" type="number" value={form.months} onChange={handleChange} placeholder="12" />
          </div>
          <div>
            <Label>Taxa anual fixa</Label>
            <Input name="fixedAnnualRate" type="number" step="0.01" value={form.fixedAnnualRate} onChange={handleChange} placeholder="0.12" />
            <p className="mt-1 text-xs text-gray-500">Ex.: 0.12 = 12% ao ano</p>
          </div>
          <div>
            <Label>Retorno anual variável</Label>
            <Input name="variableAnnualReturn" type="number" step="0.01" value={form.variableAnnualReturn} onChange={handleChange} placeholder="0.12" />
            <p className="mt-1 text-xs text-gray-500">Ex.: 0.12 = 12% ao ano</p>
          </div>
          <div>
            <Label>Volatilidade anual</Label>
            <Input name="variableVolatility" type="number" step="0.01" value={form.variableVolatility} onChange={handleChange} placeholder="0.25" />
            <p className="mt-1 text-xs text-gray-500">Ex.: 0.25 = 25% ao ano</p>
          </div>
          </div>

          <div className="mt-8 flex items-center justify-end">
            <Button type="submit" loading={submitting} className="w-full sm:w-auto" size="lg">
              {submitting ? "Simulando..." : "Simular"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}